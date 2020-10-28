export interface InventorySyncRequest {
  storeCode: string;
  orderId: string;
  pincode: string;
  lat: number;
  lng: number;
  items: Items[];
}

export interface TatRequest {
  pincode: string;
  lat: number;
  lng: number;
  items: Items[];
}

export interface Items {
  sku: string;
  qty: number;
  exist?: boolean;
}

export interface TatResponseBody {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: TatResponse;
}
export interface TatResponse {
  inventoryExist: true;
  items: Items[];
  lat: number;
  lng: number;
  orderId: number;
  ordertime: number;
  pincode: string;
  storeCode: string;
  storeType: string;
  tat: string;
  tatU: number;
  distance: number;
  allocationProfileName: string;
  clusterId: string;
}

export enum SYNC_TYPE {
  BLOCK = 'BLOCK',
  RELEASE = 'RELEASE',
  CANCEL = 'CANCEL',
}

export enum LHUB_UPDATE_TYPE {
  DSP_CHANGE = 'DSP_CHANGE',
  SHIPPED = 'SHIPPED',
}

export interface DspStatusRespBody {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: DspStatusResp;
}

export interface DspStatusResp {
  ALLOCATE_DSP: string;
  CHANGE_DSP: string;
  ORDER_UPDATE: string;
}
