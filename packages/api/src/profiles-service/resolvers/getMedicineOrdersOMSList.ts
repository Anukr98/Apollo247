import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { MedicineOrders, MEDICINE_ORDER_STATUS } from 'profiles-service/entities';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getUnixTime } from 'date-fns';
import { Tedis } from 'redis-typescript';
import { ApiConstants } from 'ApiConstants';

export const getMedicineOrdersOMSListTypeDefs = gql`
  type MedicineOrdersOMSListResult {
    medicineOrdersList: [MedicineOrdersOMS]
  }

  type MedicineOrderOMSDetailsResult {
    medicineOrderDetails: MedicineOrdersOMS
  }

  type MedicineOrdersOMS {
    id: ID!
    orderAutoId: Int
    quoteId: String
    shopId: String
    shopAddress: String
    estimatedAmount: Float
    patientId: ID!
    deliveryType: MEDICINE_DELIVERY_TYPE!
    patientAddressId: ID
    quoteDateTime: DateTime
    createdDate: DateTime
    coupon: String
    devliveryCharges: Float
    prescriptionImageUrl: String
    prismPrescriptionFileId: String
    pharmaRequest: String
    orderTat: String
    couponDiscount: Float
    productDiscount: Float
    packagingCharges: Float
    showPrescriptionAtStore: Boolean
    orderType: MEDICINE_ORDER_TYPE
    currentStatus: MEDICINE_ORDER_STATUS
    bookingSource: BOOKING_SOURCE
    medicineOrderLineItems: [MedicineOrderOMSLineItems]
    medicineOrderPayments: [MedicineOrderOMSPayments]
    medicineOrdersStatus: [MedicineOrdersOMSStatus]
    medicineOrderShipments: [MedicineOrderOMSShipment]
    patient: Patient
  }

  type MedicineOrderOMSLineItems {
    medicineSKU: String
    medicineName: String
    price: Float
    quantity: Int
    mrp: Float
    isPrescriptionNeeded: Int
    mou: Int
    isMedicine: String
  }

  type MedicineOrderOMSShipment {
    id: ID!
    siteId: String
    siteName: String
    apOrderNo: String
    updatedDate: String
    currentStatus: MEDICINE_ORDER_STATUS
    itemDetails: String
    medicineOrdersStatus: [MedicineOrdersOMSStatus]
    medicineOrderInvoice: [MedicineOrderOMSInvoice]
  }

  type MedicineOrderOMSInvoice {
    id: ID!
    siteId: String
    remarks: String
    requestType: String
    vendorName: String
    billDetails: String
    itemDetails: String
  }

  type MedicineOrdersOMSStatus {
    id: ID!
    orderStatus: MEDICINE_ORDER_STATUS
    statusDate: DateTime
    statusMessage: String
    customReason: String
    hideStatus: Boolean
  }

  type MedicineOrderOMSPayments {
    id: ID!
    paymentType: MEDICINE_ORDER_PAYMENT_TYPE
    amountPaid: Float
    paymentRefId: String
    paymentStatus: String
    paymentDateTime: Date
    responseCode: String
    responseMessage: String
    bankTxnId: String
  }

  type RecommendedProductsListResult {
    recommendedProducts: [RecommendedProducts]
  }

  type RecommendedProducts {
    productSku: String
    productName: String
    productImage: String
    productPrice: String
    productSpecialPrice: String
    isPrescriptionNeeded: String
    categoryName: String
    status: String
    mou: String
  }

  type ProductAvailabilityResult {
    productAvailabilityList: [ProductAvailability]
  }

  type ProductAvailability {
    productSku: String
    status: Boolean
    quantity: String
  }

  extend type Query {
    getMedicineOrdersOMSList(patientId: String): MedicineOrdersOMSListResult!
    getMedicineOrderOMSDetails(patientId: String, orderAutoId: Int): MedicineOrderOMSDetailsResult!
    getMedicineOMSPaymentOrder: MedicineOrdersOMSListResult!
    getRecommendedProductsList(patientUhid: String!): RecommendedProductsListResult!
    checkIfProductsOnline(productSkus: [String]): ProductAvailabilityResult!
  }
`;

type MedicineOrdersOMSListResult = {
  medicineOrdersList: MedicineOrders[];
};

type MedicineOrderOMSDetailsResult = {
  medicineOrderDetails: MedicineOrders;
};

type RecommendedProductsListResult = {
  recommendedProducts: RecommendedProducts[];
};

type RecommendedProducts = {
  productSku: string;
  productName: string;
  productImage: string;
  productPrice: string;
  productSpecialPrice: string;
  isPrescriptionNeeded: string;
  categoryName: string;
  status: string;
  mou: string;
};

type ProductAvailabilityResult = {
  productAvailabilityList: ProductAvailability[];
};

type ProductAvailability = {
  productSku: string;
  status: boolean;
  quantity: string;
};

