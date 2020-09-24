import { consultWebengageEventsCommonInfo } from 'helpers/commonHelpers';

//PHR Consult & RX
declare global {
  interface Window {
    webengage: any;
  }
}
interface UserDetail {
  emailAddress: string | null;
  dateOfBirth: string;
  mobileNumber: string;
  gender: string | null;
  firstName: string | null;
  lastName: string | null;
}

window.webengage = window.webengage || {};

export const webengageUserDetailTracking = (userDetailData: UserDetail) => {
  const { emailAddress, dateOfBirth, mobileNumber, gender, firstName, lastName } = userDetailData;
  if (typeof window !== 'undefined') {
    try {
      window.webengage.user.setAttribute('we_email', emailAddress);
      window.webengage.user.setAttribute('we_birth_date', dateOfBirth);
      window.webengage.user.setAttribute('we_phone', mobileNumber);
      window.webengage.user.setAttribute('we_gender', gender);
      window.webengage.user.setAttribute('we_first_name', firstName);
      window.webengage.user.setAttribute('we_last_name', lastName);
    } catch (err) {
      console.log('Webengage user tracking err: ', err);
    }
  }
};
export const webengageUserLoginTracking = (id: string) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.user.login(id);
    } catch (err) {
      console.log('Webengage user login tracking err: ', err);
    }
  }
};

export const webengageUserLogoutTracking = () => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.user.logout();
    } catch (err) {
      console.log('Webengage user logout tracking err: ', err);
    }
  }
};

