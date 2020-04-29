import { AppCommonDataProvider } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { DiagnosticsCartProvider } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { GetCurrentPatients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { g, getBuildEnvironment } from '@aph/mobile-patients/src/helpers/helperFunctions';
// import { db } from '@aph/mobile-patients/src/strings/FirebaseConfig';
import moment from 'moment';
import React from 'react';
import { Alert, BackAndroid, Platform, Text, TextInput } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import AsyncStorage from '@react-native-community/async-storage';

const postToFirebase = (
  currentPatients: string | null,
  selectUserId: string | null,
  error: string,
  type: string,
  ApiLevel: number | null,
  DeviceName: string | null
) => {
  const patient = (
    g(
      JSON.parse(currentPatients || '[]') as GetCurrentPatients,
      'getCurrentPatients',
      'patients'
    ) || []
  ).find((item) => item.id == selectUserId);
  const payload = {
    error,
    errorType: type,
    patientId: g(patient, 'id') || '',
    mobileNumber: g(patient, 'mobileNumber') || '',
    dateTime: moment(new Date()).toString(),
    plaform: Platform.OS === 'ios' ? 'iOS' : 'Andriod',
    apiLevel: ApiLevel,
    device: DeviceName,
    appVersion: `${DeviceInfo.getVersion()}.${DeviceInfo.getBuildNumber()}`,
    environment: getBuildEnvironment(),
  };
  console.log('crash payload ---', { payload });
  // db.ref('ApolloCrashes/')
  //   .push(payload)
  //   .then((data) => {
  //     console.log('data ', { data });
  //   })
  //   .catch((error) => {
  //     console.log('error ', { error });
  //   });
};

const reporter = (error: string, type: 'JS' | 'Native') => {
  // Logic for reporting to devs
  console.log(error, type);
  if (getBuildEnvironment() == 'PROD') {
    Promise.all([
      DeviceInfo.getDeviceName(),
      DeviceInfo.getApiLevel(),
      AsyncStorage.getItem('currentPatient'),
      AsyncStorage.getItem('selectUserId'),
    ])
      .then(([DeviceName, ApiLevel, currentPatients, selectUserId]) => {
        postToFirebase(currentPatients, selectUserId, error, type, ApiLevel, DeviceName);
      })
      .catch((error) => {
        console.log({ error });
      });
  }
};

const errorHandler = (e: any, isFatal: boolean) => {
  if (isFatal) {
    reporter(e, 'JS');
    Alert.alert(
      'Uh oh.. :(',
      'Oops! Unexpected error occurred. We have reported this to our team. Please close the app and start again.',
      [
        {
          text: 'OK, GOT IT',
          onPress: () => {
            BackAndroid.exitApp();
          },
        },
      ]
    );
  } else {
    console.log(e); // So that we can see it in the ADB logs in case of Android if needed
  }
};

setJSExceptionHandler(errorHandler);

setNativeExceptionHandler((exceptionString) => {
  reporter(exceptionString, 'Native');
  // This is your custom global error handler
  // You do stuff likehit google analytics to track crashes.
  // or hit a custom api to inform the dev team.
  //NOTE: alert or showing any UI change via JS
  //WILL NOT WORK in case of NATIVE ERRORS.
});

interface AppContainerTypes {}

export class AppContainer extends React.Component<AppContainerTypes> {
  constructor(props: AppContainerTypes) {
    super(props);
    (Text as any).defaultProps = (Text as any).defaultProps || {};
    (Text as any).defaultProps.allowFontScaling = false;
    (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
    (TextInput as any).defaultProps.allowFontScaling = false;
  }

  render() {
    return (
      <AuthProvider>
        <UIElementsProvider>
          <AppCommonDataProvider>
            <ShoppingCartProvider>
              <DiagnosticsCartProvider>
                <NavigatorContainer />
              </DiagnosticsCartProvider>
            </ShoppingCartProvider>
          </AppCommonDataProvider>
        </UIElementsProvider>
      </AuthProvider>
    );
  }
}
