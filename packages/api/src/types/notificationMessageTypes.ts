export interface MailMessage {
  subject: string;
  toEmailMailId: string;
  mailContent: string;
}

export interface SmsMessage {
  mobileNumber: number;
  smsContent: string;
}
