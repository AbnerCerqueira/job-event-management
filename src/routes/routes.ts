import type { FastifyInstance } from 'fastify'
import { nodeJobEvents } from '../modules/job/events/node-job-events.ts'
import { inMemoryJobRepository } from '../modules/job/repositories/in-memory-job-repository.ts'
import { HTTP_STATUS } from './utils.ts'

export const routes = (app: FastifyInstance) => {
  app.get('/finish/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const foundJob = await inMemoryJobRepository.findById(id)

    console.log('[ENDPOINT] notificação de sucesso recebida')

    switch (foundJob?.status) {
      case 'DONE':
        return reply
          .status(HTTP_STATUS.BAD_REQUEST)
          .send({ message: 'job ja foi finalizado antes' })
      case 'FAILED':
        return reply
          .status(HTTP_STATUS.BAD_REQUEST)
          .send({ message: 'job deu erro antes' })
      case 'PENDING':
        return reply
          .status(HTTP_STATUS.BAD_REQUEST)
          .send({ message: 'job ainda não começou a processar' })
      default: {
        inMemoryJobRepository.updateStatus(id, 'DONE')
        nodeJobEvents.emitJobCompleted(`JOB_COMPLETED:${id}`)

        return reply.send({ message: 'job finalizado com sucesso' })
      }
    }
  })
}
