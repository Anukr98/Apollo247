// Once user goes to Login screen, change isOnboardingDone to true
// Once user completes profile flow, change isProfileFlowDone to true
// Set isLoggedIn to true when otp verification is done
// Set isLoggedIn & isProfileFlowDone to false before logging out
export type LocalStorage = {
  isLoggedIn?: boolean;
  isProfileFlowDone?: boolean;
  isOnboardingDone?: boolean;
};