export const phrConsultTabClickTracking = (userData: any) => {
  if (typeof window !== 'undefined') {
    const { id, mobileNumber, firstName, relation, gender, age, uhid } = userData;
    try {
      window.webengage.track('PHR Consult & RX - web', {
        'Patient Name': firstName,
        'Patient UHID': uhid,
        Relation: relation,
        Gender: gender,
        'Mobile Number': mobileNumber,
        'Customer ID': id,
        Age: age,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};
//PHR Medical Records
export const phrMedicalRecordsTabClickTracking = (userData: any) => {
  if (window.webengage) {
    const { id, mobileNumber, firstName, relation, gender, uhid, age } = userData;
    try {
      window.webengage.track('PHR Medical Records - web', {
        'Patient Name': firstName,
        'Patient UHID': uhid,
        Relation: relation,
        Gender: gender,
        'Mobile Number': mobileNumber,
        'Customer ID': id,
        Age: age,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};
//Add Record
export const addRecordClickTracking = (source: string) => {
  // Consult & RX/ Medical Record
  try {
    window.webengage.track('Add Record - web', {
      Source: source,
    });
  } catch (err) {
    console.log('WebEngage Err: ', err);
  }
};
//Upload Prescription
export const uploadPrescriptionTracking = (data: any) => {
  console.log('data', data);
  const { id, mobileNumber, firstName, relation, age, gender, uhid } = data;
  try {
    window.webengage.track('Upload Prescription - web', {
      'Patient Name': firstName || '',
      'Patient UHID': uhid || '',
      Relation: relation || '',
      Age: age || '',
      Gender: gender || '',
      'Mobile Number': mobileNumber || '',
      'Customer ID': id || '',
    });
  } catch (err) {
    console.log('WebEngage Err: ', err);
  }
};
//Upload Photo
export const uploadPhotoTracking = (source: string) => {
  try {
    window.webengage.track('Pharmacy Prescription Image Uploaded - web', {
      Source: source, //Take Photo/Gallery
    });
  } catch (err) {
    console.log('WebEngage Err: ', err);
  }
};
//Items Clicked
export const itemsClickedTracking = (data: any) => {
  const { source, type } = data;
  try {
    window.webengage.track('Items Clicked - web', {
      Source: source, //Consult/Medical
      Type: type, //Prescription/Test Result
    });
  } catch (err) {
    console.log('WebEngage Err: ', err);
  }
};
//PHR Consult Card click
export const phrConsultCardClickTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { id, mobileNumber, firstName, relation, gender, uhid, age, consultId } = data;
    try {
      window.webengage.track('PHR Consult Card click - web', {
        'Patient Name': firstName,
        'Patient UHID': uhid,
        Relation: relation,
        Gender: gender,
        Age: age,
        'Mobile Number': mobileNumber,
        'Customer ID': id,
        'Consult ID': consultId,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};
// Payment Instrument Click
interface PaymentDetail {
  paymentMode: string;
  type: string;
  orderAutoId: number;
  orderId: string;
}
export const paymentInstrumentClickTracking = (data: PaymentDetail) => {
  if (typeof window !== 'undefined') {
    const { paymentMode, type, orderAutoId, orderId = null } = data;
    try {
      window.webengage.track('Payment Instrument - web', {
        Payment_Mode: paymentMode,
        Type: type,
        order_AutoId: orderAutoId,
        order_Id: orderId,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

interface PaymentStatusData {
  paymentStatus: string;
  type: string;
  orderAutoId: number;
  orderId: string;
}
export const paymentStatusTracking = (data: PaymentStatusData) => {
  if (typeof window !== 'undefined') {
    const { paymentStatus, type, orderAutoId, orderId = null } = data;
    try {
      window.webengage.track('Payment Status - web', {
        Payment_Status: paymentStatus,
        Type: type,
        order_AutoId: orderAutoId,
        order_Id: orderId,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

interface MedicineDetails {
  sku: string;
  name: string;
  category_id: string;
}

export const notifyMeTracking = (data: MedicineDetails) => {
  if (typeof window !== 'undefined') {
    const { sku, name, category_id } = data;
    try {
      window.webengage.track('Notify Me - web', {
        'product name': name,
        'product id': sku,
        'category ID': category_id,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacySearchEnterTracking = (results: number) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track('Pharmacy Search enter clicked - web', {
        'No. of results': results,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyOrderSummaryTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      orderId,
      orderDate,
      orderType,
      customerId,
      deliveryDate,
      mobileNumber,
      orderStatus,
    } = data;
    try {
      window.webengage.track('Pharmacy Order summary clicked - web', {
        'Order ID': orderId,
        'Order date': orderDate,
        'Order type': orderType,
        'Customer ID': customerId,
        'Delivery date': deliveryDate,
        'Mobile number': mobileNumber,
        'Order status': orderStatus,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyFilterTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { categoryName, categoryId } = data;
    try {
      window.webengage.track('Filter apply option clicked - web', {
        'Category Name': categoryName,
        'Category ID': categoryId,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyPdpPincodeTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { productName, productId, customerId, pinCode } = data;
    try {
      window.webengage.track('Pharmacy PDP Pin code checked - web', {
        'Product ID': productId,
        'Product Name': productName,
        'Customer ID': customerId,
        'PIN Code': Number(pinCode),
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyPdpOverviewTracking = (result: string) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track('Pharmacy PDP Pharma overview clicked - web', {
        'Type of information': result,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyPdpSubstituteTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { productName, productId } = data;
    try {
      window.webengage.track('Pharmacy PDP substitute clicked - web', {
        'Product ID': productId,
        'Product Name': productName,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyConfigSectionTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { productName, productId, sectionName } = data;
    try {
      window.webengage.track('Pharmacy Configurable section clicked - web', {
        'Section name': sectionName,
        'Product ID': productId,
        'Product Name': productName,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyHomeBannerTracking = (result: number) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track('Pharmacy Home page banner - web', {
        'Banner position': result,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyPrescriptionTracking = (result: string) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track('Pharmacy prescription proceed - web', {
        'Option selected': result,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const consultNowClickTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { availableInMins, docCategory, exp, hospital, name, specialty, listingType } = data;
    try {
      window.webengage.track('Consult Now clicked - web', {
        'Available in Minutes': availableInMins,
        'Doctor Category': docCategory,
        Experience: exp,
        Hospital: hospital,
        Name: name,
        Specialisation: specialty,
        listing_type: listingType,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyCartViewTracking = (result: any) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track('Cart Viewed - web', {
        'Cart Items': result,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const specialtyClickTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { patientAge, patientGender, specialtyId, specialtyName, relation } = data;
    try {
      window.webengage.track('Speciality Clicked - web', {
        'Patient Age': patientAge,
        'Patient Gender': patientGender,
        'Speciality ID': specialtyId,
        'Speciality Name': specialtyName,
        Relation: relation,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const consultationBookTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      category,
      consultDateTime,
      consultId,
      consultMode,
      displayId,
      doctorName,
      hospitalName,
      patientGender,
      specialisation,
      relation,
      patientName,
      secretaryName,
      doctorNumber,
      patientNumber,
      secretaryNumber,
    } = data;
    try {
      window.webengage.track('Consultation booked - web', {
        af_currency: '',
        af_revenue: '',
        category: category,
        'Consult Date Time': consultDateTime,
        'Consult ID': consultId,
        'Consult Mode': consultMode,
        'Display ID': displayId,
        'Doctor Name': doctorName,
        'Hospital Name': hospitalName,
        'Patient Gender': patientGender,
        specialisation: specialisation,
        Relation: relation,
        'Patient Name': patientName,
        'Secretary Name': secretaryName,
        'Doctor Mobile number': doctorNumber,
        'Patient mobile number': patientNumber,
        'Secretary Mobile Number': secretaryNumber,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const doctorProfileViewTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { availableInMins, docCategory, exp, name, specialty } = data;
    try {
      window.webengage.track('Doctor Profile Viewed - web', {
        'Available in Minutes': availableInMins,
        'Doctor Category': docCategory,
        Experience: exp,
        Name: name,
        Specialisation: specialty,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const consultPayButtonClickTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      actualPrice,
      consultDateTime,
      consultType,
      discountAmount,
      discountCoupon,
      doctorCity,
      doctorName,
      specialty,
      netAmount,
      patientGender,
    } = data;
    try {
      window.webengage.track('Consult Pay Button Clicked - web', {
        'Actual Price': actualPrice,
        'Consult Date Time': consultDateTime,
        consultType: consultType,
        'Discount Amount': discountAmount,
        'Discount coupon': discountCoupon,
        'Doctor City': doctorCity,
        'Doctor Name': doctorName,
        'Doctor Specialty': specialty,
        'Net Amount': netAmount,
        'Patient Gender': patientGender,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const consultPayInitiateTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      actualPrice,
      consultDateTime,
      consultType,
      discountAmount,
      discountCoupon,
      doctorCity,
      doctorName,
      specialty,
      netAmount,
      patientGender,
    } = data;
    try {
      window.webengage.track('Consult Payment Initiated - web', {
        'Actual Price': actualPrice,
        'Consult Date Time': consultDateTime,
        consultType: consultType,
        'Discount Amount': discountAmount,
        'Discount coupon': discountCoupon,
        'Doctor City': doctorCity,
        'Doctor Name': doctorName,
        'Doctor Specialty': specialty,
        'Net Amount': netAmount,
        'Patient Gender': patientGender,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyCheckoutTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      serviceArea,
      orderId,
      shippingInfo,
      payStatus,
      payType,
      grandTotal,
      discountAmount,
      netAfterDiscount,
    } = data;
    try {
      window.webengage.track('Pharmacy Checkout completed - web', {
        'Servie Area': serviceArea,
        'Order ID': orderId,
        'Shipping information': shippingInfo,
        'Grand Total': grandTotal,
        'Discount Amount': discountAmount,
        'Net after discount': netAfterDiscount,
        'Payment Type': payType,
        'Payment status': payStatus,
        'Cart ID': '',
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyPaymentInitiateTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { amount, serviceArea, payMode } = data;
    try {
      window.webengage.track('Pharmacy Payment Initiated - web', {
        Amount: amount,
        'Service Area': serviceArea,
        'Payment mode': payMode,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacySearchTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { keyword, source, results } = data;
    try {
      window.webengage.track('Pharmacy Search - web', {
        keyword: keyword,
        Source: source,
        'Results displayed': results,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyProductViewTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      productName,
      source,
      productId,
      brand,
      brandId,
      categoryName,
      categoryId,
      sectionName,
    } = data;
    try {
      window.webengage.track('Pharmacy product viewed - web', {
        'product name': productName,
        Source: source,
        'product id (SKUID)': productId,
        Brand: brand,
        'Brand ID': brandId,
        'category name': categoryName,
        'category ID': categoryId,
        'Section Name': sectionName,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyProductClickedTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { productName, source, productId, sectionName } = data;
    try {
      window.webengage.track('Pharmacy product clicked - web', {
        'product name': productName,
        Source: source,
        'product id (SKUID)': productId,
        'Section Name': sectionName,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyCategoryClickTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { source, categoryName, categoryId, sectionName } = data;
    try {
      window.webengage.track('Pharmacy Category Clicked - web', {
        Source: source,
        'category name': categoryName,
        'category ID': categoryId,
        'Section Name': sectionName,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const addToCartTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      productName,
      source,
      productId,
      brand,
      brandId,
      categoryName,
      categoryId,
      discountedPrice,
      price,
      quantity,
    } = data;
    try {
      window.webengage.track('Add to Cart - web', {
        'product name': productName,
        Source: source,
        'product id (SKUID)': productId,
        Brand: brand,
        'Brand ID': brandId,
        'category name': categoryName,
        'category ID': categoryId,
        'Discounted Price': discountedPrice,
        Price: price,
        Quantity: quantity,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const removeFromCartTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      productName,
      cartSize,
      productId,
      brand,
      brandId,
      categoryName,
      categoryId,
      discountedPrice,
      price,
      quantity,
    } = data;
    try {
      window.webengage.track('Removed from Cart - web', {
        'product name': productName,
        'Cart Size': cartSize,
        'product id (SKUID)': productId,
        Brand: brand,
        'Brand ID': brandId,
        'category name': categoryName,
        'category ID': categoryId,
        'Discounted Price': discountedPrice,
        Price: price,
        Quantity: quantity,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const buyNowTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      productName,
      serviceArea,
      productId,
      brand,
      brandId,
      categoryName,
      categoryId,
      discountedPrice,
      price,
      quantity,
    } = data;
    try {
      window.webengage.track('Buy Now Clicked - web', {
        'product name': productName,
        'Service Area': serviceArea,
        'product id (SKUID)': productId,
        Brand: brand,
        'Brand ID': brandId,
        'category name': categoryName,
        'category ID': categoryId,
        'Discounted Price': discountedPrice,
        Price: price,
        Quantity: quantity,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyProceedToPayTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      totalItems,
      serviceArea,
      subTotal,
      deliveryCharge,
      netAfterDiscount,
      isPrescription,
      cartId,
      deliveryMode,
      deliveryDateTime,
      pincode,
    } = data;
    try {
      window.webengage.track('Pharmacy Proceed To Pay Clicked - web', {
        'Service Area': serviceArea,
        'Total items in cart': totalItems,
        'Sub Total': subTotal,
        'Delivery charge': deliveryCharge,
        'Net after discount': netAfterDiscount,
        'Prescription Needed?': isPrescription,
        'Cart ID': cartId,
        'Mode of Delivery': deliveryMode,
        'Delivery Date Time': deliveryDateTime,
        'Pin Code': pincode,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacySubmitPrescTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { orderId, deliveryType, storeId, deliverAdd, pincode } = data;
    try {
      window.webengage.track('Pharmacy Submit Prescription - web', {
        'Order ID': orderId,
        'Delivery type': deliveryType,
        'Store ID': storeId,
        'Delivery address': deliverAdd,
        Pincode: pincode,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pincodeAutoSelectTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { pincode, serviceability } = data;
    try {
      window.webengage.track('PIN Code autoselection clicked - web', {
        'pin code': pincode,
        serviceability: serviceability,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pincodeManualSelectTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const { pincode, serviceability, source } = data;
    try {
      window.webengage.track('Pharmacy Enter Delivery Pincode Submitted - web', {
        'pin code': pincode,
        serviceability: serviceability,
        source: source,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyUploadPresClickTracking = (result: string) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track('Pharmacy Upload Prescription Clicked - web', {
        Source: result,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pageViewTracking = (eventName: string) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track(eventName);
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const buyMedicineClickTracking = (result: string) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track('Buy Medicine clicked - web', {
        'Customer ID': result,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

// web consult events

export const goConsultRoomTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track(
        'Go to consult room clicked (web)',
        consultWebengageEventsCommonInfo(data)
      );
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const medicalDetailsFillTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track(
        'Medical details filled (web)',
        consultWebengageEventsCommonInfo(data)
      );
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const callReceiveClickTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track(
        'Green button on call clicked (web)',
        consultWebengageEventsCommonInfo(data)
      );
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const callEndedClickTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track(
        'Patient ended the consult (web)',
        consultWebengageEventsCommonInfo(data)
      );
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const prescriptionReceivedTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.track(
        'Prescription patient received successfully (web)',
        consultWebengageEventsCommonInfo(data)
      );
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const messageSentPostConsultTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      doctorName,
      patientName,
      secretaryName,
      doctorNumber,
      patientNumber,
      secretaryNumber,
    } = data;
    try {
      window.webengage.track('Patient sent chat message post consult (web)', {
        'Doctor Name': doctorName,
        'Patient Name': patientName,
        'Secretary Name': secretaryName,
        'Doctor Mobile number': doctorNumber,
        'Patient mobile number': patientNumber,
        'Secretary Mobile Number': secretaryNumber,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const cancellationPatientTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      doctorName,
      patientName,
      secretaryName,
      doctorNumber,
      patientNumber,
      secretaryNumber,
    } = data;
    try {
      window.webengage.track('Cancellation by patient (web)', {
        'Doctor Name': doctorName,
        'Patient Name': patientName,
        'Secretary Name': secretaryName,
        'Doctor Mobile number': doctorNumber,
        'Patient mobile number': patientNumber,
        'Secretary Mobile Number': secretaryNumber,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const reschedulePatientTracking = (data: any) => {
  if (typeof window !== 'undefined') {
    const {
      doctorName,
      patientName,
      secretaryName,
      doctorNumber,
      patientNumber,
      secretaryNumber,
    } = data;
    try {
      window.webengage.track('Reschedule by the patient (web)', {
        'Doctor Name': doctorName,
        'Patient Name': patientName,
        'Secretary Name': secretaryName,
        'Doctor Mobile number': doctorNumber,
        'Patient mobile number': patientNumber,
        'Secretary Mobile Number': secretaryNumber,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};
