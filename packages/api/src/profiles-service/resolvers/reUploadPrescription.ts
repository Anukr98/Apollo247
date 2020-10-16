import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { log } from 'customWinstonLogger';

export const reUploadPrescriptionTypeDefs = gql`
  input PrescriptionReUploadInput {
    orderId: Int!
    fileUrl: String!
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
};
type PrescriptionInputArgs = { prescriptionInput: PrescriptionReUploadInput };

export const reUploadPrescription: Resolver<
  null,
  PrescriptionInputArgs,
  null,
  { success: boolean }
> = async (parent, { prescriptionInput }) => {
  let success = true;
  const uploadPresUrl = process.env.PHARMACY_MED_UPLOAD_PRESCRIPTION || '';
  const authToken = process.env.PHARMACY_OMS_ORDER_TOKEN || '';

  const resp = await fetch(uploadPresUrl, {
    method: 'POST',
    body: JSON.stringify({
      orderid: prescriptionInput.orderId,
      requesttype: 'UPLOAD',
      imageurl: prescriptionInput.fileUrl.split(',').map((url) => {
        url;
      }),
    }),
    headers: { 'Content-Type': 'application/json', Authorization: authToken },
  });
  console.log('reUploadPrescription', JSON.stringify(resp), authToken);
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
  return { success };
};

export const reUploadPrescriptionResolvers = {
  Mutation: {
    reUploadPrescription,
  },
};
