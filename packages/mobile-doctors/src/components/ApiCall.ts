import {
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import Axios, { AxiosResponse } from 'axios';

const AUTH_TOKEN = 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms';

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

export const searchMedicineApi = (
  searchText: string
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  return Axios.post(
    `http://uat.apollopharmacy.in/searchprd_api.php`,
    { params: searchText },
    {
      headers: {
        Authorization: AUTH_TOKEN,
      },
    }
  );
};

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
  const foundIndex = diagnosticPrescriptionDataList.findIndex((s) => s.name == item.name);
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
    (diagnosticPrescriptionData) => diagnosticPrescriptionData.name != name
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
