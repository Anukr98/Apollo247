import gql from 'graphql-tag';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Resolver } from 'api-gateway';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ConsultMode, Doctor } from 'doctors-service/entities/index';
import { omit } from "lodash";

export const setAppointmentReminderIvrTypeDefs = gql`
  type ivrResult {
    isError: Boolean
    response: String
  }

  extend type Mutation {
    setAppointmentReminderIvr(
      doctorId: String!
      isIvrSet: Boolean
      ivrConsultType: ConsultMode
      ivrCallTimeOnline: Int
      ivrCallTimePhysical: Int
    ): ivrResult!
  }
`;

type ivrResult = {
  isError: boolean;
  response: string;
};

const setAppointmentReminderIvr: Resolver<
  null,
  { doctorId: string; isIvrSet: boolean; ivrConsultType: ConsultMode; ivrCallTimeOnline: number; ivrCallTimePhysical: number },
  DoctorsServiceContext,
  ivrResult
> = async (parent, args, { doctorsDb }) => {
  try {

    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const doctordata = await doctorRepository.findDoctorByIdWithoutRelations(args.doctorId);
    if (!doctordata) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

    const doctorId = args.doctorId;
    let appointmentReminderIvrAttrs: Omit<typeof args, 'doctorId'> = Object.assign({}, omit(args, 'doctorId'));

    await doctorRepository.updateAppointmentReminderIVR(doctorId, appointmentReminderIvrAttrs);
    return { isError: false, response: "Updated Successfully" };

  } catch (err) {
    console.error("error in updating appointment reminder IVR > ", err);
    return { isError: true, response: "Not Updated" };
  }
};

export const setAppointmentReminderIvrResolvers = {
  Mutation: {
    setAppointmentReminderIvr,
  },
};
