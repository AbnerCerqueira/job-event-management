export interface JobEvents {
  onceJobCompleted(event: JobEventsTypes, handler: () => void): void
  emitJobCompleted(event: JobEventsTypes): void
}

type JobId = string
export type JobEventsTypes = `JOB_COMPLETED:${JobId}`
