import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CHECK_IF_FOLLOWUP_BOOKED,
  GET_CASESHEET_DETAILS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getCaseSheet,
  getCaseSheetVariables,
  getCaseSheet_getCaseSheet_caseSheetDetails,
  getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  getCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
} from '@aph/mobile-patients/src/graphql/types/getCaseSheet';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import { checkIfFollowUpBooked } from '@aph/mobile-patients/src/graphql/types/checkIfFollowUpBooked';
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  EPrescription,
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Download } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  MEDICINE_UNIT,
  MEDICINE_CONSUMPTION_DURATION,
  AppointmentType,
  APPOINTMENT_TYPE,
  MEDICINE_TO_BE_TAKEN,
  MEDICINE_TIMINGS,
  MEDICINE_FORM_TYPES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { useUIElements } from '../UIElementsProvider';
import { mimeType } from '../../helpers/mimeType';
import {
  handleGraphQlError,
  g,
  addTestsToCart,
  doRequestAndAccessLocation,
  postWebEngageEvent,
  nameFormater,
  medUnitFormatArray,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  useDiagnosticsCart,
  DiagnosticsCartItem,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  useAppCommonData,
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo } from '@aph/mobile-patients/src/graphql/types/getAppointmentData';

const styles = StyleSheet.create({
  imageView: {
    width: 80,
    marginLeft: 20,
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    textTransform: 'capitalize',
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
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
});

export interface ConsultDetailsProps
  extends NavigationScreenProps<{
    CaseSheet: string; // this is the appointmentId
    DoctorInfo:
      | getDoctorDetailsById_getDoctorDetailsById
      | getAppointmentData_getAppointmentData_appointmentsHistory_doctorInfo;
    // PatientId: any;
    appointmentType: APPOINTMENT_TYPE | AppointmentType;
    // appointmentDate: any;
    DisplayId: any;
    Displayoverlay: any;
    isFollowcount: any;
    BlobName: string;
  }> {}

type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};

