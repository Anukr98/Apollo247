import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { addDays } from 'date-fns';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import _ from 'lodash';
import { sendMail } from 'notifications-service/resolvers/email';
import { ApiConstants } from 'ApiConstants';

export const helpTypeDefs = gql`
  input HelpEmailInput {
    category: String
    reason: String
    comments: String
  }

  extend type Query {
    sendHelpEmail(helpEmailInput: HelpEmailInput): String
  }
`;

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
  //get patient details
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findDetailsByMobileNumber(mobileNumber);
  if (patientDetails == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const startDate = addDays(new Date(), -10);
  const endDate = new Date();

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
  console.log(appointmentDetails);

  const mailContentTemplate = _.template(
    `<html>
    <body>
    <p> Patient Help Form</p>
    <ul>
    <li>Need help with  : <%- helpEmailInput.category %></li>
    <li>Reason  : <%- helpEmailInput.reason %></li>
    <li>Comments  : <%- helpEmailInput.comments %></li>
    <li>Patient Details
      <ul>
       <li>First Name : <%- patientDetails.firstName %></li>
       <li>Last Name : <%- patientDetails.lastName %></li>
       <li>Customer Id : <%- patientDetails.id %></li>
       <li>UHID : <%- patientDetails.uhid %></li>
       <li>Email : <%- patientDetails.emailAddress %></li>
       <li>Mobile Number : <%- patientDetails.mobileNumber %></li>
      </ul>
    </li>
    <li> Appointment Details
      <ul>
      
      </ul>
    </li>
     
    </ul>
    </body> 
    </html>
    `
  );
  const mailContent = mailContentTemplate({
    helpEmailInput: helpEmailInput,
    patientDetails: patientDetails,
  });

  console.log('startDate', startDate);
  console.log('endDate', endDate);
  console.log(appointmentDetails);

  const mailStatus = await sendMail(
    mailContent,
    ApiConstants.PATIENT_HELP_FROM_EMAILID,
    ApiConstants.PATIENT_HELP_FROM_NAME,
    ApiConstants.PATIENT_HELP_SUPPORT_EMAILID,
    ApiConstants.PATIENT_HELP_SUBJECT
  );

  return mailStatus.message;
};

export const helpResolvers = {
  Query: {
    sendHelpEmail,
  },
};
