export interface PharmaResult {
  Message: string;
  OrderNo: string;
  Status: boolean;
}

export interface PharmaResponse {
  ordersResult: PharmaResult;
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
