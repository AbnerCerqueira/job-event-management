export type JobStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'

export type Job = {
  id: string
  payload: any
  status: JobStatus
  createdAt: Date
}
