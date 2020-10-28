import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { log } from 'customWinstonLogger';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MedicineOrders } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const reUploadPrescriptionTypeDefs = gql`
  input PrescriptionReUploadInput {
    orderId: Int!
    fileUrl: String!
    prismPrescriptionFileId: String
  }

  type ReUploadPrescriptionResponse {
    success: Boolean
  }

  extend type Mutation {
    reUploadPrescription(prescriptionInput: PrescriptionReUploadInput): ReUploadPrescriptionResponse
  }
`;

type PrescriptionReUploadInput = {
  orderId: number;
  fileUrl: string;
  prismPrescriptionFileId: string;
};
type PrescriptionInputArgs = { prescriptionInput: PrescriptionReUploadInput };

export const reUploadPrescription: Resolver<
  null,
  PrescriptionInputArgs,
  ProfilesServiceContext,
  { success: boolean }
> = async (parent, { prescriptionInput }, { profilesDb }) => {
  const medRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medRepo.getMedicineOrder(prescriptionInput.orderId);
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  let success = true;
  const uploadPresUrl = process.env.PHARMACY_MED_UPLOAD_PRESCRIPTION || '';
  const authToken = process.env.PHARMACY_OMS_ORDER_TOKEN || '';

  const resp = await fetch(uploadPresUrl, {
    method: 'POST',
    body: JSON.stringify({
      orderid: orderDetails.referenceNo,
      requesttype: 'UPLOAD',
      imageurl: prescriptionInput.fileUrl.split(',').map((url) => {
        url;
      }),
    }),
    headers: { 'Content-Type': 'application/json', 'Auth-Token': authToken },
  });
  if (resp.status != 200) {
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_TO_PHARMACY: ${uploadPresUrl}`,
      'reUploadPrescription',
      JSON.stringify(resp),
      ''
    );
    success = false;
  }

  const respBody = await resp.json();
  if (!respBody.Status) {
    log(
      'profileServiceLogger',
      `EXTERNAL_API_CALL_TO_PHARMACY: ${uploadPresUrl}`,
      'reUploadPrescription',
      JSON.stringify(respBody),
      ''
    );
    success = false;
  }
  const updateMedOrderAttrs: Partial<MedicineOrders> = {
    prescriptionImageUrl:
      (orderDetails.prescriptionImageUrl ? orderDetails.prescriptionImageUrl + ',' : '') +
      prescriptionInput.fileUrl,
    prismPrescriptionFileId: prescriptionInput.prismPrescriptionFileId,
  };
  medRepo.updateMedicineOrder(orderDetails.id, orderDetails.orderAutoId, updateMedOrderAttrs);

  return { success };
};

export const reUploadPrescriptionResolvers = {
  Mutation: {
    reUploadPrescription,
  },
};
