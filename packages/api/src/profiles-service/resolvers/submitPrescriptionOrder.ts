import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import {
  MedicineOrderLineItems,
  MEDICINE_ORDER_TYPE,
  MEDICINE_ORDER_STATUS,
  MedicineOrdersStatus,
} from 'profiles-service/entities';
import { Resolver } from 'api-gateway';

export const submitPrescriptionOrderTypeDefs = gql`
  input MedicineOrderInput {
    tpdetails: MedicineOrderDetails
  }

  input MedicineOrderDetails {
    orderId: Int
    shopId: String
    ShippingMethod: String
    RequestType: String
    paymentMethod: String
    VendorName: String
    DotorName: String
    OrderType: String
    StateCode: String
    TAT: String
    CouponCode: String
    OrderDate: String
    customerDetails: CustomerDetails
    PaymentDetails: PresPaymentDetails
    ItemDetails: [MedicineItem]
    PrescUrl: [PrescUrl]
  }

  input PrescUrl {
    url: String
  }

  input PresPaymentDetails {
    TotalAmount: String
    PaymentSource: String
    PaymentStatus: String
    PaymentOrderId: String
  }

  input CustomerDetails {
    MobileNo: String
    Comm_addr: String
    Del_addr: String
    FirstName: String
    LastName: String
    City: String
    PostCode: String
    MailId: String
    Age: Int
    CardNo: String
    PatientName: String
  }

  input MedicineItem {
    ItemID: String
    ItemName: String
    Price: Float
    Qty: Int
    Pack: Int
    MOU: Int
    Status: String
  }

  type MedicineOrderResult {
    status: String
    errorCode: Int
    errorMessage: String
  }

  extend type Mutation {
    getDigitizedPrescription(MedicineOrderInput: MedicineOrderInput): MedicineOrderResult!
  }
`;

type MedicineOrderInput = {
  tpdetails: MedicineOrderDetails;
};

type MedicineOrderDetails = {
  orderId: number;
  shopId: string;
  ShippingMethod: string;
  RequestType: string;
  paymentMethod: string;
  VendorName: string;
  DotorName: string;
  OrderType: string;
  StateCode: string;
  TAT: string;
  CouponCode: string;
  OrderDate: string;
  customerDetails: CustomerDetails;
  PaymentDetails: PresPaymentDetails;
  ItemDetails: MedicineItem[];
  PrescUrl: PrescUrl[];
};

type PrescUrl = {
  url: string;
};

type PresPaymentDetails = {
  TotalAmount: string;
  PaymentSource: string;
  PaymentStatus: string;
  PaymentOrderId: string;
};

type CustomerDetails = {
  MobileNo: string;
  Comm_addr: string;
  Del_addr: string;
  FirstName: string;
  LastName: string;
  City: string;
  PostCode: string;
  MailId: string;
  Age: number;
  CardNo: string;
  PatientName: string;
};

type MedicineItem = {
  ItemID: string;
  ItemName: string;
  Price: number;
  Qty: number;
  Pack: number;
  MOU: number;
  Status: string;
};

type MedicineOrderResult = {
  status: string;
  errorCode: number;
  errorMessage: string;
};

type MedicineOrderInputArgs = { MedicineOrderInput: MedicineOrderInput };

const submitPrescriptionOrder: Resolver<
  null,
  MedicineOrderInputArgs,
  ProfilesServiceContext,
  MedicineOrderResult
> = async (parent, { MedicineOrderInput }, { profilesDb }) => {
  console.log(MedicineOrderInput, 'input');
  let errorCode = 0,
    errorMessage = '',
    status = 'Accepted';
  if (
    !MedicineOrderInput.tpdetails.ItemDetails ||
    MedicineOrderInput.tpdetails.ItemDetails.length == 0
  ) {
    errorCode = -1;
    errorMessage = 'Missing medicine line items';
    status = 'Rejected';
  }
  /*const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(MedicineOrderInput.patientId);
  const medicineOrderattrs: Partial<MedicineOrders> = {
    patient: patientDetails,
    quoteId: MedicineOrderInput.quoteId,
    deliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
    estimatedAmount: MedicineOrderInput.estimatedAmount,
    orderType: MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION,
    shopId: MedicineOrderInput.shopId,
    quoteDateTime: new Date(),
    devliveryCharges: 0.0,
  };*/
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const orderDetails = await medicineOrdersRepo.getMedicineOrderDetails(
    MedicineOrderInput.tpdetails.orderId
  );
  if (!orderDetails) {
    errorCode = -1;
    errorMessage = 'Invalid order id';
    status = 'Rejected';
  }

  if (orderDetails && orderDetails.orderType == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION) {
    MedicineOrderInput.tpdetails.ItemDetails.map((item) => {
      const orderItemAttrs: Partial<MedicineOrderLineItems> = {
        medicineOrders: orderDetails,
        medicineSKU: item.ItemID,
        medicineName: item.ItemName,
        mou: item.MOU,
        quantity: item.Pack,
        price: item.Price,
        mrp: 0,
      };
      const lineItemOrder = medicineOrdersRepo.saveMedicineOrderLineItem(orderItemAttrs);
      console.log(lineItemOrder);
    });
    //save in order status table
    const medicineOrderStatusAttrs: Partial<MedicineOrdersStatus> = {
      medicineOrders: orderDetails,
      orderStatus: MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY,
      statusDate: new Date(),
    };
    await medicineOrdersRepo.saveMedicineOrderStatus(
      medicineOrderStatusAttrs,
      orderDetails.orderAutoId
    );
  }

  return { status, errorCode, errorMessage };
};

export const submitPrescriptionOrderResolvers = {
  Mutation: {
    submitPrescriptionOrder,
  },
};
