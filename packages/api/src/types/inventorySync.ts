export interface InventorySyncRequest {
  storeCode: string;
  orderId: string;
  pincode: string;
  lat: number;
  long: number;
  items: Items[];
}
export interface Items {
  sku: string;
  qty: number;
}

export enum SYNC_TYPE {
  BLOCK = 'BLOCK',
  RELEASE = 'RELEASE',
  CANCEL = 'CANCEL',
}
