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

export interface PharmaLineItemResult {
  id: number;
  sku: string;
  price: number;
  name: string;
  status: string;
  type_id: string;
  url_key: string;
  is_in_stock: number;
  mou: string;
  special_price: number;
  is_prescription_required: string;
}

export interface PharmaItemsResponse {
  productdp: PharmaLineItemResult[];
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

export interface StoreInventoryResp {
  errorCode: string;
  requestStatus: string;
  requestMessage: string;
  itemDetails: StoreItemDetail[];
}

export interface StoreItemDetail {
  sku: string;
  qty: number;
  mrp: number;
  exist: boolean;
}

export interface StoreAlertResp {
  RequestStatus: boolean;
  RequestMessage: string;
}