const getMedicineOrdersOMSList: Resolver<
  null,
  { patientId: string; orderAutoId?: number },
  ProfilesServiceContext,
  MedicineOrdersOMSListResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findById(args.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const primaryPatientIds = await patientRepo.getLinkedPatientIds(args.patientId);
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const medicineOrdersList = await medicineOrdersRepo.getMedicineOrdersList(primaryPatientIds);
  return { medicineOrdersList };
};

const getMedicineOrderOMSDetails: Resolver<
  null,
  { patientId: string; orderAutoId: number },
  ProfilesServiceContext,
  MedicineOrderOMSDetailsResult
> = async (parent, args, { profilesDb }) => {
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  if (args.patientId) {
    const patientDetails = await patientRepo.findById(args.patientId);
    if (!patientDetails) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }
  }
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  let medicineOrderDetails;
  if (!args.patientId) {
    medicineOrderDetails = await medicineOrdersRepo.getMedicineOrderDetailsByOderId(
      args.orderAutoId
    );
  } else {
    medicineOrderDetails = await medicineOrdersRepo.getMedicineOrderById(
      args.patientId,
      args.orderAutoId
    );
  }
  if (!medicineOrderDetails) {
    throw new AphError(AphErrorMessages.INVALID_MEDICINE_ORDER_ID, undefined, {});
  }
  if (medicineOrderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
    const reasonCode = medicineOrderDetails.medicineOrdersStatus.find((orderStatusObj) => {
      return orderStatusObj.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED;
    });
    if (reasonCode) {
      try {
        const cancellationReasons = await medicineOrdersRepo.getMedicineOrderCancelReasonByCode(
          reasonCode.statusMessage
        );
        if (cancellationReasons) {
          reasonCode.statusMessage = cancellationReasons.displayMessage;
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  medicineOrderDetails.medicineOrdersStatus.sort((a, b) => {
    return getUnixTime(new Date(a.statusDate)) - getUnixTime(new Date(b.statusDate));
  });
  return { medicineOrderDetails };
};

const getMedicineOMSPaymentOrder: Resolver<
  null,
  {},
  ProfilesServiceContext,
  MedicineOrdersOMSListResult
> = async (parent, args, { profilesDb }) => {
  const medicineOrdersRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const medicineOrdersList = await medicineOrdersRepo.getPaymentMedicineOrders();
  return { medicineOrdersList };
};

const getRecommendedProductsList: Resolver<
  null,
  { patientUhid: string },
  ProfilesServiceContext,
  RecommendedProductsListResult
> = async (parent, args, { profilesDb }) => {
  const tedis = new Tedis({
    port: <number>ApiConstants.REDIS_PORT,
    host: ApiConstants.REDIS_URL.toString(),
    password: ApiConstants.REDIS_PWD.toString(),
  });
  const redisKeys = await tedis.keys('*');
  const recommendedProductsList: RecommendedProducts[] = [];
  for (let k = 0; k <= 5; k++) {
    const skuDets = await tedis.hgetall(redisKeys[k]);
    //console.log(skuDets, skuDets.name, 'redis keys length');
    const recommendedProducts: RecommendedProducts = {
      productImage: skuDets.gallery_images,
      productPrice: skuDets.price,
      productName: skuDets.name,
      productSku: skuDets.sku,
      productSpecialPrice: skuDets.special_price,
      isPrescriptionNeeded: skuDets.is_prescription_required,
      categoryName: skuDets.category_name,
      status: skuDets.status,
      mou: skuDets.mou,
    };
    recommendedProductsList.push(recommendedProducts);
  }

  return { recommendedProducts: recommendedProductsList };
};

const checkIfProductsOnline: Resolver<
  null,
  { productSkus: string[] },
  ProfilesServiceContext,
  ProductAvailabilityResult
> = async (parent, args, { profilesDb }) => {
  const tedis = new Tedis({
    port: <number>ApiConstants.REDIS_PORT,
    host: ApiConstants.REDIS_URL.toString(),
    password: ApiConstants.REDIS_PWD.toString(),
  });
  //const redisKeys = await tedis.keys('*');
  async function checkProduct(sku: string) {
    return new Promise<ProductAvailability>(async (resolve) => {
      const skuDets = await tedis.hgetall(sku);
      const product: ProductAvailability = {
        productSku: sku,
        status: false,
        quantity: '0',
      };
      if (skuDets && skuDets.status == 'Enabled') {
        product.status = true;
        product.quantity = skuDets.qty;
      }
      productAvailability.push(product);
      resolve(product);
    });
  }
  const promises: object[] = [];
  const productAvailability: ProductAvailability[] = [];
  if (args.productSkus.length > 0) {
    args.productSkus.forEach(async (sku) => {
      promises.push(checkProduct(sku));
    });
  }
  await Promise.all(promises);
  return { productAvailabilityList: productAvailability };
};

export const getMedicineOrdersOMSListResolvers = {
  Query: {
    getMedicineOrdersOMSList,
    getMedicineOrderOMSDetails,
    getMedicineOMSPaymentOrder,
    getRecommendedProductsList,
    checkIfProductsOnline,
  },
};
