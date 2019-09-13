import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { addDays, addMilliseconds } from 'date-fns';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import _ from 'lodash';
import { sendMail } from 'notifications-service/resolvers/email';
import { ApiConstants } from 'ApiConstants';
import { EmailMessage } from 'types/notificationMessageTypes';
import { MEDICINE_ORDER_PAYMENT_TYPE } from 'profiles-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

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
  { profilesDb, consultsDb, mobileNumber, doctorsDb }
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

  let appointmentsList;
  const doctorIds: string[] = [];
  if (appointmentDetails.length > 0) {
    appointmentDetails.forEach((appointment) => {
      console.log(
        appointment.appointmentDateTime,
        addMilliseconds(appointment.appointmentDateTime, 19800000)
      );
      doctorIds.push(appointment.doctorId);
      console.log(doctorIds);
    });
    if (doctorIds.length > 0) {
      //get doctor details
      const doctorsRepo = doctorsDb.getCustomRepository(DoctorRepository);
      const doctorData = await doctorsRepo.getSearchDoctorsByIds(doctorIds);
      console.log(doctorData);

      if (doctorData.length > 0) {
        appointmentDetails.forEach((appointment) => {
          console.log(
            doctorData.filter((doctor) => {
              return doctor.id === appointment.doctorId ? doctor.firstName : '';
            })
          );
        });
      }
    }
  }

  type MedicineOrderData = {
    paymentMode: MEDICINE_ORDER_PAYMENT_TYPE;
    lineItems: Object[];
    orderDateTime?: Date;
    prescriptionUrl: string;
  };
  type FormattedMedicineOrders = { [index: string]: MedicineOrderData };

  const formattedOrdersObject: FormattedMedicineOrders = {};

  medicineOrdersList.forEach((order) => {
    if (!formattedOrdersObject[order.medicineOrders_id]) {
      formattedOrdersObject[order.medicineOrders_id] = {
        paymentMode: order.medicineOrderPayments_paymentType,
        lineItems: [
          {
            name: order.medicineOrderLineItems_medicineName,
            sku: order.medicineOrderLineItems_medicineSKU,
          },
        ],
        orderDateTime: order.medicineOrders_orderDateTime,
        prescriptionUrl: order.medicineOrders_prescriptionImageUrl,
      };
    } else {
      formattedOrdersObject[order.medicineOrders_id].lineItems.push({
        name: order.medicineOrderLineItems_medicineName,
        sku: order.medicineOrderLineItems_medicineSKU,
      });
    }
  });

  const medicineOrders = Object.values(formattedOrdersObject);

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
    <li> Medicine Order Details
      <ul>
      <% _.each(medicineOrders, function(order) { %>
          <li>Payment Details : <%- order.paymentMode %></li>
          <li>Item Details : 
              <ul>
                <% _.each(order.lineItems, function(item) { %>
                    <li>Name: <%- item.name %> , SKU: <%-item.sku%></li>
                <% }); %>
                </ul>
          </li>
          <li>Date and Time of Order : <%- order.orderDateTime %></li>
          <% if(order.prescriptionUrl != null) {  %>
            <li>Prescription : <img src="<%- order.prescriptionUrl %>" /></li>
          <% } %>
      <% }); %>

      </ul>
    </li>

    </ul>
    </body> 
    </html>
    `
  );
  const mailContent = mailContentTemplate({
    helpEmailInput,
    patientDetails,
    medicineOrders,
    appointmentDetails,
  });

  console.log(mailContent);

  /*const emailContent: EmailMessage = {
    subject: <string>ApiConstants.PATIENT_HELP_SUBJECT,
    fromEmail: <string>ApiConstants.PATIENT_HELP_FROM_EMAILID,
    fromName: <string>ApiConstants.PATIENT_HELP_FROM_NAME,
    messageContent: <string>mailContent,
    toEmail: <string>ApiConstants.PATIENT_HELP_SUPPORT_EMAILID,
  };

  const mailStatus = await sendMail(emailContent);*/

  return 'mailStatus.message';
};

export const helpResolvers = {
  Query: {
    sendHelpEmail,
  },
};
