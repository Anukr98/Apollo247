import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { GET_DOCTOR_DETAILS } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { setLoggedIn } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import React, { useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert } from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';

export interface OTPVerificationApiCallProps extends NavigationScreenProps {}

export const OTPVerificationApiCall: React.FC<OTPVerificationApiCallProps> = (props) => {
  const { setDoctorDetails } = useAuth();
  const client = useApolloClient();

  const redirectToProfile = () => {
    client
      .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS, fetchPolicy: 'no-cache' })
      .then(({ data: { getDoctorDetails } }) => {
        // set to context
        setDoctorDetails && setDoctorDetails(getDoctorDetails);
        setLoggedIn(true).finally(() => {
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.ProfileSetup })],
            })
          );
        });
      })
      .catch((e) => {
        console.log(e);

        const error = JSON.parse(JSON.stringify(e));
        console.log('%c redirectToProfile error', error);
        props.navigation.goBack();
        Alert.alert(
          'Error',
          'Sorry, this application is invite only. Please reach out to us at admin@apollo247.com in case you wish to enroll.'
        );
      });
  };

  useEffect(() => {
    redirectToProfile();
  }, []);

  return <Loader fullScreen />;
};
