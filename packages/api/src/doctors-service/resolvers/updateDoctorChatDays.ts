import gql from 'graphql-tag';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Resolver } from 'api-gateway';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ApiConstants } from 'ApiConstants';

export const updateDoctorChatDaysTypeDefs = gql`
  type chatDaysResult {
    isError: Boolean
    response: String
  }

  extend type Mutation {
    updateDoctorChatDays(
      doctorId: String!
      chatDays: String!
    ): chatDaysResult!
  }
`;
type chatDaysResult = {
  isError: boolean;
  response: string;
};

const updateDoctorChatDays: Resolver<
  null,
  { doctorId: string; chatDays: string; },
  DoctorsServiceContext,
  chatDaysResult
> = async (parent, args, { doctorsDb }) => {
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const doctordata = await doctorRepository.findDoctorByIdWithoutRelations(args.doctorId);
    if (!doctordata) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

    let chatDays = parseInt(args.chatDays, 10);
    if(chatDays > ApiConstants.CHAT_DAYS_LIMIT){
      chatDays = ApiConstants.CHAT_DAYS_LIMIT;
    } else if( chatDays < ApiConstants.CHAT_DAYS_LOWER_LIMIT){
      chatDays = ApiConstants.CHAT_DAYS_LOWER_LIMIT;
    }

    await doctorRepository.updateDoctorChatDays(args.doctorId, chatDays);
    return { isError: false, response: "Updated Successfully" };
  } catch (err){
    console.error("error in updating chat days > ", err);
    return { isError: true, response: "Not Updated" };
  }
};

export const updateDoctorChatDaysResolvers = {
  Mutation: {
    updateDoctorChatDays,
  },
};
