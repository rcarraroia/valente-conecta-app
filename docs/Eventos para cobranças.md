Eventos para cobranças
Escute os eventos do Asaas para ter sua integração em dia.
Os Webhooks são a melhor e mais segura forma de manter os dados da sua aplicação atualizados com os dados do Asaas. Você sempre receberá um novo evento quando o status do Webhook mudar. Os eventos que o Asaas notifica são:
•	PAYMENT_CREATED - Geração de nova cobrança.
•	PAYMENT_AWAITING_RISK_ANALYSIS - Pagamento em cartão aguardando aprovação pela análise manual de risco.
•	PAYMENT_APPROVED_BY_RISK_ANALYSIS - Pagamento em cartão aprovado pela análise manual de risco.
•	PAYMENT_REPROVED_BY_RISK_ANALYSIS - Pagamento em cartão reprovado pela análise manual de risco.
•	PAYMENT_AUTHORIZED - Pagamento em cartão que foi autorizado e precisa ser capturado.
•	PAYMENT_UPDATED - Alteração no vencimento ou valor de cobrança existente.
•	PAYMENT_CONFIRMED - Cobrança confirmada (pagamento efetuado, porém, o saldo ainda não foi disponibilizado).
•	PAYMENT_RECEIVED - Cobrança recebida.
•	PAYMENT_CREDIT_CARD_CAPTURE_REFUSED - Falha no pagamento de cartão de crédito
•	PAYMENT_ANTICIPATED - Cobrança antecipada.
•	PAYMENT_OVERDUE - Cobrança vencida.
•	PAYMENT_DELETED - Cobrança removida.
•	PAYMENT_RESTORED - Cobrança restaurada.
•	PAYMENT_REFUNDED - Cobrança estornada.
•	PAYMENT_PARTIALLY_REFUNDED - Cobrança estornada parcialmente.
•	PAYMENT_REFUND_IN_PROGRESS - Estorno em processamento (liquidação já está agendada, cobrança será estornada após executar a liquidação).
•	PAYMENT_RECEIVED_IN_CASH_UNDONE - Recebimento em dinheiro desfeito.
•	PAYMENT_CHARGEBACK_REQUESTED - Recebido chargeback.
•	PAYMENT_CHARGEBACK_DISPUTE - Em disputa de chargeback (caso sejam apresentados documentos para contestação).
•	PAYMENT_AWAITING_CHARGEBACK_REVERSAL - Disputa vencida, aguardando repasse da adquirente.
•	PAYMENT_DUNNING_RECEIVED - Recebimento de negativação.
•	PAYMENT_DUNNING_REQUESTED - Requisição de negativação.
•	PAYMENT_BANK_SLIP_VIEWED - Boleto da cobrança visualizado pelo cliente.
•	PAYMENT_CHECKOUT_VIEWED - Fatura da cobrança visualizada pelo cliente.
•	PAYMENT_SPLIT_CANCELLED - Cobrança teve um split cancelado.
•	PAYMENT_SPLIT_DIVERGENCE_BLOCK - Valor da cobrança bloqueado por divergência de split.
•	PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED - Bloqueio do valor da cobrança por divergência de split foi finalizado.
Cada vez que um Webhook de cobrança é enviado, junto dele é enviado um objeto em JSON via POST com os dados completos da cobrança. Conforme este exemplo:
JSON
{
   "id": "evt_05b708f961d739ea7eba7e4db318f621&368604920",
   "event":"PAYMENT_RECEIVED",
   "dateCreated": "2024-06-12 16:45:03",
   "payment":{
      "object":"payment",
      "id":"pay_080225913252",
      "dateCreated":"2021-01-01",
      "customer":"cus_G7Dvo4iphUNk",
      "subscription":"sub_VXJBYgP2u0eO",  
         // somente quando pertencer a uma assinatura
      "installment":"2765d086-c7c5-5cca-898a-4262d212587c",
         // somente quando pertencer a um parcelamento
      "paymentLink":"123517639363",
         // identificador do link de pagamento
      "dueDate":"2021-01-01",
      "originalDueDate":"2021-01-01",
      "value":100,
      "netValue":94.51,
      "originalValue":null,
         // para quando o valor pago é diferente do valor da cobrança
      "interestValue":null,
      "nossoNumero": null,
      "description":"Pedido 056984",
      "externalReference":"056984",
      "billingType":"CREDIT_CARD",
      "status":"RECEIVED",
      "pixTransaction":null,
      "confirmedDate":"2021-01-01",
      "paymentDate":"2021-01-01",
      "clientPaymentDate":"2021-01-01",
      "installmentNumber": null,
      "creditDate":"2021-02-01",
      "custody": null,
      "estimatedCreditDate":"2021-02-01",
      "invoiceUrl":"https://www.asaas.com/i/080225913252",
      "bankSlipUrl":null,
      "transactionReceiptUrl":"https://www.asaas.com/comprovantes/4937311816045162",
      "invoiceNumber":"00005101",
      "deleted":false,
      "anticipated":false,
      "anticipable":false,
      "lastInvoiceViewedDate":"2021-01-01 12:54:56",
      "lastBankSlipViewedDate":null,
      "postalService":false,
      "creditCard":{
         "creditCardNumber":"8829",
         "creditCardBrand":"MASTERCARD",
         "creditCardToken":"a75a1d98-c52d-4a6b-a413-71e00b193c99"
      },
      "discount":{
         "value":0.00,
         "dueDateLimitDays":0,
         "limitedDate": null,
         "type":"FIXED"
      },
      "fine":{
         "value":0.00,
         "type":"FIXED"
      },
      "interest":{
         "value":0.00,
         "type":"PERCENTAGE"
      },
      "split":[
         {
            "id": "c788f2e1-0a5b-41b9-b0be-ff3641fb0cbe",
            "walletId":"48548710-9baa-4ec1-a11f-9010193527c6",
            "fixedValue":20,
            "status":"PENDING",
            "refusalReason": null,
            "externalReference": null,
            "description": null
         },
         {
            "id": "e754f2e1-09mn-88pj-l552-df38j1fbll1c",
            "walletId":"0b763922-aa88-4cbe-a567-e3fe8511fa06",
            "percentualValue":10,
            "status":"PENDING",
            "refusalReason": null,
            "externalReference": null,
            "description": null
         }
      ],
      "chargeback": {
          "status": "REQUESTED",
          "reason": "PROCESS_ERROR"
      },
      "refunds": null
   }
}
👍
Retorno do Webhook com tipagem e ENUMs
Caso você queira saber qual o tipo de cada campo e os retornos de ENUMs disponíveis, confira a resposta 200 no endpoint "Recuperar uma única cobrança" na documentação.
Tudo no Asaas é considerado uma cobrança, inclusive transferências diretas para a conta bancária, depósitos ou recebimentos via Pix. Portanto você recebe Webhooks de Cobranças para qualquer dinheiro que entrar na sua conta.
🚧
•	Com a entrada de novos produtos e funções dentro do Asaas, é possível que novos atributos sejam incluídos no Webhook. É muito importante que seu código esteja preparado para não gerar exceções caso o Asaas devolva novos atributos não tratados pela sua aplicação, pois isso poderá causar interrupção na fila de sincronização.* Enviaremos um e-mail e avisaremos em nosso Discord quando novos campos forem incluídos no Webhook. O disparo será feito para o e-mail de notificação definido nas configurações do webhook.* O array de split será devolvido apenas quando a cobrança possuir configurações de Split de Pagamento.
Como funciona o fluxo do Webhook de cobranças?
Veja mais detalhes sobre o fluxo de webhooks em recebimentos de cobranças no Asaas:
Cobrança recebida em Boleto, sem atraso:
PAYMENT_CREATED > PAYMENT_CONFIRMED > PAYMENT_RECEIVED
Cobrança recebida em Boleto, com atraso:
PAYMENT_CREATED > PAYMENT_OVERDUE > PAYMENT_CONFIRMED > PAYMENT_RECEIVED
Cobrança recebida em Pix, sem atraso:
PAYMENT_CREATED->PAYMENT_RECEIVED
Cobrança recebida em Pix, com atraso:
PAYMENT_CREATED->PAYMENT_OVERDUE ->PAYMENT_RECEIVED
Cobrança recebida em Cartão de Crédito, sem atraso:
PAYMENT_CREATED->PAYMENT_CONFIRMED -> PAYMENT_RECEIVED (32 dias após PAYMENT_CONFIRMED)
Cobrança recebida em Cartão de Débito, sem atraso:
PAYMENT_CREATED->PAYMENT_CONFIRMED -> PAYMENT_RECEIVED (3 dias após PAYMENT_CONFIRMED)
Cobrança recebida em Cartão de Crédito, com atraso:
PAYMENT_CREATED->PAYMENT_OVERDUE -> PAYMENT_CONFIRMED -> PAYMENT_RECEIVED (32 dias após PAYMENT_CONFIRMED)
Cobrança recebida em Cartão de Débito, com atraso:
PAYMENT_CREATED->PAYMENT_OVERDUE -> PAYMENT_CONFIRMED -> PAYMENT_RECEIVED (3 dias após PAYMENT_CONFIRMED)
Cobrança estornada durante fase de confirmação (Cartão de Crédito/Débito):
PAYMENT_CREATED->PAYMENT_CONFIRMED ->PAYMENT_REFUNDED
Cobrança estornada após recebimento (Cartão de Crédito/Débito):
PAYMENT_CREATED->PAYMENT_CONFIRMED -> PAYMENT_RECEIVED ->PAYMENT_REFUNDED
Cobrança estornada após recebimento (Boleto/Pix):
PAYMENT_CREATED->PAYMENT_RECEIVED ->PAYMENT_REFUNDED
Chargeback solicitado, disputa aberta e ganha pelo cliente Asaas:
PAYMENT_CREATED->PAYMENT_CONFIRMED ou PAYMENT_RECEIVED -> CHARGEBACK_REQUESTED -> CHARGEBACK_DISPUTE -> AWAITING_CHARGEBACK_REVERSAL -> PAYMENT_CONFIRMED ou PAYMENT_RECEIVED (depende se a cobrança já atingiu a data de crédito).
Chargeback solicitado, disputa aberta e ganha pelo cliente:
PAYMENT_CREATED->PAYMENT_CONFIRMED ou PAYMENT_RECEIVED -> CHARGEBACK_REQUESTED -> CHARGEBACK_DISPUTE ->PAYMENT_REFUNDED
Chargeback solicitado e disputa não aberta:
PAYMENT_CREATED->PAYMENT_CONFIRMED ou PAYMENT_RECEIVED -> CHARGEBACK_REQUESTED ->PAYMENT_REFUNDED
Cobrança confirmada em dinheiro:
PAYMENT_CREATED->PAYMENT_RECEIVED (o billingType será "RECEIVED_IN_CASH").
Cobrança em processo de negativação Serasa:
PAYMENT_CREATED->PAYMENT_OVERDUE ->PAYMENT_DUNNING_REQUESTED
Cobrança em processo de negativação Serasa recebida:
PAYMENT_CREATED->PAYMENT_OVERDUE -> PAYMENT_DUNNING_REQUESTED ->PAYMENT_DUNNING_RECEIVED
________________________________________
É importante frisar que sempre que a cobrança sofrer atraso de vencimento, ela passará pelo status PAYMENT_OVERDUE.
Ocasionalmente, outros eventos podem ser disparados, como PAYMENT_DELETED,PAYMENT_RESTORED,PAYMENT_BANK_SLIP_VIEWED e PAYMENT_CHECKOUT_VIEWED, porém são eventos que não estão ligados com processos de recebimento de valores.


