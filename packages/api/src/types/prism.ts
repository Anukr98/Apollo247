export interface PrismGetAuthTokenResponse {
  errorCode: null;
  errorMsg: null;
  errorType: null;
  response: string;
}
export interface PrismGetAuthTokenError {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: null;
}

export interface PrismGetUsersError {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: null;
}

export interface PrismSignUpUserData {
  userName: string;
  UHID: string;
  hospital: string;
  activeStatus: string;
  siteKey: string;
  setActiveStatus: boolean;
  setSiteKey: boolean;
  setUHID: boolean;
  setHospital: boolean;
  uhid: string;
  setUserName: boolean;
}

export interface PrismGetUsersResponse {
  errorCode: null;
  errorMsg: null;
  errorType: null;
  response: null | {
    recoveryMessage: string;
    statusinfo: string;
    user: {
      id: unknown;
      salutation: unknown;
      firstName: unknown;
      middleName: unknown;
      lastName: unknown;
      status: unknown;
      dateActivated: number;
      mobileNumber: unknown;
      userBasicInfo: unknown;
      userContactInfo: unknown;
      userPreferenceInfo: unknown;
      sugarInfo: unknown;
      aadharNumber: unknown;
      license: unknown;
      panCard: unknown;
      protonstatus: unknown;
      email: unknown;
      setId: boolean;
      setSalutation: boolean;
      setFirstName: boolean;
      setMiddleName: boolean;
      setLastName: boolean;
      setStatus: boolean;
      setDateActivated: boolean;
      setUserBasicInfo: boolean;
      setUserContactInfo: boolean;
      setUserPreferenceInfo: boolean;
      sugarInfoSize: 0;
      sugarInfoIterator: unknown;
      setSugarInfo: boolean;
      setAadharNumber: boolean;
      setLicense: boolean;
      setPanCard: boolean;
      setProtonstatus: boolean;
      setEmail: boolean;
      setMobileNumber: boolean;
    };
    uhidValue: unknown;
    signUpUserData: {
      UHID: string;
      activeStatus: string;
      hospital: string;
      setActiveStatus: boolean;
      setHospital: boolean;
      setSiteKey: boolean;
      setUHID: boolean;
      setUserName: boolean;
      siteKey: string;
      uhid: string;
      userName: string;
      gender: string;
      dob: number;
    }[];
  };
}
