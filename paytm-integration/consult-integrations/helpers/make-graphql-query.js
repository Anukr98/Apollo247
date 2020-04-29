const consultsOrderQuery = (payload, isWebhook) => {
    let txnDate = new Date(new Date(payload.TXNDATE).toUTCString()).toISOString();
    if (isWebhook) {
        txnDate = new Date(new Date(payload.TXNDATETIME).toUTCString()).toISOString();
    }

    let params = `orderId: "${payload.ORDERID}", amountPaid: ${payload.TXNAMOUNT},
    paymentRefId: "${payload.TXNID}", paymentStatus: "${payload.STATUS}", paymentDateTime: "${txnDate}", responseCode: "${payload.RESPCODE}", responseMessage: "${payload.RESPMSG}", bankTxnId: "${payload.BANKTXNID}"`
    if (payload.REFUNDAMT) {
        params += `, refundAmount: ${payload.REFUNDAMT}`
    }

    if (payload.BANKNAME) {
        params += `, bankName: "${payload.BANKNAME}"`
    }

    return 'mutation { makeAppointmentPayment(paymentInput: {' + params + '}){appointment { id appointment{ id } } }}';
}

module.exports = {
    consultsOrderQuery
}

