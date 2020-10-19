const medicineOrderQuery = (payload) => {
  let txnDate = new Date(new Date().toUTCString()).toISOString();

  if (payload.TXNDATETIME || payload.TXNDATE) {
    const txnDateTimeReceived = payload.TXNDATETIME ? payload.TXNDATETIME : payload.TXNDATE;
    txnDate = new Date(
      new Date(new Date(txnDateTimeReceived).getTime() - 3600000 * 5.5).toUTCString()
    ).toISOString();
  }

  let params = `orderAutoId: ${payload.ORDERID}, 
    mid: "${payload.MID}",
    paymentType: CASHLESS, 
    amountPaid: ${payload.TXNAMOUNT},
    healthCredits: ${payload.HEALTH_CREDITS},
    paymentRefId: "${payload.TXNID}", 
    paymentStatus: "${payload.STATUS}", 
    paymentDateTime: "${txnDate}", 
    responseCode: "${payload.RESPCODE}", 
    responseMessage: "${payload.RESPMSG}", 
    bankTxnId: "${payload.BANKTXNID}"`;

  if (payload.PARTNERINFO) {
    params += `, partnerInfo: "${payload.PARTNERINFO}"`;
  }

  if (payload.PLANID) {
    params += `, planId: "${payload.PLANID}"`;
  }

  if (payload.REFUNDAMT) {
    params += `, refundAmount: ${payload.REFUNDAMT}`;
  }

  if (payload.BANKNAME) {
    params += `, bankName: "${payload.BANKNAME}"`;
  }

  if (payload.PAYMENTMODE) {
    params += `, paymentMode: ${payload.PAYMENTMODE}`;
  }

  return (
    'mutation { SaveMedicineOrderPaymentMq(medicinePaymentMqInput: { ' +
    params +
    '}){ errorCode, errorMessage, orderStatus }}'
  );
};

module.exports = {
  medicineOrderQuery,
};