export const ConsultDetails: React.FC<ConsultDetailsProps> = (props) => {
  const data = props.navigation.state.params!.DoctorInfo;
  const appointmentType = props.navigation.getParam('appointmentType');
  const appointmentId = props.navigation.getParam('CaseSheet');
  console.log('phr', data);

  // const [loading, setLoading && setLoading] = useState<boolean>(true);
  const { loading, setLoading } = useUIElements();

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
  const [testShow, setTestShow] = useState<boolean>(true);
  const [showNotExistAlert, setshowNotExistAlert] = useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    setLoading && setLoading(true);
    client
      .query<getCaseSheet, getCaseSheetVariables>({
        query: GET_CASESHEET_DETAILS,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentId: props.navigation.state.params!.CaseSheet,
        },
      })
      .then((_data) => {
        setLoading && setLoading(false);
        props.navigation.state.params!.DisplayId = _data.data.getCaseSheet!.caseSheetDetails!.appointment!.displayId;
        setcaseSheetDetails(_data.data.getCaseSheet!.caseSheetDetails!);
      })
      .catch((error) => {
        CommonBugFender('ConsultDetails_GET_CASESHEET_DETAILS', error);
        setLoading && setLoading(false);
        const errorMessage = error && error.message.split(':')[1].trim();
        console.log(errorMessage, 'err');
        if (errorMessage === 'NO_CASESHEET_EXIST') {
          setshowNotExistAlert(true);
        }
        // Alert.alert('Error');
      });
  }, []);

  const postWEGEvent = (type: 'medicine' | 'test' | 'download prescription') => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS]
      | WebEngageEvents[WebEngageEventName.ORDER_TESTS_FROM_PRESCRIPTION_DETAILS]
      | WebEngageEvents[WebEngageEventName.DOWNLOAD_PRESCRIPTION] = {
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
      (eventAttributes as WebEngageEvents[WebEngageEventName.DOWNLOAD_PRESCRIPTION])[
        'Download Screen'
      ] = 'Prescription Details';
    }
    postWebEngageEvent(
      type == 'medicine'
        ? WebEngageEventName.ORDER_MEDICINES_FROM_PRESCRIPTION_DETAILS
        : type == 'test'
        ? WebEngageEventName.ORDER_TESTS_FROM_PRESCRIPTION_DETAILS
        : WebEngageEventName.DOWNLOAD_PRESCRIPTION,
      eventAttributes
    );
  };

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
                  props.navigation.state.params!.DoctorInfo.displayName}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.timeStyle}>
                  {caseSheetDetails &&
                    moment(caseSheetDetails!.appointment!.appointmentDateTime).format(
                      'DD MMM YYYY'
                    )}
                </Text>
                <Text style={styles.timeStyle}>{','}</Text>

                <Text style={styles.timeStyle}>
                  {props.navigation.state.params!.appointmentType == 'ONLINE'
                    ? 'Online'
                    : 'Physical'}{' '}
                  Consult
                </Text>
              </View>
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
            {/* <Text style={styles.descriptionStyle}>
              This is a follow-up consult to the {props.navigation.state.params!.appointmentType}{' '}
              Visit on{' '}
              {caseSheetDetails && moment(caseSheetDetails.followUpDate).format('DD MMM YYYY')}
            </Text> */}
            <Text
              style={[theme.viewStyles.yellowTextStyle, { textAlign: 'right', paddingBottom: 16 }]}
              onPress={() => {
                CommonLogEvent('CONSULT_DETAILS', 'Go back to tab bar'),
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
  const { addMultipleCartItems, ePrescriptions, setEPrescriptions } = useShoppingCart();
  const {
    addMultipleCartItems: addMultipleTestCartItems,
    addMultipleEPrescriptions: addMultipleTestEPrescriptions,
  } = useDiagnosticsCart();
  const { locationDetails, setLocationDetails } = useAppCommonData();

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
      []) as getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[];
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
    addTestsToCart(testPrescription, client, g(locationDetails || location, 'city') || '')
      .then((tests: DiagnosticsCartItem[]) => {
        // Adding ePrescriptions to DiagnosticsCart
        const unAvailableItemsArray = testPrescription.filter(
          (item) => !tests.find((val) => val.name == item.itemname!)
        );

        const unAvailableItems = unAvailableItemsArray.map((item) => item.itemname).join(', ');

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
          Alert.alert(
            'Uh oh.. :(',
            `Unfortunately, we do not have any diagnostic(s) available right now.`
          );
        } else if (unAvailableItems) {
          Alert.alert(
            'Uh oh.. :(',
            `Out of ${testPrescription.length} diagnostic(s), you are trying to order, following diagnostic(s) are not available.\n\n${unAvailableItems}\n`
          );
        }
      })
      .catch((e) => {
        Alert.alert('Uh oh.. :(', e);
      });
    props.navigation.push(AppRoutes.TestsCart, {
      isComingFromConsult: true,
    });
  };

  const getDaysCount = (type: MEDICINE_CONSUMPTION_DURATION | null) => {
    return type == MEDICINE_CONSUMPTION_DURATION.MONTHS
      ? 30
      : type == MEDICINE_CONSUMPTION_DURATION.WEEKS
      ? 7
      : 1;
  };

  const getQuantity = (
    medicineUnit: MEDICINE_UNIT | null,
    medicineTimings: (MEDICINE_TIMINGS | null)[] | null,
    medicineDosage: string | null,
    medicineCustomDosage: string | null /** E.g: (1-0-1/2-0.5), (1-0-2\3-3) etc.*/,
    medicineConsumptionDurationInDays: string | null,
    medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null,
    mou: number // how many tablets per strip
  ) => {
    if (medicineUnit == MEDICINE_UNIT.TABLET || medicineUnit == MEDICINE_UNIT.CAPSULE) {
      const medicineDosageMapping = medicineCustomDosage
        ? medicineCustomDosage.split('-').map((item) => {
            if (item.indexOf('/') > -1) {
              const dosage = item.split('/').map((item) => Number(item));
              return (dosage[0] || 1) / (dosage[1] || 1);
            } else if (item.indexOf('\\') > -1) {
              const dosage = item.split('\\').map((item) => Number(item));
              return (dosage[0] || 1) / (dosage[1] || 1);
            } else {
              return Number(item);
            }
          })
        : medicineDosage
        ? Array.from({ length: 4 }).map(() => Number(medicineDosage))
        : [1, 1, 1, 1];

      const medicineTimingsPerDayCount =
        (medicineTimings || []).reduce(
          (currTotal, currItem) =>
            currTotal +
            (currItem == MEDICINE_TIMINGS.MORNING
              ? medicineDosageMapping[0]
              : currItem == MEDICINE_TIMINGS.NOON
              ? medicineDosageMapping[1]
              : currItem == MEDICINE_TIMINGS.EVENING
              ? medicineDosageMapping[2]
              : currItem == MEDICINE_TIMINGS.NIGHT
              ? medicineDosageMapping[3]
              : (medicineDosage && Number(medicineDosage)) || 1),
          0
        ) || 1;

      console.log({ medicineTimingsPerDayCount });

      const totalTabletsNeeded =
        medicineTimingsPerDayCount *
        Number(medicineConsumptionDurationInDays || '1') *
        getDaysCount(medicineConsumptionDurationUnit);

      console.log({ totalTabletsNeeded });

      return Math.ceil(totalTabletsNeeded / mou);
    } else {
      // 1 for other than tablet or capsule
      return 1;
    }
  };

  const onAddToCart = () => {
    setLoading && setLoading(true);

    const medPrescription = (caseSheetDetails!.medicinePrescription || []).filter(
      (item) => item!.id
    );

    const docUrl = AppConfig.Configuration.DOCUMENT_BASE_URL.concat(caseSheetDetails!.blobName!);
    Promise.all(medPrescription.map((item) => getMedicineDetailsApi(item!.id!)))
      .then((result) => {
        console.log('Promise.all medPrescription result', { result });
        setLoading && setLoading(false);
        const medicinesAll = result.map(({ data: { productdp } }, index) => {
          const medicineDetails = (productdp && productdp[0]) || {};
          if (medicineDetails.id == 0) {
            return null;
          }
          const item = medPrescription[index]!;
          const qty = getQuantity(
            item.medicineUnit,
            item.medicineTimings,
            item.medicineDosage,
            item.medicineCustomDosage,
            item.medicineConsumptionDurationInDays,
            item.medicineConsumptionDurationUnit,
            parseInt(medicineDetails.mou || '1', 10)
          );

          return {
            id: medicineDetails!.sku!,
            mou: medicineDetails.mou,
            name: medicineDetails!.name,
            price: medicineDetails!.price,
            specialPrice: medicineDetails.special_price
              ? typeof medicineDetails.special_price == 'string'
                ? parseInt(medicineDetails.special_price)
                : medicineDetails.special_price
              : undefined,
            // quantity: parseInt(medPrescription[index]!.medicineDosage!),
            quantity: qty,
            prescriptionRequired: medicineDetails.is_prescription_required == '1',
            isMedicine: medicineDetails.type_id == 'Pharma',
            thumbnail: medicineDetails.thumbnail || medicineDetails.image,
            isInStock: !!medicineDetails.is_in_stock,
          } as ShoppingCartItem;
        });
        const medicines = medicinesAll.filter((item) => !!item);
        console.log({ medicinesAll });
        console.log({ medicines });

        addMultipleCartItems!(medicines as ShoppingCartItem[]);

        const totalItems = (caseSheetDetails!.medicinePrescription || []).length;
        // const customItems = medicinesAll.length - medicines.length;
        const outOfStockItems = medicines.filter((item) => !item!.isInStock).length;
        const outOfStockMeds = medicines
          .filter((item) => !item!.isInStock)
          .map((item) => `${item!.name}`)
          .join(', ');

        if (outOfStockItems > 0) {
          const alertMsg =
            totalItems == outOfStockItems
              ? 'Unfortunately, we do not have any medicines available right now.'
              : `Out of ${totalItems} medicines, you are trying to order, following medicine(s) are out of stock.\n\n${outOfStockMeds}\n`;
          Alert.alert('Uh oh.. :(', alertMsg);
        }

        // if (medPrescription.length > medicines.filter((item) => item!.isInStock).length) {
        //   // const outOfStockCount = medPrescription.length - medicines.length;
        //   // props.navigation.push(AppRoutes.YourCart, { isComingFromConsult: true });
        // }

        const rxMedicinesCount =
          medicines.length == 0 ? 0 : medicines.filter((item) => item!.prescriptionRequired).length;

        const presToAdd = {
          id: caseSheetDetails!.id,
          date: moment(caseSheetDetails!.appointment!.appointmentDateTime).format('DD MMM YYYY'),
          doctorName: g(data, 'displayName') || '',
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
        CommonBugFender('ConsultDetails_onAddToCart', e);
        setLoading && setLoading(false);
        console.log({ e });
        handleGraphQlError(e);
      });
  };

  const medicineDescription = (
    item: getCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription
  ) => {
    const type = item.medicineFormTypes === MEDICINE_FORM_TYPES.OTHERS ? 'Take' : 'Apply';
    const customDosage = item.medicineCustomDosage
      ? item.medicineCustomDosage.split('-').filter((i) => i !== '')
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
    return `${type + ' '}${
      customDosage.length > 0
        ? `${customDosage.join(' ' + unit + ' - ') + ' ' + unit + ' '}${
            medicineTimings && medicineTimings.length
              ? '(' +
                (medicineTimings.length > 1
                  ? medicineTimings
                      .slice(0, -1)
                      .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
                      .join(', ') +
                    ' & ' +
                    nameFormater(medicineTimings[medicineTimings.length - 1] || '', 'lower') +
                    ') '
                  : medicineTimings
                      .map((i: MEDICINE_TIMINGS | null) => nameFormater(i || '', 'lower'))
                      .join(', ') + ' ')
              : ''
          }${
            item.medicineConsumptionDurationInDays
              ? `for ${item.medicineConsumptionDurationInDays} ${
                  item.medicineConsumptionDurationUnit
                    ? `${item.medicineConsumptionDurationUnit.slice(0, -1).toLowerCase()}(s) `
                    : ``
                }`
              : ''
          }${
            item.medicineToBeTaken && item.medicineToBeTaken.length
              ? item.medicineToBeTaken
                  .map((i: MEDICINE_TO_BE_TAKEN | null) => nameFormater(i || '', 'lower'))
                  .join(', ') + '.'
              : ''
          }`
        : `${item.medicineDosage ? item.medicineDosage : ''} ${
            item.medicineUnit ? unit + ' ' : ''
          }${item.medicineFrequency ? nameFormater(item.medicineFrequency, 'lower') + ' ' : ''}${
            item.medicineConsumptionDurationInDays
              ? `for ${item.medicineConsumptionDurationInDays} ${
                  item.medicineConsumptionDurationUnit
                    ? `${item.medicineConsumptionDurationUnit.slice(0, -1).toLowerCase()}(s) `
                    : ``
                }`
              : ''
          }${
            item.medicineToBeTaken && item.medicineToBeTaken.length
              ? item.medicineToBeTaken
                  .map((i: MEDICINE_TO_BE_TAKEN | null) => nameFormater(i || '', 'lower'))
                  .join(', ') + ' '
              : ''
          }${
            medicineTimings && medicineTimings.length
              ? `${
                  medicineTimings.includes(MEDICINE_TIMINGS.AS_NEEDED) &&
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
    }${
      item.routeOfAdministration
        ? `\nTo be taken: ${nameFormater(item.routeOfAdministration, 'title')}`
        : ''
    }${item.medicineInstructions ? '\nInstuctions: ' + item.medicineInstructions : ''}`;
  };

  const renderPrescriptions = () => {
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

                        <Text style={styles.dataTextStyle}>{medicineDescription(item)}</Text>
                      </View>
                    );
                })}
                <TouchableOpacity
                  onPress={() => {
                    postWEGEvent('medicine');
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
    return (
      <View>
        <CollapseCard
          heading={`PROVISIONAL DIAGNOSED MEDICAL CONSITION\n(ACCEPTABLE IN ICD-10 NOMENCLATURE)`}
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
                  {caseSheetDetails!.followUpAfterInDays! <= '7' ? (
                    <Text style={styles.dataTextStyle}>
                      Recommended after {caseSheetDetails!.followUpAfterInDays} days
                    </Text>
                  ) : (
                    <Text style={styles.dataTextStyle}>
                      Follow up on {moment(caseSheetDetails!.followUpDate).format('DD MMM YYYY')}{' '}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    CommonLogEvent('CONSULT_DETAILS', 'Check if follow book api called');

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

                        setdisplayoverlay(true);
                      })
                      .catch((error) => {
                        CommonBugFender('ConsultDetails_renderFollowUp', error);
                        console.log('Error occured', { error });
                      });
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

  const renderTestNotes = () => {
    console.log('caseSheetDetails', caseSheetDetails);
    return (
      <View>
        <CollapseCard
          heading="PRESCRIBED TESTS"
          collapse={testShow}
          onPress={() => setTestShow(!testShow)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
            {caseSheetDetails!.diagnosticPrescription &&
            caseSheetDetails!.diagnosticPrescription !== null ? (
              <View>
                {caseSheetDetails!.diagnosticPrescription.map((item, index, array) => {
                  return (
                    <>
                      <Text style={styles.labelStyle}>{item!.itemname}</Text>
                      <Spearator style={{ marginBottom: index == array.length - 1 ? 2.5 : 11.5 }} />
                    </>
                  );
                })}
                <TouchableOpacity
                  style={{ marginTop: 12 }}
                  onPress={() => {
                    postWEGEvent('test');
                    onAddTestsToCart();
                  }}
                >
                  <Text
                    style={[
                      theme.viewStyles.yellowTextStyle,
                      { textAlign: 'right', paddingBottom: 16 },
                    ]}
                  >
                    {strings.health_records_home.order_test}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.labelStyle}>No Tests</Text>
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
          {renderTestNotes()}
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
            title="PRESCRIPTION DETAILS"
            leftIcon="backArrow"
            onPressLeftIcon={() => props.navigation.goBack()}
            rightComponent={
              <View style={{ flexDirection: 'row' }}>
                {/* <TouchableOpacity activeOpacity={1} style={{ marginRight: 20 }} onPress={() => {}}>
                  <ShareGreen />
                </TouchableOpacity> */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    if (props.navigation.state.params!.BlobName == null) {
                      Alert.alert('No Image');
                      CommonLogEvent('CONSULT_DETAILS', 'No image');
                    } else {
                      postWEGEvent('download prescription');
                      let dirs = RNFetchBlob.fs.dirs;

                      console.log('blollb', props.navigation.state.params!.BlobName);
                      let fileName: string =
                        props.navigation.state.params!.BlobName.substring(
                          0,
                          props.navigation.state.params!.BlobName.indexOf('.pdf')
                        ) + '.pdf';
                      const downloadPath =
                        Platform.OS === 'ios'
                          ? (dirs.DocumentDir || dirs.MainBundleDir) +
                            '/' +
                            (fileName || 'Apollo_Prescription.pdf')
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
                          AppConfig.Configuration.DOCUMENT_BASE_URL.concat(
                            props.navigation.state.params!.BlobName
                          ),
                          {
                            //some headers ..
                          }
                        )
                        .then((res) => {
                          setLoading && setLoading(false);
                          // if (Platform.OS === 'android') {
                          //   Alert.alert('Download Complete');
                          // }
                          Platform.OS === 'ios'
                            ? RNFetchBlob.ios.previewDocument(res.path())
                            : RNFetchBlob.android.actionViewIntent(
                                res.path(),
                                mimeType(res.path())
                              );
                        })
                        .catch((err) => {
                          CommonBugFender('ConsultDetails_renderFollowUp', err);
                          console.log('error ', err);
                          setLoading && setLoading(false);
                          // ...
                        });
                    }
                  }}
                >
                  {props.navigation.state.params!.BlobName ? <Download /> : null}
                </TouchableOpacity>
              </View>
            }
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
  return null;
};
