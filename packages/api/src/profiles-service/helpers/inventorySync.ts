import AbortController from 'abort-controller';
import { debugLog } from 'customWinstonLogger';
import fetch from 'node-fetch';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  MedicineOrders,
  MedicineOrderLineItems,
  MedicineOrderAddress,
} from 'profiles-service/entities';
import { InventorySyncRequest, SYNC_TYPE, TatRequest } from 'types/inventorySync';

const inventorySyncTimeout = Number(process.env.INVENTORY_SYNC_TIMEOUT);

const dLogger = debugLog(
  'profileServiceLogger',
  'inventorySyncService',
  Math.floor(Math.random() * 100000000)
);

export async function syncInventory(orderDatails: MedicineOrders, syncType: SYNC_TYPE) {
  if (!process.env.INVENTORY_SYNC_URL || !process.env.INVENTORY_SYNC_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_INVENTORY_SYNC_URL);

  const baseUrl = process.env.INVENTORY_SYNC_URL.toString();

  const reqStartTime = new Date();
  const controller = new AbortController();
  const medicineOrderAddress = orderDatails.medicineOrderAddress;

  const itemdetails = orderDatails.medicineOrderLineItems.map((item) => {
    return {
      sku: item.medicineSKU,
      qty: item.quantity * item.mou,
    };
  });
  const reqBody: InventorySyncRequest = {
    orderId: orderDatails.orderAutoId.toString(),
    storeCode: orderDatails.shopId,
    pincode: medicineOrderAddress.zipcode,
    lat: medicineOrderAddress.latitude,
    lng: medicineOrderAddress.longitude,
    items: itemdetails,
  };

  const timeout = setTimeout(() => {
    controller.abort();
  }, inventorySyncTimeout);

  let apiUrl = baseUrl;

  if (syncType == SYNC_TYPE.BLOCK) {
    apiUrl = `${apiUrl}/orderplaced`;
  } else if (syncType == SYNC_TYPE.RELEASE) {
    apiUrl = `${apiUrl}/orderfulfilled`;
  } else if (syncType == SYNC_TYPE.CANCEL) {
    apiUrl = `${apiUrl}/ordercancelled`;
  }
  const resp = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(reqBody),
    headers: {
      Authorization: process.env.INVENTORY_SYNC_TOKEN,
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  });
  if (resp.status != 200) {
    dLogger(
      reqStartTime,
      'INVENTORY_SYNC_API_ERROR',
      `${apiUrl} --- ${JSON.stringify(reqBody)} --- ${JSON.stringify(resp)}`
    );
  } else {
    dLogger(
      reqStartTime,
      'INVENTORY_SYNC_API_SUCCESS',
      `${apiUrl} --- ${JSON.stringify(reqBody)} --- ${JSON.stringify(resp)}`
    );
  }

  clearTimeout(timeout);
}

export async function getTat(
  medicineOrderItems: Partial<MedicineOrderLineItems>[],
  medicineOrderAddress: MedicineOrderAddress
) {
  if (!process.env.INVENTORY_SYNC_URL || !process.env.INVENTORY_SYNC_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_INVENTORY_SYNC_URL);

  const baseUrl = process.env.INVENTORY_SYNC_URL.toString();

  const reqStartTime = new Date();
  const controller = new AbortController();

  const itemdetails = medicineOrderItems.map((item: Partial<MedicineOrderLineItems>) => {
    return {
      sku: item.medicineSKU || '',
      qty: item.quantity || 0,
    };
  });
  const reqBody: TatRequest = {
    pincode: medicineOrderAddress.zipcode,
    lat: medicineOrderAddress.latitude,
    lng: medicineOrderAddress.longitude,
    items: itemdetails,
  };

  const timeout = setTimeout(() => {
    controller.abort();
  }, inventorySyncTimeout);

  const apiUrl = `${baseUrl}/tat`;

  const resp = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(reqBody),
    headers: {
      Authorization: process.env.INVENTORY_SYNC_TOKEN,
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  });
  if (resp.status != 200) {
    dLogger(
      reqStartTime,
      'GET_TAT_API_ERROR',
      `${apiUrl} --- ${JSON.stringify(reqBody)} --- ${JSON.stringify(resp)}`
    );
    return;
  }
  const tatResponse = await resp.json();
  if (tatResponse.errorCode) {
    dLogger(
      reqStartTime,
      'GET_TAT_API_ERROR',
      `${apiUrl} --- ${JSON.stringify(reqBody)} --- ${JSON.stringify(resp)}`
    );
    return;
  }
  dLogger(
    reqStartTime,
    'GET_TAT_API_SUCCESS',
    `${apiUrl} --- ${JSON.stringify(reqBody)} --- ${JSON.stringify(tatResponse.response)}`
  );
  clearTimeout(timeout);
  return tatResponse.response;
}

export async function orderShipmentCreated(reqBody: InventorySyncRequest) {
  if (!process.env.INVENTORY_SYNC_URL || !process.env.INVENTORY_SYNC_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_INVENTORY_SYNC_URL);

  const baseUrl = process.env.INVENTORY_SYNC_URL.toString();

  const reqStartTime = new Date();
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, inventorySyncTimeout);

  const apiUrl = `${baseUrl}/ordershipped`;

  const resp = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(reqBody),
    headers: {
      Authorization: process.env.INVENTORY_SYNC_TOKEN,
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  });
  if (resp.status != 200) {
    dLogger(
      reqStartTime,
      'ORDER_SHIPPED_TAT_API_ERROR',
      `${apiUrl} --- ${JSON.stringify(reqBody)} --- ${JSON.stringify(resp)}`
    );
  } else {
    dLogger(
      reqStartTime,
      'ORDER_SHIPPED_TAT_API_SUCCESS',
      `${apiUrl} --- ${JSON.stringify(reqBody)} --- ${JSON.stringify(resp)}`
    );
  }

  clearTimeout(timeout);
}
