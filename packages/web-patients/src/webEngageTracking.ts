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
  if (window && window.webengage) {
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
  if (window && window.webengage) {
    try {
      window.webengage.user.login(id);
    } catch (err) {
      console.log('Webengage user login tracking err: ', err);
    }
  }
};

export const webengageUserLogoutTracking = () => {
  if (window && window.webengage) {
    try {
      window.webengage.user.logout();
    } catch (err) {
      console.log('Webengage user logout tracking err: ', err);
    }
  }
};

export const phrConsultTabClickTracking = (userData: any) => {
  if (window && window.webengage) {
    const { id, mobileNumber, firstName, relation, gender, age, uhid } = userData;
    try {
      window.webengage.track('PHR Consult & RX', {
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
      window.webengage.track('PHR Medical Records', {
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
    window.webengage.track('Add Record', {
      Source: source,
    });
  } catch (err) {
    console.log('WebEngage Err: ', err);
  }
};
//Upload Prescription
export const uploadPrescriptionTracking = (data: any) => {
  const { id, mobileNumber, firstName, relation, age, gender, uhid } = data;
  try {
    window.webengage.track('Upload Prescription', {
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
    window.webengage.track('Upload Photo', {
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
    window.webengage.track('Items Clicked', {
      Source: source, //Consult/Medical
      Type: type, //Prescription/Test Result
    });
  } catch (err) {
    console.log('WebEngage Err: ', err);
  }
};
//PHR Consult Card click
export const phrConsultCardClickTracking = (data: any) => {
  if (window && window.webengage) {
    const { id, mobileNumber, firstName, relation, gender, uhid, age, consultId } = data;
    try {
      window.webengage.track('PHR Consult Card click', {
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
  if (window && window.webengage) {
    const { paymentMode, type, orderAutoId, orderId = null } = data;
    try {
      window.webengage.track('Payment Instrument', {
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
  if (window && window.webengage) {
    const { paymentStatus, type, orderAutoId, orderId = null } = data;
    try {
      window.webengage.track('Payment Status', {
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
  if (window && window.webengage) {
    const { sku, name, category_id } = data;
    try {
      window.webengage.track('Notify Me', {
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
  if (window && window.webengage) {
    try {
      window.webengage.track('Pharmacy Search enter clicked', {
        'No. of results': results,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyOrderSummaryTracking = (data: any) => {
  if (window && window.webengage) {
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
      window.webengage.track('Pharmacy Order summary clicked', {
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
  if (window && window.webengage) {
    const { categoryName, categoryId } = data;
    try {
      window.webengage.track('Filter option clicked', {
        'Category Name': categoryName,
        'Category ID': categoryId,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyPdpPincodeTracking = (data: any) => {
  if (window && window.webengage) {
    const { productName, productId, customerId, pinCode } = data;
    try {
      window.webengage.track('Pharmacy PDP Pin code checked', {
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
  if (window && window.webengage) {
    try {
      window.webengage.track('Pharmacy PDP Pharma overview clicked', {
        'Type of information': result,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyPdpSubstituteTracking = (data: any) => {
  if (window && window.webengage) {
    const { productName, productId } = data;
    try {
      window.webengage.track('Pharmacy PDP substitute clicked', {
        'Product ID': productId,
        'Product Name': productName,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};

export const pharmacyConfigSectionTracking = (data: any) => {
  if (window && window.webengage) {
    const { productName, productId, sectionName } = data;
    try {
      window.webengage.track('Pharmacy Configurable section clicked', {
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
  if (window && window.webengage) {
    try {
      window.webengage.track('Pharmacy Home page banner', {
        'Banner position': result,
      });
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};
