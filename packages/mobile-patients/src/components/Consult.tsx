import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DoctorPlaceholder, DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAuth, useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  AsyncStorage,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import { NavigationScreenProps, FlatList } from 'react-navigation';
import { useQuery } from 'react-apollo-hooks';
import {
  getPatinetAppointments,
  getPatinetAppointments_getPatinetAppointments_patinetAppointments,
} from '@aph/mobile-patients/src/graphql/types/getPatinetAppointments';
import { GET_PATIENT_APPOINTMENTS } from '@aph/mobile-patients/src/graphql/profiles';
import moment from 'moment';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  viewName: {
    backgroundColor: theme.colors.WHITE,
    width: '100%',
    // height: 266,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  hiTextStyle: {
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
    marginTop: 12,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  buttonStyles: {
    height: 40,
    width: 160,
    marginTop: 16,
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
  labelStyle: {
    paddingVertical: 16,
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    // marginTop: 16,
    marginHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  cardContainerStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 172,
    zIndex: 2,
  },
  doctorView: {
    // flex: 1,
    marginHorizontal: 8,
    ...theme.viewStyles.cardViewStyle,
    marginBottom: 16,
    borderRadius: 10,
    // marginBottom
  },
  buttonView: {
    height: 44,
    backgroundColor: theme.colors.BUTTON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.BUTTON_TEXT,
  },
  availableView: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 112,
  },
  imageView: {
    margin: 16,
    marginTop: 32,
    width: 60,
  },
  doctorNameStyles: {
    paddingTop: 40,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingBottom: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
  },
  doctorLocation: {
    marginBottom: 16,
    paddingTop: 2,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
  consultTextStyles: {
    paddingVertical: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
});

type currentProfiles = {
  firstName: string;
  id: string;
  lastName: string;
  mobileNumber: string;
  sex: string;
  uhid: string;
};

export interface ConsultProps extends NavigationScreenProps {}
export const Consult: React.FC<ConsultProps> = (props) => {
  const thingsToDo = string.consult_room.things_to_do.data;
  const articles = string.consult_room.articles.data;
  // const scrollViewWidth = thingsToDo.length * 250 + thingsToDo.length * 20;
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [userName, setuserName] = useState<string>('');
  const { analytics } = useAuth();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [consultations, setconsultations] = useState<
    getPatinetAppointments_getPatinetAppointments_patinetAppointments[]
  >([]);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);

  useEffect(() => {
    let userName =
      currentPatient && currentPatient.firstName ? currentPatient.firstName.split(' ')[0] : '';
    userName = userName.toLowerCase();
    setuserName(userName);
    console.log('consult room', currentPatient);
    analytics.setCurrentScreen(AppRoutes.Consult);
  }, [currentPatient, analytics, userName, props.navigation.state.params]);

  useEffect(() => {
    async function fetchData() {
      const userLoggedIn = await AsyncStorage.getItem('gotIt');
      if (userLoggedIn == 'true') {
      }
    }
    fetchData();
  }, []);

  const inputData = {
    // patientId: "ac24883c-4f7c-4e46-a9e4-155e4092263c",
    // appointmentDate: "2019-08-08"
    patientId: currentPatient ? currentPatient!.id : '',
    appointmentDate: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
  };
  console.log(inputData, 'inputData');
  const { data, error } = useQuery<getPatinetAppointments>(GET_PATIENT_APPOINTMENTS, {
    variables: {
      patientAppointmentsInput: inputData,
    },
  });

  if (error) {
    console.log('error', error);
  } else {
    console.log(data, 'GET_PATIENT_APPOINTMENTS');
    if (
      data &&
      data.getPatinetAppointments &&
      data.getPatinetAppointments.patinetAppointments &&
      consultations !== data.getPatinetAppointments.patinetAppointments
    ) {
      setconsultations(data.getPatinetAppointments.patinetAppointments);
      setshowSpinner(false);
    }
  }

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
        {allCurrentPatients &&
          allCurrentPatients.map((profile, i) => (
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

  const renderThingsToDo = () => {
    return (
      <View>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>{string.consult_room.things_to_do.label}</Text>
        </View>
        {thingsToDo.map((serviceTitle, i) => (
          <TouchableHighlight key={i}>
            <View
              style={{
                // height: 104,
                ...theme.viewStyles.cardViewStyle,
                // borderRadius: 10,
                padding: 16,
                // backgroundColor: '#f7f8f5',
                flexDirection: 'row',
                marginHorizontal: 20,
                marginTop: i === 0 ? 11 : 8,
                marginBottom: thingsToDo.length === i + 1 ? 16 : 8,
                // shadowColor: '#808080',
                // shadowOffset: { width: 0, height: 1 },
                // shadowOpacity: 0.4,
                // shadowRadius: 10,
                // elevation: 5,
              }}
              key={i}
            >
              <View style={{ flex: 1, marginRight: 16 }}>
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
                    marginTop: 8,
                    color: '#fc9916',
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  {serviceTitle.description}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                <DoctorPlaceholder />
              </View>
            </View>
          </TouchableHighlight>
        ))}
      </View>
    );
  };

  const renderArticles = () => {
    return (
      <View>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>{string.consult_room.articles.label}</Text>
        </View>
        {articles.map((article, i) => (
          <TouchableHighlight key={i}>
            <View
              style={{
                height: 104,
                ...theme.viewStyles.cardViewStyle,
                // borderRadius: 10,
                // padding: 16,
                // backgroundColor: '#f7f8f5',
                flexDirection: 'row',
                marginHorizontal: 20,
                padding: 0,
                marginTop: i === 0 ? 15 : 8,
                marginBottom: articles.length === i + 1 ? 32 : 8,
                // shadowColor: '#808080',
                // shadowOffset: { width: 0, height: 1 },
                // shadowOpacity: 0.4,
                // shadowRadius: 10,
                // elevation: 5,
              }}
              key={i}
            >
              <View
                style={{
                  overflow: 'hidden',
                  // backgroundColor: 'red',
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
              >
                <DoctorPlaceholder
                  style={{
                    height: 104,
                    width: 104,
                  }}
                />
              </View>
              <View style={{ flex: 1, margin: 16 }}>
                <Text
                  style={{
                    color: theme.colors.CARD_HEADER,
                    lineHeight: 24,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(17),
                  }}
                >
                  {article.title}
                </Text>
              </View>
            </View>
          </TouchableHighlight>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
        {showMenu && Popup()}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {/* <View style={{ top: 200, position: 'absolute', zIndex: 3 }}>
           
          </View> */}
          <View style={{ width: '100%' }}>
            <View style={styles.viewName}>
              <View style={{ alignItems: 'flex-end', marginTop: 20 }}>
                <TouchableOpacity onPress={() => props.navigation.replace(AppRoutes.ConsultRoom)}>
                  <ApolloLogo style={{ right: 20 }} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setShowMenu(true)}
                activeOpacity={1}
                style={{
                  flexDirection: 'row',
                  // marginTop: 18,
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.hiTextStyle}>{string.home.hi}</Text>
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
              <Text style={styles.descriptionTextStyle}>
                {consultations.length > 0
                  ? `You have ${consultations.length} consultation${
                      consultations.length > 1 ? 's' : ''
                    } today!`
                  : string.consult_room.description}
              </Text>
              <View style={{ height: consultations.length > 0 ? 94 : 58 }} />
            </View>
            <View style={styles.cardContainerStyle}>
              {consultations.length > 0 ? (
                <FlatList
                  contentContainerStyle={{ padding: 12 }}
                  horizontal={true}
                  data={consultations}
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={{ width: 312 }}>
                      <TouchableOpacity
                        style={[styles.doctorView]}
                        onPress={() =>
                          props.navigation.navigate(AppRoutes.AppointmentDetails, {
                            data: item,
                          })
                        }
                      >
                        <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
                          <View style={{ flexDirection: 'row' }}>
                            {/* {(rowData.availableForPhysicalConsultation || rowData.availableForVirtualConsultation) &&
                            props.displayButton &&
                            rowData.availableIn ? ( */}
                            {/* <CapsuleView
                              title="15 MINS" //{`${rowData.availableIn} MINS`}
                              style={styles.availableView}
                              isActive={Number(17) > 15 ? false : true}
                            /> */}
                            {/* ) : null} */}
                            <View style={styles.imageView}>
                              {item.doctorInfo && item.doctorInfo.photoUrl && (
                                <Image
                                  style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 30,
                                  }}
                                  source={{ uri: item.doctorInfo.photoUrl }}
                                />
                              )}

                              {/* {item.isStarDoctor ? (
              <Star style={{ height: 28, width: 28, position: 'absolute', top: 66, left: 30 }} />
            ) : null} */}
                            </View>
                            <View style={{ flex: 1, marginRight: 16 }}>
                              <Text style={styles.doctorNameStyles}>
                                Dr.{' '}
                                {item.doctorInfo
                                  ? `${item.doctorInfo.firstName} ${item.doctorInfo.lastName}`
                                  : ''}
                              </Text>
                              <Text style={styles.doctorSpecializationStyles}>
                                {item.doctorInfo && item.doctorInfo.specialty
                                  ? item.doctorInfo.specialty.name
                                  : ''}
                                {item.doctorInfo ? ` | ${item.doctorInfo.experience} YRS` : ''}
                              </Text>
                              <View style={styles.separatorStyle} />
                              <Text style={styles.consultTextStyles}>Online Consultation</Text>
                              <View style={styles.separatorStyle} />
                              <View
                                style={{ flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' }}
                              >
                                {['FEVER', 'COUGH & COLD'].map((name) => (
                                  <CapsuleView
                                    title={name}
                                    isActive={false}
                                    style={{ width: 'auto', marginRight: 4, marginTop: 11 }}
                                    titleTextStyle={{ color: theme.colors.SKY_BLUE }}
                                  />
                                ))}
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              ) : (
                <View
                  style={{
                    marginLeft: 20,
                    marginTop: 20,
                  }}
                >
                  <Button
                    title={string.home.consult_doctor}
                    style={styles.buttonStyles}
                    onPress={() => {
                      props.navigation.navigate(AppRoutes.DoctorSearch);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
          <View style={{ marginTop: consultations.length > 0 ? 116 : 16 }}>
            {renderThingsToDo()}
            {renderArticles()}
          </View>
        </ScrollView>
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
