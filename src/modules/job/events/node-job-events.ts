import EventEmitter from 'node:events'
import type { JobEvents, JobEventsTypes } from './job-events.ts'

export class NodeJobEvents implements JobEvents {
  private eventEmitter: EventEmitter

  constructor() {
    this.eventEmitter = new EventEmitter()
  }

  onceJobCompleted(event: JobEventsTypes, handler: () => void): void {
    this.eventEmitter.once(event, handler)
  }
  emitJobCompleted(event: JobEventsTypes): void {
    this.eventEmitter.emit(event)
  }
}

export const nodeJobEvents = new NodeJobEvents()
