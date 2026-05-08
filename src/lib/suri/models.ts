// Tipos e Modelos baseados na documentação da API Suri

export enum ChannelType {
  Messenger = 0,
  WhatsApp = 1,
  WebChat = 2,
  Instagram = 3,
}

export enum GenderType {
  Masculino = 0,
  Feminino = 1,
  Outro = 2,
}

export enum Provider {
  ChatbotMaker = 0,
  Talkjs = 4,
  Gupshup = 5,
  ZAPI = 6,
  CloudAPI = 7,
}

export enum TemplateHeaderType {
  None = 0,
  Image = 1,
  Video = 2,
  Document = 3,
}

export enum AttachmentType {
  Image = 0,
  Video = 1,
  Audio = 2,
  File = 3,
  Location = 4,
}

export enum CampaignStatus {
  Importing = 0,
  Waiting = 1,
  Running = 2,
  Cancelled = 3,
  Error = 4,
  Finished = 5,
}

// Models
export interface Blob {
  name: string;
  url: string;
}

export interface Session {
  id: string;
  type: number;
  start: Date | string;
  end: Date | string;
  windowEnd: Date | string;
  answered: boolean;
  delivered: boolean;
}

export interface User {
  id: string;
  name: string;
  chatbotId: string;
  channelId: string;
  channelType: ChannelType;
  phone: string;
  email: string;
  profilePicture: Blob;
  gender: GenderType;
  identificationDocument: string;
  note: string;
  dateCreate: Date | string;
  lastActivity: Date | string;
  lastMessageActivity: Date | string;
  tags: string[];
  currentDialog: string;
  variables: Record<string, string>;
  session: Session;
  allowedMessageType: number;
}

export interface Attendant {
  id: string;
  name: string;
  email: string;
}

export interface CustomData {
  agentId: string | null;
  departmentId: string | null;
  senderType: "chatbot" | "agent" | "API";
}

export interface Message {
  conversationId: string;
  createdAt: Date | string;
  id: string;
  text: string;
  type: string;
  custom: Record<string, string>;
}

export interface AttachmentFile {
  url: string;
  fileName: string;
}

export interface TemplateButton {
  type: number;
  text: string;
  url?: string;
  example?: string;
  phone?: string;
}

export interface Template {
  isWhatsappTemplate: boolean;
  channelName?: string;
  channelId?: string;
  channelProvider?: Provider;
  messageId?: string;
  messageName: string;
  rejectedReason?: string;
  headerType?: number;
  category?: string;
  templateType?: string;
  attachmentsFiles?: AttachmentFile[];
  variableExamples: string[];
  buttons: TemplateButton[];
  status?: number;
  id: string;
  chatbotId: string;
  title: string;
  body: string;
  subject?: string;
  parameters: number;
}

export interface MessageOutAttachment {
  type: AttachmentType;
  fileName?: string;
  url?: string;
  size?: number;
  latitude?: string;
  longitude?: string;
}

export interface MessageOutOption {
  type: number;
  title: string;
  description?: string;
  postback?: string;
}

export interface MessageOutButton {
  headerType: number;
  header?: string;
  headerFileName?: string;
  body: string;
  options: MessageOutOption[];
}

export interface MessageOutListSection {
  title: string;
  options: MessageOutOption[];
}

export interface MessageOutList {
  body: string;
  buttonTitle: string;
  sections: MessageOutListSection[];
}

export interface MessageOutTemplate {
  id: string;
  headerType: number;
  header?: string;
  headerFileName?: string;
  offerExpireTime?: string;
  bodyParameters: string[];
  buttonParameters: string[];
  orderParameters?: any; // Omitido na documentação detalhada
}

export interface MessageOut {
  id: string;
  type: number;
  text?: string;
  attachments: MessageOutAttachment[];
  button?: MessageOutButton;
  list?: MessageOutList;
  template?: MessageOutTemplate;
  catalog?: any;
  catalogProduct?: any;
  flow?: any;
  payment?: any;
  orderDetails?: any;
}

export interface Channel {
  name: string;
  provider: Provider;
  id: string;
  type: ChannelType;
}

export interface Department {
  id: string;
  name: string;
}

export interface CampaignAction {
  type: number;
  templateId: string;
  templateFile: {
    url: string;
    fileName: string;
  };
}

export interface Campaign {
  id: string;
  chatbotId: string;
  name: string;
  channelId: string;
  when: Date | string;
  scheduled: boolean;
  status: CampaignStatus;
  totalContacts: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalErrors: number;
  totalAnswered: number;
  processingErrors: string[];
  actions: CampaignAction[];
  dateCreate?: Date | string;
  createdByPlatformUserId?: string;
  dateStart?: Date | string;
  startedByPlatformUserId?: string;
  dateCancel?: Date | string;
  cancelledByPlatformUserId?: string;
  response?: any;
}

export interface CampaignUserExport {
  numero: string;
  nome?: string;
  status: string;
  mensagemDeErro: string;
  parametros: string;
  variaveis?: Record<string, string>;
}

export interface CampaignUser {
  phone: string;
  parameters: string[];
  name?: string;
  variables?: Record<string, string>;
}

export interface CampaignResponse {
  type: number;
  sendTo: string;
}

// Webhook events
export interface WebhookEventBase {
  id: string;
  type: string;
  timestamp: number;
  payload: any;
}

export interface WebhookNewContactEvent extends WebhookEventBase {
  type: "new-contact";
  payload: {
    user: User;
  };
}

export interface WebhookChangeQueueEvent extends WebhookEventBase {
  type: "change-queue";
  payload: {
    from: string;
    to: string;
    user: User;
    attendant: Attendant;
  };
}

export interface WebhookFinishAttendanceEvent extends WebhookEventBase {
  type: "finish-attendance";
  payload: {
    attendanceTime: number;
    departmentId: string | null;
    tags: string[];
    user: User;
    message: Message[];
    attendant: Attendant;
  };
}

export interface WebhookMessageReceivedEvent extends WebhookEventBase {
  type: "message-received";
  payload: {
    user: User;
    message: Message;
  };
}

export interface WebhookMessageSentEvent extends WebhookEventBase {
  type: "message-sent";
  payload: {
    user: User;
    channel: Channel;
    message: MessageOut;
    messageId: string;
    attendant?: Attendant;
  };
}