Eventos para assinaturas
Escute os eventos do Asaas para ter sua integração em dia.
É possível utilizar webhook para que o seu sistema seja notificado sobre alterações que ocorram nas assinaturas. Os eventos que o Asaas notifica são:
•	SUBSCRIPTION_CREATED - Geração de nova assinatura.
•	SUBSCRIPTION_UPDATED - Alteração na assinatura.
•	SUBSCRIPTION_INACTIVATED - Assinatura inativada.
•	SUBSCRIPTION_DELETED - Assinatura removida.
•	SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK - Assinatura bloqueada por divergência de split.
•	SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED - Bloqueio da assinatura por divergência de split foi finalizado.


Exemplo de JSON a ser recebido [POST]
A notificação consiste em um POST contendo um JSON, conforme este exemplo::
JSON
{
  "id": "evt_6561b631fa5580caadd00bbe3b858607&9193",
  "event": "SUBSCRIPTION_CREATED",
  "dateCreated": "2024-10-16 11:11:04",
  "subscription": {
    "object": "subscription",
    "id": "sub_m5gdy1upm25fbwgx",
    "dateCreated": "16/10/2024",
    "customer": "cus_000000008773",
    "paymentLink": null,
    "value": 19.9,
    "nextDueDate": "22/11/2024",
    "cycle": "MONTHLY",
    "description": "Assinatura Plano Pró",
    "billingType": "BOLETO",
    "deleted": false,
    "status": "ACTIVE",
    "externalReference": null,
    "sendPaymentByPostalService": false,
    "discount": {
      "value": 10,
      "limitDate": null,
      "dueDateLimitDays": 0,
      "type": "PERCENTAGE"
    },
    "fine": {
      "value": 1,
      "type": "PERCENTAGE"
    },
    "interest": {
      "value": 2,
      "type": "PERCENTAGE"
    },
    "split": [
      {
        "walletId": "a0188304-4860-4d97-9178-4da0cde5fdc1",
        "fixedValue": null,
        "percentualValue": 20,
        "externalReference": null,
        "description": null
      }
    ]
  }
}
👍
Retorno do Webhook com tipagem e ENUMs
Caso você queira saber qual o tipo de cada campo e os retornos de ENUMs disponíveis, confira a resposta 200 no endpoint "Recuperar uma única assinatura" na documentação.
🚧
•	Com a entrada de novos produtos e funções dentro do Asaas, é possível que novos atributos sejam incluídos no Webhook. É muito importante que seu código esteja preparado para não gerar exceções caso o Asaas devolva novos atributos não tratados pela sua aplicação, pois isso poderá causar interrupção na fila de sincronização.* Enviaremos um e-mail e avisaremos em nosso Discord quando novos campos forem incluídos no Webhook. O disparo será feito para o e-mail de notificação definido nas configurações do webhook* O array de split será devolvido apenas quando a assinatura possuir configurações de Split de Pagamento.
Updated 23 days ago
Eventos para Checkout
Escute os eventos do Asaas para ter sua integração em dia.
Os Webhooks são a melhor e mais segura forma de manter os dados da sua aplicação atualizados com os dados do Asaas. Você sempre receberá um novo evento quando o status do Webhook mudar.
Como utilizar os webhooks do checkout:
POST https://api.asaas.com/api/v3/webhooks
header: access_token
JSON
{  
"name": "teste",  
"url":"<https://minha-url.com">,  
"sendType":"SEQUENTIALLY",  
"email":"[teste@teste.com](mailto:teste@teste.com)",  
"enabled":true,  
"interrupted":false,  
"events":[  
"CHECKOUT_CREATED",  
"CHECKOUT_CANCELED",  
"CHECKOUT_EXPIRED",  
"CHECKOUT_PAID"  
]  
}
O endpoint de webhook do checkout é o mesmo utilizado para criação de webhook do asaas e podemos encontrar mais informações na documentação padrão da API.
A única mudança são os eventos do checkout, no body params da requisição deve ser adicionado os eventos que desejamos acompanhar:
•	CHECKOUT_CREATED - Checkout criado
•	CHECKOUT_CANCELED - Checkout cancelado
•	CHECKOUT_EXPIRED - Checkout expirado
•	CHECKOUT_PAID - Checkout pago


