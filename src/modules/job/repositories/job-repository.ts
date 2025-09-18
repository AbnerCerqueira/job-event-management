import type { Job, JobStatus } from '../job.ts'

export interface JobRepository {
  save(job: Job): Promise<void>
  findById(jobId: string): Promise<Job | null>
  findNextPending(): Promise<Job | null>
  updateStatus(id: string, status: JobStatus): Promise<void>
  dump(): void
}
