import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  EPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  MedicineRxIcon,
  PHRFollowUpDarkIcon,
  LabTestIcon,
  PhrSymptomIcon,
  PhrDiagnosisIcon,
  PhrGeneralAdviceIcon,
  WhiteDownloadIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { GET_SD_LATEST_COMPLETED_CASESHEET_DETAILS } from '@aph/mobile-patients/src/graphql/profiles';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import { getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo } from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import {
  getSDLatestCompletedCaseSheet,
  getSDLatestCompletedCaseSheetVariables,
  getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails,
  getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosticPrescription,
  getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_medicinePrescription,
} from '@aph/mobile-patients/src/graphql/types/getSDLatestCompletedCaseSheet';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  AppointmentType,
  APPOINTMENT_TYPE,
  MEDICINE_CONSUMPTION_DURATION,
  MEDICINE_FORM_TYPES,
  MEDICINE_FREQUENCY,
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
  MEDICINE_UNIT,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  addTestsToCart,
  doRequestAndAccessLocation,
  formatToCartItem,
  g,
  getPrescriptionItemQuantity,
  handleGraphQlError,
  medUnitFormatArray,
  nameFormater,
  postWebEngageEvent,
  postCleverTapPHR,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '../../helpers/mimeType';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { ListItem } from 'react-native-elements';
import _ from 'lodash';
import { AxiosResponse } from 'axios';
import { getMedicineDetailsApi, MedicineProductDetailsResponse } from '../../helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { DiagnosticAddToCartEvent } from '@aph/mobile-patients/src/components/Tests/Events';
import { DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE } from '@aph/mobile-patients/src/utils/commonUtils';
import InAppReview from 'react-native-in-app-review';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bottomPaddingTwelve: {
    paddingBottom: 12,
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
  orderMedicineMsg: {
    textAlign: 'right',
    color: theme.colors.SKY_BLUE,
    lineHeight: 14,
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingTop: 5,
    paddingBottom: 10,
  },
  subDataTextStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
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
  topCardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginBottom: 15,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 9,
  },
  separatorLineStyle: {
    backgroundColor: '#02475B',
    opacity: 0.2,
    height: 0.5,
    marginBottom: 7,
    marginTop: 16,
  },
  collapseCardLabelViewStyle: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  blueCirleViewStyle: {
    backgroundColor: '#02475B',
    opacity: 0.6,
    width: 5,
    marginTop: 7,
    alignSelf: 'flex-start',
    height: 5,
    borderRadius: 2.5,
    marginRight: 12,
  },
  listItemContainerStyle: {
    paddingLeft: 18,
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 0,
  },
  topViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickActionButtons: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#FC9916',
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  orderMedicinesButton: {
    backgroundColor: theme.colors.BUTTON_BG,
    borderRadius: 10,
    marginVertical: 13,
    alignItems: 'center',
    paddingHorizontal: 65,
    paddingVertical: 6,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  orderMedicineText: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#fff',
  },
  etaMsg: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    color: '#fff',
  },
  bottomButtonContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkupDateTextStyle: { ...theme.viewStyles.text('R', 14, '#67909C', 1, 18.2), marginTop: 6 },
  downloadBtnViewStyle: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.BUTTON_BG,
    borderRadius: 10,
    paddingVertical: 7,
    paddingLeft: 18,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadBtnTextStyle: {
    ...theme.viewStyles.text('B', 13, theme.colors.WHITE, 1, 16.9),
    marginLeft: 2,
  },
  downloadIconStyle: { width: 20, height: 20 },
  phrGeneralIconStyle: { width: 20, height: 24.84, marginRight: 12 },
});

export interface ConsultDetailsProps
  extends NavigationScreenProps<{
    CaseSheet: string; // this is the appointmentId
    DoctorInfo:
    | getDoctorDetailsById_getDoctorDetailsById
    | getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo;
    appointmentType: APPOINTMENT_TYPE | AppointmentType;
    DisplayId: any;
    Displayoverlay: any;
    isFollowcount: any;
    BlobName: string;
  }> { }

type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};

