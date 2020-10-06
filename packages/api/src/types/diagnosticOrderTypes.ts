export interface DiagnosticPreBookingResult {
  status: string;
  PreBookingID: string;
}

export interface DiagnosticOrderTest {
  TestCode: string;
  ItemId: string;
  ItemName: string;
  Rate: string;
}

export interface ItdosTestDetails {
  test_name: string;
  price: string;
  quantity: string;
  department: string;
  customer: string;
  item_id: string;
  item_name: string;
  test_code: string;
}

export interface AddProcessResult {
  successList: string[];
  failureList: DiagnosticFailureReason[];
}

export interface DiagnosticFailureReason {
  referenceNumber: string;
  failReason: string;
}
