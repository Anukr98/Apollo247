import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { WebEngageEvent, WebEngageResponse, postEvent, WebEngageInput } from 'helpers/webEngage';
import { ConsultMode } from 'doctors-service/entities';
import { ApiConstants } from 'ApiConstants';

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
    displayId: string!
    consultMode: ConsultMode!
    doctorFullName: string!
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
  //post order billed and packed event event to webEngage
  const postBody: Partial<WebEngageInput> = {
    userId: doctorConsultEventInput.mobileNumber,
    eventName: ApiConstants.MEDICINE_ORDER_BILLED_AND_PACKED_EVENT_NAME.toString(),
    eventData: {
      consultID: '',
      displayID: '',
      consultMode: '',
      doctorName: '',
    },
  };
  return await postEvent(postBody);
};

export const webEngageResolvers = {
  Mutation: {
    postDoctorConsultEvent,
  },
};
