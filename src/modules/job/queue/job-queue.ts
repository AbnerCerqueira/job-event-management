import { sendJobSimulator } from '../../../main.ts'
import type { JobEvents } from '../events/job-events.ts'
import { nodeJobEvents } from '../events/node-job-events.ts'
import type { Job } from '../job.ts'
import { inMemoryJobRepository } from '../repositories/in-memory-job-repository.ts'
import type { JobRepository } from '../repositories/job-repository.ts'

const jobProcessTimeoutMs = 1 * 60 * 1000

export class JobQueue {
  private processing = false
  private pollingInterval: NodeJS.Timeout | null = null

  private static instance: JobQueue | null = null

  private constructor(
    private readonly repository: JobRepository,
    private readonly jobEvents: JobEvents,
    private readonly sendJob: (job: Job) => Promise<void>,
    private readonly timeoutMs: number,
    private readonly pollMs = 2000
  ) {}

  static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue(
        inMemoryJobRepository,
        nodeJobEvents,
        sendJobSimulator,
        jobProcessTimeoutMs
      )
    }

    return JobQueue.instance
  }

  start() {
    if (this.pollingInterval) {
      return
    }

    console.log('start')

    this.pollingInterval = setInterval(() => {
      this.process()
    }, this.pollMs)
  }

  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    this.pollingInterval = null
  }
  private async process() {
    if (this.processing) {
      console.log('[QUEUE] job processando')
      return
    }

    this.processing = true

    try {
      // biome-ignore lint/nursery/noUnnecessaryConditions: confia no pai
      while (true) {
        const job = await this.repository.findNextPending()
        if (!job) {
          console.log('[QUEUE] nenhum job encontrado')
          break
        }

        try {
          await this.repository.updateStatus(job.id, 'PROCESSING')
          console.log(`[QUEUE] proximo job ${job.id} começou a processar`)
          this.repository.dump()
          await this.sendJob(job)
          await this.waitForCompletion(job.id)
        } catch (err) {
          console.log(
            `[QUEUE] job ${job.id} deu timeout ${this.timeoutMs}, ${err}`
          )
          this.repository.dump()
          await this.repository.updateStatus(job.id, 'FAILED')
        }
      }
    } finally {
      this.processing = false
    }
  }

  private async waitForCompletion(jobId: string): Promise<void> {
    const mostUpdatedJob = await this.repository.findById(jobId)

    if (!mostUpdatedJob) {
      throw new Error(`[QUEUE] job ${jobId} não encontrado`)
    }

    if (mostUpdatedJob?.status === 'DONE') {
      return
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('timeout')),
        this.timeoutMs
      )
      this.jobEvents.onceJobCompleted(`JOB_COMPLETED:${jobId}`, () => {
        console.log(`[QUEUE] job ${jobId} finalizado`)
        this.repository.dump()
        clearTimeout(timer)
        resolve()
      })
    })
  }
}
