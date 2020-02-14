import gql from 'graphql-tag';

export const CUSTOM_LOGIN = gql`
  query Login($mobileNumber: String!, $loginType: LOGIN_TYPE!) {
    login(mobileNumber: $mobileNumber, loginType: $loginType) {
      status
      message
      loginId
    }
  }
`;

export const CUSTOM_LOGIN_RESEND_OTP = gql`
  query ResendOtp($mobileNumber: String!, $id: String!, $loginType: LOGIN_TYPE!) {
    resendOtp(mobileNumber: $mobileNumber, id: $id, loginType: $loginType) {
      status
      message
      loginId
    }
  }
`;

export const CUSTOM_LOGIN_VERIFY_OTP = gql`
  query verifyLoginOtp($otpVerificationInput: OtpVerificationInput) {
    verifyLoginOtp(otpVerificationInput: $otpVerificationInput) {
      status
      authToken
      isBlocked
    }
  }
`;
