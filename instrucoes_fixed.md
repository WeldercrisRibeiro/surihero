Suri
Por aqui vamos te ajudar a usar todas as funcionalidades da nossa plataforma da melhor forma possível para encantar seus clientes.

Esta documentação contém todos os Endpoints existentes na API, definições e informações sobre Webhooks. Para dicas sobre como integrar a Suri em seu fluxo de conversação, veja nosso Manual de Integração.

AUTHORIZATION
Bearer Token
Token
CHABOT-TOKEN

GET
Retornar fluxo
CHATBOT-URL/api/flows/:flowId
AUTHORIZATION
Bearer Token
This request is using Bearer Token from folderAPIs
PATH VARIABLES
flowId
{{flowId}}

### Example Request
**200 - OK**
```bash
curl --location -g 'CHATBOT-URL/api/flows/{{flowId}}' \
--header 'Authorization: Bearer <token>'
```

### Example Response
**200 OK**
```json
{
  "success": true,
  "data": {
    "id": "cb44367",
    "chatbotId": "cb44358",
    "trigger": {
      "intentId": "7775b51e-b4bf-4171-97e6-1f035bd613e3",
      "trainingPhrases": [],
      "adIds": [],
      "sequenceIds": [],
      "messageSequence": null,
      "webhook": null,
      "generativePrompt": null
    },
    "name": "Boas-vindas",
    "actions": [
      {
        "$type": "ChatbotMaker.BDK.Models.API.ApiFlowActionSendText, ChatbotMaker.BDK",
        "text": "Olá, tudo bem? Seja bem vindo(a) ao atendimento Suri!",
        "type": 0,
        "delay": 0,
        "isEndFlow": false
      },
      {
        "$type": "ChatbotMaker.BDK.Models.API.ApiFlowActionGoToFlow, ChatbotMaker.BDK",
        "flowId": "cb44362",
        "type": 3,
        "delay": 0,
        "isEndFlow": true
      }
    ],
    "followUp": null,
    "assistantBehavior": {
      "enabled": false,
      "followUpFlowId": null,
      "exitFlowId": null,
      "maxAnswers": null,
      "instructions": null,
      "feedbackMessage": null,
      "firstTimeFeedback": false,
      "allowedAnswerSize": 0,
      "useDynamicMaxAnswers": false,
      "forceAccessKnownledgeBase": false,
      "functions": []
    },
    "fixed": true,
    "version": 3
  },
  "error": null,
  "validationErrors": null
}
```

# Webhooks
# Webhooks
Existem 5 tipos de eventos que podem ser entregues no seu webhook, eles são:

new-contact

change-queue

finish-attendance

message-received

message-sent

O estrutura abaixo é a base de todos os eventos. O informação em payload muda de acordo com o respectivo tipo de evento, que são descritos na próxima seção.

```json
{
    "id": "cb1000000",
    "type": "new-contact",
    "timestamp":1580142086287,
    "payload": {}
}
```

| Property | Type | Description |
|---|---|---|
| id | string | Identificação do chatbot que gerou o evento |
| type | string | Tipo de contato new-contact |
| timestamp | long | Tempo em unix timestamp de quando o evento ocorreu no chatbot |
| payload | event_payload | Payload contem a informação do respectivo evento. Veja próxima parte da documentação |

# Eventos
## Novo contato (new-contact)
{
    ...
    "payload": {}
}
```

| Property | Type | Description |
|---|---|---|
| user | User | Informações do novo usuário |

## Troca de fila (change-queue)
```json
{
    ...
    "payload": {
        "from": "automatic",
        "to": "waiting",
        "user": ,
        "attendant": {}
    }
}
```

| Property | Type | Description |
|---|---|---|
| from | string | Tipo de fila automatic |
| to | string | Tipo de fila automatic |
| user | User | Informações do usuário |

## Finalização de atendimento (finish-attandance)
```json
{
    ...
    "payload": {
        "attendanceTime": 245,
        "departmentId": "cbxxxxxx",
        "tags": ["tag1", "tag2"],
        "user": ,
        "attendant": ,
        "messages": []
    }
}
```

| Property | Type | Description |
|---|---|---|
| attendanceTime | long | Quanto tempo o atendimento levou em segundos |
| departmentId | string | null |
| tags | string[] | Lista de tags do atendimento |
| user | User | Informações do usuário |
| message | Message | Mensagens trocadas |
| attendant | Attendant | Informações do atendente que fez o atendimento |

## Mensagem Recebida (message-received)
```json
```json
{
    ...
    "payload": {
        "user": ...,
        "message": ...
    }
}
```

