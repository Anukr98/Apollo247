import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';

import { AppointmentCallFeedbackRepository } from 'consults-service/repositories/appointmentCallFeedbackRepository';

import { CALL_FEEDBACK_RESPONSES_TYPES } from 'consults-service/entities/appointmentCallFeedbackEntity'

export const appointmentCallFeedbackTypeDefs = gql`

  enum CALL_FEEDBACK_RESPONSES_TYPES {
    AUDIO
    VIDEO
    AUDIOVIDEO
  }

  input SaveAppointmentCallFeedbackInput {
    appointmentCallDetailsId: ID!
    ratingValue: Int!
    feedbackResponseType : CALL_FEEDBACK_RESPONSES_TYPES
    feedbackResponses: String
  }

  type AppointmentCallFeedback {
    id : ID!
    appointmentCallDetailsId: ID!
    ratingValue: Int!
    feedbackResponseType : CALL_FEEDBACK_RESPONSES_TYPES
    feedbackResponses: String
  }

  extend type Mutation {
    saveAppointmentCallFeedback(saveAppointmentCallFeedbackInput: SaveAppointmentCallFeedbackInput): AppointmentCallFeedback!
  }
`;

type saveAppointmentCallFeedbackInputArgs = {
  saveAppointmentCallFeedbackInput: SaveAppointmentCallFeedbackInput
}

type SaveAppointmentCallFeedbackInput = {
  appointmentCallDetailsId: string;
  ratingValue: number;
  feedbackResponseType: CALL_FEEDBACK_RESPONSES_TYPES;
  feedbackResponses: string;
}

type AppointmentCallFeedback = {
  id: string;
  appointmentCallDetailsId: string;
  ratingValue: number;
  feedbackResponseType: CALL_FEEDBACK_RESPONSES_TYPES;
  feedbackResponses: string;
}

const saveAppointmentCallFeedback: Resolver<
  null,
  saveAppointmentCallFeedbackInputArgs,
  ConsultServiceContext,
  AppointmentCallFeedback
> = async (parent, { saveAppointmentCallFeedbackInput }, { consultsDb }) => {
  const appointmentFeedbackRepository = consultsDb.getCustomRepository(AppointmentCallFeedbackRepository);
  let result = await appointmentFeedbackRepository.saveAppointmentCallFeedback(saveAppointmentCallFeedbackInput)

  return {
    id: result.id,
    appointmentCallDetailsId: result.appointmentCallDetailsId,
    ratingValue: result.ratingValue,
    feedbackResponseType: result.feedbackResponseType,
    feedbackResponses: result.feedbackResponses
  }
}

export const appointmentCallFeedbackResolvers = {
  Mutation: {
    saveAppointmentCallFeedback
  }
};

