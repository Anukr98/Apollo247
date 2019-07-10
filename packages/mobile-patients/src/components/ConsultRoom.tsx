import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  DoctorImage,
  DoctorPlaceholder,
  DropdownGreen,
  Mascot,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  AsyncStorage,
  Platform,
  Alert,
} from 'react-native';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import firebase from 'react-native-firebase';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  viewName: {
    backgroundColor: 'white',
    marginTop: 10,
    width: '100%',
    height: 294,
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#fc9916',
  },
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    flex: 1,
  },
  subViewPopup: {
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  congratulationsTextStyle: {
    marginHorizontal: 24,
    marginTop: 28,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
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
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  buttonStyles: {
    flex: 1,
    backgroundColor: '#fcb716',
    height: 40,
    width: 160,
    borderRadius: 10,
    marginLeft: 20,
    marginTop: 16,
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
    color: '#0087ba',
  },
  doctorView: {
    width: '100%',
    height: 277,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: 'white',
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
  title: string;
  descripiton: string;
};

const arrayTest: ArrayTest[] = [
  {
    title: 'Are you looking for a particular doctor?',
    descripiton: 'SEARCH SPECIALIST',
  },
  {
    title: 'Do you want to buy some medicines?',
    descripiton: 'SEARCH MEDICINE',
  },
  {
    title: 'Do you want to get some tests done?',
    descripiton: 'BOOK A TEST',
  },
];

type ArrayDoctor = {
  name: string;
  status: string;
  Program: string;
  doctors: string;
  Patients: string;
};

const arrayDoctor: ArrayDoctor[] = [
  {
    name: 'Dr. Narayana Rao’s',
    status: 'AVAILABLE',
    Program: 'Star Cardiology Program',
    doctors: '09',
    Patients: '18',
  },
  {
    name: 'Dr. Simran Rao',
    status: 'AVAILABLE',
    Program: 'Star Cardiology Program',
    doctors: '05',
    Patients: '20',
  },
  {
    name: 'Dr. Sekhar Rao’s',
    status: 'AVAILABLE',
    Program: 'Star Cardiology Program',
    doctors: '12',
    Patients: '10',
  },
];

type currentProfiles = {
  firstName: string;
  id: string;
  lastName: string;
  mobileNumber: string;
  sex: string;
  uhid: string;
};

export interface ConsultRoomProps extends NavigationScreenProps {}
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
  const scrollViewWidth = arrayTest.length * 250 + arrayTest.length * 20;
  const [showPopUp, setshowPopUp] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [userName, setuserName] = useState<string>('');
  const { currentUser, analytics, currentProfiles, callApiWithToken } = useAuth();
  const [firebaseCalled, setFirebaseCalled] = useState<boolean>(false);

  useEffect(() => {
    let userName = currentUser && currentUser.firstName ? currentUser.firstName.split(' ')[0] : '';
    userName = userName.toLowerCase();
    setuserName(userName);

    async function fetchFirebase() {
      if (!userName) {
        console.log('else');

        if (!firebaseCalled) {
          firebase.auth().onAuthStateChanged(async (updatedUser) => {
            if (updatedUser) {
              const token = await updatedUser!.getIdToken();
              const patientSign = await callApiWithToken(token);
              const patient = patientSign.data.patientSignIn.patients[0];
              const errMsg =
                patientSign.data.patientSignIn.errors &&
                patientSign.data.patientSignIn.errors.messages[0];

              console.log('patient', patient);
              setFirebaseCalled(true);

              setTimeout(() => {
                if (errMsg) {
                  Alert.alert('Error', errMsg);
                } else {
                }
              }, 1000);
            } else {
              console.log('no new user');
            }
          });
        }
      }
    }
    fetchFirebase();

    analytics.setCurrentScreen(AppRoutes.ConsultRoom);
  }, [currentUser, currentProfiles, analytics, userName, props.navigation.state.params]);

  useEffect(() => {
    async function fetchData() {
      const userLoggedIn = await AsyncStorage.getItem('gotIt');
      if (userLoggedIn == 'true') {
        setshowPopUp(false);
      }
    }
    fetchData();
  }, []);

  const Popup = () => (
    <TouchableOpacity
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
              marginTop: 124,
            },
            ios: {
              marginTop: 134,
            },
          }),
        }}
      >
        {currentProfiles &&
          currentProfiles.map((profile: currentProfiles, i: number) => (
            <View style={styles.textViewStyle} key={i}>
              <Text
                style={styles.textStyle}
                onPress={() => {
                  setShowMenu(false);
                }}
              >
                {profile.firstName ? profile.firstName.split(' ')[0].toLowerCase() : ''}
              </Text>
            </View>
          ))}

        <Text
          style={{
            paddingTop: 20,
            paddingBottom: 4,
            paddingRight: 16,
            textAlign: 'right',
            ...theme.fonts.IBMPlexSansBold(13),
            color: theme.colors.APP_YELLOW,
          }}
        >
          ADD MEMBER
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
        {showMenu && Popup()}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          <Image
            source={require('@aph/mobile-patients/src/images/doctor/doctor.png')}
            style={{
              right: 20,
              top: 207,
              position: 'absolute',
              zIndex: 2,
            }}
          />
          <View style={{ top: 200, position: 'absolute', zIndex: 3 }}>
            <Button
              title="CONSULT A DOCTOR"
              style={styles.buttonStyles}
              onPress={() => {
                props.navigation.navigate(AppRoutes.DoctorSearch);
              }}
            />
          </View>
          <View style={{ width: '100%', height: 456 }}>
            <View style={styles.viewName}>
              <View style={{ alignItems: 'flex-end', marginTop: 20 }}>
                <ApolloLogo style={{ right: 20 }} />
              </View>
              <TouchableOpacity
                onPress={() => setShowMenu(true)}
                activeOpacity={1}
                style={{
                  flexDirection: 'row',
                  marginTop: 18,
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.hiTextStyle}>hi</Text>
                  <View>
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
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.descriptionTextStyle}>Are you not feeling well today?</Text>
            </View>
          </View>
          <View>
            {arrayTest.map((serviceTitle, i) => (
              <View key={i} style={{}}>
                <TouchableHighlight key={i}>
                  <View
                    style={{
                      borderRadius: 10,
                      height: 104,
                      padding: 16,
                      backgroundColor: '#f7f8f5',
                      flexDirection: 'row',
                      marginHorizontal: 20,
                      marginTop: i === 0 ? 0 : 8,
                      marginBottom: arrayTest.length === i + 1 ? 16 : 8,
                      shadowColor: '#808080',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.4,
                      shadowRadius: 10,
                      elevation: 5,
                    }}
                    key={i}
                  >
                    <View style={{ width: width - 144 }}>
                      <Text
                        style={{
                          color: '#02475b',
                          lineHeight: 24,
                          textAlign: 'left',
                          ...theme.fonts.IBMPlexSansMedium(14),
                        }}
                      >
                        {serviceTitle.title}
                      </Text>
                      <Text
                        style={{
                          // marginHorizontal: 16,
                          marginTop: 8,
                          color: '#fc9916',
                          textAlign: 'left',
                          ...theme.fonts.IBMPlexSansBold(13),
                        }}
                      >
                        {serviceTitle.descripiton}
                      </Text>
                    </View>
                    {/* <View> */}
                    <DoctorPlaceholder />
                    {/* </View> */}
                  </View>
                </TouchableHighlight>
              </View>
            ))}
          </View>
          <View style={styles.doctorView}>
            <Text style={styles.doctorStyle}>Learn about Apollo Star Doctor Program</Text>
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
              {arrayDoctor.map((serviceTitle, i) => (
                <View key={i}>
                  <TouchableHighlight key={i}>
                    <View
                      style={{
                        marginTop: 20,
                        marginLeft: i === 0 ? 20 : 8,
                        marginRight: arrayDoctor.length === i + 1 ? 20 : 8,
                        marginBottom: 16,
                        width: 244,
                        height: 207,
                        backgroundColor: 'white',
                        shadowColor: '#808080',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 5,
                        elevation: 4,
                        borderRadius: 5,
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
                          AVAILABLE
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
                          color: '#0087ba',
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
                            Doctors
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
                            Patients Enrolled
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableHighlight>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.helpView}>
            <Mascot style={{ height: 80, width: 80 }} />
            <Button
              title="Need Help?"
              style={styles.needhelpbuttonStyles}
              titleTextStyle={styles.titleBtnStyles}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      {showPopUp && (
        <View style={styles.showPopUp}>
          <View style={styles.subViewPopup}>
            <Text style={styles.congratulationsTextStyle}>Congratulations! :)</Text>
            <Text style={styles.congratulationsDescriptionStyle}>
              Welcome to the Apollo family. You can add more family members any time from ‘My
              Account’.
            </Text>
            <View style={{ height: 60, alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={styles.gotItStyles}
                onPress={() => {
                  AsyncStorage.setItem('gotIt', 'true');
                  setshowPopUp(false);
                }}
              >
                <Text style={styles.gotItTextStyles}>OK, GOT IT</Text>
              </TouchableOpacity>
            </View>
            <Mascot style={{ position: 'absolute', top: -32, right: 20 }} />
          </View>
        </View>
      )}
    </View>
  );
};
