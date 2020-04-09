import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MedicineOrdersStatusRepository } from 'profiles-service/repositories/MedicineOrdersStatusRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import fetch from 'node-fetch';
import { PharmaCancelResponse } from 'types/medicineOrderTypes';
import { log } from 'customWinstonLogger';

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
  const medicineOrdersStatusRepo = profilesDb.getCustomRepository(MedicineOrdersStatusRepository);
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

  const cancelOrderUrl = process.env.PHARMACY_MED_CANCEL_ORDERS
    ? process.env.PHARMACY_MED_CANCEL_ORDERS
    : '';
  const placeOrderToken = process.env.PHARMACY_ORDER_TOKEN ? process.env.PHARMACY_ORDER_TOKEN : '';
  if (cancelOrderUrl == '' || placeOrderToken == '') {
    throw new AphError(AphErrorMessages.INVALID_PHARMA_ORDER_URL, undefined, {});
  }

  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_CANCEL_MED: ${cancelOrderUrl}`,
    'cancelMedicineOrder()->API_CALL_STARTING',
    '',
    ''
  );
  const pharmaResp = await fetch(cancelOrderUrl, {
    method: 'POST',
    body: JSON.stringify(cancelOrderInput),
    headers: { 'Content-Type': 'application/json', Token: placeOrderToken },
  }).catch((error) => {
    log(
      'profileServiceLogger',
      'API_CALL_ERROR',
      'cancelMedicineOrder()->CATCH_BLOCK',
      '',
      JSON.stringify(error)
    );
    throw new AphError(AphErrorMessages.CANCEL_MEDICINE_ORDER_ERROR);
  });
  console.log('pharmaREsp', pharmaResp);
  if (pharmaResp.status == 400 || pharmaResp.status == 404) {
    console.log('statusssssssssssssssssss');
    log(
      'profileServiceLogger',
      'API_CALL_RESPONSE',
      'cancelMedicineOrder()->API_CALL_RESPONSE',
      JSON.stringify(pharmaResp),
      ''
    );
    throw new AphError(AphErrorMessages.SOMETHING_WENT_WRONG, undefined, {});
  }

  const textRes = await pharmaResp.text();
  console.log(textRes, '222222222222222222222222222');
  log(
    'profileServiceLogger',
    'API_CALL_RESPONSE',
    'cancelMedicineOrder()->API_CALL_RESPONSE',
    textRes,
    ''
  );

  const orderResp: PharmaCancelResponse = JSON.parse(textRes);
  console.log(
    orderResp,
    orderResp.ordersCancelResult.Status,
    'respppppppppppppppppppppppppppppppppp',
    orderResp.ordersCancelResult.Message
  );

  if (orderResp.ordersCancelResult.Status) {
    console.log('aaaaaaaaaaaaa');
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: MEDICINE_ORDER_STATUS.CANCEL_REQUEST,
      medicineOrders: orderDetails,
      statusDate: new Date(),
      statusMessage: orderResp.ordersCancelResult.Message,
    };
    await medicineOrdersStatusRepo.saveMedicineOrderStatus(
      orderStatusAttrs,
      orderDetails.orderAutoId
    );
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
