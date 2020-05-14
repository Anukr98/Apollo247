const getMedicineOrderQuery = (method, patientId, orderId) => {
  return `query {
        "${method}"(patientId:"${patientId}", orderAutoId:${orderId}) {
          MedicineOrderDetails {
            id
            shopId
            orderAutoId
            estimatedAmount
            pharmaRequest
            devliveryCharges
            deliveryType
            patientAddressId
            prescriptionImageUrl
            orderType
            currentStatus
            patient{
              mobileNumber
              firstName
              lastName
              emailAddress
              dateOfBirth
            }
            medicineOrderLineItems{
              medicineSKU
              medicineName
              mrp
              mou
              price
              quantity        
              isMedicine
            }
            medicineOrderPayments{
              id
              bankTxnId
              paymentType
              amountPaid
              paymentRefId
              paymentStatus
            }
          }
        }
    }`;
};

module.exports = {
  getMedicineOrderQuery,
};
