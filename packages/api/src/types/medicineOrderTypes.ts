export interface PharmaResult {
  Message: string;
  OrderNo: string;
  Status: boolean;
  ReferenceNo: string;
}

export interface PharmaResponse {
  ordersResult: PharmaResult;
}

export interface PharmaCancelResponse {
  ordersCancelResult: PharmaCancelResult;
}

export interface PharmaCancelResult {
  ApOrderNo: string;
  Message: string;
  OrderNo: string;
  SiteId: string;
  Status: boolean;
}

export interface PharmaLineItem {
  ItemID: string;
  ItemName: string;
  Qty: number;
  Pack: number;
  MOU: number;
  Price: number;
  Status: boolean;
}

export interface PrescriptionUrl {
  url: string;
}

export interface PrescriptionPrismFileId {
  fileId: string;
}
