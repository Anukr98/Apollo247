import gql from 'graphql-tag';

export const getNotificationsTypeDefs = gql`
  type PushNotificationMessage {
    messageId: String
  }

  type PushNotificationSuccessMessage {
    results: [PushNotificationMessage]
    canonicalRegistrationTokenCount: Int
    failureCount: Int
    successCount: Int
    multicastId: Int
  }

  enum NotificationPriority {
    high
    normal
  }

  enum NotificationType {
    INITIATE_RESCHEDULE
    INITIATE_TRANSFER
  }

  enum APPT_CALL_TYPE {
    AUDIO
    VIDEO
    CHAT
  }

  enum DOCTOR_CALL_TYPE {
    SENIOR
    JUNIOR
  }

  input PushNotificationInput {
    notificationType: NotificationType
    appointmentId: String
  }

  input CartPushNotificationInput {
    notificationType: NotificationType
    orderAutoId: Int
  }

  type SendChatMessageToDoctorResult {
    status: Boolean
  }

  type SendDoctorApptReminderResult {
    status: Boolean
    apptsListCount: Int
  }

  type SendSMS {
    status: String
    message: String
  }

  extend type Query {
    sendPushNotification(
      pushNotificationInput: PushNotificationInput
    ): PushNotificationSuccessMessage

    testPushNotification(deviceToken: String): PushNotificationSuccessMessage
    sendDailyAppointmentSummary: String
    sendFollowUpNotification: String
    sendChatMessageToDoctor(
      appointmentId: String
      chatMessage: String
    ): SendChatMessageToDoctorResult
    sendMessageToMobileNumber(mobileNumber: String, textToSend: String): SendSMS
    sendDoctorReminderNotifications(nextMin: Int): SendDoctorApptReminderResult
  }
`;

export const emailTypeDefs = gql`
  extend type Query {
    sendEmailMessage: String
  }
`;

export const notificationBinTypeDefs = gql`
  enum notificationStatus {
    READ
    UNREAD
  }

  enum notificationEventName {
    APPOINTMENT
  }

  enum notificationType {
    CHAT
  }

  input MessageInput {
    fromId: String!
    toId: String!
    eventName: notificationEventName!
    eventId: String!
    message: String!
    status: notificationStatus!
    type: notificationType!
  }

  type NotificationBinData {
    fromId: String!
    toId: String!
    eventName: notificationEventName!
    eventId: String!
    message: String!
    status: notificationStatus!
    type: notificationType!
    id: String
  }

  type NotificationData {
    notificationData: NotificationBinData
  }

  type NotificationDataSet {
    notificationData: [GetNotificationsResponse]
  }

  type NotificationBinDataSet {
    notificationData: [NotificationBinData]
  }

  type GetNotificationsResponse {
    appointmentId: String
    doctorId: String
    lastUnreadMessageDate: DateTime
    patientId: String
    patientFirstName: String
    patientLastName: String
    patientPhotoUrl: String
    unreadNotificationsCount: Int
  }

  extend type Query {
    getNotifications(toId: String!, startDate: Date, endDate: Date): NotificationDataSet
    sendUnreadMessagesNotification: String
    archiveMessages: String
  }

  extend type Mutation {
    insertMessage(messageInput: MessageInput): NotificationData
    markMessageToUnread(eventId: String): NotificationBinDataSet
  }
`;

export const webEngageTypeDefs = gql`
  enum WebEngageEvent {
    DOCTOR_IN_CHAT_WINDOW
    DOCTOR_LEFT_CHAT_WINDOW
    DOCTOR_SENT_MESSAGE
  }
  enum ConsultMode {
    ONLINE
    PHYSICAL
    BOTH
  }

  input DoctorConsultEventInput {
    mobileNumber: String!
    eventName: WebEngageEvent!
    consultID: ID!
    displayId: String!
    consultMode: ConsultMode!
    doctorFullName: String!
  }

  type WebEngageResponseData {
    status: String!
  }

  type WebEngageResponse {
    response: WebEngageResponseData!
  }

  extend type Mutation {
    postDoctorConsultEvent(doctorConsultEventInput: DoctorConsultEventInput): WebEngageResponse
  }
`;
