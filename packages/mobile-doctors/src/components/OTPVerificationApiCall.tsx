import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { GET_DOCTOR_DETAILS } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { setLoggedIn, getLocalData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import React from 'react';
import { useQuery } from 'react-apollo-hooks';
import { Alert } from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';

export interface OTPVerificationApiCallProps extends NavigationScreenProps {
  phoneNumber: string;
}
{
}

export const OTPVerificationApiCall: React.FC<OTPVerificationApiCallProps> = (props) => {
  const { setDoctorDetails } = useAuth();
  const { data, loading, error } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);

  if (!loading) {
    console.log('OTPVerificationApiCall', { loading, data });
    if (error) {
      console.log(error, 'error GetDoctorDetails');
      CommonBugFender('OTPVerificationApiCall', error);
      props.navigation.goBack();
      Alert.alert(
        'Error',
        'Sorry, this application is invite only. Please reach out to us at admin@apollo247.com in case you wish to enroll.'
      );
    } else {
      // set to context
      const userPhone: string = props.navigation.getParam('phoneNumber');
      console.log('OTPVerificationApiCall', { userPhone });
      setDoctorDetails && setDoctorDetails(data!.getDoctorDetails);
      setDoctorDetails;
      getLocalData()
        .then((data) => {
          console.log('OTPVerificationApiCalldata', data);
        })
        .catch(() => {});

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
