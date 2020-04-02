import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NotificationListener } from '@aph/mobile-patients/src/components/NotificationListener';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import {
  Ambulance,
  CartIcon,
  ConsultationRoom,
  Diabetes,
  DoctorIcon,
  DropdownGreen,
  MyHealth,
  Person,
  PrescriptionMenu,
  Symptomtracker,
  TestsCartIcon,
  TestsCartMedicineIcon,
  TestsIcon,
  MedicineIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonLogEvent,
  DeviceHelper,
  CommonBugFender,
  CommonSetUserBugsnag,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_PATIENT_FUTURE_APPOINTMENT_COUNT,
  SAVE_DEVICE_TOKEN,
} from '@aph/mobile-patients/src/graphql/profiles';
import { DEVICE_TYPE, Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  saveDeviceToken,
  saveDeviceTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/saveDeviceToken';
import {
  g,
  postWebEngageEvent,
  UnInstallAppsFlyer,
  doRequestAndAccessLocationModified,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  ImageBackground,
  Linking,
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  NativeModules,
} from 'react-native';
import firebase from 'react-native-firebase';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { getPatientFutureAppointmentCount } from '@aph/mobile-patients/src/graphql/types/getPatientFutureAppointmentCount';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import KotlinBridge from '@aph/mobile-patients/src/KotlinBridge';
import { GenerateTokenforCM } from '@aph/mobile-patients/src/helpers/apiCalls';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import AsyncStorage from '@react-native-community/async-storage';
import {
  WebEngageEvents,
  WebEngageEventName,
  PatientInfo,
  PatientInfoWithSource,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import moment from 'moment';
import WebEngage from 'react-native-webengage';
import { LocationSearchHeader } from '@aph/mobile-patients/src/components/ui/LocationSearchHeader';
import { LocationSearchPopup } from '@aph/mobile-patients/src/components/ui/LocationSearchPopup';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

const { Vitals } = NativeModules;

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

type menuOptions = {
  id: number;
  title: string;
  image: React.ReactNode;
  onPress: () => void;
};

type TabBarOptions = {
  id: number;
  title: string;
  image: React.ReactNode;
};

const tabBarOptions: TabBarOptions[] = [
  {
    id: 1,
    title: 'APPOINTMENTS',
    image: <ConsultationRoom />,
  },
  {
    id: 2,
    title: 'HEALTH RECORDS',
    image: <MyHealth />,
  },
  {
    id: 3,
    title: 'MEDICINES',
    image: <MedicineIcon />,
  },
  {
    id: 4,
    title: 'TESTS',
    image: <TestsIcon />,
  },
  {
    id: 5,
    title: 'MY ACCOUNT',
    image: <Person />,
  },
];

export interface ConsultRoomProps extends NavigationScreenProps {}
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
  const { isIphoneX } = DeviceHelper();
  const {
    setLocationDetails,
    locationDetails,
    isCurrentLocationFetched,
    setCurrentLocationFetched,
  } = useAppCommonData();

  // const startDoctor = string.home.startDoctor;
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [isLocationSearchVisible, setLocationSearchVisible] = useState(false);
  const [showList, setShowList] = useState<boolean>(false);
  const [isFindDoctorCustomProfile, setFindDoctorCustomProfile] = useState<boolean>(false);

  const { cartItems } = useDiagnosticsCart();
  const { cartItems: shopCartItems } = useShoppingCart();
  const cartItemsCount = cartItems.length + shopCartItems.length;

  const { analytics, getPatientApiCall } = useAuth();
  const { currentPatient } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [deviceTokenApICalled, setDeviceTokenApICalled] = useState<boolean>(false);
  const [menuViewOptions, setMenuViewOptions] = useState<number[]>([]);
  const [currentAppointments, setCurrentAppointments] = useState<string>('0');
  const [appointmentLoading, setAppointmentLoading] = useState<boolean>(false);
  const [enableCM, setEnableCM] = useState<boolean>(true);
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const [isWEGFired, setWEGFired] = useState(false);
  const webengage = new WebEngage();

  const updateLocation = () => {
    doRequestAndAccessLocationModified()
      .then((response) => {
        response && setLocationDetails!(response);
      })
      .catch((e) => {
        CommonBugFender('ConsultRoom_updateLocation', e);
      });
  };

  const askLocationPermission = () => {
    showAphAlert!({
      unDismissable: true,
      title: 'Hi! :)',
      description:
        'We need to know your location to function better. Please allow us to auto detect your location or enter location manually.',
      CTAs: [
        {
          text: 'ENTER MANUALLY',
          onPress: () => {
            hideAphAlert!();
            setLocationSearchVisible(true);
          },
          type: 'white-button',
        },
        {
          text: 'ALLOW AUTO DETECT',
          onPress: () => {
            hideAphAlert!();
            setLoading!(true);
            doRequestAndAccessLocationModified()
              .then((response) => {
                setLoading!(false);
                response && setLocationDetails!(response);
              })
              .catch((e) => {
                CommonBugFender('ConsultRoom__ALLOW_AUTO_DETECT', e);
                setLoading!(false);
                e &&
                  typeof e == 'string' &&
                  !e.includes('denied') &&
                  showAphAlert!({
                    title: 'Uh oh! :(',
                    description: e,
                  });
                setLocationSearchVisible(true);
              });
          },
        },
      ],
    });
  };

  useEffect(() => {
    if (locationDetails && locationDetails.pincode) {
      if (!isCurrentLocationFetched) {
        setCurrentLocationFetched!(true);
        updateLocation();
      }
    } else {
      askLocationPermission();
    }
  }, []);

  useEffect(() => {
    try {
      if (currentPatient && g(currentPatient, 'relation') == Relation.ME && !isWEGFired) {
        setWEGFired(true);
        setWEGUserAttributes();
      }
    } catch (e) {}
  }, [currentPatient]);

  const setWEGUserAttributes = () => {
    webengage.user.setFirstName(g(currentPatient, 'firstName'));
    webengage.user.setLastName(g(currentPatient, 'lastName'));
    webengage.user.setGender((g(currentPatient, 'gender') || '').toLowerCase());
    webengage.user.setEmail(g(currentPatient, 'emailAddress'));
    webengage.user.setBirthDateString(g(currentPatient, 'dateOfBirth'));
    webengage.user.setPhone(g(currentPatient, 'mobileNumber'));
  };

  const postHomeWEGEvent = (
    eventName: WebEngageEventName,
    source?: PatientInfoWithSource['Source']
  ) => {
    const eventAttributes: PatientInfo = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      Age: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      Gender: g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    if (
      source &&
      (eventName == WebEngageEventName.BUY_MEDICINES ||
        eventName == WebEngageEventName.ORDER_TESTS ||
        eventName == WebEngageEventName.VIEW_HELATH_RECORDS ||
        eventName == WebEngageEventName.NEED_HELP)
    ) {
      (eventAttributes as PatientInfoWithSource)['Source'] = source;
    }
    postWebEngageEvent(eventName, eventAttributes);
  };

  const onProfileChange = () => {
    setShowList(false);
    if (isFindDoctorCustomProfile) {
      setFindDoctorCustomProfile(false);
      props.navigation.navigate(AppRoutes.DoctorSearch);
    }
  };

  const showProfileSelectionAlert = () => {
    showAphAlert!({
      title: 'Hi!',
      description: 'Who is the patient today?',
      ctaContainerStyle: { marginTop: 50 },
      CTAs: [
        {
          text: 'MYSELF',
          onPress: () => {
            hideAphAlert!();
            props.navigation.navigate(AppRoutes.DoctorSearch);
          },
        },
        {
          type: 'white-button',
          text: 'SOMEONE ELSE',
          onPress: () => {
            setShowList(true);
            hideAphAlert!();
            setFindDoctorCustomProfile(true);
          },
        },
      ],
    });
  };

  const menuOptions: menuOptions[] = [
    {
      id: 1,
      title: 'Find a Doctor',
      image: <DoctorIcon style={styles.menuOptionIconStyle} />,
      onPress: () => {
        postHomeWEGEvent(WebEngageEventName.FIND_A_DOCTOR);
        showProfileSelectionAlert();
      },
    },
    {
      id: 2,
      title: 'Buy Medicines',
      image: <TestsCartMedicineIcon style={styles.menuOptionIconStyle} />,
      onPress: () => {
        postHomeWEGEvent(WebEngageEventName.BUY_MEDICINES, 'Home Screen');
        props.navigation.navigate('MEDICINES', { focusSearch: true });
      },
    },
    {
      id: 3,
      title: 'Order Tests',
      image: <TestsCartIcon style={styles.menuOptionIconStyle} />,
      onPress: () => {
        postHomeWEGEvent(WebEngageEventName.ORDER_TESTS, 'Home Screen');
        props.navigation.navigate('TESTS', { focusSearch: true });
      },
    },
    {
      id: 4,
      title: 'Manage Diabetes',
      image: <Diabetes style={styles.menuOptionIconStyle} />,
      onPress: () => {
        postHomeWEGEvent(WebEngageEventName.MANAGE_DIABETES);
        getTokenforCM();
      },
    },
    {
      id: 5,
      title: 'Track Symptoms',
      image: <Symptomtracker style={styles.menuOptionIconStyle} />,
      onPress: () => {
        postHomeWEGEvent(WebEngageEventName.TRACK_SYMPTOMS);
        props.navigation.navigate(AppRoutes.SymptomChecker, { MoveDoctor: 'MoveDoctor' });
      },
    },
    {
      id: 6,
      title: 'View Health Records',
      image: <PrescriptionMenu style={styles.menuOptionIconStyle} />,
      onPress: () => {
        postHomeWEGEvent(WebEngageEventName.VIEW_HELATH_RECORDS, 'Home Screen');
        props.navigation.navigate('HEALTH RECORDS');
      },
    },
  ];

  const [listValues, setListValues] = useState<menuOptions[]>(menuOptions);

  useEffect(() => {
    if (enableCM) {
      setMenuViewOptions([1, 2, 3, 4, 5, 6]);
    } else {
      setMenuViewOptions([1, 2, 3, 5]);
    }
  }, [enableCM]);

  useEffect(() => {
    async function fetchData() {
      try {
        const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
        const item = JSON.parse(retrievedItem);

        const callByPrism: any = await AsyncStorage.getItem('callByPrism');
        let allPatients;

        if (callByPrism === 'true') {
          allPatients =
            item && item.data && item.data.getCurrentPatients
              ? item.data.getCurrentPatients.patients
              : null;
        } else {
          allPatients =
            item && item.data && item.data.getPatientByMobileNumber
              ? item.data.getPatientByMobileNumber.patients
              : null;
        }

        const patientDetails = allPatients
          ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
          : null;

        CommonSetUserBugsnag(
          patientDetails ? (patientDetails.mobileNumber ? patientDetails.mobileNumber : '') : ''
        );
      } catch (error) {}
    }

    fetchData();
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
      case 'https://devapi.apollo247.com//graphql':
        return 'DEVReplica';
      default:
        return '';
    }
  };

  useEffect(() => {
    console.log('consultroom', currentPatient);

    currentPatient && setshowSpinner(false);
    if (!currentPatient) {
      // getPatientApiCall();
    } else {
      AsyncStorage.setItem('selectedProfileId', JSON.stringify(currentPatient.id));
      if (selectedProfile !== currentPatient.id) {
        setAppointmentLoading(true);
        setSelectedProfile(currentPatient.id);
        client
          .query<getPatientFutureAppointmentCount>({
            query: GET_PATIENT_FUTURE_APPOINTMENT_COUNT,
            fetchPolicy: 'no-cache',
            variables: {
              patientId: currentPatient.id,
            },
          })
          .then((data) => {
            setCurrentAppointments(
              (g(data, 'data', 'getPatientFutureAppointmentCount', 'consultsCount') || 0).toString()
            );
            setAppointmentLoading(false);
          })
          .catch((e) => {
            CommonBugFender('ConsultRoom_getPatientFutureAppointmentCount', e);
          })
          .finally(() => setAppointmentLoading(false));
      }
    }
  }, [currentPatient, analytics, props.navigation.state.params]);

  useEffect(() => {
    async function fetchData() {
      const userLoggedIn = await AsyncStorage.getItem('gotIt');
      if (userLoggedIn == 'true') {
        setshowPopUp(false);
      } else {
        setshowPopUp(true);
      }
      const CMEnabled = await AsyncStorage.getItem('CMEnable');
      const eneabled = CMEnabled ? JSON.parse(CMEnabled) : false;
      setEnableCM(eneabled);
    }
    fetchData();
    callDeviceTokenAPI();
  }, []);

  const getTokenforCM = async () => {
    const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
    const item = JSON.parse(retrievedItem);

    const callByPrism: any = await AsyncStorage.getItem('callByPrism');

    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';

    let allPatients;

    if (callByPrism === 'false') {
      allPatients =
        item && item.data && item.data.getPatientByMobileNumber
          ? item.data.getPatientByMobileNumber.patients
          : null;
    } else {
      allPatients =
        item && item.data && item.data.getCurrentPatients
          ? item.data.getCurrentPatients.patients
          : null;
    }

    const patientDetails = allPatients
      ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
      : null;

    const fullName = `${g(patientDetails, 'firstName') || ''}%20${g(patientDetails, 'lastName') ||
      ''}`;

    const patientUHID = patientDetails ? (patientDetails.uhid ? patientDetails.uhid : '') : '';

    if (patientUHID) {
      setshowSpinner(true);

      GenerateTokenforCM(
        patientDetails ? patientDetails.uhid : '',
        fullName,
        patientDetails ? (patientDetails.gender ? patientDetails.gender : '') : '',
        patientDetails ? (patientDetails.emailAddress ? patientDetails.emailAddress : '') : '',
        patientDetails ? (patientDetails.mobileNumber ? patientDetails.mobileNumber : '') : ''
      )
        .then((token: any) => {
          console.log(token, 'getTokenforCM');

          async function fetchTokenData() {
            setshowSpinner(false);

            const tokenValue = token.data.vitaToken; //await AsyncStorage.getItem('token');
            const buildSpecify = buildName();
            let keyHash;
            if (buildSpecify === 'QA' || buildSpecify === 'DEV' || buildSpecify === 'DEVReplica') {
              keyHash = '7729FD68-C552-4C90-B31E-98AA6C84FEBF~247Android';
            } else {
              keyHash = '4d4efe1a-cec8-4647-939f-09c25492721e~Apollo247';
            }
            console.log('tokenValue', tokenValue, keyHash);

            if (Platform.OS === 'ios') {
              if (tokenValue) {
                Vitals.vitalsToExport(tokenValue, buildSpecify);
                setTimeout(() => {
                  Vitals.goToReactNative(tokenValue);
                }, 500);
              }
            } else {
              const fullName = `${g(patientDetails, 'firstName') || ''}%20${g(
                patientDetails,
                'lastName'
              ) || ''}`;
              const UHID = `${g(patientDetails, 'uhid') || ''}`;
              tokenValue &&
                KotlinBridge.show(
                  tokenValue,
                  UHID,
                  fullName,
                  keyHash,
                  buildSpecify,
                  currentDeviceToken.deviceToken
                );
            }
          }

          fetchTokenData();
        })
        .catch((e) => {
          CommonBugFender('ConsultRoom_getTokenforCM', e);
          setshowSpinner(false);
        });
    } else {
      setshowSpinner(false);
      showAphAlert &&
        showAphAlert({
          title: 'Hi :)',
          description: 'We’re setting up your profile. Please check back soon!',
        });
    }
  };

  const client = useApolloClient();

  const callDeviceTokenAPI = async () => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const deviceToken2 = deviceToken ? JSON.parse(deviceToken) : '';
    firebase
      .messaging()
      .getToken()
      .then((token) => {
        console.log('token', token);
        // console.log('DeviceInfo', DeviceInfo);
        UnInstallAppsFlyer(token);
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
              .catch((e) => {
                CommonBugFender('ConsultRoom_setDeviceTokenApICalled', e);
                console.log('Error occured while adding Doctor', e);
              });
          }
        }
      })
      .catch((e) => {
        CommonBugFender('ConsultRoom_callDeviceTokenAPI', e);
      });
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
                  props.navigation.navigate('APPOINTMENTS');
                } else if (i == 1) {
                  postHomeWEGEvent(WebEngageEventName.VIEW_HELATH_RECORDS, 'Menu');
                  CommonLogEvent(AppRoutes.ConsultRoom, 'HEALTH_RECORDS clicked');
                  props.navigation.navigate('HEALTH RECORDS');
                } else if (i == 2) {
                  postHomeWEGEvent(WebEngageEventName.BUY_MEDICINES, 'Menu');
                  CommonLogEvent(AppRoutes.ConsultRoom, 'MEDICINES clicked');
                  props.navigation.navigate('MEDICINES');
                } else if (i == 3) {
                  postHomeWEGEvent(WebEngageEventName.ORDER_TESTS, 'Menu');
                  CommonLogEvent(AppRoutes.ConsultRoom, 'TESTS clicked');
                  props.navigation.navigate('TESTS');
                } else if (i == 4) {
                  postHomeWEGEvent(WebEngageEventName.MY_ACCOUNT);
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
        showList={showList}
        onProfileChange={onProfileChange}
        navigation={props.navigation}
        saveUserChange={true}
        childView={
          <View
            style={{
              flexDirection: 'row',
              paddingRight: 8,
              borderRightWidth: 0,
              // paddingTop: 80,
              // marginTop: 30,
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
        // setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
        unsetloaderDisplay={true}
      />
    );
  };

  const renderListView = () => {
    return (
      <View>
        <ListCard
          container={{ marginTop: 14 }}
          title={'Active Appointments'}
          leftIcon={renderListCount(currentAppointments)}
          onPress={() => {
            postHomeWEGEvent(WebEngageEventName.ACTIVE_APPOINTMENTS);
            props.navigation.navigate('APPOINTMENTS');
          }}
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
        {listValues.map((item) => {
          if (menuViewOptions.findIndex((i) => i === item.id) >= 0) {
            return (
              <TouchableOpacity activeOpacity={1} onPress={item.onPress}>
                <View
                  style={{
                    ...theme.viewStyles.cardViewStyle,
                    shadowOffset: { width: 0, height: 5 },
                    elevation: 15,
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
            postHomeWEGEvent(WebEngageEventName.CORONA_VIRUS_TALK_TO_OUR_EXPERT);
            Linking.openURL('tel:08047192606');
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
            {string.common.emergencyBannerText}
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
          <LocationSearchHeader
            onLocationProcess={() => setLocationSearchVisible(!isLocationSearchVisible)}
          />
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              props.navigation.navigate(AppRoutes.MedAndTestCart, {
                isComingFromConsult: true,
              })
            }
            // style={{ right: 20 }}
          >
            <CartIcon />
            {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
          </TouchableOpacity>
          {/* <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.navigation.navigate(AppRoutes.NotificationSettings)}
          >
            <NotificationIcon />
          </TouchableOpacity> */}
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
                <View style={{ height: 100 }} />
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
            onNeedHelpPress={() => {
              postHomeWEGEvent(WebEngageEventName.NEED_HELP, 'Home Screen');
            }}
          />
        </ScrollView>
      </SafeAreaView>
      {renderBottomTabBar()}
      {showPopUp && (
        <BottomPopUp
          title={`Hi ${(currentPatient && currentPatient.firstName) || ''}`}
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
      {showSpinner && <Spinner />}
      <NotificationListener navigation={props.navigation} />
      {isLocationSearchVisible && (
        <LocationSearchPopup
          onPressLocationSearchItem={() => {
            setCurrentLocationFetched!(true);
            setLocationSearchVisible(false);
          }}
          location={g(locationDetails, 'displayName')}
          onClose={() => {
            setLocationSearchVisible(false);
            !g(locationDetails, 'displayName') && askLocationPermission();
          }}
        />
      )}
    </View>
  );
};
