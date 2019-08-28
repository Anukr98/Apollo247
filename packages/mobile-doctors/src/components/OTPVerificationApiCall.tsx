import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { GET_DOCTOR_DETAILS } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { setLoggedIn } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import React from 'react';
import { useQuery } from 'react-apollo-hooks';
import { Alert } from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { RNFirebase } from 'react-native-firebase';

export interface OTPVerificationApiCallProps extends NavigationScreenProps {
  phoneNumber: string;
}
{
}

export const OTPVerificationApiCall: React.FC<OTPVerificationApiCallProps> = (props) => {
  const { setDoctorDetails, setIsDelegateLogin, isDelegateLogin } = useAuth();
  const { data, loading, error } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);

  if (!loading) {
    console.log('OTPVerificationApiCall', { loading, data });
    if (error) {
      props.navigation.goBack();
      Alert.alert(
        'Error',
        'Sorry, this application is invite only. Please reach out to us at admin@apollo247.com in case you wish to enroll.'
      );
    } else {
      // set to context
      const userPhone: string = props.navigation.getParam('phoneNumber');
      const delegateNumber = data!.getDoctorDetails!.delegateNumber;
      console.log('OTPVerificationApiCall', { userPhone, delegateNumber });
      if ((userPhone && userPhone.replace('+91', '')) == delegateNumber) {
        console.log('Logged in with delegate number', { userPhone, delegateNumber });
        setIsDelegateLogin && setIsDelegateLogin(true);
        console.log({ isDelegateLogin });
      }
      setDoctorDetails && setDoctorDetails(data!.getDoctorDetails);
      setDoctorDetails;

      setLoggedIn(true).finally(() => {
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({ routeName: AppRoutes.ProfileSetup })],
          })
        );
      });
    }
  }

  return <Loader fullScreen />;
};
