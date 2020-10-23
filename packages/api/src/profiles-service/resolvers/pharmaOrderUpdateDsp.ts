import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { MEDICINE_ORDER_STATUS, MedicineOrdersStatus } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import { updateLhub } from 'profiles-service/helpers/inventorySync';
import { LHUB_UPDATE_TYPE } from 'types/inventorySync';

export const updateOrderDspTypeDefs = gql`
  input UpdateOrderDspInput {
    orderId: Int!
    apOrderNo: String!
  }

  type updateOrderDspResult {
    status: Boolean
  }

  extend type Mutation {
    updateOrderDsp(updateOrderDspInput: UpdateOrderDspInput): updateOrderDspResult!
  }
`;

type updateOrderDspResult = {
  status: boolean;
};

type UpdateOrderDspInput = {
  orderId: number;
  apOrderNo: string;
};

type ItemArticleDetails = {
  articleCode: string;
  articleName: string;
  quantity: number;
  batch: string;
  unitPrice: number;
  packSize: number;
  posAvailability: boolean;
};

type UpdateOrderOnHoldInputInputArgs = {
  updateOrderDspInput: UpdateOrderDspInput;
};

const updateOrderDsp: Resolver<
  null,
  UpdateOrderOnHoldInputInputArgs,
  ProfilesServiceContext,
  updateOrderDspResult
> = async (parent, { updateOrderDspInput }, { profilesDb }) => {
  log(
    'profileServiceLogger',
    `ORDER_DSP_CHANGED_OMS_FOR_ORDER_ID:${updateOrderDspInput.orderId}`,
    `updateOrderDsp`,
    JSON.stringify(updateOrderDspInput),
    ''
  );
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderWithShipments(
    updateOrderDspInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  const shimentDetails = orderDetails.medicineOrderShipments.find(
    (shipment) => shipment.apOrderNo == updateOrderDspInput.apOrderNo
  );

  if (!shimentDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
  }
  const shipmentDetails = orderDetails.medicineOrderShipments[0];
  const orderAddress = orderDetails.medicineOrderAddress;
  if (orderAddress) {
    const itemDetails = JSON.parse(shipmentDetails.itemDetails);
    const shipmentReq = {
      storeCode: shipmentDetails.siteId,
      orderId: orderDetails.orderAutoId.toString(),
      pincode: orderAddress.zipcode,
      lat: orderAddress.latitude,
      lng: orderAddress.longitude,
      items: itemDetails.map((item: ItemArticleDetails) => {
        return {
          sku: item.articleCode,
          qty: item.quantity,
        };
      }),
    };
    updateLhub(shipmentReq, LHUB_UPDATE_TYPE.DSP_CHANGE);
  }
  return {
    status: true,
  };
};

export const updateOrderDspResolvers = {
  Mutation: {
    updateOrderDsp,
  },
};
