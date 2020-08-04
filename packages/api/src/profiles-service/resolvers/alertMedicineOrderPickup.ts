import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import fetch from 'node-fetch';
import { MEDICINE_ORDER_STATUS } from 'profiles-service/entities';
import { StoreAlertResp } from 'types/medicineOrderTypes';
import { ApiConstants } from 'ApiConstants';
import { WebEngageInput, postEvent } from 'helpers/webEngage';
import { format, addMinutes } from 'date-fns';

export const alertMedicineOrderPickupTypeDefs = gql`
  input AlertMedicineOrderPickupInput {
    orderId: Int!
    patientId: String!
    remarks: String
  }
  type AlertMedicineOrderPickupResult {
    status: Boolean
    message: String
  }
  extend type Mutation {
    alertMedicineOrderPickup(
      alertMedicineOrderPickupInput: AlertMedicineOrderPickupInput
    ): AlertMedicineOrderPickupResult!
  }
`;

type AlertMedicineOrderPickupInput = {
  orderId: number;
  patientId: string;
  remarks: string;
};

type AlertMedicineOrderPickupInputArgs = {
  alertMedicineOrderPickupInput: AlertMedicineOrderPickupInput;
};

type AlertMedicineOrderPickupResult = {
  status: boolean;
  message: string;
};

const alertMedicineOrderPickup: Resolver<
  null,
  AlertMedicineOrderPickupInputArgs,
  ProfilesServiceContext,
  AlertMedicineOrderPickupResult
> = async (parent, { alertMedicineOrderPickupInput }, { profilesDb }) => {
  let error = 0,
    errorMessage = '';
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(
    alertMedicineOrderPickupInput.patientId
  );
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(
    alertMedicineOrderPickupInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  if (orderDetails.patient.id != alertMedicineOrderPickupInput.patientId) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  if (
    orderDetails.currentStatus != MEDICINE_ORDER_STATUS.ORDER_VERIFIED &&
    orderDetails.currentStatus != MEDICINE_ORDER_STATUS.READY_AT_STORE
  ) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const storeAlertUrl = process.env.PHARMACY_MED_STORE_ALERT_URL || '';
  const authToken = process.env.PHARMACY_MED_DELIVERY_AUTH_TOKEN || '';

  const reqBody = JSON.stringify({
    shopId: orderDetails.medicineOrderShipments[0].siteId || orderDetails.shopId,
    customerName: patientDetails.firstName,
    remarks:
      alertMedicineOrderPickupInput.remarks ||
      ApiConstants.ALERT_STORE_REMARKS.replace('{name}', patientDetails.firstName)
        .replace('{mobile}', patientDetails.mobileNumber)
        .replace('{orderNo}', orderDetails.orderAutoId.toString()),
    mobile: patientDetails.mobileNumber.substr(3),
    orderId: orderDetails.orderAutoId,
    apolloId: orderDetails.medicineOrderShipments[0].apOrderNo,
  });
  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_TO_PHARMACY: ${storeAlertUrl}`,
    'ALERT_STORE_FOR_PICKUP__API_CALL_STARTING',
    reqBody,
    ''
  );

  const resp = await fetch(storeAlertUrl, {
    method: 'POST',
    body: reqBody,
    headers: { 'Content-Type': 'application/json', Authentication: authToken },
  });

  if (resp.status != 200) {
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_TO_PHARMACY: ${storeAlertUrl}`,
      'ALERT_STORE_FOR_PICKUP__API_CALL_FAILED',
      JSON.stringify(resp),
      ''
    );
    throw new AphError(AphErrorMessages.ALERT_STORE_FOR_PICKUP_ERROR, undefined, {});
  }

  const storeAlertResp: StoreAlertResp = await resp.json();

  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_TO_PHARMACY: ${storeAlertUrl}`,
    'ALERT_STORE_FOR_PICKUP__API_CALL_SUCCESS',
    JSON.stringify(storeAlertResp),
    ''
  );

  if (!storeAlertResp.RequestStatus) {
    error = 1;
    errorMessage = storeAlertResp.RequestMessage;
  } else {
    await medicineOrdersRepo.updateMedicineOrder(orderDetails.id, orderDetails.orderAutoId, {
      alertStore: true,
    });
  }

  //post order kerb side notification event to webEngage
  const postBody: Partial<WebEngageInput> = {
    userId: orderDetails.patient.mobileNumber,
    eventName: ApiConstants.MEDICINE_ORDER_KERB_STORE_NOTIFICATION_EVENT_NAME.toString(),
    eventData: {
      orderId: orderDetails.orderAutoId,
      statusDateTime: format(addMinutes(new Date(), +330), "yyyy-MM-dd'T'HH:mm:ss'+0530'"),
    },
  };
  postEvent(postBody);

  return {
    status: !error,
    message: errorMessage,
  };
};

export const alertMedicineOrderPickupResolvers = {
  Mutation: {
    alertMedicineOrderPickup,
  },
};
