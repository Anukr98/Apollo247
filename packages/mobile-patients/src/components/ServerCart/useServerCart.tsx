import { useEffect, useState } from 'react';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export const useServerCart = () => {
  const {
    serverCartItems,
    setServerCartItems,
    setCartCircleSubscriptionId,
    setServerCartAmount,
    // setCartAmounts,
    // setCartAddressId
    // setCartCoupon
    // setCartPrescriptions
    // setSubscriptionDetails
  } = useShoppingCart();
  const [userActionPayload, setUserActionPayload] = useState<any>(null);

  const fetchServerCart = () => {
    // make GQL query call
    const response = {
      statusCode: 200,
      errorMessage: '',
      data: {
        patientId: 'string',
        amount: {
          cartTotal: 200.4,
          estimatedAmount: 220.4,
          deliveryCharges: 50,
          cartSavings: 0,
          couponSavings: 0,
          totalCashBack: 30.05,
          isFreeDelivery: true,
          packagingCharges: 20,
        },
        medicineOrderCartLineItems: [
          {
            sku: 'CRO0091',
            name: "Crocin Advance Tablet 20's",
            price: 200.4,
            mou: '20',
            quantity: 1,
            image: '/catalog/product/cache/resized/100x/c/r/crocin_adva.jpg',
            thumbnail: '/catalog/product/cache/resized/100x/c/r/crocin_adva.jpg',
            smallImage: '/catalog/product/cache/resized/100x/c/r/crocin_adva.jpg',
            isExpress: 1,
            isInContract: 'yes',
            isPrescriptionRequired: false,
            description: "Crocin Advance Tablet 20's",
            subcategory: '',
            typeId: 'Pharma',
            urlKey: 'crocin-advance-tablet',
            isInStock: 1,
            maxOrderQty: 3,
            sellOnline: 1,
            manufacturer: 'Crocin',
            dcAvailability: 'yes',
            tat: '10-Oct-2021 22:00',
            tatDuration: 'string',
            sellingPrice: 200.4,
            isCouponApplicable: false,
            cashback: 30.05,
          },
        ],
        zipcode: '122001',
        latitude: 75,
        longitude: 74,
        patientAddressId: '688f53c4-22dc-4959-b2dd-95f8e83230f4',
        coupon: '',
        prescriptionDetails: [
          {
            prescriptionImageUrl: '',
            prismPrescriptionFileId: '',
          },
        ],
        prescriptionType: '',
        appointmentId: 'string',
        subscriptionDetails: {
          userSubscriptionId: '3f8fcb71-a1ba-4b09-9bb6-3ade622adeef',
          // planId: '',
          // subPlanId: '',
          // type: '',
          // planAmount: '',
          // durationInMonths: '',
          // validDuration: '',
        },
      },
    };
    setServerCartItems(response.data.medicineOrderCartLineItems);
    setCartCircleSubscriptionId(response.data.subscriptionDetails.userSubscriptionId);
    console.log('response.data.amount >>>>> ', response.data.amount);
    setServerCartAmount(response.data.amount);
  };

  const syncServerCart = (userActionPayload) => {
    // make GQL mutation call
    return new Promise((resolve, reject) => {
      // make api call
    });
  };

  useEffect(() => {
    if (userActionPayload) {
      syncServerCart(userActionPayload).then((response) => {
        // setCartItems(response.cartItems);
      });
    }
  }, [userActionPayload]);

  return {
    setUserActionPayload,
    fetchServerCart,
    syncServerCart,
  };
};
