import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MedicineOrderInvoice,
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format, addMinutes, parseISO } from 'date-fns';

export const saveOrderShipmentInvoiceTypeDefs = gql`
  input SaveOrderShipmentInvoiceInput {
    orderId: Int!
    status: MEDICINE_ORDER_STATUS
    apOrderNo: String
    updatedDate: String!
    referenceNo: String
    billingDetails: BillingDetails
    itemDetails: [ArticleDetails]
  }

  input ArticleDetails {
    articleCode: String
    articleName: String
    quantity: Int
    batch: String
    unitPrice: Float
    discountPrice: Float
    packSize: Int
    isSubstitute: Boolean
    substitute: [SubstituteDetails]
  }

  input SubstituteDetails {
    articleCode: String
    articleName: String
    quantity: Int
    batch: String
    unitPrice: Float
    discountPrice: Float
  }

  input BillingDetails {
    invoiceTime: String
    invoiceNo: String
    invoiceValue: Float
    cashValue: Float
    prepaidValue: Float
    discountValue: Float
    deliveryCharges: Float
  }

  type SaveOrderShipmentInvoiceResult {
    status: String
    errorCode: Int
    errorMessage: String
    orderId: Int
    apOrderNo: String
  }

  extend type Mutation {
    saveOrderShipmentInvoice(
      saveOrderShipmentInvoiceInput: SaveOrderShipmentInvoiceInput
    ): SaveOrderShipmentInvoiceResult!
  }
`;

type SaveOrderShipmentInvoiceResult = {
  status: MEDICINE_ORDER_STATUS;
  errorCode: number;
  errorMessage: string;
  orderId: number;
  apOrderNo: string;
};

type SaveOrderShipmentInvoiceInput = {
  orderId: number;
  status: MEDICINE_ORDER_STATUS;
  apOrderNo: string;
  updatedDate: string;
  referenceNo: String;
  billingDetails: BillingDetails;
  itemDetails: ArticleDetails[];
};

type BillingDetails = {
  invoiceTime: string;
  invoiceNo: string;
  invoiceValue: string;
  cashValue: number;
  prepaidValue: number;
  discountValue: number;
  deliveryCharges: number;
};

type ArticleDetails = {
  articleCode: string;
  articleName: string;
  quantity: number;
  batch: string;
  unitPrice: number;
  discountPrice: number;
  packSize: number;
  isSubstitute: boolean;
  substitute: SubstituteDetails[];
};

type SubstituteDetails = {
  articleCode: string;
  articleName: string;
  quantity: number;
  batch: string;
  unitPrice: number;
  discountPrice: number;
};

type SaveOrderShipmentInvoiceInputArgs = {
  saveOrderShipmentInvoiceInput: SaveOrderShipmentInvoiceInput;
};

const saveOrderShipmentInvoice: Resolver<
  null,
  SaveOrderShipmentInvoiceInputArgs,
  ProfilesServiceContext,
  SaveOrderShipmentInvoiceResult
> = async (parent, { saveOrderShipmentInvoiceInput }, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    saveOrderShipmentInvoiceInput.orderId
  );
  if (!orderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }

  if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  const shipmentDetails = orderDetails.medicineOrderShipments.find((shipment) => {
    return shipment.apOrderNo == saveOrderShipmentInvoiceInput.apOrderNo;
  });
  if (!shipmentDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
  }
  if (shipmentDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_SHIPMENT_ID, undefined, {});
  }
  const statusDate = format(
    addMinutes(parseISO(saveOrderShipmentInvoiceInput.updatedDate), -330),
    "yyyy-MM-dd'T'HH:mm:ss.SSSX"
  );
  const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
    orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED,
    medicineOrderShipments: shipmentDetails,
    statusDate: new Date(statusDate),
  };

  await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);

  const billDetails: BillingDetails = saveOrderShipmentInvoiceInput.billingDetails;
  const orderInvoiceAttrs: Partial<MedicineOrderInvoice> = {
    orderNo: saveOrderShipmentInvoiceInput.orderId,
    apOrderNo: shipmentDetails.apOrderNo,
    siteId: shipmentDetails.siteId,
    billDetails: JSON.stringify({
      billDateTime: format(
        addMinutes(parseISO(saveOrderShipmentInvoiceInput.billingDetails.invoiceTime), -330),
        "yyyy-MM-dd'T'HH:mm:ss.SSSX"
      ),
      billNumber: billDetails.invoiceNo,
      invoiceValue: billDetails.invoiceValue,
      cashValue: billDetails.cashValue,
      prepaidValue: billDetails.prepaidValue,
      discountValue: billDetails.discountValue,
      deliveryCharges: billDetails.deliveryCharges,
    }),
    itemDetails: JSON.stringify(
      saveOrderShipmentInvoiceInput.itemDetails.map((item) => {
        return {
          itemId: item.articleCode,
          itemName: item.articleName,
          batchId: item.batch,
          issuedQty: item.quantity,
          mou: item.packSize,
          mrp: item.quantity * item.unitPrice,
        };
      })
    ),
    medicineOrderShipments: shipmentDetails,
  };

  await medicineOrdersRepo.saveMedicineOrderInvoice(orderInvoiceAttrs);

  await medicineOrdersRepo.updateMedicineOrderShipment(
    {
      currentStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED,
    },
    shipmentDetails.apOrderNo
  );

  const unBilledShipments = orderDetails.medicineOrderShipments.find((shipment) => {
    return (
      shipment.apOrderNo != shipmentDetails.apOrderNo &&
      shipment.currentStatus == MEDICINE_ORDER_STATUS.ORDER_VERIFIED
    );
  });
  if (!unBilledShipments) {
    const orderStatusAttrs: Partial<MedicineOrdersStatus> = {
      orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED,
      medicineOrders: orderDetails,
      statusDate: new Date(statusDate),
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(orderStatusAttrs, orderDetails.orderAutoId);
    await medicineOrdersRepo.updateMedicineOrderDetails(
      orderDetails.id,
      orderDetails.orderAutoId,
      new Date(statusDate),
      MEDICINE_ORDER_STATUS.ORDER_BILLED
    );
  }

  return {
    status: MEDICINE_ORDER_STATUS.ORDER_BILLED,
    errorCode: 0,
    errorMessage: '',
    orderId: orderDetails.orderAutoId,
    apOrderNo: shipmentDetails.apOrderNo,
  };
};

export const saveOrderShipmentInvoiceResolvers = {
  Mutation: {
    saveOrderShipmentInvoice,
  },
};
