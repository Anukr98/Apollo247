const medicineOrderQuery = (payload, isWebhook) => {
    let txnDate = new Date(new Date(payload.TXNDATE).toUTCString()).toISOString();
    if (isWebhook) {
        txnDate = new Date(new Date(payload.TXNDATETIME).toUTCString()).toISOString();
    }

    let params = `orderAutoId: ${payload.ORDERID}, paymentType: CASHLESS, amountPaid: ${payload.TXNAMOUNT},
    paymentRefId: "${payload.TXNID}", paymentStatus: "${payload.STATUS}", paymentDateTime: "${txnDate}", responseCode: "${payload.RESPCODE}", responseMessage: "${payload.RESPMSG}", bankTxnId: "${payload.BANKTXNID}"`
    if (payload.REFUNDAMT) {
        params += `, refundAmount: ${payload.REFUNDAMT}`
    }

    if (payload.BANKNAME) {
        params += `, bankName: "${payload.BANKNAME}"`
    }

    return 'mutation { SaveMedicineOrderPaymentMq(medicinePaymentMqInput: { ' + params + '}){ errorCode, errorMessage, orderStatus }}';
}

module.exports = {
    medicineOrderQuery
}

