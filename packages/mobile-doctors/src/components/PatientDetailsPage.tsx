import PatientDetailsPageStyles from '@aph/mobile-doctors/src/components/PatientDetailsPage.styles';
import { PastConsultCard } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/PastConsultCard';
import { BackArrow, UserPlaceHolder } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { GET_CASESHEET } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { getPatientLog_getPatientLog_patientLog_patientInfo } from '@aph/mobile-doctors/src/graphql/types/getPatientLog';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { g, isValidImageUrl } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';

const { width } = Dimensions.get('window');

const styles = PatientDetailsPageStyles;

export interface PatientsProps
  extends NavigationScreenProps<{
    patientId: string;
    ConsultsCount: string;
    PatientInfo: getPatientLog_getPatientLog_patientLog_patientInfo | null;
  }> {}

export const PatientDetailsPage: React.FC<PatientsProps> = (props) => {
  const client = useApolloClient();
  // const [patientHistoryshow, setpatientHistoryshow] = useState(false);

  // const [familyValues, setFamilyValues] = useState<
  //   (GetCaseSheet_getCaseSheet_patientDetails_familyHistory | null)[] | null
  // >([]);
  // const [lifeStyleData, setLifeStyleData] = useState<
  //   (GetCaseSheet_getCaseSheet_patientDetails_lifeStyle | null)[] | null
  // >([]);
  const [patientDetails, setPatientDetails] = useState<GetCaseSheet_getCaseSheet_patientDetails>();
  // const [allergiesData, setAllergiesData] = useState<string>('');

  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [pastList, setPastList] = useState<
    (GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null
  >([]);

  const PatientInfo = props.navigation.getParam('PatientInfo');
  const age =
    moment(new Date()).diff(patientDetails && patientDetails.dateOfBirth, 'years', true) || -1;

  useEffect(() => {
    console.log(PatientInfo, 'PatientInfoData');
    client
      .query<GetCaseSheet>({
        query: GET_CASESHEET,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: props.navigation.getParam('patientId') },
      })
      .then((data) => {
        try {
          const result = g(data, 'data', 'getCaseSheet');
          console.log(result, 'result');

          if (result) {
            if (result.patientDetails) {
              setPatientDetails(result.patientDetails);
              // setFamilyValues(result.patientDetails.familyHistory);
              // setAllergiesData(result.patientDetails.allergies || '');
              // setLifeStyleData(result.patientDetails.lifeStyle);
            }
            setPastList(result.pastAppointments);
          }
          setshowSpinner(false);
        } catch (e) {
          console.log('e', e);
        }
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        CommonBugFender('Patient Details Case sheet', error);
        console.log('Error occured while fetching Doctor GetJuniorDoctorCaseSheet', error);
      });
  }, []);
  // const renderFamilyDetails = () => {
  //   return (
  //     <View>
  //       <Text style={styles.familyText}>{strings.case_sheet.family_history}</Text>
  //       <View style={styles.familyInputView}>
  //         {familyValues && familyValues.length == 0 ? (
  //           <Text style={styles.symptomsText}>{strings.common.no_data}</Text>
  //         ) : (
  //           familyValues &&
  //           familyValues.map(
  //             (showdata) =>
  //               showdata && (
  //                 <View style={{ flexDirection: 'row' }}>
  //                   <Text style={styles.symptomsText}>{showdata.relation}: </Text>
  //                   <Text style={styles.symptomsText}>{showdata.description}</Text>
  //                 </View>
  //               )
  //           )
  //         )}
  //       </View>
  //     </View>
  //   );
  // };

  // const renderAllergiesView = () => {
  //   return (
  //     <View>
  //       <Text style={styles.familyText}>{strings.case_sheet.allergies}</Text>
  //       <View style={styles.AllergiesInputView}>
  //         {allergiesData == null || [] ? (
  //           <Text style={styles.symptomsText}>{strings.common.no_data}</Text>
  //         ) : (
  //           <Text style={styles.symptomsText}>{allergiesData}</Text>
  //         )}
  //       </View>
  //     </View>
  //   );
  // };
  // const renderLifeStylesHabits = () => {
  //   return (
  //     <View>
  //       <Text style={styles.familyText}>{strings.case_sheet.lyfestyle_habits}</Text>
  //       <View style={styles.familyInputView}>
  //         {lifeStyleData && lifeStyleData.length == 0 ? (
  //           <Text style={styles.symptomsText}>{strings.common.no_data}</Text>
  //         ) : (
  //           lifeStyleData &&
  //           lifeStyleData.map(
  //             (showdata) =>
  //               showdata && (
  //                 <View>
  //                   <Text style={styles.symptomsText}>{showdata.description}</Text>
  //                 </View>
  //               )
  //           )
  //         )}
  //       </View>
  //     </View>
  //   );
  // };
  // const renderPatientHistoryLifestyle = () => {
  //   return (
  //     <View>
  //       <CollapseCard
  //         heading="Patient History & Lifestyle"
  //         collapse={patientHistoryshow}
  //         onPress={() => setpatientHistoryshow(!patientHistoryshow)}
  //       >
  //         {renderFamilyDetails()}
  //         {renderAllergiesView()}
  //         {renderLifeStylesHabits()}
  //       </CollapseCard>
  //     </View>
  //   );
  // };
  // const renderLeftTimeLineView = (
  //   status: Appointments['timeslottype'],
  //   showTop: boolean,
  //   showBottom: boolean
  // ) => {
  //   return (
  //     <View style={styles.leftTimeLineContainer}>
  //       <View
  //         style={[
  //           styles.verticalLine,
  //           {
  //             backgroundColor: showTop ? '#02475b' : '#ffffff',
  //             //marginLeft: 15,
  //           },
  //         ]}
  //       />
  //       {getStatusCircle(status)}
  //       <View
  //         style={[
  //           styles.verticalLine,
  //           {
  //             backgroundColor: showBottom ? '#02475b' : '#ffffff',
  //             //marginLeft: 15,
  //           },
  //         ]}
  //       />
  //     </View>
  //   );
  // };

  // const getStatusCircle = (status: Appointments['timeslottype']) =>
  //   status == 'past' ? (
  //     <PastAppointmentIcon />
  //   ) : status == 'missed' ? (
  //     <View
  //       style={{
  //         width: 12,
  //         height: 12,
  //         borderRadius: 12 / 2,
  //         backgroundColor: '#02475b',
  //       }}
  //     ></View>
  //   ) : status == 'next' ? (
  //     <View
  //       style={{
  //         width: 12,
  //         height: 12,
  //         borderRadius: 12 / 2,
  //         backgroundColor: '#02475b',
  //       }}
  //     ></View>
  //   ) : (
  //     <UpComingIcon />
  //   );

  // const renderPastAppData = (apmnt: any) => {
  //   return (
  //     <View>
  //       {apmnt == [] ? (
  //         <Text style={styles.symptomsText}>No Data</Text>
  //       ) : (
  //         apmnt.caseSheet.map((_caseSheet: any, i: any) => {
  //           return (
  //             <View style={{ marginLeft: 16 }}>
  //               {_caseSheet.symptoms == null || [] ? (
  //                 <Text style={styles.symptomsText}>No Data</Text>
  //               ) : (
  //                 _caseSheet.symptoms.map((symptoms: any, i: any, array: any) => {
  //                   return (
  //                     <View
  //                       style={{
  //                         flex: 1,
  //                         flexDirection: 'row',
  //                         justifyContent: 'center',
  //                         alignItems: 'center',
  //                       }}
  //                     >
  //                       {renderLeftTimeLineView(
  //                         symptoms.symptom,
  //                         i == 0 ? true : true,
  //                         i == array.length - 1 ? false : true
  //                       )}

  //                       <PastConsultCard
  //                         doctorname={
  //                           symptoms.symptom +
  //                           symptoms.howOften +
  //                           symptoms.since +
  //                           symptoms.severity
  //                         }
  //                         timing={moment
  //                           .unix(apmnt.appointmentDateTime / 1000)
  //                           .format('DD MMM  hh:mm a')}
  //                       />
  //                     </View>

  //                     // <View
  //                     //   style={{
  //                     //     backgroundColor: '#ffffff',
  //                     //     borderRadius: 5,
  //                     //     borderStyle: 'solid',
  //                     //     borderWidth: 1,
  //                     //     borderColor: 'rgba(2, 71, 91, 0.15)',
  //                     //     marginBottom: 16,
  //                     //   }}
  //                     // >
  //                     //   <View style={{ backgroundColor: 'white', flexDirection: 'row' }}>
  //                     //     <Text
  //                     //       style={{
  //                     //         color: '#0087ba',
  //                     //         ...theme.fonts.IBMPlexSansMedium(14),
  //                     //         marginLeft: 14,
  //                     //         marginBottom: 8,
  //                     //         marginTop: 12,
  //                     //         marginRight: 14,
  //                     //       }}
  //                     //     >
  //                     //       {symptoms.symptom}
  //                     //       {symptoms.howOften} {symptoms.since} {symptoms.severity}
  //                     //     </Text>
  //                     //   </View>
  //                     //   <View>
  //                     //     <Text
  //                     //       style={{
  //                     //         fontFamily: 'IBMPlexSans',
  //                     //         fontSize: 10,
  //                     //         fontWeight: '500',
  //                     //         fontStyle: 'normal',
  //                     //         lineHeight: 12,
  //                     //         letterSpacing: 0,
  //                     //         color: 'rgba(2, 71, 91, 0.6)',
  //                     //         marginLeft: 14,
  //                     //         marginBottom: 8,
  //                     //       }}
  //                     //     >
  //                     //       {moment
  //                     //         .unix(apmnt.appointmentDateTime / 1000)
  //                     //         .format('DD MMM  hh:mm a')}
  //                     //     </Text>
  //                     //   </View>
  //                     // </View>
  //                   );
  //                 })
  //               )}
  //             </View>
  //           );
  //         })
  //       )}
  //     </View>
  //   );
  // };

  const renderPatientImage = () => {
    return (
      <View style={{ marginBottom: 20 }}>
        <View style={{ top: 10, marginLeft: 20, position: 'absolute', zIndex: 2 }}>
          <TouchableOpacity onPress={() => props.navigation.pop()}>
            <BackArrow />
          </TouchableOpacity>
        </View>
        {patientDetails && isValidImageUrl(patientDetails.photoUrl) ? (
          <Image
            source={{
              uri: (patientDetails && patientDetails.photoUrl) || '',
            }}
            style={{ height: width, width: width }}
            resizeMode={'contain'}
            placeholderStyle={{
              height: width,
              width: width,
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
          />
        ) : (
          <UserPlaceHolder
            style={{
              height: 150,
              width: width,
              alignItems: 'center',
              backgroundColor: 'white',
              resizeMode: 'contain',
            }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {!showSpinner && (
        <SafeAreaView style={[theme.viewStyles.container]}>
          <ScrollView bounces={false}>
            {renderPatientImage()}
            <View style={[styles.shadowview, { marginTop: -20 }]}>
              <View style={{ flexDirection: 'row', marginTop: 12, marginHorizontal: 20 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansSemiBold(18),
                      color: theme.colors.SHARP_BLUE,
                      marginBottom: 2,
                      marginRight: 15,
                    }}
                  >
                    {PatientInfo && PatientInfo.firstName}
                  </Text>
                </View>
                {PatientInfo && PatientInfo.uhid && (
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansMedium(12),
                      color: 'rgba(2, 71, 91, 0.8)',
                      marginLeft: 14,
                      marginBottom: 8,
                    }}
                  >
                    {strings.case_sheet.uhid}: {PatientInfo.uhid}
                  </Text>
                )}

                {/* <View
              style={{
                height: 16,
                borderWidth: 0.5,
                borderColor: 'rgba(2, 71, 91, 0.6)',
                marginTop: 5,
              }}
            ></View>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(16),
                color: 'rgba(2, 71, 91, 0.8)',
                marginLeft: 14,
                marginBottom: 8,
              }}
            >
              {todayYear - dateOfBirth}, {PatientInfo.gender}
            </Text> */}
              </View>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: theme.colors.LIGHT_BLUE,
                  marginBottom: 12,
                  marginLeft: 20,
                }}
              >
                {age > -1 ? Math.round(age).toString() : '-'}
                {PatientInfo && PatientInfo.gender ? `, ${PatientInfo.gender.charAt(0)} ` : ''}
                {PatientInfo && PatientInfo.addressList && PatientInfo.addressList.length > 0
                  ? `, ${PatientInfo.addressList[0].city}`
                  : ''}
              </Text>

              {/* <View
            style={{
              borderRadius: 5,
              backgroundColor: '#f0f4f5',
              flexDirection: 'row',
              marginLeft: 20,
              marginBottom: 16,
              marginRight: 20,
              marginTop: 20,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ marginTop: 15, marginLeft: 10, marginRight: 5, marginBottom: 15 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(20),
                  color: '#0087ba',
                  letterSpacing: 0.09,
                }}
              >
                Rs. 2000
              </Text>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: '#02475b',
                  letterSpacing: 0.02,
                  textAlign: 'center',
                }}
              >
                REVENUE
              </Text>
            </View>
            <View
              style={{
                height: 44,
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(2, 71, 91, 0.15)',
                marginTop: 20,
              }}
            ></View>
            <View style={{ marginTop: 15, marginLeft: 5, marginRight: 5, marginBottom: 15 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(20),
                  color: '#0087ba',
                  letterSpacing: 0.09,
                  textAlign: 'center',
                }}
              >
                {props.navigation.getParam('ConsultsCount')}
              </Text>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: '#02475b',
                  letterSpacing: 0.02,
                }}
              >
                CONSULTS
              </Text>
            </View>
            <View
              style={{
                height: 44,
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(2, 71, 91, 0.15)',
                marginTop: 20,
              }}
            ></View>
            <View style={{ marginTop: 15, marginLeft: 5, marginRight: 12, marginBottom: 15 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(20),
                  color: '#0087ba',
                  letterSpacing: 0.09,
                  textAlign: 'center',
                }}
              >
                2
              </Text>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: '#02475b',
                  letterSpacing: 0.02,
                }}
              >
                PRESCRIPTIONS
              </Text>
            </View>
          </View> */}
            </View>
            <View>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(17),
                  lineHeight: 24,
                  color: '#01475b',
                  margin: 16,
                }}
              >
                {strings.case_sheet.past_consultations}
              </Text>
              <PastConsultCard
                data={pastList}
                navigation={props.navigation}
                patientDetails={patientDetails}
              />
              {/* <ScrollView bounces={false}>
            {pastList.map((apmnt: any, i: any) => {
              return (
                <View style={{ marginLeft: 16, marginRight: 20, marginBottom: 0 }}>
                  {renderPastAppData(apmnt)}
                </View>
              );
            })} */}
              {/* {_data!.map((_doctor, i, array) => {
              return (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {renderLeftTimeLineView(
                    _doctor.id,
                    i == 0 ? true : true,
                    i == array.length - 1 ? false : true
                  )}

                  <PastConsultCard doctorname={_doctor.name} />
                </View>
              );
            })} */}
              {/* </ScrollView> */}
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
      {showSpinner && <Spinner />}
    </View>
  );
};
