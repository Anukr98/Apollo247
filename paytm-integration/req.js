const { parseISO, format, differenceInYears, addMinutes } = require('date-fns');
const orderDetails = {
  id: 'ed1bada8-ee31-4c39-85f1-155c6c62942b',
  shopId: '14055',
  shopAddress:
    '{"storename":"BANJARA HILLS RD NO 12","address":"Apollo Pharmacy -8-2-644/1/8, SHOP NO.7&7A,HIGHLINE COMPLEX, BANJARA HILLS 12,HYDERABAD","workinghrs":"8AM to 8PM","phone":"040-23431764","city":"HYDERABAD","state":"TELANGANA","zipcode":"500034","stateCode":"TS"}',
  orderAutoId: 245002491,
  estimatedAmount: 274.46,
  orderTat: '',
  pharmaRequest: null,
  devliveryCharges: 0,
  deliveryType: 'STORE_PICKUP',
  patientAddressId: '',
  prescriptionImageUrl: '',
  orderType: 'CART_ORDER',
  currentStatus: 'ORDER_INITIATED',
  quoteDateTime: '2020-06-06T15:24:19.865Z',
  coupon: '',
  patient: {
    mobileNumber: '+919650091010',
    firstName: 'Ajay',
    lastName: 'Prasad',
    emailAddress: '',
    dateOfBirth: '1984-09-28',
  },
  medicineOrderLineItems: [
    {
      medicineSKU: 'DET0034',
      medicineName: 'Dettol Original Liquid Hand Wash 185 Ml Refill',
      mrp: 45,
      mou: 1,
      price: 42.75,
      quantity: 1,
      isMedicine: '0',
    },
    {
      medicineSKU: 'DET0055',
      medicineName: 'Dettol Original Hand Wash 250Ml',
      mrp: 79,
      mou: 1,
      price: 79,
      quantity: 1,
      isMedicine: '0',
    },
    {
      medicineSKU: 'APH0015',
      medicineName: 'Apollo Life Hand Sanitizer 50ml',
      mrp: 25,
      mou: 1,
      price: 25,
      quantity: 1,
      isMedicine: '0',
    },
    {
      medicineSKU: 'GLY0020',
      medicineName: 'GLYCOMET GP 2MG TABLET',
      mrp: 141.9,
      mou: 15,
      price: 127.71,
      quantity: 1,
      isMedicine: '1',
    },
  ],
  medicineOrderPayments: [
    {
      id: 'c9031224-efb4-4881-82f7-aa612376a6a2',
      bankTxnId: null,
      paymentType: 'COD',
      amountPaid: 274.46,
      paymentRefId: null,
      paymentStatus: 'success',
    },
  ],
};
let deliveryCity = 'Kakinada',
  deliveryZipcode = '500034',
  deliveryAddress1 = '',
  deliveryAddress2 = '',
  landmark = '',
  deliveryAddress = 'Kakinada',
  deliveryState = 'Telangana',
  deliveryStateCode = 'TS',
  lat = 0,
  long = 0;

if (orderDetails.shopId) {
  if (!orderDetails.shopAddress) {
    logger.error(`store address details not present for store pick ${orderDetails.orderAutoId}`);
    return;
  }
  const shopAddress = JSON.parse(orderDetails.shopAddress);
  deliveryState = shopAddress.state;
  deliveryCity = shopAddress.city;
  deliveryZipcode = shopAddress.zipcode;
  deliveryAddress = shopAddress.address;
  deliveryStateCode = shopAddress.stateCode;
}
const orderLineItems = [];
let requestType = 'NONCART';
let orderType = 'fmcg';
if (orderDetails.orderType == 'CART_ORDER') {
  requestType = 'CART';
  orderDetails.medicineOrderLineItems.forEach((item) => {
    const lineItem = {
      itemid: item.medicineSKU,
      itemname: item.medicineName,
      quantity: item.quantity * item.mou,
      packsize: item.mou,
      discpercent: ((item.mrp - item.price) / item.mrp) * 100,
      discamount: item.mrp - item.price,
      mrp: item.mrp / item.mou, // per unit
      splmrp: item.price / item.mou,
      totalAmount: item.price * item.quantity,
      comment: '',
    };
    orderLineItems.push(lineItem);
  });
  const pharmaItems = orderDetails.medicineOrderLineItems.filter((item) => {
    return item.isMedicine == '1';
  });
  if (pharmaItems && pharmaItems.length > 0) {
    orderType = 'Pharma';
  }
  if (orderDetails.devliveryCharges > 0) {
    orderLineItems.push({
      itemid: 'ESH0002',
      itemname: 'E SHOP SHIPPING CHARGE',
      packsize: 1,
      quantity: 1,
      discpercent: '',
      discamount: '',
      mrp: orderDetails.devliveryCharges,
      totalamount: orderDetails.devliveryCharges,
      comment: '',
    });
  }
}
const paymentDetails =
  (orderDetails.medicineOrderPayments && orderDetails.medicineOrderPayments[0]) || {};