export const ConsultDetails: React.FC<ConsultDetailsProps> = (props) => {
  const data = props.navigation.getParam('DoctorInfo');
  const appointmentType = props.navigation.getParam('appointmentType');
  const appointmentId = props.navigation.getParam('CaseSheet');

  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const client = useApolloClient();
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [caseSheetDetails, setcaseSheetDetails] = useState<
    getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails
  >();
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(
    props.navigation.getParam('Displayoverlay')
  );
  const [bookFollowUp, setBookFollowUp] = useState<boolean>(true);
  const [isfollowcount, setIsfollowucount] = useState<number>(
    props.navigation.getParam('isFollowcount')
  );
  const [rescheduleType, setRescheduleType] = useState<rescheduleType>();
  const [showNotExistAlert, setshowNotExistAlert] = useState<boolean>(false);
  const [APICalled, setAPICalled] = useState<boolean>(false);
  const [showReferral, setShowReferral] = useState<boolean>(true);

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    props.navigation.goBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  useEffect(() => {
    setLoading && setLoading(true);
    client
      .query<getSDLatestCompletedCaseSheet, getSDLatestCompletedCaseSheetVariables>({
        query: GET_SD_LATEST_COMPLETED_CASESHEET_DETAILS,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentId: props.navigation.getParam('CaseSheet'),
        },
      })
      .then((_data) => {
        setLoading && setLoading(false);
        props.navigation.state.params!.DisplayId = _data.data.getSDLatestCompletedCaseSheet!.caseSheetDetails!.appointment!.displayId;
        setcaseSheetDetails(_data.data.getSDLatestCompletedCaseSheet!.caseSheetDetails!);
        appReviewAndRating(_data.data.getSDLatestCompletedCaseSheet!.caseSheetDetails!)
        setAPICalled(true);
      })
      .catch((error) => {
        CommonBugFender('ConsultDetails_GET_SD_LATEST_COMPLETED_CASESHEET_DETAILS', error);
        setLoading && setLoading(false);
        const errorMessage = error && error.message.split(':')[1].trim();
        if (errorMessage === 'NO_CASESHEET_EXIST') {
          setshowNotExistAlert(true);
        }
      });
  }, []);

  const postWEGEvent = (
    type: 'medicine' | 'test' | 'download prescription',
    medOrderType?: CleverTapEvents[CleverTapEventName.ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS]['Order Type']
  ) => {
    const requireCasesheetDetails =
      caseSheetDetails?.doctorType !== 'JUNIOR' ? caseSheetDetails : {};
    const eventAttributes:
      | CleverTapEvents[CleverTapEventName.ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS]
      | CleverTapEvents[CleverTapEventName.ORDER_TESTS_FROM_PRESCRIPTION_DETAILS]
      | CleverTapEvents[CleverTapEventName.DOWNLOAD_PRESCRIPTION] = {
      ...requireCasesheetDetails,
      'Doctor Name': g(data, 'fullName')!,
      'Speciality ID': g(data, 'specialty', 'id')!,
      'Speciality Name': g(data, 'specialty', 'name')!,
      'Doctor Category': g(data, 'doctorType')!,
      'Consult Date Time': moment(
        g(caseSheetDetails, 'appointment', 'appointmentDateTime')
      ).toDate(),
      'Consult Mode': appointmentType == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      'Hospital Name': g(data, 'doctorHospital', '0' as any, 'facility', 'name')!,
      'Hospital City': g(data, 'doctorHospital', '0' as any, 'facility', 'city')!,
      'Consult ID': appointmentId,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
    };
    if (type == 'download prescription') {
      (eventAttributes as CleverTapEvents[CleverTapEventName.DOWNLOAD_PRESCRIPTION])[
        'Download Screen'
      ] = 'Prescription Details';
    }
    if (type == 'medicine' && medOrderType) {
      (eventAttributes as CleverTapEvents[CleverTapEventName.ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS])[
        'Order Type'
      ] = medOrderType;
    }
    postWebEngageEvent(
      type == 'medicine'
        ? CleverTapEventName.ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS
        : type == 'test'
          ? CleverTapEventName.ORDER_TESTS_FROM_PRESCRIPTION_DETAILS
          : CleverTapEventName.DOWNLOAD_PRESCRIPTION,
      eventAttributes
    );
    postCleverTapEvent(
      type == 'medicine'
        ? CleverTapEventName.ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS
        : type == 'test'
          ? CleverTapEventName.ORDER_TESTS_FROM_PRESCRIPTION_DETAILS
          : CleverTapEventName.DOWNLOAD_PRESCRIPTION,
      eventAttributes
    );
  };

  const renderTopDetailsView = () => {
    return !g(caseSheetDetails, 'appointment', 'doctorInfo') ? null : (
      <View style={styles.topCardViewStyle}>
        <View style={styles.topViewHeader}>
          <Text style={{ ...theme.viewStyles.text('SB', 23, '#02475B', 1, 30) }}>
            {'Prescription'}
          </Text>
        </View>
        <Text style={{ ...theme.viewStyles.text('M', 16, '#0087BA', 1, 21), marginTop: 6 }}>
          {g(caseSheetDetails, 'appointment', 'doctorInfo', 'displayName')}
        </Text>
        <Text style={styles.checkupDateTextStyle}>
          {g(caseSheetDetails, 'appointment', 'appointmentType') == 'ONLINE'
            ? 'Online'
            : 'Physical'}{' '}
          Consult
        </Text>
        <Text style={styles.checkupDateTextStyle}>
          {'Checkup Date on '}
          {caseSheetDetails?.appointment?.appointmentDateTime
            ? moment(caseSheetDetails?.appointment?.appointmentDateTime).format('DD MMM, YYYY')
            : ''}
        </Text>
        <View style={styles.separatorLineStyle} />
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => onPressDownloadPrescripiton()}
          style={styles.downloadBtnViewStyle}
        >
          <WhiteDownloadIcon style={styles.downloadIconStyle} />
          <Text style={styles.downloadBtnTextStyle}>{'DOWNLOAD'}</Text>
        </TouchableOpacity>
      </View>
    );
  };


  /******
   * App Review And Rating
   * *****/
  const appReviewAndRating = async (data: any) => {
    if (g(data, 'appointment', 'doctorInfo')) {
      if (InAppReview.isAvailable()) {
        console.log('Riviewing....')
        await InAppReview.RequestInAppReview()
      }
    }
  }

  const renderSymptoms = () => {
    return (
      <>
        {renderHeadingView(
          'Symptoms',
          <PhrSymptomIcon style={{ width: 19.98, height: 20, marginRight: 12 }} />
        )}
        {caseSheetDetails?.symptoms !== null ? (
          <View>
            {caseSheetDetails?.symptoms?.map((item) => {
              if (item?.symptom)
                return (
                  <View style={{ marginTop: 28 }}>
                    <Text
                      style={{
                        ...theme.viewStyles.text('SB', 16, '#00B38E', 1, 20.8),
                        marginLeft: 30,
                        flex: 1,
                      }}
                    >
                      {item.symptom}
                    </Text>
                    {!!item?.since ? (
                      <View style={{ marginLeft: 0, marginTop: 20 }}>
                        {renderListItem('Duration', 'Active')}
                        <Text
                          style={{
                            ...theme.viewStyles.text('R', 13, '#0087BA', 1, 15),
                            paddingLeft: 35,
                            flex: 1,
                          }}
                        >
                          {item.since}
                        </Text>
                      </View>
                    ) : null}
                    {!!item?.howOften ? renderListItem(item?.howOften, 'Acute', 17) : null}
                    {!!item?.severity ? (
                      <View style={{ marginLeft: 0, marginTop: 20 }}>
                        {renderListItem('Medically Relevant Details', '')}
                        <Text
                          style={{
                            ...theme.viewStyles.text('R', 13, '#0087BA', 1, 15),
                            paddingLeft: 35,
                            paddingRight: 14,
                            flex: 1,
                          }}
                        >
                          {item.severity}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
            })}
          </View>
        ) : (
          renderNoData('No Symptoms')
        )}
      </>
    );
  };
  const { setEPrescriptions, addMultipleCartItems } = useShoppingCart();
  const {
    addMultipleCartItems: addMultipleTestCartItems,
    addMultipleEPrescriptions: addMultipleTestEPrescriptions,
  } = useDiagnosticsCart();
  const {
    locationDetails,
    setLocationDetails,
    diagnosticLocation,
    pharmacyLocation,
  } = useAppCommonData();

  function postDiagnosticAddToCart(itemId: string, itemName: string) {
    DiagnosticAddToCartEvent(itemName, itemId, 0, 0, DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.PHR);
  }

  const onAddTestsToCart = async () => {
    let location: LocationData | null = null;
    setLoading && setLoading(true);

    if (!locationDetails) {
      try {
        location = await doRequestAndAccessLocation();
        location && setLocationDetails!(location);
      } catch (error) {
        setLoading && setLoading(false);
        Alert.alert(
          'Uh oh.. :(',
          'Unable to get location. We need your location in order to add tests to your cart.'
        );
        return;
      }
    }

    const testPrescription = (caseSheetDetails!.diagnosticPrescription ||
      []) as getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_diagnosticPrescription[];
    const docUrl = AppConfig.Configuration.DOCUMENT_BASE_URL.concat(caseSheetDetails!.blobName!);

    if (!testPrescription.length) {
      Alert.alert('Uh oh.. :(', 'No items are available in your location for now.');
      setLoading && setLoading(false);
      return;
    }
    const presToAdd = {
      id: caseSheetDetails!.id,
      date: moment(caseSheetDetails!.appointment!.appointmentDateTime).format('DD MMM YYYY'),
      doctorName: g(data, 'displayName') || '',
      forPatient: (currentPatient && currentPatient.firstName) || '',
      medicines: '',
      uploadedUrl: docUrl,
    } as EPrescription;

    // Adding tests to DiagnosticsCart
    addTestsToCart(
      testPrescription,
      client,
      g(diagnosticLocation || pharmacyLocation || locationDetails || location, 'pincode') || ''
    )
      .then((tests: DiagnosticsCartItem[]) => {
        // Adding ePrescriptions to DiagnosticsCart
        const unAvailableItemsArray = testPrescription.filter(
          (item) => !tests.find((val) => val?.name!.toLowerCase() == item?.itemname!.toLowerCase())
        );
        const unAvailableItems = unAvailableItemsArray.map((item) => item.itemname).join(', ');
        const getItemNames = tests?.map((item) => item?.name)?.join(', ');
        const getItemIds = tests?.map((item) => Number(item?.id))?.join(', ');

        if (tests.length) {
          addMultipleTestCartItems!(tests);
          addMultipleTestEPrescriptions!([
            {
              ...presToAdd,
              medicines: (tests as DiagnosticsCartItem[]).map((item) => item.name).join(', '),
            },
          ]);
        }
        if (testPrescription.length == unAvailableItemsArray.length) {
          showAphAlert?.({
            title: string.common.uhOh,
            description: string.common.noDiagnosticsAvailable,
            onPressOk: () => {
              _navigateToTestCart();
            },
            onPressOutside: () => {
              _navigateToTestCart();
            },
          });
        } else {
          //in case of if any unavailable items or all are present
          const lengthOfAvailableItems = tests?.length;
          const testAdded = tests?.map((item) => nameFormater(item?.name), 'title').join('\n');
          showAphAlert?.({
            title:
              !!lengthOfAvailableItems && lengthOfAvailableItems > 0
                ? `${lengthOfAvailableItems} ${lengthOfAvailableItems > 1 ? 'items' : 'item'
                } added to your cart`
                : string.common.uhOh,
            description: unAvailableItems
              ? `Below items are added to your cart: \n${testAdded} \nSearch for the remaining diagnositc tests and add to the cart.`
              : `Below items are added to your cart: \n${testAdded}`,
            onPressOk: () => {
              _navigateToTestCart();
            },
            onPressOutside: () => {
              _navigateToTestCart();
            },
          });
        }
        setLoading?.(false);
        postDiagnosticAddToCart(getItemIds, getItemNames);
      })
      .catch((e) => {
        setLoading?.(false);
        handleGraphQlError(e);
      });
  };

  function _navigateToTestCart() {
    hideAphAlert?.();
    props.navigation.push(AppRoutes.TestsCart, { comingFrom: AppRoutes.ConsultDetails });
  }

  const getDaysCount = (type: MEDICINE_CONSUMPTION_DURATION | null) => {
    return type == MEDICINE_CONSUMPTION_DURATION.MONTHS
      ? 30
      : type == MEDICINE_CONSUMPTION_DURATION.WEEKS ||
        type == MEDICINE_CONSUMPTION_DURATION.TILL_NEXT_REVIEW
        ? 7
        : 1;
  };

  const onAddToCart = async () => {
    const medPrescription = (caseSheetDetails!.medicinePrescription || []).filter(
      (item) => item!.id
    );
    const docUrl = AppConfig.Configuration.DOCUMENT_BASE_URL.concat(caseSheetDetails!.blobName!);
    const presToAdd = {
      id: caseSheetDetails!.id,
      appointmentId: appointmentId,
      date: moment(caseSheetDetails!.appointment!.appointmentDateTime).format('DD MMM YYYY'),
      doctorName: g(data, 'displayName') || '',
      forPatient: (currentPatient && currentPatient.firstName) || '',
      medicines: (medPrescription || []).map((item) => item!.medicineName).join(', '),
      uploadedUrl: docUrl,
    } as EPrescription;
    const isCartOrder = medPrescription?.length === caseSheetDetails?.medicinePrescription?.length;
    postWEGEvent('medicine', isCartOrder ? 'Cart' : 'Non-Cart');

    if (isCartOrder) {
      try {
        setLoading?.(true);
        const response: AxiosResponse<MedicineProductDetailsResponse>[] = await Promise.all(
          medPrescription.map((item) => getMedicineDetailsApi(item?.id!))
        );
        const cartItems = response
          .filter(({ data }) => data?.productdp?.[0]?.id && data?.productdp?.[0]?.sku)
          .map(({ data }, index) => ({
            ...formatToCartItem({ ...data?.productdp?.[0]!, image: '' }),
            quantity: getPrescriptionItemQuantity(
              medPrescription?.[index]?.medicineUnit!,
              medPrescription?.[index]?.medicineTimings!,
              medPrescription?.[index]?.medicineDosage!,
              medPrescription?.[index]?.medicineCustomDosage!,
              medPrescription?.[index]?.medicineConsumptionDurationInDays!,
              medPrescription?.[index]?.medicineConsumptionDurationUnit!,
              parseInt(data?.productdp?.[0]?.mou || '1', 10)
            ),
          }));

        addMultipleCartItems?.(cartItems);
        setEPrescriptions?.([presToAdd]);
        setLoading?.(false);
        props.navigation.push(AppRoutes.MedicineCart);
      } catch (error) {
        setLoading?.(false);
        showAphAlert?.({
          title: string.common.uhOh,
          description: string.common.somethingWentWrong,
        });
        CommonBugFender(`${AppRoutes.ConsultDetails}_onAddToCart`, error);
      }
      return;
    }

    setEPrescriptions?.([presToAdd]);
    props.navigation.navigate(AppRoutes.UploadPrescription, {
      ePrescriptionsProp: [presToAdd],
      type: 'E-Prescription',
    });
  };

  const medicineDescription = (
    item: getSDLatestCompletedCaseSheet_getSDLatestCompletedCaseSheet_caseSheetDetails_medicinePrescription
  ) => {
    const { medicineCustomDetails } = item;
    const type =
      item.medicineFormTypes === MEDICINE_FORM_TYPES.OTHERS && medicineCustomDetails === null
        ? 'Take'
        : 'Apply';
    const customDosage = item.medicineCustomDosage
      ? item.medicineCustomDosage.split('-').filter((i) => i !== '' && i != '0')
      : [];
    const medTimingsArray = [
      MEDICINE_TIMINGS.MORNING,
      MEDICINE_TIMINGS.NOON,
      MEDICINE_TIMINGS.EVENING,
      MEDICINE_TIMINGS.NIGHT,
      MEDICINE_TIMINGS.AS_NEEDED,
    ];
    const medicineTimings = medTimingsArray
      .map((i) => {
        if (item.medicineTimings && item.medicineTimings.includes(i)) {
          return i;
        } else {
          return null;
        }
      })
      .filter((i) => i !== null);
    const unit: string =
      (medUnitFormatArray.find((i) => i.key === item.medicineUnit) || {}).value || 'others';
    if (medicineCustomDetails !== null) {
      return `${medicineCustomDetails}`;
    } else {
      return `${type + ' '}${customDosage.length > 0
        ? `${customDosage.join(' ' + unit + ' - ') + ' ' + unit + ' '}${medicineTimings && medicineTimings.length
          ? '(' +
          (medicineTimings.length > 1
            ? medicineTimings
              .slice(0, -1)
              .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
              .join(', ') +
            ' & ' +
            nameFormater(medicineTimings[medicineTimings.length - 1] || '', 'lower')
            : medicineTimings
              .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
              .join(', ')) +
          ') '
          : ''
        }${item.medicineConsumptionDurationInDays
          ? `for ${item.medicineConsumptionDurationInDays} ${item.medicineConsumptionDurationUnit
            ? `${item.medicineConsumptionDurationUnit.slice(0, -1).toLowerCase()}(s) `
            : ``
          }`
          : ''
        }${item.medicineConsumptionDurationUnit
          ? `${nameFormater(item.medicineConsumptionDurationUnit || '', 'lower')} `
          : ''
        }${item.medicineToBeTaken && item.medicineToBeTaken.length
          ? item.medicineToBeTaken
            .map((i: MEDICINE_TO_BE_TAKEN | null) => nameFormater(i || '', 'lower'))
            .join(', ') + '.'
          : ''
        }`
        : `${item.medicineDosage ? item.medicineDosage : ''} ${item.medicineUnit ? unit + ' ' : ''
        }${item.medicineFrequency
          ? item.medicineFrequency === MEDICINE_FREQUENCY.STAT
            ? 'STAT (Immediately) '
            : nameFormater(item.medicineFrequency, 'lower') + ' '
          : ''
        }${item.medicineConsumptionDurationInDays
          ? `for ${item.medicineConsumptionDurationInDays} ${item.medicineConsumptionDurationUnit
            ? `${item.medicineConsumptionDurationUnit.slice(0, -1).toLowerCase()}(s) `
            : ``
          }`
          : ''
        }${item.medicineConsumptionDurationUnit
          ? `${nameFormater(item.medicineConsumptionDurationUnit || '', 'lower')} `
          : ''
        }${item.medicineToBeTaken && item.medicineToBeTaken.length
          ? item.medicineToBeTaken
            .map((i: MEDICINE_TO_BE_TAKEN | null) => nameFormater(i || '', 'lower'))
            .join(', ') + ' '
          : ''
        }${medicineTimings && medicineTimings.length
          ? `${medicineTimings.includes(MEDICINE_TIMINGS.AS_NEEDED) &&
            medicineTimings.length === 1
            ? ''
            : 'in the '
          }` +
          (medicineTimings.length > 1
            ? medicineTimings
              .slice(0, -1)
              .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
              .join(', ') +
            ' & ' +
            nameFormater(medicineTimings[medicineTimings.length - 1] || '', 'lower') +
            ' '
            : medicineTimings
              .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
              .join(', ') + ' ')
          : ''
        }`
        }${item.medicineInstructions ? '\nInstructions: ' + item.medicineInstructions : ''}`;
    }
  };

  const renderPrescriptions = () => {
    return (
      <>
        {renderHeadingView(
          'Medicines',
          <MedicineRxIcon style={{ width: 20, height: 20, marginRight: 12 }} />
        )}
        {caseSheetDetails?.medicinePrescription &&
          caseSheetDetails?.medicinePrescription?.length !== 0 &&
          caseSheetDetails?.doctorType !== 'JUNIOR' ? (
          <View style={{ marginTop: 28 }}>
            <View>
              {caseSheetDetails?.medicinePrescription?.map((item) => {
                if (item)
                  return (
                    <>
                      <View>
                        {renderListItem(
                          item?.medicineName!,
                          _.capitalize(item?.routeOfAdministration!)
                        )}
                        <Text
                          style={{
                            ...theme.viewStyles.text('R', 13, '#0087BA', 1, 15),
                            paddingLeft: 35,
                            paddingRight: 15,
                            paddingBottom: 20,
                            flex: 1,
                          }}
                        >
                          {medicineDescription(item)}
                        </Text>
                      </View>
                    </>
                  );
              })}
              <TouchableOpacity
                onPress={() => {
                  onAddToCart();
                }}
              >
                <Text style={styles.quickActionButtons}>ORDER MEDICINES</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          renderNoData('No Medicines')
        )}
      </>
    );
  };

  const renderDiagnosis = () => {
    return (
      <>
        {renderHeadingView(
          'Diagnosis',
          <PhrDiagnosisIcon style={{ width: 20, height: 20, marginRight: 12 }} />
        )}
        {caseSheetDetails?.diagnosis !== null ? (
          <View style={{ marginTop: 28 }}>
            {caseSheetDetails?.diagnosis?.map((item) => {
              return renderListItem(item?.name!, '');
            })}
          </View>
        ) : (
          renderNoData('No diagnosis')
        )}
      </>
    );
  };

  const renderGenerealAdvice = () => {
    let listOfAdvices =
      caseSheetDetails?.otherInstructions?.map((item, i) => {
        if (item?.instruction !== '') {
          return `${item?.instruction}`;
        }
      }) || [];
    const listStrings = listOfAdvices.join('\n');
    return (
      <>
        {renderHeadingView(
          'General Advice',
          <PhrGeneralAdviceIcon style={styles.phrGeneralIconStyle} />
        )}
        {caseSheetDetails?.otherInstructions !== null ? (
          <View style={{ marginTop: 28 }}>{renderListItem(listStrings || '', '')}</View>
        ) : (
          renderNoData('No advice')
        )}
      </>
    );
  };

  const renderReferral = () => {
    return (
      <>
        {renderHeadingView('Referral', <PhrGeneralAdviceIcon style={styles.phrGeneralIconStyle} />)}
        {caseSheetDetails?.otherInstructions !== null ? (
          <View style={{ marginTop: 28 }}>
            {renderListItem('Consult \n' + caseSheetDetails?.referralSpecialtyName, '')}
            {renderListItem(
              'Reason for Referral\n' + caseSheetDetails?.referralDescription || '',
              ''
            )}
          </View>
        ) : (
          renderNoData('No advice')
        )}
      </>
    );
  };

  const renderFollowUp = () => {
    return (
      <>
        {renderHeadingView(
          'Follow up',
          <PHRFollowUpDarkIcon style={{ width: 20, height: 17.5, marginRight: 12 }} />
        )}
        {caseSheetDetails?.doctorType !== 'JUNIOR' ? (
          <View>
            {caseSheetDetails?.followUpAfterInDays
              ? renderListItem(
                `Recommended after ${caseSheetDetails?.followUpAfterInDays} days`,
                '',
                28
              )
              : renderNoData('No followup')}
          </View>
        ) : (
          renderNoData('No followup')
        )}
      </>
    );
  };

  const renderTestNotes = () => {
    return (
      <>
        {renderHeadingView(
          'Tests',
          <LabTestIcon style={{ width: 20, height: 21.13, marginRight: 12 }} />
        )}
        {caseSheetDetails?.diagnosticPrescription !== null ? (
          <View style={{ marginTop: 28 }}>
            {caseSheetDetails?.diagnosticPrescription?.map((item, index, array) => {
              return (
                <>
                  {renderListItem(item?.itemname!, '')}
                  {item?.testInstruction ? (
                    <Text
                      style={{
                        ...theme.viewStyles.text('R', 13, '#0087BA', 1, 15),
                        paddingLeft: 35,
                        paddingRight: 15,
                        paddingBottom: 20,
                        flex: 1,
                      }}
                    >
                      {item?.testInstruction}
                    </Text>
                  ) : null}
                </>
              );
            })}
            <TouchableOpacity
              onPress={() => {
                postWEGEvent('test');
                onAddTestsToCart();
              }}
            >
              <Text style={styles.quickActionButtons}>
                {strings.health_records_home.order_test}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          renderNoData('No Tests')
        )}
      </>
    );
  };

  const renderPlaceorder = () => {
    if (caseSheetDetails!.doctorType !== 'JUNIOR' && g(caseSheetDetails, 'blobName')) {
      return (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.orderMedicinesButton}
            onPress={() => {
              onAddToCart();
            }}
          >
            <Text style={styles.orderMedicineText}>ORDER MEDICINES NOW</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const getFileName = () => {
    if (props.navigation.state.params!.DoctorInfo && props.navigation.state.params!.DisplayId) {
      return (
        'Prescription_' +
        props.navigation.state.params!.DisplayId +
        '_' +
        moment(caseSheetDetails!.appointment!.appointmentDateTime).format('DD MM YYYY') +
        '_' +
        props.navigation.state.params!.DoctorInfo.displayName +
        '_Apollo 247' +
        new Date().getTime() +
        '.pdf'
      );
    } else {
      return 'Prescription_Apollo 247' + new Date().getTime() + '.pdf';
    }
  };

  const renderDetailsFinding = () => {
    if (caseSheetDetails)
      return (
        <View style={{ marginBottom: 20 }}>
          <CollapseCard
            heading="DETAILED FINDINGS"
            collapse={showPrescription}
            containerStyle={
              !showPrescription && {
                ...theme.viewStyles.cardViewStyle,
                marginHorizontal: 8,
              }
            }
            headingStyle={{ ...theme.viewStyles.text('SB', 18, '#02475B', 1, 23) }}
            labelViewStyle={styles.collapseCardLabelViewStyle}
            onPress={() => setshowPrescription(!showPrescription)}
          >
            <View style={{ marginTop: 11, marginBottom: 20 }}>
              <View
                style={[
                  styles.topCardViewStyle,
                  { marginTop: 4, marginBottom: 4, paddingTop: 16, paddingHorizontal: 0 },
                ]}
              >
                {renderSymptoms()}
                {renderPrescriptions()}
                {renderTestNotes()}
                {renderDiagnosis()}
                {renderGenerealAdvice()}
                {caseSheetDetails && caseSheetDetails?.referralSpecialtyName !== null
                  ? renderReferral()
                  : null}
                {/* {renderFollowUp()} */}
              </View>
            </View>
          </CollapseCard>
        </View>
      );
  };

  const onPressDownloadPrescripiton = () => {
    if (g(caseSheetDetails, 'blobName') == null) {
      Alert.alert('No Image');
      CommonLogEvent('CONSULT_DETAILS', 'No image');
    } else {
      postWEGEvent('download prescription');
      postCleverTapPHR(
        currentPatient,
        CleverTapEventName.PHR_DOWNLOAD_DOCTOR_CONSULTATION,
        'Doctor Consultation',
        caseSheetDetails
      );
      const dirs = RNFetchBlob.fs.dirs;

      const fileName: string = getFileName();

      const downloadPath =
        Platform.OS === 'ios'
          ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + (fileName || 'Apollo_Prescription.pdf')
          : dirs.DownloadDir + '/' + (fileName || 'Apollo_Prescription.pdf');
      setLoading && setLoading(true);
      RNFetchBlob.config({
        fileCache: true,
        path: downloadPath,
        addAndroidDownloads: {
          title: fileName,
          useDownloadManager: true,
          notification: true,
          path: downloadPath,
          mime: mimeType(downloadPath),
          description: 'File downloaded by download manager.',
        },
      })
        .fetch(
          'GET',
          AppConfig.Configuration.DOCUMENT_BASE_URL.concat(caseSheetDetails!.blobName!),
          {
            //some headers ..
          }
        )
        .then((res) => {
          setLoading && setLoading(false);
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(res.path())
            : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
        })
        .catch((err) => {
          CommonBugFender('ConsultDetails_renderFollowUp', err);
          setLoading && setLoading(false);
        });
    }
  };

  const renderHeadingView = (title: string, icon: React.ReactNode) => {
    return (
      <View style={{ flexDirection: 'row', marginHorizontal: 10, marginTop: 22 }}>
        {icon}
        <Text style={{ ...theme.viewStyles.text('SB', 16, '#02475B', 1, 20.8) }}>{title}</Text>
      </View>
    );
  };

  const renderNoData = (noDataText: string) => {
    return (
      <View style={{ marginLeft: 30, marginTop: 20 }}>
        <Text style={styles.labelStyle}>{noDataText}</Text>
      </View>
    );
  };

  const renderListItem = (title: string, rightTitle: string, marginTop: number = 0) => {
    const renderListItemRightComponent = () => {
      return (
        <Text
          style={{
            ...theme.viewStyles.text('SB', 14, '#0087BA', 1, 18.2),
          }}
        >
          {rightTitle}
        </Text>
      );
    };
    return title ? (
      <ListItem
        title={title}
        titleStyle={{ ...theme.viewStyles.text('R', 14, '#02475B', 1, 18.2) }}
        pad={0}
        containerStyle={[styles.listItemContainerStyle, { marginTop: marginTop }]}
        underlayColor={'#FFFFFF'}
        activeOpacity={1}
        leftElement={<View style={styles.blueCirleViewStyle} />}
        rightElement={renderListItemRightComponent()}
      />
    ) : null;
  };

  if (g(caseSheetDetails, 'appointment', 'doctorInfo')) {
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            title={'DOCTOR CONSULTATIONS DETAILS'}
            leftIcon="backArrow"
            onPressLeftIcon={() => props.navigation.goBack()}
            rightComponent={
              <ProfileImageComponent
                onPressProfileImage={() => props.navigation.pop(2)}
                currentPatient={currentPatient}
              />
            }
          />

          <ScrollView bounces={false}>
            {caseSheetDetails && renderTopDetailsView()}
            {renderDetailsFinding()}
          </ScrollView>
          {caseSheetDetails && renderPlaceorder()}
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
              isInitiatedByDoctor={false}
            />
          )}
        </SafeAreaView>
        {loading && <Spinner />}
        {showNotExistAlert && (
          <BottomPopUp
            title={'Alert!'}
            description={
              'No consultation happened, hence there is no case sheet for this appointment'
            }
          >
            <View style={{ height: 60, alignItems: 'flex-end' }}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.gotItStyles}
                onPress={() => {
                  setshowNotExistAlert(false);
                  props.navigation.goBack();
                }}
              >
                <Text style={styles.gotItTextStyles}>OK, GOT IT</Text>
              </TouchableOpacity>
            </View>
          </BottomPopUp>
        )}
      </View>
    );
  } else {
    return (
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        <Header
          title={'DOCTOR CONSULTATIONS DETAILS'}
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
          rightComponent={
            <ProfileImageComponent
              onPressProfileImage={() => props.navigation.pop(2)}
              currentPatient={currentPatient}
            />
          }
        />
      </SafeAreaView>
    );
  }
};