| Property | Type | Description |
|---|---|---|
| user | User | Informações do contato |
| message | Message | Mensagens trocadas |

## Mensagem Enviada (message-sent)
```json
{
    ...
    "payload": {
        "user": ...,
        "channel": ...,
        "message": ...,
        "messageId": ...,
        "attendant": ...
    }
}
```

| Propriedade | Tipo | Obrigatório? | Descrição |
|---|---|---|---|
| user | User | Sim | Informações do contato |
| channel | Channel | Sim | Informações do canal |
| message | MessageOut | Sim | Detalhes da mensagem. Ver definição do modelo na página Models |
| messageId | string | Sim | ID da mensagem enviada |
| attendant | Attendant | Não | Atendente que enviou a mensagem. Opcional, só vem settada quando a mensagem foi de fat enviado por um atendente humano |

# Models
### User

| Propriedade | Tipo | Descrição |
|---|---|---|
| id | string | Identificação do usuário |
| name | string | Nome do usuário |
| chatbotId | string | Id do chatbot associado |
| channelId | string | Id do canal associado |
| channelType | ChannelType | Enumerável com tipo de canal conectado. Valores possíveis: 0 para Messenger, 1 para WhatsApp, 2 para Webchat, 3 para Instagram |
| phone | string | Telefone do usuário |
| email | string | E-mail do usuário |
| profilePicture | blob | Objeto de foto do usuário (ver descrição mais abaixo) |
| gender | GenderType | Enumerável com gênero associado. Valores possíveis: 0 para Masculino, 1 para Feminino, 2 para Outro |
| identificationDocument | string | Documento válido identificador |
| note | string | Anotação sobre o usuário |
| dateCreate | dateTime | Data de criação do usuário |
| lastActivity | dateTime | Última atividade realizada com o usuário. ATENÇÃO: pode ser uma leitura de mensagem ou uma mensagem enviada pelo atendente ao contato. Se você estiver precisando saber a data da última mensagem enviada PELO CONTATO, utilizar o atributo abaixo |
| lastMessageActivity | dateTime | Data da última mensagem enviada PELO CONTATO |
| tags | string[] | Lista de tags |
| currentDialog | string | Uri do diálogo em que o usuário estava |
| variables | object | Dicionário string-string onde a chave é o nome da variável e o valor é o valor da variável |
| session | Session | Objeto que representa o estado da sessão atual do contato, útil para saber se ele está com conversa aberta e o tipo da mesma (ativa ou receptiva). Ver descrição mais abaixo |
| allowedMessageType | int | Tipo de mensagem que o contato pode receber do chatbot ou atendente do Portal. Valores possíveis: 0 para nenhum (contato não pode ser contactado), 1 para qualquer tipo (sem restrições de mensagem), 2 para template (apenas mensagens templates são permitidas). |

### Session

| Propriedade | Descrição |
|---|---|
| id | String. ID único da sessão |
| type | Number. Tipo da sessão (0 para receptivo, 1 para ativo) |
| start | Datetime. Data e hora de início da sessão |
| end | Datetime. Data e hora do término da sessão |
| windowEnd | Datetime. Data e hora do término da janela de sessão. Em caso de canal WhatsApp, essa data é igual à data de última mensagem do contato + 24h, que representa o período em que a empresa pode enviar mensagens comuns (sem ser template) para o contato. Em canais não WhatsApp, esta data sempre é igual a end. |
| answered | Boolean. Se contato respondeu à mensagem enviada pela empresa (se type = 0 é sempre true). Note que, se type = 1 (ativo) a sessão só vai estar de fato aberta se answered = tre. |
| delivered | Boolean. Se contato recebeu a mensagem enviada pela empresa (se type = 0 é sempre true). |

