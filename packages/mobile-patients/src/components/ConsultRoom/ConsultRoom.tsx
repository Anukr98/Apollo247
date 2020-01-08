import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  ConsultationRoom,
  DoctorImage,
  MyHealth,
  Person,
  ShoppingCart,
  TestsIcon,
  MedicineIcon,
  DropdownGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  DeviceHelper,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SAVE_DEVICE_TOKEN } from '@aph/mobile-patients/src/graphql/profiles';
import { DEVICE_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { PatientSignIn_patientSignIn_patients } from '@aph/mobile-patients/src/graphql/types/PatientSignIn';
import {
  saveDeviceToken,
  saveDeviceTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/saveDeviceToken';
import { getNetStatus, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  AsyncStorage,
  Dimensions,
  Image,
  ImageSourcePropType,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
  AppStateStatus,
  NativeModules,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import firebase from 'react-native-firebase';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { NotificationListener } from '@aph/mobile-patients/src/components/NotificationListener';
import { AddProfile } from '@aph/mobile-patients/src/components/ui/AddProfile';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { useUIElements } from '../UIElementsProvider';
import { AppConfig } from '../../strings/AppConfig';
import KotlinBridge from '../../KotlinBridge';
import { GenerateTokenforCM } from '../../helpers/apiCalls';
const { Vitals } = NativeModules;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  viewName: {
    backgroundColor: theme.colors.WHITE,
    width: '100%',
    height: Platform.OS === 'ios' ? 274 : 284,
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  hiTextStyle: {
    marginLeft: 20,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  nameTextContainerStyle: {
    maxWidth: '75%',
  },
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    //marginTop: 5,
    marginHorizontal: 5,
    marginBottom: 6,
  },
  descriptionTextStyle: {
    marginLeft: 20,
    marginTop: 12,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  buttonStyles: {
    flex: 1,
    backgroundColor: '#fcb716',
    height: 40,
    width: 'auto',
    borderRadius: 10,
    marginLeft: 20,
    marginTop: 16,
    paddingHorizontal: 13,
  },
  doctorView: {
    width: '100%',
    height: 277,
    ...theme.viewStyles.cardContainer,
  },
  doctorStyle: {
    marginLeft: 20,
    marginTop: 16,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
  },
});

type ArrayTest = {
  id: number;
  title: string;
  descripiton: string;
  image: ImageSourcePropType;
};

const arrayTest: ArrayTest[] = [
  {
    id: 1,
    title: 'Are you looking for a particular doctor?',
    descripiton: 'SEARCH SPECIALIST',
    image: require('@aph/mobile-patients/src/images/home/doctor.png'),
  },
  {
    id: 2,
    title: 'Do you want to buy some medicines?',
    descripiton: 'SEARCH MEDICINE',
    image: require('@aph/mobile-patients/src/images/home/medicine.png'),
  },
  {
    id: 3,
    title: 'Do you want to get some tests done?',
    descripiton: 'BOOK A TEST',
    image: require('@aph/mobile-patients/src/images/home/test.png'),
  },
  {
    id: 4,
    title: 'Track your Diabetes',
    descripiton: 'Continue to your program',
    image: require('@aph/mobile-patients/src/images/home/ic_diabetes.png'),
  },
];

type TabBarOptions = {
  id: number;
  title: string;
  image: React.ReactNode;
};

const tabBarOptions: TabBarOptions[] = [
  {
    id: 1,
    title: 'CONSULT ROOM',
    image: <ConsultationRoom style={{ marginTop: -4 }} />,
  },
  {
    id: 2,
    title: 'HEALTH RECORDS',
    image: <MyHealth style={{ marginTop: -4 }} />,
  },
  {
    id: 3,
    title: 'MEDICINES',
    image: <ShoppingCart style={{ marginTop: -4 }} />,
  },
  {
    id: 4,
    title: 'TESTS',
    image: <TestsIcon style={{ marginTop: -4 }} />,
  },
  {
    id: 5,
    title: 'MY ACCOUNT',
    image: <Person style={{ marginTop: -4 }} />,
  },
];

export interface ConsultRoomProps extends NavigationScreenProps {}
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
  const { isIphoneX } = DeviceHelper();

  const startDoctor = string.home.startDoctor;
  const scrollViewWidth = arrayTest.length * 250 + arrayTest.length * 20;
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);

  const { analytics, getPatientApiCall } = useAuth();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [deviceTokenApICalled, setDeviceTokenApICalled] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [listValues, setListValues] = useState<ArrayTest[]>(arrayTest);

  useEffect(() => {
    currentPatient && setshowSpinner(false);
    console.log(currentPatient, 'currentPatient');

    if (!currentPatient) {
      getPatientApiCall();
    }
    AppState.addEventListener('change', _handleAppStateChange);
  }, [currentPatient, analytics, props.navigation.state.params]);

  useEffect(() => {
    currentPatient && getTokenforCM(currentPatient);
  }, [currentPatient]);

  useEffect(() => {
    async function fetchData() {
      const userLoggedIn = await AsyncStorage.getItem('gotIt');
      if (userLoggedIn == 'true') {
        setshowPopUp(false);
      } else {
        setshowPopUp(true);
      }
    }
    fetchData();
    callDeviceTokenAPI();
    // getTokenforCM();
    checkForVersionUpdate();
  }, []);

  useEffect(() => {
    try {
      if (Platform.OS === 'android') {
        Linking.getInitialURL().then((url) => {
          // this.navigate(url);
        });
      } else {
        console.log('linking');
        Linking.addEventListener('url', handleOpenURL);
      }
    } catch (error) {}
  }, []);

  const getTokenforCM = (currentPatient: any) => {
    const fullName = `${g(currentPatient, 'firstName') || ''}%20${g(currentPatient, 'lastName') ||
      ''}`;

    GenerateTokenforCM(
      currentPatient ? (currentPatient.uhid ? currentPatient.uhid : currentPatient.id) : '',
      fullName,
      currentPatient ? (currentPatient.gender ? currentPatient.gender : '') : '',
      currentPatient ? (currentPatient.emailAddress ? currentPatient.emailAddress : '') : '',
      currentPatient ? (currentPatient.mobileNumber ? currentPatient.mobileNumber : '') : ''
    ).then((token: any) => {
      console.log(token, 'getTokenforCM');
      AsyncStorage.setItem('token', token.data.vitaToken);
      AsyncStorage.setItem('conditionalName', token.data.message);

      const testArray = JSON.parse(JSON.stringify(arrayTest));

      for (var i in testArray) {
        if (testArray[i].id == 4) {
          if (token.data.message === 'VitaToken Obtained Successfully') {
            testArray[i].title = 'Track your Diabetes';
            testArray[i].descripiton = 'Continue to your program';
          } else {
            testArray[i].title = 'Are you looking for Diabetes Management?';
            testArray[i].descripiton = 'Get Started';
          }
          break; //Stop this loop, we found it!
        }
      }
      setListValues(testArray);
      console.log(testArray, 'testArray');

      {
        renderItemsList();
      }
    });
  };

  const handleOpenURL = (event: any) => {
    console.log('event', event);
    const route = event.url.replace('apollopatients://', '');

    if (route == 'ConsultRoom') {
      console.log('ConsultRoom');
      // props.navigation.replace(AppRoutes.ConsultRoom);
    }
    console.log('route', route);
  };

  const client = useApolloClient();

  const callDeviceTokenAPI = async () => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const deviceToken2 = deviceToken ? JSON.parse(deviceToken) : '';
    firebase
      .messaging()
      .getToken()
      .then((token) => {
        // console.log('token', token);
        // console.log('DeviceInfo', DeviceInfo);
        if (token !== deviceToken2.deviceToken) {
          const input = {
            deviceType: Platform.OS === 'ios' ? DEVICE_TYPE.IOS : DEVICE_TYPE.ANDROID,
            deviceToken: token,
            deviceOS: '',
            // deviceOS: Platform.OS === 'ios' ? '' : DeviceInfo.getBaseOS(),
            patientId: currentPatient ? currentPatient.id : '',
          };
          console.log('input', input);

          if (currentPatient && !deviceTokenApICalled) {
            setDeviceTokenApICalled(true);
            client
              .mutate<saveDeviceToken, saveDeviceTokenVariables>({
                mutation: SAVE_DEVICE_TOKEN,
                variables: {
                  SaveDeviceTokenInput: input,
                },
                fetchPolicy: 'no-cache',
              })
              .then((data: any) => {
                console.log('APICALLED', data.data.saveDeviceToken.deviceToken);
                AsyncStorage.setItem(
                  'deviceToken',
                  JSON.stringify(data.data.saveDeviceToken.deviceToken)
                );
              })
              .catch((e: string) => {
                console.log('Error occured while adding Doctor', e);
              });
          }
        }
      });
  };

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      checkForVersionUpdate();
    }
  };

  const checkForVersionUpdate = () => {
    console.log('checkForVersionUpdate');

    if (__DEV__) {
      firebase.config().enableDeveloperMode();
    }

    firebase
      .config()
      .fetch(30 * 0) // 30 min
      .then(() => {
        return firebase.config().activateFetched();
      })
      .then(() => {
        return firebase
          .config()
          .getValues([
            'Android_mandatory',
            'android_latest_version',
            'ios_mandatory',
            'ios_Latest_version',
          ]);
      })
      .then((snapshot) => {
        const myValye = snapshot;
        let index: number = 0;
        const nietos = [];
        const Android_version: string = AppConfig.Configuration.Android_Version;
        const iOS_version: string = AppConfig.Configuration.iOS_Version;

        for (const val in myValye) {
          if (myValye.hasOwnProperty(val)) {
            index++;
            const element = myValye[val];
            nietos.push({ index: index, value: element.val() });
            if (nietos.length === 4) {
              console.log(
                'nietos',
                parseFloat(nietos[1].value),
                parseFloat(iOS_version),
                parseFloat(Android_version)
              );
              if (Platform.OS === 'ios') {
                if (parseFloat(nietos[3].value) > parseFloat(iOS_version)) {
                  showUpdateAlert(nietos[2].value);
                }
              } else {
                if (parseFloat(nietos[1].value) > parseFloat(Android_version)) {
                  showUpdateAlert(nietos[0].value);
                }
              }
            }
          }
        }
      })
      .catch((error) => console.log(`Error processing config: ${error}`));
  };

  const showUpdateAlert = (mandatory: boolean) => {
    showAphAlert!({
      title: `Hi there :)`,
      description: 'There is a new version available for this app. Please update it.',
      unDismissable: true,
      children: (
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 20,
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginVertical: 18,
          }}
        >
          {!mandatory ? (
            <Button
              style={{
                flex: 1,
                marginRight: 16,
              }}
              title={'CANCEL'}
              onPress={() => {
                hideAphAlert!();
              }}
            />
          ) : null}

          <Button
            style={{ flex: 1 }}
            title={'UPDATE'}
            onPress={() => {
              hideAphAlert!();

              Linking.openURL(
                Platform.OS === 'ios'
                  ? 'https://play.google.com/store/apps/details?id=com.apollo.patientapp'
                  : 'https://play.google.com/store/apps/details?id=com.apollo.patientapp'
              ).catch((err) => console.error('An error occurred', err));
            }}
          />
        </View>
      ),
    });
  };

  const Popup = () => (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        paddingVertical: 9,
        position: 'absolute',
        width: width,
        height: height,
        flex: 1,
        alignItems: 'flex-end',
        zIndex: 3,
        backgroundColor: 'transparent',
      }}
      onPress={() => setShowMenu(false)}
    >
      <View
        style={{
          width: 160,
          borderRadius: 10,
          backgroundColor: 'white',
          marginRight: 56,
          shadowColor: '#808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 5,
          paddingTop: 8,
          paddingBottom: 16,
          ...Platform.select({
            android: {
              marginTop: 94,
            },
            ios: {
              marginTop: 114,
            },
          }),
        }}
      >
        {allCurrentPatients &&
          allCurrentPatients.map((profile: PatientSignIn_patientSignIn_patients, i: number) => (
            <View style={styles.textViewStyle} key={i}>
              <Text
                style={[
                  styles.textStyle,
                  profile.firstName && currentPatient!.firstName === profile.firstName
                    ? { color: theme.colors.APP_GREEN }
                    : null,
                ]}
                onPress={() => {
                  setShowMenu(false);
                }}
              >
                {profile.firstName
                  ? profile.firstName
                      .split(' ')[0]
                      .replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
                  : ''}
              </Text>
            </View>
          ))}
        {/* 
        <Text
          style={{
            paddingTop: 15,
            paddingBottom: 4,
            paddingRight: 16,
            textAlign: 'right',
            ...theme.viewStyles.yellowTextStyle,
          }}
        >
          ADD MEMBER
        </Text> */}
      </View>
    </TouchableOpacity>
  );

  const renderStarDoctors = () => {
    return (
      <View style={styles.doctorView}>
        <Text style={styles.doctorStyle}>{string.home.start_doctor_title}</Text>
        <ScrollView
          style={{ backgroundColor: 'transparent' }}
          contentContainerStyle={{
            flexDirection: 'row',
            width: scrollViewWidth,
          }}
          horizontal={true}
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled={true}
        >
          {startDoctor.map((serviceTitle, i) => (
            <View key={i}>
              <TouchableHighlight key={i}>
                <View
                  style={{
                    ...theme.viewStyles.cardViewStyle,
                    marginTop: 20,
                    marginLeft: i === 0 ? 20 : 8,
                    marginRight: startDoctor.length === i + 1 ? 20 : 8,
                    marginBottom: 16,
                    width: 244,
                    height: 207,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 0.1,
                    borderColor: 'rgba(0,0,0,0.4)',
                    position: 'relative',
                    borderBottomWidth: 0,
                  }}
                  key={i}
                >
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 77,
                      height: 24,
                      borderRadius: 5,
                      backgroundColor: '#ff748e',
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        ...theme.fonts.IBMPlexSansSemiBold(9),
                      }}
                    >
                      {serviceTitle.status}
                    </Text>
                  </View>
                  <DoctorImage style={{ height: 80, width: 80 }} />
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansMedium(18),
                      color: '#02475b',
                      textAlign: 'center',
                    }}
                  >
                    {serviceTitle.name}
                  </Text>
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansMedium(12),
                      color: theme.colors.SKY_BLUE,
                      textAlign: 'center',
                    }}
                  >
                    {serviceTitle.Program}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 16,
                      alignItems: 'center',
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(14),
                          color: '#02475b',
                          textAlign: 'center',
                        }}
                      >
                        {serviceTitle.doctors}
                      </Text>
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(10),
                          color: '#02475b',
                          textAlign: 'center',
                        }}
                      >
                        {string.home.doctors_label}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: '#02475b',
                        width: 1,
                        height: 31,
                        marginLeft: 40,
                        marginRight: 16,
                      }}
                    />
                    <View>
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(14),
                          color: '#02475b',
                          textAlign: 'center',
                        }}
                      >
                        {serviceTitle.Patients}
                      </Text>
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(10),
                          color: '#02475b',
                          textAlign: 'center',
                        }}
                      >
                        {string.home.patients_enrolled_label}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBottomTabBar = () => {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          flexDirection: 'row',
          width: width,
          height: showPopUp ? 0 : isIphoneX() ? 87 : 57,
          shadowColor: 'black',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        {tabBarOptions.map((tabBarOptions, i) => (
          <View key={i}>
            <TouchableOpacity
              activeOpacity={1}
              key={i}
              onPress={() => {
                if (i === 0) {
                  CommonLogEvent(AppRoutes.ConsultRoom, 'CONSULT_ROOM clicked');
                  props.navigation.navigate('CONSULT ROOM');
                } else if (i == 1) {
                  CommonLogEvent(AppRoutes.ConsultRoom, 'HEALTH_RECORDS clicked');
                  props.navigation.navigate('HEALTH RECORDS');
                } else if (i == 2) {
                  CommonLogEvent(AppRoutes.ConsultRoom, 'MEDICINES clicked');
                  props.navigation.navigate('MEDICINES');
                } else if (i == 3) {
                  CommonLogEvent(AppRoutes.ConsultRoom, 'TESTS clicked');
                  props.navigation.navigate('TESTS');
                } else if (i == 4) {
                  CommonLogEvent(AppRoutes.ConsultRoom, 'MY_ACCOUNT clicked');
                  props.navigation.navigate('MY ACCOUNT');
                }
              }}
            >
              <View
                style={{
                  width: width / 5,
                  height: 57,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                key={i}
              >
                {tabBarOptions.image}
                <Text
                  style={{
                    fontFamily: 'IBMPlexSans-SemiBold',
                    fontSize: 7,
                    letterSpacing: 0.5,
                    textAlign: 'center',
                    marginTop: 8,
                    color: '#02475b',
                  }}
                >
                  {tabBarOptions.title}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderItemsList = () => {
    return (
      <View>
        {listValues.map((serviceTitle, i) => (
          <View key={i} style={{}}>
            <TouchableOpacity
              activeOpacity={1}
              key={i}
              onPress={() => {
                if (i === 0) {
                  CommonLogEvent(AppRoutes.ConsultRoom, 'DoctorSearch_clicked');
                  props.navigation.navigate(AppRoutes.DoctorSearch);
                } else if (i == 1) {
                  CommonLogEvent(AppRoutes.ConsultRoom, 'SearchMedicineScene_clicked');
                  // props.navigation.navigate(AppRoutes.SearchMedicineScene);
                  props.navigation.navigate('MEDICINES', { focusSearch: true });
                } else if (i == 2) {
                  CommonLogEvent(AppRoutes.ConsultRoom, 'SearchTestScene_clicked');
                  // props.navigation.navigate(AppRoutes.SearchTestScene);
                  props.navigation.navigate('TESTS', { focusSearch: true });
                } else if (i == 3) {
                  async function fetchTokenData() {
                    const tokenValue = await AsyncStorage.getItem('token');
                    console.log(tokenValue, 'tokenValue');

                    if (Platform.OS === 'ios') {
                      // Vitals.vitalsToExport(tokenValue);
                      Vitals.vitalsToExport(
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aXRhSWQiOiJ2aXRhSWRfMzY2OGYyNDYtZjZhNS00YmJkLWE5OGYtOTEzNDBiN2YzNWVkIiwicHJvdmlkZXJzIjp7InByb3ZpZGVySWRfZGExMWM0ZDQtMzExNi00MGJhLWI2NDEtMzM5MDA3NmFjMDA3Ijp7InByb3ZpZGVySWQiOiJwcm92aWRlcklkX2RhMTFjNGQ0LTMxMTYtNDBiYS1iNjQxLTMzOTAwNzZhYzAwNyIsIm5hbWUiOiJEZW1vIERvYyIsInJvbGUiOiJkb2N0b3IifSwicHJvdmlkZXJJZF84YjE1ODRmNC00NWM1LTQzNWItOGI2Ni00MTFjY2RlMzcxYWIiOnsicHJvdmlkZXJJZCI6InByb3ZpZGVySWRfOGIxNTg0ZjQtNDVjNS00MzViLThiNjYtNDExY2NkZTM3MWFiIiwibmFtZSI6IlRlc3QgQ29hY2giLCJyb2xlIjoiY29hY2gifSwicHJvdmlkZXJJZF9mY2QzM2FiNy01NWUxLTQxMjItOTUzMC02NmFlMzZiZWIyYmUiOnsicHJvdmlkZXJJZCI6InByb3ZpZGVySWRfZmNkMzNhYjctNTVlMS00MTIyLTk1MzAtNjZhZTM2YmViMmJlIiwibmFtZSI6IkhhcmkiLCJyb2xlIjoiZG9jdG9yIn19LCJwcm4iOiJ2aXRhSWRfMzY2OGYyNDYtZjZhNS00YmJkLWE5OGYtOTEzNDBiN2YzNWVkIiwiaWF0IjoxNTY4MjY4MjE1LCJleHAiOjk5OTk5OTk5OTksImlzcyI6IlZpdGFDbG91ZC1BVVRIIiwic3ViIjoiVml0YVRva2VuIn0.OgQdvqOJQeQGqlupI1N-ZLZLApYQMEiFrJtGJ_Be6P4'
                      );
                      setTimeout(() => {
                        Vitals.goToReactNative();
                      }, 500);
                    } else {
                      const fullName = `${g(currentPatient, 'firstName') || ''}%20${g(
                        currentPatient,
                        'lastName'
                      ) || ''}`;
                      const UHID = `${g(currentPatient, 'uhid') || ''}`;

                      tokenValue &&
                        KotlinBridge.show(
                          tokenValue,
                          UHID,
                          fullName,
                          '7729FD68-C552-4C90-B31E-98AA6C84FEBF~247Android'
                        );
                    }
                  }
                  fetchTokenData();
                }
              }}
            >
              <View
                style={{
                  ...theme.viewStyles.cardViewStyle,
                  ...theme.viewStyles.shadowStyle,
                  padding: 16,
                  marginHorizontal: 20,
                  backgroundColor: theme.colors.CARD_BG,
                  flexDirection: 'row',
                  alignItems: 'center',
                  // height: 104,
                  marginTop: i === 0 ? 0 : 8,
                  marginBottom: arrayTest.length === i + 1 ? 16 : 8,
                }}
                key={i}
              >
                <View style={{ width: width - 144, justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      color: '#02475b',
                      lineHeight: 24,
                      textAlign: 'left',
                      ...theme.fonts.IBMPlexSansMedium(14),
                      paddingRight: 16,
                    }}
                  >
                    {serviceTitle.title}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      textAlign: 'left',
                      ...theme.viewStyles.yellowTextStyle,
                    }}
                  >
                    {serviceTitle.descripiton}
                  </Text>
                </View>
                <Image style={{ height: 72, width: 72 }} source={serviceTitle.image} />
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {showMenu && Popup()}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          <Image
            source={require('@aph/mobile-patients/src/images/doctor/doctor.png')}
            style={{
              right: 20,
              top: Platform.OS === 'ios' ? 187 : 197,
              position: 'absolute',
              zIndex: 2,
            }}
          />
          <View style={{ top: Platform.OS === 'ios' ? 180 : 190, position: 'absolute', zIndex: 3 }}>
            <Button
              title={string.home.consult_doctor}
              style={styles.buttonStyles}
              onPress={() => {
                CommonLogEvent(AppRoutes.ConsultRoom, 'symptom checker  clicked');
                props.navigation.navigate(AppRoutes.SymptomChecker, { MoveDoctor: 'MoveDoctor' });
              }}
            />
          </View>
          <View style={{ width: '100%', height: Platform.OS === 'ios' ? 436 : 446 }}>
            <View style={styles.viewName}>
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  paddingTop: 16,
                  paddingHorizontal: 20,
                  backgroundColor: theme.colors.WHITE,
                }}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {}} //props.navigation.replace(AppRoutes.TabBar)}
                >
                  <ApolloLogo />
                </TouchableOpacity>
              </View>
              <View
                // activeOpacity={1}
                // onPress={() => setShowMenu(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <ProfileList
                    navigation={props.navigation}
                    saveUserChange={true}
                    childView={
                      <View
                        style={{
                          flexDirection: 'row',
                          paddingRight: 8,
                          borderRightWidth: 0,
                          borderRightColor: 'rgba(2, 71, 91, 0.2)',
                          backgroundColor: theme.colors.WHITE,
                        }}
                      >
                        <Text style={styles.hiTextStyle}>{'hi'}</Text>
                        <View style={styles.nameTextContainerStyle}>
                          <Text style={styles.nameTextStyle} numberOfLines={1}>
                            {(currentPatient && currentPatient!.firstName!.toLowerCase()) || ''}
                          </Text>
                          <View style={styles.seperatorStyle} />
                        </View>
                        <View style={{ paddingTop: 15 }}>
                          <DropdownGreen />
                        </View>
                      </View>
                    }
                    setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
                    unsetloaderDisplay={true}
                  ></ProfileList>
                  {/* <Text style={styles.hiTextStyle}>
                    {string.home.hi} {userName}!
                  </Text> */}
                  {/* <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={styles.nameTextStyle}>{userName}!</Text>
                      <DropdownGreen style={{ marginTop: 8 }} />
                    </View>
                    <View style={styles.seperatorStyle} />
                  </View> */}
                </View>
              </View>
              <Text style={styles.descriptionTextStyle}>{string.home.description}</Text>
            </View>
          </View>
          {renderItemsList()}
          {/* {renderStarDoctors()} */}
          <NeedHelpAssistant
            containerStyle={{ marginTop: 30, marginBottom: 48 }}
            navigation={props.navigation}
          />
          {/* <View style={styles.helpView}>
            <Mascot style={{ height: 80, width: 80 }} />
            <Button
              title={string.home.need_help}
              style={styles.needhelpbuttonStyles}
              titleTextStyle={styles.titleBtnStyles}
            />
          </View> */}
        </ScrollView>
      </SafeAreaView>
      {renderBottomTabBar()}
      {showPopUp && (
        <BottomPopUp
          title={string.home.welcome_popup.title}
          description={string.home.welcome_popup.description}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.gotItStyles}
              onPress={() => {
                CommonLogEvent(AppRoutes.ConsultRoom, 'ConsultRoom_BottomPopUp clicked');
                AsyncStorage.setItem('gotIt', 'true');
                setshowPopUp(false);
              }}
            >
              <Text style={styles.gotItTextStyles}>{string.home.welcome_popup.cta_label}</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {/* <BottomPopUp
        title={string.common.greatPopup}
        description={
          'Your appointment with Dr. Jayanth has been scheduled for — 18th May, Monday, 12:00 pm'
        }
      >
        <View style={{ height: 60, alignItems: 'flex-end' }}>
          <TouchableOpacity style={styles.gotItStyles} onPress={() => {}}>
            <Text style={styles.gotItTextStyles}>{string.home.welcome_popup.cta_label}</Text>
          </TouchableOpacity>
        </View>
      </BottomPopUp> */}
      {showSpinner && <Spinner />}
      {/* {displayAddProfile && (
        <AddProfile
          setdisplayoverlay={setDisplayAddProfile}
          setProfile={(profile) => {
            setProfile(profile);
          }}
        />
      )} */}
      <NotificationListener navigation={props.navigation} />
    </View>
  );
};
