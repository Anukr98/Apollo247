import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
import { Resolver } from 'api-gateway';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { MedicineOrderInvoice } from 'profiles-service/entities';

export const saveMedicineOrderInvoiceTypeDefs = gql`
  input MedicineOrderInvoiceInput {
    orderNo: Int
    siteId: String
    remarks: String
    requestType: String
    vendorName: String
    otp: String
    billDetails: BillDetails
    itemDetails: [ItemDetails]
  }

  input BillDetails {
    billDateTime: String
    billNumber: String
    billedBy: String
    invoiceValue: Float
    cashValue: Float
    creditValue: Float
  }

  input ItemDetails {
    itemId: String
    itemName: String
    batchId: String
    reqQty: Int
    issuedQty: Int
    mrp: Float
    isSubstitute: Boolean
    substitute: [Substitute]
  }

  input Substitute {
    substituteItemId: String
    substituteItemName: String
    substituteBatchId: String
    issuedQty: Int
  }

  type SaveMedicineOrderInvoiceResult {
    requestStatus: String
    requestMessage: String
  }

  extend type Mutation {
    SaveMedicineOrderInvoice(
      medicineOrderInvoiceInput: MedicineOrderInvoiceInput
    ): SaveMedicineOrderInvoiceResult!
  }
`;

type MedicineOrderInvoiceInput = {
  orderNo: number;
  siteId: string;
  remarks: string;
  requestType: string;
  vendorName: string;
  otp: string;
  billDetails: BillDetails;
  itemDetails: ItemDetails[];
};

type BillDetails = {
  billDateTime: string;
  billNumber: string;
  billedBy: string;
  invoiceValue: number;
  cashValue: number;
  creditValue: number;
};

type ItemDetails = {
  itemId: string;
  itemName: string;
  batchId: string;
  reqQty: number;
  issuedQty: number;
  mrp: number;
  isSubstitute: boolean;
  substitute: Substitute[];
};

type Substitute = {
  substituteItemId: string;
  substituteItemName: string;
  substituteBatchId: string;
  issuedQty: number;
};

type SaveMedicineOrderInvoiceResult = {
  requestStatus: string;
  requestMessage: string;
};
type MedicineOrderInvoiceInputInputArgs = { medicineOrderInvoiceInput: MedicineOrderInvoiceInput };

const SaveMedicineOrderInvoice: Resolver<
  null,
  MedicineOrderInvoiceInputInputArgs,
  ProfilesServiceContext,
  SaveMedicineOrderInvoiceResult
> = async (parent, { medicineOrderInvoiceInput }, { profilesDb }) => {
  const medicineOrderRepo = profilesDb.getCustomRepository(MedicineOrdersRepository);
  const medicineOrders = await medicineOrderRepo.getMedicineOrderDetails(
    medicineOrderInvoiceInput.orderNo
  );

  if (medicineOrders == null) {
    throw new AphError(AphErrorMessages.SAVE_MEDICINE_ORDER_ERROR, undefined, {});
  }

  const orderInvoiceAttrs: Partial<MedicineOrderInvoice> = {
    orderNo: medicineOrderInvoiceInput.orderNo,
    otp: medicineOrderInvoiceInput.otp,
    siteId: medicineOrderInvoiceInput.siteId,
    remarks: medicineOrderInvoiceInput.remarks,
    requestType: medicineOrderInvoiceInput.requestType,
    vendorName: medicineOrderInvoiceInput.vendorName,
    billDetails: JSON.stringify(medicineOrderInvoiceInput.billDetails),
    itemDetails: JSON.stringify(medicineOrderInvoiceInput.itemDetails),
    medicineOrders,
  };

  await medicineOrderRepo.saveMedicineOrderInvoice(orderInvoiceAttrs);

  return {
    requestStatus: 'success',
    requestMessage: 'updated invoice',
  };
};

export const saveMedicineOrderInvoiceResolvers = {
  Mutation: {
    SaveMedicineOrderInvoice,
  },
};