### ChannelType

| ChannelType | Descrição |
|---|---|
| 0 | Messenger |
| 1 | WhatsApp |
| 2 | WebChat |
| 3 | Instagram |

### Blob

| Propriedade | Tipo | Descrição |
|---|---|---|
| name | string | Nome do arquivo |
| url | string | Url de fonte da foto |

### GenderType

| GenderType | Descrição |
|---|---|
| 0 | Masculino |
| 1 | Feminino |
| 2 | Outro |

### Attendant

| Propriedade | Tipo | Descrição |
|---|---|---|
| Id | string | Identificador do atendente |
| Name | string | Nome do atendente |
| Email | string | Email do atendente |

### Message

| Propriedade | Tipo | Descrição |
|---|---|---|
| conversationId | string | Identificador da conversa (contato) |
| createdAt | date | Data de criação em unix time |
| id | string | Identificador da mensagem |
| text | string | Texto da mensagem |
| type | string | Tipo da mensagem |
| custom | Dictionary{ [key: string]: string } | Dicionário com informações extras sobre mensagens enviadas. Vem vazio quando type = UserMessage |

### CustomData

| Chave | Tipo | Descrição |
|---|---|---|
| agentId | string / null | Identificador do agente que estava atendendo o usuário. Nulo quando o usuário não está em atendimento. |
| departmentId | string / null | Identificador do departamento atual do usuário. Nulo quando o usuário está sem nenhum departamento. |
| senderType | SenderType (string) | Indica qual a origem da mensagem. Valores possíveis: "chatbot" para mensagem enviada pelo bot, "agent" para mensagens enviadas por um atendente humano, "API" para mensagens enviadas pela API |
| SenderType | Descrição |
| chatbot | Mensagem automática enviada pelo chatbot |
| agent | Mensagem enviada por um atendente |
| API | Mensagem enviada pela API |

### Mensagem modelo (Template)

