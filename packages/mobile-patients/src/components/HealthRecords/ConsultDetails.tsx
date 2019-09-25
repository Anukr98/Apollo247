import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  GET_CASESHEET_DETAILS,
  GET_APPOINTMENT_DATA,
  CHECK_IF_RESCHDULE,
  CHECK_IF_FOLLOWUP_BOOKED,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getCaseSheet,
  getCaseSheetVariables,
  getCaseSheet_getCaseSheet_caseSheetDetails,
} from '@aph/mobile-patients/src/graphql/types/getCaseSheet';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AsyncStorage,
} from 'react-native';
import {
  NavigationScreenProps,
  ScrollView,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import { AppRoutes } from '../NavigatorContainer';
import { ShoppingCartItem, useShoppingCart, EPrescription } from '../ShoppingCartProvider';
import { Spinner } from '../ui/Spinner';
import { OverlayRescheduleView } from '../Consult/OverlayRescheduleView';
import { useAllCurrentPatients, useAuth } from '../../hooks/authHooks';
import { getAppointmentData } from '../../graphql/types/getAppointmentData';

import { ConsultOverlay } from '../ConsultRoom/ConsultOverlay';
import {
  checkIfReschedule,
  checkIfRescheduleVariables,
} from '../../graphql/types/checkIfReschedule';
import { checkIfFollowUpBooked } from '../../graphql/types/checkIfFollowUpBooked';
import { getMedicineDetailsApi } from '../../helpers/apiCalls';
import { AppConfig } from '../../strings/AppConfig';

const styles = StyleSheet.create({
  imageView: {
    width: 80,
    marginLeft: 20,
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  timeStyle: {
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.04,
  },
  descriptionStyle: {
    paddingTop: 7,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.TEXT_LIGHT_BLUE,
  },
  doctorDetailsStyle: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  labelStyle: {
    paddingBottom: 4,
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  dataTextStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingTop: 7,
    paddingBottom: 12,
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
});

export interface ConsultDetailsProps extends NavigationScreenProps {
  CaseSheet: string;
  DoctorInfo: any;
  PatientId: any;
  appointmentType: string;
  appointmentDate: any;
  DisplayId: any;
  Displayoverlay: any;
  isFollowcount: any;
}

type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};

export const ConsultDetails: React.FC<ConsultDetailsProps> = (props) => {
  console.log('consulcasesheetid', props.navigation.state.params!.CaseSheet);
  console.log('DoctorInfo', props.navigation.state.params!.DoctorInfo);
  console.log('FollowUp', props.navigation.state.params!.FollowUp);
  console.log('appointmentDate', props.navigation.state.params!.appointmentDate);
  console.log('Displayoverlay', props.navigation.state.params!.Displayoverlay);
  console.log('isfollowcount', props.navigation.state.params!.isFollowcount);
  const data = props.navigation.state.params!.DoctorInfo;
  const [loading, setLoading] = useState<boolean>(true);
  const client = useApolloClient();
  const [showsymptoms, setshowsymptoms] = useState<boolean>(true);
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [showDiagnosis, setshowDiagnosis] = useState<boolean>(true);
  const [showgeneral, setShowGeneral] = useState<boolean>(true);
  const [showFollowUp, setshowFollowUpl] = useState<boolean>(true);
  const [caseSheetDetails, setcaseSheetDetails] = useState<
    getCaseSheet_getCaseSheet_caseSheetDetails
  >();
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(
    props.navigation.state.params!.Displayoverlay
  );
  const [bookFollowUp, setBookFollowUp] = useState<boolean>(true);
  const [isfollowcount, setIsfollowucount] = useState<number>(
    props.navigation.state.params!.isFollowcount
  );
  const [rescheduleType, setRescheduleType] = useState<rescheduleType>();

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    setLoading(true);
    client
      .query<getCaseSheet, getCaseSheetVariables>({
        query: GET_CASESHEET_DETAILS,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentId: props.navigation.state.params!.CaseSheet,
        },
      })
      .then((_data) => {
        setLoading(false);
        console.log('GET_CASESHEET_DETAILS', _data!);
        console.log(_data.data.getCaseSheet!.caseSheetDetails!.blobName, 'blobname');
        console.log('displayid', _data.data.getCaseSheet!.caseSheetDetails!.appointment!.displayId);
        props.navigation.state.params!.DisplayId = _data.data.getCaseSheet!.caseSheetDetails!.appointment!.displayId;

        setcaseSheetDetails(_data.data.getCaseSheet!.caseSheetDetails!);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error, 'GET_CASESHEET_DETAILS error');
        const errorMessage = error && error.message;
        console.log('Error occured while GET_CASESHEET_DETAILS error', errorMessage, error);
        Alert.alert('Error', errorMessage);
      });
  }, []);
  // const getData = useQuery<getCaseSheet>(GET_CASESHEET_DETAILS, {
  //   fetchPolicy: 'no-cache',
  //   variables: {
  //     appointmentId: props.navigation.state.params!.CaseSheet,
  //   },
  // });
  // console.log(getData, 'getData');

  // if (getData.data) {
  //   if (
  //     getData &&
  //     getData.data &&
  //     getData.data.getCaseSheet &&
  //     getData.data.getCaseSheet.caseSheetDetails &&
  //     caseSheetDetails !== getData.data.getCaseSheet.caseSheetDetails
  //   ) {
  //     console.log(getData.data.getCaseSheet.caseSheetDetails, 'caseSheetDetails');
  //     setcaseSheetDetails(getData.data.getCaseSheet.caseSheetDetails);
  //   }
  // } else {
  //   console.log(getData.error, 'getData error');
  //   console.log('Error occured while accept appid', getData.error);
  //   const error = JSON.parse(JSON.stringify(getData.error));
  //   const errorMessage = error && error.message;
  //   console.log('Error occured while getData error', errorMessage, error);
  //   Alert.alert('Error', errorMessage);
  // }

  const renderDoctorDetails = () => {
    return (
      <View style={styles.doctorDetailsStyle}>
        {!props.navigation.state.params!.DoctorInfo ? null : (
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: theme.colors.SEARCH_EDUCATION_COLOR,
                  paddingBottom: 4,
                }}
              >
                {props.navigation.state.params!.DoctorInfo &&
                  '#' + props.navigation.state.params!.DisplayId}
              </Text>
              <View style={theme.viewStyles.lightSeparatorStyle} />
              <Text style={styles.doctorNameStyle}>
                {props.navigation.state.params!.DoctorInfo &&
                  'Dr.' + props.navigation.state.params!.DoctorInfo.firstName}
              </Text>
              <Text style={styles.timeStyle}>
                {props.navigation.state.params!.appointmentType} CONSULT
              </Text>
              <View style={theme.viewStyles.lightSeparatorStyle} />
            </View>
            <View style={styles.imageView}>
              {props.navigation.state.params!.DoctorInfo &&
                props.navigation.state.params!.DoctorInfo.photoUrl && (
                  <Image
                    source={{
                      uri:
                        props.navigation.state.params!.DoctorInfo &&
                        props.navigation.state.params!.DoctorInfo.photoUrl,
                    }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                    }}
                  />
                )}
            </View>
          </View>
        )}
        {caseSheetDetails && caseSheetDetails.followUp ? (
          <View>
            <Text style={styles.descriptionStyle}>
              This is a follow-up consult to the {props.navigation.state.params!.appointmentType}{' '}
              Visit on{' '}
              {caseSheetDetails && moment(caseSheetDetails.followUpDate).format('DD MMM YYYY')}
            </Text>
            <Text
              style={[theme.viewStyles.yellowTextStyle, { textAlign: 'right', paddingBottom: 16 }]}
              onPress={() => {
                props.navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
                  })
                );
              }}
            >
              {strings.health_records_home.view_consult}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderSymptoms = () => {
    console.log('caseSheetDetails.symptoms.length', caseSheetDetails!.symptoms!);
    console.log('bolbname', caseSheetDetails!.blobName!);
    // if (caseSheetDetails && caseSheetDetails.symptoms && caseSheetDetails.symptoms.length > 0)
    return (
      <View
        style={{
          marginTop: 24,
        }}
      >
        <CollapseCard
          heading="SYMPTOMS"
          collapse={showsymptoms}
          onPress={() => setshowsymptoms(!showsymptoms)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
            {caseSheetDetails!.symptoms && caseSheetDetails!.symptoms !== null ? (
              <View>
                {caseSheetDetails!.symptoms!.map((item) => {
                  if (item && item.symptom)
                    return (
                      <View>
                        <View style={styles.labelViewStyle}>
                          <Text style={styles.labelStyle}>{item.symptom}</Text>
                        </View>
                        <Text style={styles.dataTextStyle}>
                          {`Since: ${item.since}\nHow Often: ${item.howOften}\nSeverity: ${item.severity}`}
                        </Text>
                      </View>
                    );
                })}
              </View>
            ) : (
              <View>
                <Text style={styles.labelStyle}>No Symptoms</Text>
              </View>
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };
  const { setCartItems, cartItems, ePrescriptions, setEPrescriptions } = useShoppingCart();

  const onAddToCart = () => {
    console.log('medicine', caseSheetDetails!.medicinePrescription);
    console.log(
      'blobName',
      AppConfig.Configuration.DOCUMENT_BASE_URL.concat(caseSheetDetails!.blobName!)
    );
    setLoading(true);

    const medPrescription = caseSheetDetails!.medicinePrescription || [];
    const docUrl = AppConfig.Configuration.DOCUMENT_BASE_URL.concat(caseSheetDetails!.blobName!);

    Promise.all(medPrescription.map((item) => getMedicineDetailsApi(item!.id!)))
      .then((result) => {
        console.log({ result });

        setLoading(false);
        const medicines = result
          .map(({ data: { productdp } }, index) => {
            const medicineDetails = (productdp && productdp[0]) || {};
            if (!medicineDetails.is_in_stock) {
              return null;
            }
            return {
              id: medicineDetails!.sku!,
              mou: medicineDetails.mou,
              name: medicineDetails!.name,
              price: medicineDetails!.price,
              quantity: parseInt(medPrescription[index]!.medicineDosage!),
              prescriptionRequired: medicineDetails.is_prescription_required == '1',
            } as ShoppingCartItem;
          })
          .filter((item) => (item ? true : false));

        console.log({ medicines });

        const filteredItemsFromCart = cartItems.filter(
          (cartItem) => !medicines.find((item) => (item && item.id) == cartItem.id)
        );

        console.log({ filteredItemsFromCart });

        setCartItems!([...filteredItemsFromCart, ...(medicines as ShoppingCartItem[])]);

        if (medPrescription.length > medicines.length) {
          const outOfStockCount = medPrescription.length - medicines.length;
          Alert.alert('Alert', `${outOfStockCount} item(s) are out of stock.`);
          // props.navigation.push(AppRoutes.YourCart, { isComingFromConsult: true });
        }

        const rxMedicinesCount =
          medicines.length == 0 ? 0 : medicines.filter((item) => item!.prescriptionRequired).length;

        console.log({ rxMedicinesCount });

        const presToAdd = {
          id: caseSheetDetails!.id,
          date: moment(caseSheetDetails!.appointment!.appointmentDateTime).format('DD MMM YYYY'),
          doctorName: '',
          forPatient: (currentPatient && currentPatient.firstName) || '',
          medicines: (medicines || []).map((item) => item!.name).join(', '),
          uploadedUrl: docUrl,
        } as EPrescription;

        if (rxMedicinesCount) {
          setEPrescriptions!([
            ...ePrescriptions.filter((item) => !(item.id == presToAdd.id)),
            presToAdd,
          ]);
        }
        props.navigation.push(AppRoutes.YourCart, { isComingFromConsult: true });
      })
      .catch((e) => {
        setLoading(false);
        console.log({ e });
        Alert.alert('Alert', 'Oops! Something went wrong.');
      });
  };

  const renderPrescriptions = () => {
    // if (
    //   caseSheetDetails &&
    //   caseSheetDetails.medicinePrescription &&
    //   caseSheetDetails.medicinePrescription.length > 0
    // )
    return (
      <View>
        <CollapseCard
          heading="PRESCRIPTION"
          collapse={showPrescription}
          onPress={() => setshowPrescription(!showPrescription)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
            {caseSheetDetails!.medicinePrescription &&
            caseSheetDetails!.medicinePrescription.length !== 0 &&
            caseSheetDetails!.doctorType !== 'JUNIOR' ? (
              <View>
                {caseSheetDetails!.medicinePrescription.map((item) => {
                  if (item)
                    return (
                      <View>
                        <View style={styles.labelViewStyle}>
                          <Text style={styles.labelStyle}>{item.medicineName}</Text>
                        </View>
                        <Text style={styles.dataTextStyle}>
                          {item.medicineDosage}
                          {item.medicineTimings
                            ? `\n${
                                item.medicineTimings.length
                              } times a day (${item.medicineTimings
                                .join(', ')
                                .toLowerCase()}) for ${
                                item.medicineConsumptionDurationInDays
                              } days\n`
                            : ''}

                          {item.medicineToBeTaken
                            ? item.medicineToBeTaken
                                .map(
                                  (item) =>
                                    item &&
                                    item
                                      .split('_')
                                      .join(' ')
                                      .toLowerCase()
                                )
                                .join(', ')
                            : ''}
                        </Text>
                      </View>
                    );
                })}
                <TouchableOpacity
                  onPress={() => {
                    onAddToCart();
                  }}
                >
                  <Text
                    style={[
                      theme.viewStyles.yellowTextStyle,
                      { textAlign: 'right', paddingBottom: 16 },
                    ]}
                  >
                    {strings.health_records_home.order_medicine}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.labelStyle}>No Medicines</Text>
              </View>
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderDiagnosis = () => {
    console.log('dia', caseSheetDetails!.diagnosis!);
    //if (caseSheetDetails && caseSheetDetails.diagnosis && caseSheetDetails.diagnosis.length > 0)
    return (
      <View>
        <CollapseCard
          heading="DIAGNOSIS"
          collapse={showDiagnosis}
          onPress={() => setshowDiagnosis(!showDiagnosis)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
            {caseSheetDetails!.diagnosis && caseSheetDetails!.diagnosis! !== null ? (
              <View>
                <Text style={styles.labelStyle}>
                  {caseSheetDetails!.diagnosis!.map((item) => item && item.name).join(', ')}
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.labelStyle}>No diagnosis</Text>
              </View>
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };
  const renderGenerealAdvice = () => {
    // if (
    //   caseSheetDetails &&
    //   caseSheetDetails.otherInstructions &&
    //   caseSheetDetails.otherInstructions.length > 0
    // )
    return (
      <View>
        <CollapseCard
          heading="GENERAL ADVICE"
          collapse={showgeneral}
          onPress={() => setShowGeneral(!showgeneral)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
            {caseSheetDetails!.otherInstructions && caseSheetDetails!.otherInstructions !== null ? (
              <View>
                <Text style={styles.labelStyle}>
                  {caseSheetDetails!
                    .otherInstructions!.map((item, i) => {
                      if (item && item.instruction !== '') {
                        return `${i + 1}. ${item.instruction}`;
                      }
                    })
                    .join('\n')}
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.labelStyle}>No advice</Text>
              </View>
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderFollowUp = () => {
    console.log('caseSheetDetails.followUp', caseSheetDetails!.followUp);
    //if (caseSheetDetails && caseSheetDetails.followUp)
    return (
      <View>
        <CollapseCard
          heading="FOLLOW-UP"
          collapse={showFollowUp}
          onPress={() => setshowFollowUpl(!showFollowUp)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
            {caseSheetDetails &&
            caseSheetDetails!.followUp &&
            caseSheetDetails!.doctorType !== 'JUNIOR' ? (
              <View>
                <View>
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>
                      {caseSheetDetails!.consultType === 'PHYSICAL'
                        ? 'Clinic Visit'
                        : 'Online Consult '}
                    </Text>
                  </View>
                  {caseSheetDetails!.followUpAfterInDays == null ? (
                    <Text style={styles.dataTextStyle}>
                      Recommended after{' '}
                      {moment(caseSheetDetails!.followUpDate).format('DD MMM YYYY')}{' '}
                    </Text>
                  ) : (
                    <Text style={styles.dataTextStyle}>
                      Recommended after {caseSheetDetails!.followUpAfterInDays} days
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    console.log(
                      'doctorid',
                      props.navigation.state.params!.DoctorInfo &&
                        props.navigation.state.params!.DoctorInfo.id
                    );
                    console.log('patientid', props.navigation.state.params!.PatientId);
                    console.log('appointmentid', props.navigation.state.params!.CaseSheet);
                    console.log('follwup', caseSheetDetails!.followUp);
                    console.log('appointmentType', props.navigation.state.params!.appointmentType);
                    client
                      .query<checkIfFollowUpBooked>({
                        query: CHECK_IF_FOLLOWUP_BOOKED,
                        variables: {
                          appointmentId: props.navigation.state.params!.CaseSheet,
                        },
                        fetchPolicy: 'no-cache',
                      })
                      .then(({ data }) => {
                        console.log('checkIfFollowUpBooked', data);
                        console.log('checkIfFollowUpBookedcount', data.checkIfFollowUpBooked);
                        setIsfollowucount(data.checkIfFollowUpBooked);
                        // setBookFollowUp(
                        //   data!.getAppointmentData &&
                        //     data!.getAppointmentData!.appointmentsHistory[0].isFollowUp!
                        // );
                        setdisplayoverlay(true);
                      })
                      .catch((error) => {
                        console.log('Error occured', { error });
                      });
                    // props.navigation.navigate(AppRoutes.DoctorDetails, {
                    //   doctorId: props.navigation.state.params!.DoctorInfo.id,
                    //   PatientId: props.navigation.state.params!.PatientId,
                    //   FollowUp: caseSheetDetails!.followUp,
                    //   appointmentType: props.navigation.state.params!.appointmentType,
                    //   appointmentId: props.navigation.state.params!.CaseSheet,
                    //   showBookAppointment: true,
                    // });
                    //setdisplayoverlay(true);
                  }}
                >
                  <Text
                    style={[
                      theme.viewStyles.yellowTextStyle,
                      { textAlign: 'right', paddingBottom: 16 },
                    ]}
                  >
                    {strings.health_records_home.book_follow_up}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.labelStyle}>No followup</Text>
              </View>
            )}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderData = () => {
    if (caseSheetDetails)
      return (
        <View>
          {renderSymptoms()}
          {renderPrescriptions()}
          {renderDiagnosis()}
          {renderGenerealAdvice()}
          {renderFollowUp()}
        </View>
      );
  };

  if (props.navigation.state.params!.DoctorInfo)
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            title="PRESCRIPTION"
            leftIcon="backArrow"
            onPressLeftIcon={() => props.navigation.goBack()}
          />

          <ScrollView bounces={false}>
            {renderDoctorDetails()}
            {renderData()}
          </ScrollView>

          {displayoverlay && props.navigation.state.params!.DoctorInfo && (
            <OverlayRescheduleView
              setdisplayoverlay={() => setdisplayoverlay(false)}
              navigation={props.navigation}
              doctor={
                props.navigation.state.params!.DoctorInfo
                  ? props.navigation.state.params!.DoctorInfo
                  : null
              }
              patientId={currentPatient ? currentPatient.id : ''}
              clinics={
                props.navigation.state.params!.DoctorInfo &&
                props.navigation.state.params!.DoctorInfo.doctorHospital
                  ? props.navigation.state.params!.DoctorInfo.doctorHospital
                  : []
              }
              doctorId={
                props.navigation.state.params!.DoctorInfo &&
                props.navigation.state.params!.DoctorInfo.id
              }
              renderTab={'Consult Online'}
              rescheduleCount={rescheduleType!}
              appointmentId={props.navigation.state.params!.CaseSheet}
              bookFollowUp={bookFollowUp}
              data={data}
              KeyFollow={'Followup'}
              isfollowupcount={isfollowcount}
            />
          )}
        </SafeAreaView>
        {loading && <Spinner />}
      </View>
    );
  return null;
};
