# Mini Job Queue - Node.js

Este é um **mini projeto de fila de jobs** implementado em Node.js, usando **TypeScript**, **Fastify** e uma abordagem **event-driven**, com persistência mínima (in-memory).

O objetivo é demonstrar como gerenciar jobs assíncronos de forma segura, garantindo que:

-   Jobs sejam processados **um a um** ou com limite de concorrência.
-   Jobs possam ser criados e processados mesmo que eventos de conclusão cheguem antes do processamento.
-   Timeout seja aplicado para jobs que não recebem resposta.
-   Status de jobs seja persistido (mesmo que temporariamente em memória).
-   Eventos sejam tratados de forma idempotente, evitando vazamentos de memória.

---

## Conceitos aplicados

### 1. **Fila de jobs com polling**

-   A fila (`JobQueue`) verifica periodicamente o banco (ou repositório) por jobs **pendentes**.
-   Quando encontra, muda o status para `PROCESSING` e envia o job para um serviço externo.

### 2. **Processamento assíncrono**

-   Cada job pode levar tempo para ser processado.
-   O `sendJob` é uma função assíncrona que simula envio para um serviço externo.

### 3. **Eventos para conclusão**

-   Quando o serviço externo finaliza um job, um evento é emitido (`JobEvents`).
-   O `JobQueue` escuta esses eventos para marcar jobs como `DONE`.
-   Para evitar problemas, antes de registrar o listener, a fila verifica o status no banco. Isso evita travar a fila se o evento chegar antes do job ser processado.

### 4. **Timeout**

-   Cada job possui um timeout configurável (`timeoutMs`).
-   Se o job não finalizar dentro desse tempo, é marcado como `FAILED` e a fila continua processando os próximos jobs.

### 5. **Idempotência**

-   Eventos de conclusão podem chegar antes ou depois do processamento.
-   A lógica é idempotente: mesmo se um job já estiver `DONE`, não ocorrerá duplicação ou travamento.

### 6. **Singleton**

-   O `JobQueue` é exportado como singleton para garantir uma instância única por processo.
-   Isso centraliza o gerenciamento da fila em toda a aplicação.

---

## Fluxo de status dos jobs

```
PENDING   →  PROCESSING  →  DONE
                   ↓
                 FAILED
```

-   **PENDING**: Job foi criado, mas ainda não entrou na fila.
-   **PROCESSING**: Job está sendo processado pela fila.
-   **DONE**: Job finalizado com sucesso (evento emitido).
-   **FAILED**: Job não finalizou dentro do timeout ou deu erro.

### Endpoint `/finish/:id`

-   Recebe notificações de jobs finalizados pelo serviço externo.
-   Valida o status atual do job antes de atualizar:

| Status atual | Resposta do endpoint                    |
| ------------ | --------------------------------------- |
| PENDING      | 400 – job ainda não começou a processar |
| PROCESSING   | Atualiza para DONE e emite evento       |
| DONE         | 400 – job já finalizado antes           |
| FAILED       | 400 – job deu erro antes                |

-   Só jobs que estão **em processamento** podem ser finalizados via endpoint.

---

## Uso

### 1. Rodar

```bash
npm run start
```

-   Irá ser criado alguns jobs e mostrado no console
-   A fila detecta jobs **pendentes** e processa automaticamente.

### 2. Notificar conclusão

-   Envie uma requisição com o id job em processamento em `client.http`
-   Endpoint `/finish/:id` marca o job como `DONE` **somente se estiver PROCESSING**
-   Jobs PENDING ou já DONE/FAILED retornam erro para evitar inconsistência.

---

## Benefícios do design

-   **Segurança contra eventos fora de ordem**
-   **Controle de timeout** para jobs que não respondem
-   **Processamento assíncrono** sem travar o Node.js
-   **Fila persistente e confiável** mesmo com jobs criados externamente
-   **Idempotência** garantindo que eventos repetidos não quebrem o sistema
-   **Fluxo de status claro**, com endpoint validando cada transição

---