| Propriedade | Tipo | Descrição |
|---|---|---|
| isWhatsappTemplate | boolean | Boolean indicando se mensagem é mensagem modelo do WhatsApp (template) |
| channelName | string? | Nome do canal o qual mensagem modelo pertence. (Opcional, obrigatório apenas quando isWhatsAppTemplate é true |
| channelId | string? | ID do canal o qual mensagem modelo pertence. (Opcional, obrigatório apenas quando isWhatsAppTemplate é true. |
| channelProvider | ChannelProvider? | Enum de provedor do canal (ver opções mais abaixo na tabela Provider. Opcional, obrigatório apenas quando isWhatsAppTemplate é true). Valores possíveis: 5 para Gupshup, 6 para Z-API e 7 para SURI |
| messageId | string? | ID da template do WhatsApp. É este ID que utilizamos para enviar mensagem template via API. (Opcional, obrigatório apenas quando isWhatsAppTemplate é true) |
| messageName | string | Nome da template no WhatsApp (criado internamente via Meta. Opcional, obrigatório apenas quando isWhatsAppTemplate é true) |
| rejectedReason | string? | Motivo da rejeição da template pelo WhatsApp, em caso de template não aprovada (Opcional). |
| headerType | int? | Valores possíveis: 0 para imagem, 1 para vídeo, 2 para documento (Opcional). |
| category | string? | Categoria da mensagem template do WhatsApp. Pode ser "MARKETING", "UTILITY", "AUTHENTICATION" (Opcional, obrigatório apenas quando isWhatsAppTemplate é true) |
| templateType | string? | Tipo da template do WhatsApp, se é texto ("TEXT"), imagem ("IMAGE"), vídeo ("VIDEO") ou documento ("DOCUMENT"). Opcional. |
| attachmentsFiles | AttachmentFile[]? | Lista de anexos da mensagem template do WhatsApp, quando possui. Opcional. Ver descrição do tipo mais abaixo. |
| variableExamples | string[] | Exemplos de parâmetros (variáveis) existentes no Body da mensagem modelo. Esses exemplos são os mesmos que são informados na hora de montar a template pelo Portal. |
| buttons | TemplateButton[] | Botões da template do WhatsApp, se existirem. Ver descrição do tipo mais abaixo. |
| status | TemplateStatus? | Enumerável de status da template do WhatsApp. Valores possíveis: 0 para Aprovado, 1 para Esperando, 2 para Rejeitado, 3 para Deletado, 4 para Desabilitado e 5 para Pausado. |
| id | string | Id do modelo de mensagem. É o ID interno, que NÃO é utilizado para o envio via API. Para o envio, utilizar o campo messageId. |
| chatbotId | string | Id do chatbot. |
| title | string | Título do modelo de mensagem |
| body | string | Corpo do modelo de mensagem. Se a template possui variáveis (parâmetros), os mesmos são representados por {{1}}, {{2}}, etc. |
| subject | string? | Assunto do modelo de mensagem (opcional). Utilizado unicamente para fins de filtro e organização no painel. |
| parameters | int | Número de parâmetros (variáveis) utilizados no corpo da template (body). |

### AttachmentFile

| Propriedade | Tipo |
|---|---|
| url | string |
| fileName | string |

### TemplateButton

| Propriedade | Tipo | Descrição |
|---|---|---|
| type | int | Enumerável do tipo de botão de template. Valores possíveis: 0 para Botão de URL, 1 para número de telefone e 2 para resposta rápida. |
| text | string | Texto do botão. No caso de botão de resposta rápida, esse também é o valor enviado quando uma pessoa seleciona tal botão. |
| url | string? | Url do botão. Opcional, obrigatório apenas em caso de type = 0. Caso a url possua parâmetro (variável) no final da url, ela aparecerá representada por {{1}}. |
| example | string? | Exemplo de url quando a mesma possui um parâmetro (variável), tendo tal parâmetro preenchido. Por exemplo, se a url é https://ex.com/{{1}}, um exemplo pode ser https://ex.com/1234. |
| phone | string? | Telefone do botão detefone. Opcional, obrigatório quando type = 1. |

### MessageOut (Mensagem enviada)

| Propriedade | Tipo | Obrigatório? | Descrição |
|---|---|---|---|
| id | string | Sim | Id da mensagem |
| type | int (enum) | Sim | Tipo de mensagem, ver todos os tipos possíveis nas descrições de cada lnha abaixo. |
| text | string | Não | Texto da mensagem enviada, quando a mensagem é do tipo Text (type 0) |
| attachments | MessageOutAttachment[] | Sim | Lista de anexos enviada na mensagem, quando é do tipo Attachment (type 1), nos demais casos é sempre um array vazio []. |
| button | MessageOutButton | Não | Payload de mensagem de botão, quando type = 2. |
| list | MessageOutList | Não | Payload de mensagem de lista, quando type = 3. |
| template | MessageOutTemplate | Não | Payload de mensagem template, quando type = 4. |
| catalog | MessageOutCatalog | Não | Payload de mensagem de catálogo do WhatsApp, quando type = 5. |
| catalogProduct | MessageOutCatalogProduct | Não | Payload de mensagem de produto do catálogo do WhatsApp, quando type = 6 |
| flow | MessageOutFlow | Não | Payload de mensagem de WhatsAppFlow, quando type = 7 |
| payment | MessageOutPayment | Não | Payload de mensagem de WhatsApp Payment, quando type = 8 |
| orderDetails | MessageOutOrderDetails | Não | Payload de mensagem de detalhes do pedido (WhatsApp Payment), quando type = 9 |

Veja abaixo cada um dos tipos citados na tabela acima:

### MessageOutAttachment

| Propriedade | Tipo | Obrigatório? | Descrição |
|---|---|---|---|
| type | int (enum) | Sim | Tipo de anexo. Valores possíveis: 0 para imagem, 1 para vídeo, 2 para áudio, 3 para arquivo, 4 para localização |
| fileName | string | Não | Nome do arquivo, quando disponível. |
| url | string | Não | Link para o arquivo |
| size | int | Não | Tamanho do arquivo em bytes, quando disponível |
| latitude | string | Não | Latitude, quando o anexo é de localização (type 4) |
| longitude | string | Não | Longitude, quando o anexo é de localização (type 4) |

### MessageOutButton

| Propriedade | Tipo | Obrigatório? | Descrição |
|---|---|---|---|
| headerType | int (enum) | Sim | Tipo de cabeçalho do botão. Valores possíveis: 0 para nenhum, 1 para texto, 2 para imagem, 3 para vídeo, 4 para arquivo |
| header | string | Não | Conteúdo do cabeçalho, quando disponível |
| headerFileName | string | Não | Nome do arquivo do cabeçalho, quando disponível |
| body | string | Sim | Corpo textual do botão |
| options | MessageOutOption[] | Sim | Lista de opções de botão. Ver definição mais abaixo |

### MessageOutOption

| Propriedade | Tipo | Obrigatório? | Descrição |
|---|---|---|---|
| type | int (enum0 | Sim | Tipo de botão. Valores possíveis: 0 para resposta rápida, 1 para URL, 2 para Telefone, 3 para Copia-E-Cola |
| title | string | Sim | Título do botão/item da lista |
| description | string | Não | Descrição (subtítulo) da opção |
| postback | string | Não | Postback do botão/lista (o valor pode ser utilizado internamente para realização de alguma ação) |

### MessageOutList

| Propriedade | Tipo | Obrigatório? | Descrição |
|---|---|---|---|
| body | string | Sim | Corpo de texto da lista |
| buttonTitle | string | Sim | Texto do botão que abre a lista |
| sections | MessageOutListSection[] | Sim | Lista de seções da lista. Seções são um agrupamento de opções |

### MessageOutListSection

| Propriedade | Tipo | Obrigatório? | Descrição |
|---|---|---|---|
| title | string | Sim | Título da seção |
| options | MessageOutOption[] | Sim | Lista de opções da seção |

### MessageOutTemplate

| Propriedade | Tipo | Obrigatório? | Descrição |
|---|---|---|---|
| id | string | Sim | Id da template, é o mesmo id utilizado no envio |
| headerType | int (enum) | Sim | Tipo de cabeçalho da template. Valores possíveis: 0 para nenhum, 1 para imagem, 2 para vídeo, 3 para arquivo |
| header | string | Não | Conteúdo do cabeçalho (link) quando disponível |
| headerFileName | string | Não | Nome do arquivo de cabeçalho, quando disponível |
| offerExpireTime | string | Não | Tempo de término de oferta da template. Representa uma data no fuso UTC no padrão ISO |
| bodyParameters | string[] | Sim | Lista de variáveis enviadas no corpo da template, quando disponível, caso contrário é apenas um array vazio [] |
| buttonParameters | string[] | Sim | Lista de variáveis enviadas nos botões da template, quando disponível, caso contrário é apenas um array vazio [] |
| orderParameters | OrderParameters | Não | Detalhes do pedido, enviados na template, é o mesmo modelo que está definido na página de envio de template de pagamento |

### Channel

| Propriedade | Tipo | Descrição |
|---|---|---|
| name | string | Nome do canal |
| provider | int | Enumerável com provedor do canal (veja opções na tabela abaixo) |
| id | string | Id do canal |
| type | int | Enumerável do tipo de canal (veja opções na tabela abaixo) |
| Provider | Descrição |
| 0 | ChatbotMaker |
| 4 | Talkjs |
| 5 | Gupshup |
| 6 | Z-API |
| 7 | CloudAPI |
| Type | Descrição |
| 0 | Messager |
| 1 | WhatsApp |
| 2 | WebChat |
| 3 | Instagram |

### Department

| Propriedade | Tipo | Descrição |
|---|---|---|
| id | string | Identificador do departamento |
| name | string | Nome do departamento |

### Campaign

| Propriedade | Tipo | Descrição |
|---|---|---|
| Id | string | Id da campanha |
| ChatbotId | string | Id da template a ser usada na campanha |
| Name | string | Arquivo a ser enviado caso a template permita |
| ChannelId | string | Id do canal usado na campanha |
| When | DateTime | Data na qual a campanha deve ser executada. Caso a campanha não tenha sido agendada para iniciar determinado horário, a hora retornada é a padrão 0000-00-00T00:00:00. |
| Scheduled | bool | Se a campanha foi agenda ou não |
| Status | int | Enumerador que representa o estado atual da campanha |
| TotalContacts | int | Total de contatos na campanha |
| TotalSent | int | Total de mensagens enviadas |
| TotalDelivered | int | Total de contatos que receberam a campanha |
| TotalRead | int | Total de contatos que leram a campanha |
| TotalErrors | int | Total de contatos com erros ao enviar a campanha |
| TotalAnswered | int | Total de contatos que responderam a campanha |
| ProcessingErrors | string[] | Lista dos erros que aconteceram ao relacionar os parametros ao contatos da campanha |
| Actions | CampaignAction[] | Lista de ações da campanha |
| DateCreate |  |  |
| CreatedByPlatformUserId |  |  |
| DateStart |  | Data de início da campanha. Caso a campanha não tenha sido iniciada ainda, a hora retornada é a padrão 0000-00-00T00:00:00. |
| StartedByPlatformUserId |  |  |
| DateCancel |  | Data que a campanha foi cancelada. Caso a campanha não tenha sido cancelada, a hora retornada é a padrão 0000-00-00T00:00:00. |
| CancelledByPlatformUserId |  |  |
| Response |  |  |
| Status | Descrição |
| 0 | Contatos estão sendo importados para a campanha |
| 1 | Contatos foram importados e a campanha está aguardando a data de agendamento ou ser iniciada manualmente |
| 2 | A campanha foi iniciada e está sendo executada |
| 3 | A campanha foi cancelada |
| 4 | Algum erro aconteceu e a campanha não pode ser executada |
| 5 | A campanha foi executada e está finalizada |

### CampaignUserExport

| Propriedade | Tipo | Descrição |
|---|---|---|
| Número | string | Número do contato |
| Nome | string | Nome do contato. Opcional. |
| Status | string | Estado do usuário na campanha (Aguardando, Lido, Enviado, Entregue, Erro ou Respondido) |
| Mensagem de erro | string | Messagem de erro caso não tenha sido possível enviar a mensagem |
| Parametros | string | Parametros usados para esse usuário (concatenados por "; ") |
| Variaveis | [ [key: string]: string] | Variáveis adicionadas/atualizadas ao contato durante a campanha. Opcional. Só é settado quando as variávels foram previamente informadas. Padrão: null |

### CampaignAction

| Propriedade | Tipo | Descrição |
|---|---|---|
| Type | int | Enumerável definindo o que será feito na campanha. OBS: Apenas o tipo 0 (enviar template) está disponível. |
| TemplateId | string | Id da template a ser usada na campanha |
| TemplateFile | TemplateFile | Arquivo a ser enviado caso a template permita |

### Template File

| Propriedade | Tipo | Descrição |
|---|---|---|
| Url | string | Url do arquivo a ser enviado na campanha. O arquivo deve respeitar os limites de anexos do whatsapp. |
| FileName | string | Nome do arquivo a ser usado |

### CampaignUser

| Propriedade | Tipo | Descrição |
|---|---|---|
| Phone | string | Número de telefone para mensagem ser enviada |
| Parameters | string[] | Lista de parametros a ser usado na template. A quantidade de parametros deve corresponder com a quantidade de variáveis na template usada. |
| Name | string | Opcional. Nome do contato a ser criado. Se o contato já existir, o nome é atualizado |
| Variables | [ [key: string]: string ] | Opcional. Dicionário string -> string que define variáveis para criar junto ao contato. Se as variáveis já existirem, serão atualizadas. |

### CampaignResponse

| Propriedade | Tipo | Descrição |
|---|---|---|
| Type | int | Enumerável que define para o que o usuário deve ser direcionado. |
| SendTo | string | Id do departamento ou intenção ou Flow a qual o usuário deve ser direcionado ao responder a campanha. |
| Type | Descrição |
| 0 | Direcionar para departamento |
| 1 | Direcionar para intenção |
| 2 | Direcionar para flow |