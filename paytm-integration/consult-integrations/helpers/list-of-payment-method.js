module.exports = [{
    name: 'DEBIT CARD',
    paymentMode: 'DC',
    enabled: true,
    imageUrl: 'https://prodaphstorage.blob.core.windows.net/paymentlogos/card.png',
    seq: 1
},
{
    name: 'CREDIT CARD',
    paymentMode: 'CC',
    enabled: true,
    imageUrl: 'https://prodaphstorage.blob.core.windows.net/paymentlogos/card.png',
    seq: 2,
},
{
    name: 'PAYTM',
    paymentMode: 'PPI',
    enabled: true,
    imageUrl: 'https://prodaphstorage.blob.core.windows.net/paymentlogos/paytm.png',
    seq: 3
},
{
    name: 'UPI',
    paymentMode: 'UPI',
    enabled: true,
    imageUrl: 'https://prodaphstorage.blob.core.windows.net/paymentlogos/Bhim.png',
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
            enabled: true,
            imageUrl: 'https://prodaphstorage.blob.core.windows.net/paymentlogos/sbi.png',
            seq: 1
        },
        {
            name: 'HDFC',
            bankCode: 'HDFC',
            enabled: true,
            imageUrl: 'https://prodaphstorage.blob.core.windows.net/paymentlogos/hdfc.png',
            seq: 2
        },
        {
            name: 'ICICI',
            bankCode: 'ICICI',
            enabled: true,
            imageUrl: 'https://prodaphstorage.blob.core.windows.net/paymentlogos/icici.png',
            seq: 3
        },
        {
            name: 'AXIS',
            bankCode: 'AXIS',
            enabled: true,
            imageUrl: 'https://prodaphstorage.blob.core.windows.net/paymentlogos/axis.png',
            seq: 4
        },
        {
            name: 'PNB',
            bankCode: 'PNB',
            enabled: false,
            imageUrl: '',
            seq: 5
        },

    ]
}]