Feito a configuração acima, o webhook do checkout passará a enviar requisições para a url configurada. Segue exemplo da requisição POST que será feita pelo webhook para a sua URL cadastrada:
JSON
{  
  "id": "evt_37260be8159d4472b4458d3de13efc2d&15370",  
  "event": "CHECKOUT_CREATED",  
  "dateCreated": "2024-10-31 18:07:47",  
  "checkout": {  
    "id": "2bd251f0-09b2-44ff-8a0c-a5cb29e5bbda",  
    "link": null,  
    "status": "ACTIVE",  
    "minutesToExpire": 10,  
    "billingTypes": [  
      "MUNDIPAGG_CIELO"  
    ],  
    "chargeTypes": [  
      "RECURRENT"  
    ],  
    "callback": {  
      "cancelUrl": "<https://google.com">,  
      "successUrl": "<https://google.com">,  
      "expiredUrl": "<https://google.com">  
    },  
    "items": [  
      {  
        "name": "teste2",  
        "description": "teste",  
        "quantity": 2,  
        "value": 100  
      },  
      {  
        "name": "teste2",  
        "description": "teste2",  
        "quantity": 2,  
        "value": 100  
      }  
    ],  
    "subscription": {  
      "cycle": "MONTHLY",  
      "nextDueDate": "2024-10-31T03:00:00+0000",  
      "endDate": "2025-10-29T03:00:00+0000"  
    },  
    "installment": null,  
    "split": [  
      {  
        "walletId": "c1ad713f-77fc-45b0-b734-b2ff9970d6d8",  
        "fixedValue": 2,  
        "percentualValue": null,  
        "totalFixedValue": null  
      },  
      {  
        "walletId": "c1ad713f-77fc-45b0-b734-b2ff9970d6d8",  
        "fixedValue": null,  
        "percentualValue": 2,  
        "totalFixedValue": null  
      }  
    ],  
    "customer": "cus_000000018936",  
    "customerData": null  
  }  
}
Updated 23 days ago

