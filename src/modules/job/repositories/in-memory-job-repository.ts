/** biome-ignore-all lint/suspicious/useAwait: aqui pode*/

import type { Job, JobStatus } from '../job.ts'
import type { JobRepository } from './job-repository.ts'

export class InMemoryJobRepository implements JobRepository {
  private readonly jobs: Job[] = []

  async save(job: Job): Promise<void> {
    this.jobs.push(job)
  }

  async findById(jobId: string): Promise<Job | null> {
    return this.jobs.find((j) => j.id === jobId) ?? null
  }

  async findNextPending(): Promise<Job | null> {
    return this.jobs.find((j) => j.status === 'PENDING') ?? null
  }

  async updateStatus(id: string, status: JobStatus): Promise<void> {
    const foundJob = this.jobs.find((j) => j.id === id)

    if (foundJob) {
      foundJob.status = status
    }
  }

  dump() {
    console.table(this.jobs)
  }
}

export const inMemoryJobRepository = new InMemoryJobRepository()
