import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import fetch from 'node-fetch';
import { PharmaCancelResponse } from 'types/medicineOrderTypes';

export const medicineOrderCancelTypeDefs = gql`
  input MedicineOrderCancelInput {
    orderNo: Int
    remarksCode: String
  }

  type MedicineOrderCancelResult {
    orderStatus: MEDICINE_ORDER_STATUS
  }

  extend type Mutation {
    cancelMedicineOrder(
      medicineOrderCancelInput: MedicineOrderCancelInput
    ): MedicineOrderCancelResult!
  }
`;

type MedicineOrderCancelInput = {
  orderNo: number;
  remarksCode: string;
};

type MedicineOrderCancelResult = {
  orderStatus: MEDICINE_ORDER_STATUS;
};
type medicineOrderCancelInputArgs = {
  medicineOrderCancelInput: MedicineOrderCancelInput;
};

const cancelMedicineOrder: Resolver<
  null,
  medicineOrderCancelInputArgs,
  ProfilesServiceContext,
  MedicineOrderCancelResult
> = async (parent, { medicineOrderCancelInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    medicineOrderCancelInput.orderNo
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  const cancelOrderInput = {
    OrderNo: medicineOrderCancelInput.orderNo,
    Remarks: 'MCCR0037',
  };
  const pharmaResp = await fetch(
    'http://online.apollopharmacy.org:51/POPCORN/OrderPlace.svc/cancelorders ',
    {
      method: 'POST',
      body: JSON.stringify(cancelOrderInput),
      headers: { 'Content-Type': 'application/json', Token: '9f15bdd0fcd5423190c2e877ba0228A24' },
    }
  );

  if (pharmaResp.status == 400) {
    throw new AphError(AphErrorMessages.SOMETHING_WENT_WRONG, undefined, {});
  }

  const textRes = await pharmaResp.text();
  const orderResp: PharmaCancelResponse = JSON.parse(textRes);
  console.log(orderResp, 'respp', orderResp.ordersCancelResult.Message);

  if (orderResp.ordersCancelResult.Status) {
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: MEDICINE_ORDER_STATUS.CANCEL_REQUEST,
      medicineOrders: orderDetails,
      statusDate: new Date(),
      statusMessage: orderResp.ordersCancelResult.Message,
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(),
      MEDICINE_ORDER_STATUS.CANCEL_REQUEST
    );
  }
  return { orderStatus: MEDICINE_ORDER_STATUS.CANCEL_REQUEST };
};

export const medicineOrderCancelResolvers = {
  Mutation: {
    cancelMedicineOrder,
  },
};
