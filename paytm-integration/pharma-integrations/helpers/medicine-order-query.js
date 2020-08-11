const getMedicineOrderQuery = (method, patientId, orderId) => {
  return `query {
        ${method}(patientId:"${patientId}", orderAutoId:${orderId}) {
          medicineOrderDetails {
            id
            shopId
            shopAddress
            orderAutoId
            estimatedAmount
            orderTat
            pharmaRequest
            devliveryCharges
            deliveryType
            patientAddressId
            prescriptionImageUrl
            orderType
            currentStatus
            quoteDateTime
            coupon
            customerComment
            medicineOrderAddress {
              mobileNumber
              name
              latitude
              longitude
              landmark
              addressLine1
              addressLine2
              city
              state
              zipcode
              stateCode
            }
            patient{
              id
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
              healthCreditsRedeemed
              healthCreditsRedemptionRequest {
                RequestNumber
              }
            }
          }
        }
    }`;
};

module.exports = {
  getMedicineOrderQuery,
};
