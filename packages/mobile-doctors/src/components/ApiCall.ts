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

let sysmptonsList: unknown[] = [];

export const getSysmptonsList = () => sysmptonsList;

export const addSysmptonsList = (item: any) => {
  sysmptonsList = [...sysmptonsList, item];
};

export const setSysmptonsList = (lsit: any[]) => {
  sysmptonsList = [...lsit];
};
export const removeSysmptonsList = (item: any) => {
  const lsit = sysmptonsList.filter((symptonItem) => symptonItem.symptom == item);
  sysmptonsList = [...lsit];
};

let diagonsisList: unknown[] = [];

export const getDiagonsisList = () => diagonsisList;

export const addDiagonsisList = (item: any) => {
  diagonsisList = [...diagonsisList, item];
};

export const setDiagonsisList = (lsit: any[]) => {
  diagonsisList = [...lsit];
};

let diagnosticPrescriptionDataList: unknown[] = [];

export const getDiagnosticPrescriptionDataList = () => diagnosticPrescriptionDataList;

export const addDiagnosticPrescriptionDataList = (item: any) => {
  diagnosticPrescriptionDataList = [...diagnosticPrescriptionDataList, item];
};

export const setDiagnosticPrescriptionDataList = (lsit: any[]) => {
  diagnosticPrescriptionDataList = [...lsit];
};

let medicineList: unknown[] = [];

export const getMedicineList = () => medicineList;

export const addMedicineList = (item: any) => {
  medicineList = [...medicineList, item];
};

export const setMedicineList = (lsit: any[]) => {
  medicineList = [...lsit];
};
export const updateMedicineList = (item: any) => {
  const updated = medicineList.map((medicine: any) =>
    medicine.medicineName == item.medicineName ? item : medicine
  );
  console.log({ updated, item });
  medicineList = [...updated];
};
