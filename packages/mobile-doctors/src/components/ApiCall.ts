import {
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import Axios, { AxiosResponse, Canceler } from 'axios';
import { MEDICINE_UNIT } from '@aph/mobile-doctors/src/graphql/types/globalTypes';

const AUTH_TOKEN = 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d';

export interface MedicineProductsResponse {
  product_count: number;
  products: MedicineProduct[];
}

export interface MedicineProduct {
  description: string;
  id: number;
  image: string;
  is_in_stock: boolean;
  is_prescription_required: string; //1 for  required
  name: string;
  price: number;
  sku: string;
  small_image: string;
  status: string; //1, 2
  thumbnail: string;
  type_id: string;
}
export type Doseform =
  | 'TABLET'
  | 'INJECTION'
  | 'SYRUP'
  | 'DROPS'
  | 'CAPSULE'
  | 'BOTTLE'
  | 'SUSPENSION'
  | 'ROTACAPS'
  | 'SACHET'
  | 'POWDER'
  | 'CREAM'
  | 'SOAP'
  | 'GEL'
  | 'LOTION'
  | 'SPRAY'
  | 'SOLUTION'
  | 'OINTMENT'
  | '';

interface PharmaOverview {
  generic: string;
  Doseform: MEDICINE_UNIT | '';
  Unit: string;
  Strength: string;
  Strengh: string;
  Overview:
    | {
        Caption: string;
        CaptionDesc: string;
      }[]
    | string;
}

export interface MedicineProductDetails extends MedicineProduct {
  PharmaOverview: PharmaOverview[];
}

export interface MedicineProductDetailsResponse {
  productdp: MedicineProductDetails[];
  message?: string;
}

let cancelSearchMedicineApi: Canceler | undefined;

export const searchMedicineApi = (
  searchText: string
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  const CancelToken = Axios.CancelToken;
  cancelSearchMedicineApi && cancelSearchMedicineApi();
  return Axios.post(
    `https://www.apollopharmacy.in/popcsrchprd_api.php`,
    { params: searchText },
    {
      headers: {
        Authorization: AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
      cancelToken: new CancelToken((c) => {
        // An executor function receives a cancel function as a parameter
        cancelSearchMedicineApi = c;
      }),
    }
  );
};

export const getMedicineDetailsApi = (
  productSku: string
): Promise<AxiosResponse<MedicineProductDetailsResponse>> => {
  return Axios.post(
    `https://www.apollopharmacy.in//popcsrchpdp_api.php`,
    { params: productSku },
    {
      headers: {
        Authorization: AUTH_TOKEN,
      },
    }
  );
};
// ----------

let sysmptonsList: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] = [];

export const getSysmptonsList = () => sysmptonsList;

export const addSysmptonsList = (item: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms) => {
  const foundIndex = sysmptonsList.findIndex((s) => s.symptom == item.symptom);
  if (foundIndex > -1) {
    return;
  } else {
    sysmptonsList = [...sysmptonsList, item];
  }
};

export const setSysmptonsList = (lsit: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[]) => {
  sysmptonsList = [...lsit];
};
export const removeSysmptonsList = (name: string) => {
  const lsit = sysmptonsList.filter((symptonItem) => symptonItem.symptom != name);
  sysmptonsList = [...lsit];
};

let diagonsisList: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[] = [];

export const getDiagonsisList = () => diagonsisList;

export const addDiagonsisList = (item: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis) => {
  const foundIndex = diagonsisList.findIndex((d) => d.name == item.name);
  if (foundIndex > -1) {
    return;
  } else {
    diagonsisList = [...diagonsisList, item];
  }
};

export const setDiagonsisList = (lsit: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[]) => {
  diagonsisList = [...lsit];
};

export const removeDiagonsisList = (name: string) => {
  const lsit = diagonsisList.filter((diagnosis) => diagnosis.name != name);
  diagonsisList = [...lsit];
};

let diagnosticPrescriptionDataList: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[] = [];

export const getDiagnosticPrescriptionDataList = () => diagnosticPrescriptionDataList;

export const addDiagnosticPrescriptionDataList = (
  item: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription
) => {
  const foundIndex = diagnosticPrescriptionDataList.findIndex((s) => s.itemname == item.itemname);
  if (foundIndex > -1) {
    return;
  } else {
    diagnosticPrescriptionDataList = [...diagnosticPrescriptionDataList, item];
  }
};

export const setDiagnosticPrescriptionDataList = (
  lsit: GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[]
) => {
  diagnosticPrescriptionDataList = [...lsit];
};

export const removeDiagnosticPrescriptionDataList = (name: string) => {
  const lsit = diagnosticPrescriptionDataList.filter(
    (diagnosticPrescriptionData) => diagnosticPrescriptionData.itemname != name
  );
  diagnosticPrescriptionDataList = [...lsit];
};

let medicineList: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] = [];

export const getMedicineList = () => medicineList;

export const addMedicineList = (
  item: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription
) => {
  const foundIndex = medicineList.findIndex((m) => m.medicineName == item.medicineName);
  if (foundIndex > -1) {
    return;
  } else {
    medicineList = [...medicineList, item];
  }
};

export const setMedicineList = (
  lsit: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[]
) => {
  medicineList = [...lsit];
};
export const updateMedicineList = (
  item: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription
) => {
  const updated = medicineList.map((medicine) =>
    medicine.medicineName == item.medicineName ? item : medicine
  );
  medicineList = [...updated];
};

export const removeMedicineList = (name: string) => {
  const lsit = medicineList.filter((medicinedata) => medicinedata.medicineName != name);
  medicineList = [...lsit];
};
