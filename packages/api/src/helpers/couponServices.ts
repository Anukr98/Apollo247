import AbortController from 'abort-controller';
import { debugLog } from 'customWinstonLogger';
import fetch from 'node-fetch';
import {
  ValidateCouponRequest,
  ValidateCouponResponse,
  AcceptCouponResponse,
  AcceptCouponRequest,
} from 'types/coupons';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

const couponTimeoutMillSeconds = Number(process.env.COUPON_TIMEOUT_IN_MILLISECONDS);

const dLogger = debugLog(
  'profileServiceLogger',
  'couponCall',
  Math.floor(Math.random() * 100000000)
);

export async function validateCoupon(
  payload: ValidateCouponRequest
): Promise<ValidateCouponResponse> {
  if (!process.env.COUPON_VALIDATE_API)
    throw new AphError(AphErrorMessages.INVALID_VALIDATE_COUPON_URL);

  const apiUrl = process.env.COUPON_VALIDATE_API.toString();

  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, couponTimeoutMillSeconds);

  return await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'VALIDATE_COUPON_API_CALL___END',
          `${apiUrl} --- ${JSON.stringify(payload)} --- ${JSON.stringify(data)}`
        );

        if (data.errorCode) throw new AphError(AphErrorMessages.INVALID_COUPON_CODE);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'VALIDATE_COUPON_API_CALL___ERROR',
          `${apiUrl} --- ${JSON.stringify(payload)} --- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_COUPON);
        } else {
          throw new AphError(AphErrorMessages.INVALID_COUPON_CODE);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}

export async function acceptCoupon(payload: AcceptCouponRequest): Promise<AcceptCouponResponse> {
  if (!process.env.COUPON_ACCEPT_API)
    throw new AphError(AphErrorMessages.INVALID_ACCEPT_COUPON_URL);

  let apiUrl = process.env.COUPON_ACCEPT_API.toString();
  apiUrl = apiUrl.replace('{MOBILE_NUMBER}', payload.mobile);
  apiUrl = apiUrl.replace('{COUPON_CODE}', payload.coupon);
  const reqStartTime = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, couponTimeoutMillSeconds);
  return await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then(
      (data) => {
        dLogger(
          reqStartTime,
          'ACCEPT_COUPON_API_CALL___END',
          `${apiUrl}--- ${JSON.stringify(data)}`
        );
        if (data.errorCode) throw new AphError(AphErrorMessages.COUPON_ACCEPT_ERROR);
        return data;
      },
      (err) => {
        dLogger(
          reqStartTime,
          'ACCEPT_COUPON_API_CALL___ERROR',
          `${apiUrl}--- ${JSON.stringify(err)}`
        );
        if (err.name === 'AbortError') {
          throw new AphError(AphErrorMessages.NO_RESPONSE_FROM_COUPON);
        } else {
          throw new AphError(AphErrorMessages.COUPON_ACCEPT_ERROR);
        }
      }
    )
    .finally(() => {
      clearTimeout(timeout);
    });
}
