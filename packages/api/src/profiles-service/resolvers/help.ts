import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { addDays } from 'date-fns';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';

export const helpTypeDefs = gql``;

type HelpEmailInput = {
  category: string;
  reason: string;
  comments: string;
};

type HelpEmailInputArgs = { helpEmailInput: HelpEmailInput };

const sendHelpEmail: Resolver<null, HelpEmailInputArgs, ProfilesServiceContext, string> = async (
  parent,
  { helpEmailInput },
  { profilesDb, consultsDb, mobileNumber }
) => {
  console.log(helpEmailInput);

  const startDate = addDays(new Date(), -10);
  const endDate = new Date();
  //get patient details
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findDetailsByMobileNumber(mobileNumber);
  if (patientDetails == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  console.log(patientDetails);

  //get ongoing and open orders in last 10 days
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const MedicineOrdersList = await medicineOrdersRepo.getMedicineOrdersListByCreateddate(
    patientDetails.id,
    startDate,
    endDate
  );

  console.log(MedicineOrdersList);

  //get ongoing, open, scheduled appointments in last 10 days

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentDetails = await appointmentRepo.getAppointmentsByPatientId(
    patientDetails.id,
    startDate,
    endDate
  );
  console.log('startDate', startDate);
  console.log('endDate', endDate);
  console.log(appointmentDetails);

  return 'hello..';
};

export const helpResolvers = {
  Query: {
    sendHelpEmail,
  },
};
