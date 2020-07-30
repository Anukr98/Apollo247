import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { WebEngageEvent, WebEngageResponse, postEvent, WebEngageInput } from 'helpers/webEngage';
import { ConsultMode } from 'doctors-service/entities';
import { ApiConstants } from 'ApiConstants';
import { isMobileNumberValid } from '@aph/universal/dist/aphValidators';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

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

type DoctorConsultEventInput = {
  mobileNumber: string;
  eventName: WebEngageEvent;
  consultID: string;
  displayId: string;
  consultMode: ConsultMode;
  doctorFullName: string;
};

type DoctorConsultEventInputArgs = { doctorConsultEventInput: DoctorConsultEventInput };

const postDoctorConsultEvent: Resolver<
  null,
  DoctorConsultEventInputArgs,
  NotificationsServiceContext,
  WebEngageResponse
> = async (parent, { doctorConsultEventInput }) => {
  if (!isMobileNumberValid(doctorConsultEventInput.mobileNumber))
    throw new AphError(AphErrorMessages.INVALID_MOBILE_NUMBER);

  let eventName;
  switch (doctorConsultEventInput.eventName) {
    case WebEngageEvent.DOCTOR_IN_CHAT_WINDOW:
      eventName = ApiConstants.DOCTOR_IN_CHAT_WINDOW_EVENT_NAME.toString();
      break;
    case WebEngageEvent.DOCTOR_LEFT_CHAT_WINDOW:
      eventName = ApiConstants.DOCTOR_LEFT_CHAT_WINDOW_EVENT_NAME.toString();
      break;
    case WebEngageEvent.DOCTOR_SENT_MESSAGE:
      eventName = ApiConstants.DOCTOR_SENT_MESSAGE_EVENT_NAME.toString();
      break;
  }

  const postBody: Partial<WebEngageInput> = {
    userId: doctorConsultEventInput.mobileNumber,
    eventName: eventName,
    eventData: {
      consultID: doctorConsultEventInput.consultID,
      displayID: doctorConsultEventInput.displayId,
      consultMode: doctorConsultEventInput.consultMode,
      doctorName: doctorConsultEventInput.doctorFullName,
    },
  };
  return await postEvent(postBody);
};

export const webEngageResolvers = {
  Mutation: {
    postDoctorConsultEvent,
  },
};
