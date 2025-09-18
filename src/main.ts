import { app } from './app.ts'
import type { Job } from './modules/job/job.ts'
import { JobQueue } from './modules/job/queue/job-queue.ts'
import { seedJobs } from './seed.ts'

export const sendJobSimulator = async (job: Job) => {
  console.log(`[EXTERNAL] job ${job.id} enviado para serviço externo`)
}
;(() => {
  seedJobs()

  const queue = JobQueue.getInstance()

  queue.start()

  app.listen({ port: 3000 }, () => console.log('server is running'))
})()
