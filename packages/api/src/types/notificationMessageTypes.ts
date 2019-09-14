export interface MailMessage {
  subject: string;
  toEmailMailId: string;
  mailContent: string;
}

export interface SmsMessage {
  mobileNumber: number;
  smsContent: string;
}

export interface EmailMessage {
  messageContent: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  subject: string;
  ccEmail: string;
}