const patientDetails = orderDetails.patient;
let patientAge = 30;
if (patientDetails.dateOfBirth && patientDetails.dateOfBirth != null) {
  patientAge = Math.abs(differenceInYears(new Date(), parseISO(patientDetails.dateOfBirth)));
}
const orderPrescriptionUrl = [];
let prescriptionImages = [];
if (orderDetails.prescriptionImageUrl) {
  prescriptionImages = orderDetails.prescriptionImageUrl.split(',');
}
if (prescriptionImages.length > 0) {
  prescriptionImages.map((imageUrl) => {
    const url = {
      url: imageUrl,
    };
    orderPrescriptionUrl.push(url);
  });
}
if (!orderDetails.orderTat) {
  orderDetails.orderTat = '';
}
const orderTat =
  orderDetails.orderTat && Date.parse(orderDetails.orderTat) ? new Date(orderDetails.orderTat) : '';
const medicineOrderPharma = {
  orderid: orderDetails.orderAutoId,
  orderdate: format(addMinutes(parseISO(orderDetails.quoteDateTime), 330), 'MM-dd-yyyy HH:mm:ss'),
  couponcode: orderDetails.coupon,
  drname: '',
  VendorName: 'Apollo247',
  shippingmethod: orderDetails.deliveryType == 'HOME_DELIVERY' ? 'HOMEDELIVERY' : 'CURBSIDE',
  paymentmethod: paymentDetails.paymentType === 'CASHLESS' ? 'PREPAID' : 'COD',
  prefferedsite: orderDetails.shopId || '',
  ordertype: requestType,
  orderamount: orderDetails.estimatedAmount || 0,
  deliverydate: orderTat ? format(orderTat, 'MM-dd-yyyy HH:mm:ss') : '',
  timeslot: orderTat ? format(orderTat, 'HH:mm') : '',
  shippingcharges: orderDetails.devliveryCharges || 0,
  categorytype: orderType,
  customercomment: '',
  landmark: landmark,
  issubscribe: false,
  customerdetails: {
    billingaddress: (deliveryAddress && deliveryAddress.trim()) || '',
    billingpincode: deliveryZipcode,
    billingcity: deliveryCity,
    billingstateid: deliveryStateCode,
    shippingaddress: (deliveryAddress && deliveryAddress.trim()) || '',
    shippingpincode: deliveryZipcode,
    shippingcity: deliveryCity,
    shippingstateid: deliveryStateCode,
    customerid: '',
    patiendname: patientDetails.firstName,
    customername:
      patientDetails.firstName + (patientDetails.lastName ? ' ' + patientDetails.lastName : ''),
    primarycontactno: patientDetails.mobileNumber.substr(3),
    secondarycontactno: '',
    age: patientAge,
    emailid: patientDetails.emailAddress || '',
    cardno: '0',
    latitude: lat,
    longitude: long,
  },
  paymentdetails:
    paymentDetails.paymentType === 'CASHLESS'
      ? [
          {
            paymentsource: 'paytm',
            transactionstatus: 'TRUE',
            paymenttransactionid: paymentDetails.paymentRefId,
            amount: paymentDetails.amountPaid,
          },
        ]
      : [],
  itemdetails: orderLineItems || [],
  imageurl: orderPrescriptionUrl,
};

console.log(medicineOrderPharma);
