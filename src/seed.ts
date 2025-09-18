import { randomUUID } from 'node:crypto'
import { inMemoryJobRepository } from './modules/job/repositories/in-memory-job-repository.ts'

export function seedJobs() {
  for (const _ of Array.from({ length: 5 })) {
    inMemoryJobRepository.save({
      id: randomUUID(),
      payload: {},
      status: 'PENDING',
      createdAt: new Date(),
    })
  }
  inMemoryJobRepository.dump()
}
