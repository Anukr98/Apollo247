export interface InventorySyncRequest {
  storeCode: string;
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
