import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  DoctorImage,
  DropdownGreen,
  Mascot,
  ConsultationRoom,
  MyHealth,
  ShoppingCart,
  Person,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useAuth, useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  AsyncStorage,
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { PatientSignIn_patientSignIn_patients } from '@aph/mobile-patients/src/graphql/types/PatientSignIn';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { DeviceHelper } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useApolloClient } from 'react-apollo-hooks';
import {
  saveDeviceToken,
  saveDeviceTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/saveDeviceToken';
import { SAVE_DEVICE_TOKEN } from '@aph/mobile-patients/src/graphql/profiles';
import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';
import { DEVICE_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';

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
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginTop: 5,
    marginHorizontal: 5,
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
  needhelpbuttonStyles: {
    backgroundColor: 'white',
    height: 50,
    width: 120,
    marginTop: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 15,
  },
  titleBtnStyles: {
    color: theme.colors.SKY_BLUE,
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
  helpView: {
    width: '100%',
    height: 212,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
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
  // {
  //   id: 3,
  //   title: 'Do you want to get some tests done?',
  //   descripiton: 'BOOK A TEST',
  //   image: require('@aph/mobile-patients/src/images/home/test.png'),
  // },
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
    title: 'TESTS & MEDICINES',
    image: <ShoppingCart style={{ marginTop: -4 }} />,
  },
  {
    id: 4,
    title: 'MY ACCOUNT',
    image: <Person style={{ marginTop: -4 }} />,
  },
];

export interface ConsultRoomProps extends NavigationScreenProps {}
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
  const { isIphoneX } = DeviceHelper();

  const startDoctor = string.home.startDoctor;
  const scrollViewWidth = arrayTest.length * 250 + arrayTest.length * 20;
  const [showPopUp, setshowPopUp] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [userName, setuserName] = useState<string>('');
  const { analytics } = useAuth();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [deviceTokenApICalled, setDeviceTokenApICalled] = useState<boolean>(false);

  useEffect(() => {
    let userName =
      currentPatient && currentPatient.firstName ? currentPatient.firstName.split(' ')[0] : '';
    userName = userName.toLowerCase();
    setuserName(userName);
    currentPatient && setshowSpinner(false);
    // console.log('consult room', currentPatient);
    analytics.setCurrentScreen(AppRoutes.ConsultRoom);
  }, [currentPatient, analytics, userName, props.navigation.state.params]);

  useEffect(() => {
    async function fetchData() {
      const userLoggedIn = await AsyncStorage.getItem('gotIt');
      if (userLoggedIn == 'true') {
        setshowPopUp(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    callDeviceTokenAPI();
  });

  const client = useApolloClient();

  const callDeviceTokenAPI = async () => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const deviceToken2 = deviceToken ? JSON.parse(deviceToken) : '';
    firebase
      .messaging()
      .getToken()
      .then((token) => {
        console.log('token', token);
        if (token !== deviceToken2.deviceToken) {
          const input = {
            deviceType: Platform.OS === 'ios' ? DEVICE_TYPE.IOS : DEVICE_TYPE.ANDROID,
            deviceToken: token,
            deviceOS: Platform.OS === 'ios' ? '' : DeviceInfo.getBaseOS(),
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
                  profile.firstName &&
                  userName === profile.firstName.split(' ')[0].toLocaleLowerCase()
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
          height: isIphoneX() ? 80 : 50,
        }}
      >
        {tabBarOptions.map((tabBarOptions, i) => (
          <View key={i}>
            <TouchableOpacity
              activeOpacity={1}
              key={i}
              onPress={() => {
                if (i === 0) {
                  props.navigation.replace(AppRoutes.TabBar);
                } else if (i == 1) {
                } else if (i == 2) {
                } else if (i == 3) {
                  // props.navigation.replace(AppRoutes.AzureUpload);
                }
              }}
            >
              <View
                style={{
                  width: width / 4,
                  height: 50,
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
                    marginTop: 5,
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

  return (
    <View style={{ flex: 1 }}>
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
                props.navigation.navigate(AppRoutes.SymptomChecker);
              }}
            />
          </View>
          <View style={{ width: '100%', height: Platform.OS === 'ios' ? 436 : 446 }}>
            <View style={styles.viewName}>
              <View style={{ alignItems: 'flex-end', marginTop: 20, height: 57 }}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => props.navigation.replace(AppRoutes.TabBar)}
                >
                  <ApolloLogo style={{ right: 20 }} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                activeOpacity={1}
                // onPress={() => setShowMenu(true)}
                style={{
                  flexDirection: 'row',
                  marginTop: 8,
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.hiTextStyle}>
                    {string.home.hi} {userName}!
                  </Text>
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
              </TouchableOpacity>
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
                      props.navigation.navigate(AppRoutes.DoctorSearch);
                    } else if (i == 1) {
                      props.navigation.navigate(AppRoutes.SearchMedicineScene);
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
          {/* {renderStarDoctors()} */}
          <View style={styles.helpView}>
            <Mascot style={{ height: 80, width: 80 }} />
            <Button
              title={string.home.need_help}
              style={styles.needhelpbuttonStyles}
              titleTextStyle={styles.titleBtnStyles}
            />
          </View>
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
    </View>
  );
};
