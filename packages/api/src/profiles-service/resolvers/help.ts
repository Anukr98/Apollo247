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
import { EmailMessage } from 'types/notificationMessageTypes';

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
  const medicineOrdersList = await medicineOrdersRepo.getMedicineOrdersListByCreateddate(
    patientDetails.id,
    startDate,
    endDate
  );

  //get ongoing, open, scheduled appointments in last 10 days
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentDetails = await appointmentRepo.getAppointmentsByPatientId(
    patientDetails.id,
    startDate,
    endDate
  );

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
    <li> Appointment Details </li>     
    </ul>
    </body> 
    </html>
    `
  );
  const mailContent = mailContentTemplate({
    helpEmailInput,
    patientDetails,
    medicineOrdersList,
    appointmentDetails,
  });

  const emailContent: EmailMessage = {
    subject: <string>ApiConstants.PATIENT_HELP_SUBJECT,
    fromEmail: <string>ApiConstants.PATIENT_HELP_FROM_EMAILID,
    fromName: <string>ApiConstants.PATIENT_HELP_FROM_NAME,
    messageContent: <string>mailContent,
    toEmail: <string>ApiConstants.PATIENT_HELP_SUPPORT_EMAILID,
  };

  const mailStatus = await sendMail(emailContent);

  return mailStatus.message;
};

export const helpResolvers = {
  Query: {
    sendHelpEmail,
  },
};
