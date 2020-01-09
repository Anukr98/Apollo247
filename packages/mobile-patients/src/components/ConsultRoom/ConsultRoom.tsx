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
  ManageProfileIcon,
  Location,
  NotificaitonAccounts,
  Ambulance,
  CartIcon,
  NotificationIcon,
  TestsCartIcon,
  TestsCartMedicineIcon,
  DoctorIcon,
  Diabetes,
  Symptomtracker,
  PrescriptionIcon,
  PrescriptionMenu,
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
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
  StyleProp,
  ViewStyle,
  ImageBackground,
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
import { ListCard } from '../ui/ListCard';
import { useDiagnosticsCart } from '../DiagnosticsCartProvider';
import { useShoppingCart } from '../ShoppingCartProvider';
import { getAppointments } from '../../helpers/clientCalls';
import moment from 'moment';
import { apiRoutes } from '../../helpers/apiRoutes';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  viewName: {
    backgroundColor: theme.colors.WHITE,
    width: '100%',
    marginBottom: 20,
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
    marginTop: 0,
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
  labelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
  menuOptionIconStyle: {
    height: 40,
    width: 40,
    resizeMode: 'contain',
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
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);

  const { cartItems } = useDiagnosticsCart();
  const { cartItems: shopCartItems } = useShoppingCart();
  const cartItemsCount = cartItems.length + shopCartItems.length;

  const { analytics, getPatientApiCall } = useAuth();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [deviceTokenApICalled, setDeviceTokenApICalled] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [menuViewOptions, setMenuViewOptions] = useState<number[]>([]);
  const [currentAppointments, setCurrentAppointments] = useState<string>('0');
  const [appointmentLoading, setAppointmentLoading] = useState<boolean>(false);
  const menuOptions = [
    {
      id: 1,
      title: 'Find A Doctor',
      image: <DoctorIcon style={styles.menuOptionIconStyle} />,
      onPress: () => props.navigation.navigate(AppRoutes.DoctorSearch),
    },
    {
      id: 2,
      title: 'Buy Medicines',
      image: <TestsCartMedicineIcon style={styles.menuOptionIconStyle} />,
      onPress: () => props.navigation.navigate('MEDICINES', { focusSearch: true }),
    },
    {
      id: 3,
      title: 'Order Tests',
      image: <TestsCartIcon style={styles.menuOptionIconStyle} />,
      onPress: () => props.navigation.navigate('TESTS', { focusSearch: true }),
    },
    {
      id: 4,
      title: 'Manage Diabetes',
      image: <Diabetes style={styles.menuOptionIconStyle} />,
      onPress: () => {},
    },
    {
      id: 5,
      title: 'Track Symptoms',
      image: <Symptomtracker style={styles.menuOptionIconStyle} />,
      onPress: () =>
        props.navigation.navigate(AppRoutes.SymptomChecker, { MoveDoctor: 'MoveDoctor' }),
    },
    {
      id: 6,
      title: 'View Health Records',
      image: <PrescriptionMenu style={styles.menuOptionIconStyle} />,
      onPress: () => props.navigation.navigate('HEALTH RECORDS'),
    },
  ];

  useEffect(() => {
    // if (token.data.message === 'VitaToken Obtained Successfully') {
    setMenuViewOptions([1, 2, 3, 4, 5, 6]);
    // } else {
    // setMenuViewOptions([1, 2, 3, 5]);
    // }
  }, []);

  const buildName = () => {
    switch (apiRoutes.graphql()) {
      case 'https://aph.dev.api.popcornapps.com//graphql':
        return 'DEV';
      case 'https://aph.staging.api.popcornapps.com//graphql':
        return 'QA';
      case 'https://aph.uat.api.popcornapps.com//graphql':
        return 'UAT';
      case 'https://aph.vapt.api.popcornapps.com//graphql':
        return 'VAPT';
      case 'https://api.apollo247.com//graphql':
        return 'PROD';
      case 'https://asapi.apollo247.com//graphql':
        return 'PRF';
      default:
        return '';
    }
  };

  useEffect(() => {
    currentPatient && setshowSpinner(false);
    if (!currentPatient) {
      getPatientApiCall();
    } else {
      setAppointmentLoading(true);
      getAppointments(client, currentPatient.id)
        .then((data: any) => {
          const appointments = data.patinetAppointments.filter((item: any) =>
            moment(item.appointmentDateTime).isSameOrAfter(moment(new Date()))
          );
          setCurrentAppointments(appointments.length);
        })
        .finally(() => {
          setAppointmentLoading(false);
        });
    }
    AppState.addEventListener('change', _handleAppStateChange);
  }, [currentPatient, analytics, props.navigation.state.params]);

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
            'QA_Android_mandatory',
            'QA_android_latest_version',
            'QA_ios_mandatory',
            'QA_ios_latest_version',
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
            if (nietos.length === 8) {
              console.log(
                'nietos',
                parseFloat(nietos[1].value),
                parseFloat(iOS_version),
                parseFloat(Android_version),
                parseFloat(nietos[5].value),
                parseFloat(nietos[7].value)
              );
              if (Platform.OS === 'ios') {
                if (buildName() === 'QA') {
                  if (parseFloat(nietos[7].value) > parseFloat(iOS_version)) {
                    showUpdateAlert(nietos[6].value);
                  }
                } else {
                  if (parseFloat(nietos[3].value) > parseFloat(iOS_version)) {
                    showUpdateAlert(nietos[2].value);
                  }
                }
              } else {
                if (buildName() === 'QA') {
                  if (parseFloat(nietos[5].value) > parseFloat(Android_version)) {
                    showUpdateAlert(nietos[4].value);
                  }
                } else {
                  if (parseFloat(nietos[1].value) > parseFloat(Android_version)) {
                    showUpdateAlert(nietos[0].value);
                  }
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

  const renderProfileDrop = () => {
    return (
      <ProfileList
        navigation={props.navigation}
        saveUserChange={true}
        childView={
          <View
            style={{
              flexDirection: 'row',
              paddingRight: 8,
              borderRightWidth: 0,
              paddingTop: 80,
              marginTop: 30,
              borderRightColor: 'rgba(2, 71, 91, 0.2)',
              backgroundColor: theme.colors.CLEAR,
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
      />
    );
  };

  const renderListView = () => {
    return (
      <View>
        <ListCard
          container={{ marginTop: 14 }}
          title={'Upcoming Appointments'}
          leftIcon={renderListCount(currentAppointments)}
          onPress={() => props.navigation.navigate('CONSULT ROOM')}
        />
        {/* <ListCard
          container={{ marginTop: 14 }}
          title={'Active Orders'}
          leftIcon={renderListCount(2)}
          onPress={() => props.navigation.navigate(AppRoutes.YourOrdersScene)}
        /> */}
      </View>
    );
  };

  const renderListCount = (count: string) => {
    return (
      <View
        style={{
          height: 40,
          width: 40,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.CARD_BG,
          borderRadius: 5,
        }}
      >
        {appointmentLoading ? (
          <Spinner style={{ backgroundColor: 'transparent' }} spinnerProps={{ size: 'small' }} />
        ) : (
          <Text style={{ ...theme.viewStyles.text('M', 18, theme.colors.SKY_BLUE, 1, 24, 0) }}>
            {count}
          </Text>
        )}
      </View>
    );
  };

  const renderMenuOptions = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginLeft: 20,
          marginRight: 8,
          marginTop: 16,
        }}
      >
        {menuOptions.map((item) => {
          if (menuViewOptions.findIndex((i) => i === item.id) >= 0) {
            return (
              <TouchableOpacity activeOpacity={1} onPress={item.onPress}>
                <View
                  style={{
                    ...theme.viewStyles.cardViewStyle,
                    flexDirection: 'row',
                    minHeight: 59,
                    width: width / 2 - 28,
                    marginRight: 12,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginHorizontal: 10,
                      flex: 0.5,
                    }}
                  >
                    {item.image}
                  </View>
                  <View
                    style={{
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      marginRight: 10,
                      flex: 1,
                    }}
                  >
                    <Text style={[theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 18)]}>
                      {item.title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }
        })}
      </View>
    );
  };

  const renderEmergencyCallBanner = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          {
            Linking.openURL('tel:1066');
          }
        }}
      >
        <View
          style={{
            marginHorizontal: 20,
            marginVertical: 16,
            paddingHorizontal: 10,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: '#d13135',
            borderRadius: 10,
          }}
        >
          <Text style={theme.viewStyles.text('SB', 14, theme.colors.WHITE, 1, 20)}>
            Call 1066 in emergency
          </Text>
          <Ambulance style={{ height: 41, width: 41 }} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderTopIcons = () => {
    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          paddingTop: 16,
          paddingHorizontal: 20,
          backgroundColor: theme.colors.CLEAR,
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <ApolloLogo style={{ width: 57, height: 37 }} resizeMode="contain" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              props.navigation.navigate(AppRoutes.MedAndTestCart, {
                isComingFromConsult: true,
              })
            }
            style={{ right: 20 }}
          >
            <CartIcon />
            {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.navigation.navigate(AppRoutes.NotificationSettings)}
          >
            <NotificationIcon />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          <View style={{ width: '100%' }}>
            <View style={styles.viewName}>
              <ImageBackground
                style={{ width: '100%' }}
                imageStyle={{ width: width }}
                source={require('@aph/mobile-patients/src/images/apollo/img_doctorimage.png')}
              >
                {renderTopIcons()}
                <View style={{ flexDirection: 'row' }}>{renderProfileDrop()}</View>
              </ImageBackground>
              <Text style={styles.descriptionTextStyle}>{string.home.description}</Text>
              {renderMenuOptions()}
              {renderEmergencyCallBanner()}
            </View>
          </View>
          {renderListView()}
          <NeedHelpAssistant
            containerStyle={{ marginTop: 30, marginBottom: 48 }}
            navigation={props.navigation}
          />
          {/* <Image
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
            </View> */}
          {/* </View>
              </View>
              <Text style={styles.descriptionTextStyle}>{string.home.description}</Text>
            </View>
          </View>
          <View>
            {arrayTest.map((serviceTitle, i) => (
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
            ))} */}
          {/* </View> */}
          {/* {renderStarDoctors()} */}
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
