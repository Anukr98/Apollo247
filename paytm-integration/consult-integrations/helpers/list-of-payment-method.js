module.exports =
    [{
        name: 'DEBIT CARD',
        paymentMode: 'DC',
        enabled: true,
        seq: 1
    },
    {
        name: 'CREDIT CARD',
        paymentMode: 'CC',
        enabled: true,
        seq: 2,
    },
    {
        name: 'PAYTM',
        paymentMode: 'PPI',
        enabled: true,
        seq: 3
    },
    {
        name: 'UPI',
        paymentMode: 'UPI',
        enabled: true,
        seq: 4
    },
    {
        name: "NET BANKING",
        paymentMode: 'NB',
        seq: 5,
        enabled: true,
        banksList: [
            {
                name: 'SBI',
                bankCode: 'ASBI',
                seq: 1
            },
            {
                name: 'HDFC',
                bankCode: 'HDFC',
                seq: 2
            },
            {
                name: 'ICICI',
                bankCode: 'ICICI',
                seq: 3
            },
            {
                name: 'AXIS',
                bankCode: 'AXIS',
                seq: 4
            },
            {
                name: 'PNB',
                bankCode: 'PNB',
                seq: 5
            },

        ]
    }]

