const consultsOrderQuery = (payload) => {
  let txnDate = new Date(new Date().toUTCString()).toISOString();
  if (payload.TXNDATETIME || payload.TXNDATE) {
    const txnDateTimeReceived = payload.TXNDATETIME ? payload.TXNDATETIME : payload.TXNDATE;
    txnDate = new Date(
      new Date(new Date(txnDateTimeReceived).getTime() - 3600000 * 5.5).toUTCString()
    ).toISOString();
  }
  let partnerInfo = '';
  if (payload.MERC_UNQ_REF) {
    const info = payload.MERC_UNQ_REF.split(':');
    if (info.length == 3) {
      partnerInfo = info[2];
    }
  }

  let params = `orderId: "${payload.ORDERID}",
    amountPaid: ${payload.TXNAMOUNT},
    paymentRefId: "${payload.TXNID}", 
    paymentStatus: "${payload.STATUS}", 
    paymentDateTime: "${txnDate}", 
    responseCode: "${payload.RESPCODE}", 
    responseMessage: "${payload.RESPMSG}", 
    bankTxnId: "${payload.BANKTXNID}",
    partnerInfo: "${partnerInfo}"`;

  if (payload.REFUNDAMT) {
    params += `, refundAmount: ${payload.REFUNDAMT}`;
  }

  if (payload.BANKNAME) {
    params += `, bankName: "${payload.BANKNAME}"`;
  }

  if (payload.PAYMENTMODE) {
    params += `, paymentMode: ${payload.PAYMENTMODE}`;
  }
  console.log(params, 'make appt payment params');
  return (
    'mutation { makeAppointmentPayment(paymentInput: {' +
    params +
    '}){isRefunded appointment { id appointment{ id } } }}'
  );
};

module.exports = {
  consultsOrderQuery,
};
