import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  MedicineIcon,
  OnlineConsult,
  PrescriptionSkyBlue,
  TrackerBig,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { getDoctorDetailsById_getDoctorDetailsById_specialty } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription } from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  g,
  handleGraphQlError,
  addTestsToCart,
  doRequestAndAccessLocation,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  EPrescription,
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import RNFetchBlob from 'rn-fetch-blob';
import {
  MEDICINE_UNIT,
  MEDICINE_CONSUMPTION_DURATION,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { mimeType } from '../../helpers/mimeType';
import { useDiagnosticsCart, DiagnosticsCartItem } from '../DiagnosticsCartProvider';
import { getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription } from '../../graphql/types/getCaseSheet';
import { useUIElements } from '../UIElementsProvider';
import { useAppCommonData, LocationData } from '../AppCommonDataProvider';
import { useApolloClient } from 'react-apollo-hooks';
import { WebEngageEventName, WebEngageEvents } from '../../helpers/webEngageEvents';

const styles = StyleSheet.create({
  viewStyle: {
    flexDirection: 'row',
  },
  trackerViewStyle: {
    width: 44,
    alignItems: 'center',
  },
  trackerLineStyle: {
    flex: 1,
    width: 4,
    alignSelf: 'center',
    backgroundColor: theme.colors.SKY_BLUE,
  },
  labelTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.LIGHT_BLUE,
    paddingLeft: 4,
  },
  cardContainerStyle: {
    flex: 1,
    ...theme.viewStyles.cardViewStyle,
    marginTop: 8,
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 4,
    padding: 16,
  },
  rightViewStyle: {
    flex: 1,
  },
  imageView: {
    marginRight: 16,
  },
  doctorNameStyles: {
    paddingTop: 4,
    paddingBottom: 8,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
  },
  separatorStyles: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    marginVertical: 7,
  },
  descriptionTextStyles: {
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.TEXT_LIGHT_BLUE,
    lineHeight: 20,
    letterSpacing: 0.04,
  },

  profileImageStyle: { width: 40, height: 40, borderRadius: 20 },
  yellowTextStyle: {
    ...theme.fonts.IBMPlexSansBold(12),
    lineHeight: 20,
    color: theme.colors.APP_YELLOW,
  },
});

type rowData = {
  id?: string;
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  qualification?: string | null;
  mobileNumber?: string;
  experience?: string | null;
  specialization?: string | null;
  languages?: string | null;
  city?: string | null;
  awards?: string | null;
  photoUrl?: string | null;
  specialty?: getDoctorDetailsById_getDoctorDetailsById_specialty;
  registrationNumber?: string;
  onlineConsultationFees?: string;
  physicalConsultationFees?: string;
  status: string;
  desease: string;
};

export interface HealthConsultViewProps extends NavigationScreenProps {
  PastData?: any; //getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults;
  onPressOrder?: () => void;
  onClickCard?: () => void;
  onFollowUpClick?: (PastData: any) => void;
}

export const HealthConsultView: React.FC<HealthConsultViewProps> = (props) => {
  const { addMultipleCartItems, setEPrescriptions, ePrescriptions } = useShoppingCart();
  const {
    addMultipleCartItems: addMultipleTestCartItems,
    addMultipleEPrescriptions: addMultipleTestEPrescriptions,
  } = useDiagnosticsCart();
  const { locationDetails, setLocationDetails } = useAppCommonData();
  const { setLoading: setGlobalLoading } = useUIElements();
  const [loading, setLoading] = useState<boolean>(true);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  // console.log(props.PastData, 'pastData');

  let item = (g(props, 'PastData', 'caseSheet') || []).find((obj: any) => {
    return (
      obj!.doctorType === 'STAR_APOLLO' ||
      obj!.doctorType === 'APOLLO' ||
      obj!.doctorType === 'PAYROLL'
    );
  });

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
  });

  const downloadPrescription = () => {
    console.log('pharama', item);
    if (item.blobName == null) {
      Alert.alert('No Image');
    } else {
      let dirs = RNFetchBlob.fs.dirs;

      let fileName: string = item.blobName.substring(0, item.blobName.indexOf('.pdf')) + '.pdf';
      const downloadPath =
        Platform.OS === 'ios'
          ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + (fileName || 'Apollo_Prescription.pdf')
          : dirs.DownloadDir + '/' + (fileName || 'Apollo_Prescription.pdf');
      setLoading(true);
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
        .fetch('GET', AppConfig.Configuration.DOCUMENT_BASE_URL.concat(item.blobName), {
          //some headers ..
        })
        .then((res) => {
          setLoading(false);
          if (Platform.OS === 'android') {
            Alert.alert('Download Complete');
          }
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(res.path())
            : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
        })
        .catch((err) => {
          CommonBugFender('HealthConsultView_downloadPrescription', err);
          console.log('error ', err);
          setLoading(false);
          // ...
        });
    }
  };

  const postOrderMedsAndTestsEvent = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHR_ORDER_MEDS_TESTS] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Consult ID': g(props.PastData, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.PHR_ORDER_MEDS_TESTS, eventAttributes);
  };

  const requestReadSmsPermission = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        resuts[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (resuts) {
      }
    } catch (error) {
      CommonBugFender('HealthConsultView_requestReadSmsPermission_try', error);
      console.log('error', error);
    }
  };
  if (props.PastData || (props.PastData && props.PastData!.patientId!))
    return (
      <View style={styles.viewStyle}>
        <View style={styles.trackerViewStyle}>
          <TrackerBig />
          <View style={styles.trackerLineStyle} />
        </View>
        {props.PastData!.patientId != null ? (
          <View style={styles.rightViewStyle}>
            {moment(new Date()).format('DD/MM/YYYY') ===
            moment(new Date(props.PastData!.appointmentDateTime)).format('DD/MM/YYYY') ? (
              <Text style={styles.labelTextStyle}>
                Today ,{' '}
                {moment(new Date(props.PastData!.appointmentDateTime)).format('DD MMM YYYY')}
              </Text>
            ) : (
              <Text style={styles.labelTextStyle}>
                {moment(new Date(props.PastData!.appointmentDateTime)).format('DD MMM YYYY')}
              </Text>
            )}

            <TouchableOpacity
              activeOpacity={1}
              style={[styles.cardContainerStyle]}
              onPress={() => {
                CommonLogEvent('HEALTH_CONSULT_VIEW', 'On click card'),
                  props.onClickCard && props.onClickCard();
              }}
            >
              <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.imageView}>
                    {/* {data.image} */}
                    {!!(
                      props.PastData &&
                      props.PastData.doctorInfo &&
                      props.PastData.doctorInfo.photoUrl &&
                      props.PastData.doctorInfo.photoUrl.match(
                        /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/
                      )
                    ) && (
                      <Image
                        style={styles.profileImageStyle}
                        source={{ uri: props.PastData.doctorInfo.photoUrl }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity activeOpacity={1}>
                      <Text style={styles.doctorNameStyles}>
                        {props.PastData!.doctorInfo && props.PastData!.doctorInfo.fullName}
                      </Text>
                    </TouchableOpacity>
                    <View>
                      {props.PastData!.isFollowUp ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={styles.descriptionTextStyles}>
                            Follow-up {props.PastData!.followUpTo}
                          </Text>
                          <OnlineConsult />
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={styles.descriptionTextStyles}>New Consult</Text>
                          <OnlineConsult />
                        </View>
                      )}
                    </View>
                    <View style={styles.separatorStyles} />
                    <View
                      style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}
                    >
                      <View>
                        {g(item, 'symptoms') ? (
                          <View>
                            <View style={{ flexDirection: 'column' }}>
                              {item.symptoms.map((value: any) => {
                                return (
                                  <View style={{ flex: 1, paddingRight: 20 }}>
                                    <Text
                                      style={{
                                        paddingLeft: 0,
                                        ...theme.fonts.IBMPlexSansMedium(12),
                                        color: theme.colors.TEXT_LIGHT_BLUE,
                                        lineHeight: 20,
                                        letterSpacing: 0.04,
                                        width: 160,
                                      }}
                                      numberOfLines={2}
                                    >
                                      {value.symptom}
                                    </Text>
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        ) : (
                          <Text style={styles.descriptionTextStyles}>No Symptoms</Text>
                        )}
                      </View>

                      <View>
                        {g(item, 'blobName') ? (
                          <TouchableOpacity
                            onPress={() => {
                              CommonLogEvent('HEALTH_CONSULT_VIEW', 'Download Prescription'),
                                downloadPrescription();
                            }}
                          >
                            <PrescriptionSkyBlue />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </View>
                <View
                  style={[theme.viewStyles.darkSeparatorStyle, { marginTop: 8, marginBottom: 15 }]}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  {g(item, 'medicinePrescription') || g(item, 'diagnosticPrescription') ? (
                    <Text
                      style={styles.yellowTextStyle}
                      onPress={async () => {
                        postOrderMedsAndTestsEvent();
                        let item =
                          props.PastData!.caseSheet &&
                          props.PastData!.caseSheet.find((obj: any) => {
                            return (
                              obj.doctorType === 'STAR_APOLLO' ||
                              obj.doctorType === 'APOLLO' ||
                              obj.doctorType === 'PAYROLL'
                            );
                          });

                        if (item == undefined) {
                          Alert.alert('Uh oh.. :(', 'No medicines or tests found.');
                          CommonLogEvent('HEALTH_CONSULT_VIEW', 'No medicines prescribed');
                        } else {
                          if (item.medicinePrescription || item.diagnosticPrescription) {
                            //write here stock condition

                            setGlobalLoading!(true);

                            let location: LocationData | null = null;

                            const medPrescription = ((item.medicinePrescription ||
                              []) as getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription[]).filter(
                              (item) => item!.id
                            );
                            const docUrl = AppConfig.Configuration.DOCUMENT_BASE_URL.concat(
                              item!.blobName!
                            );
                            const getDaysCount = (type: MEDICINE_CONSUMPTION_DURATION) => {
                              return type == MEDICINE_CONSUMPTION_DURATION.MONTHS
                                ? 30
                                : type == MEDICINE_CONSUMPTION_DURATION.WEEKS
                                ? 7
                                : 1;
                            };

                            console.log('diagnosticPrescription', {
                              a: item.diagnosticPrescription,
                            });

                            const testPrescription = (item.diagnosticPrescription ||
                              []) as getCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[];

                            const presToAdd = {
                              id: item.id,
                              date: moment(g(props.PastData, 'appointmentDateTime')).format(
                                'DD MMM YYYY'
                              ),
                              doctorName: g(props.PastData, 'doctorInfo', 'displayName') || '',
                              forPatient: (currentPatient && currentPatient.firstName) || '',
                              medicines: [].map((item: any) => item!.name).join(', '),
                              uploadedUrl: docUrl,
                            } as EPrescription;

                            Promise.all(
                              medPrescription.map((item: any) => getMedicineDetailsApi(item!.id!))
                            )
                              .then(async (result) => {
                                const medicineAll = result.map(({ data: { productdp } }, index) => {
                                  const medicineDetails = (productdp && productdp[0]) || {};
                                  if (medicineDetails.id == 0) {
                                    return null;
                                  }

                                  const _qty =
                                    medPrescription[index]!.medicineUnit == MEDICINE_UNIT.CAPSULE ||
                                    medPrescription[index]!.medicineUnit == MEDICINE_UNIT.TABLET
                                      ? ((medPrescription[index]!.medicineTimings || []).length ||
                                          1) *
                                        getDaysCount(
                                          medPrescription[index]!.medicineConsumptionDurationUnit!
                                        ) *
                                        parseInt(
                                          medPrescription[index]!
                                            .medicineConsumptionDurationInDays || '1',
                                          10
                                        )
                                      : 1;
                                  const qty = Math.ceil(
                                    _qty / parseInt(medicineDetails.mou || '1')
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
                                    quantity: qty,
                                    prescriptionRequired:
                                      medicineDetails.is_prescription_required == '1',
                                    thumbnail: medicineDetails.thumbnail || medicineDetails.image,
                                    isInStock: !!medicineDetails.is_in_stock,
                                  } as ShoppingCartItem;
                                });
                                const medicines = medicineAll.filter((item: any) => !!item);

                                addMultipleCartItems!(medicines as ShoppingCartItem[]);

                                const totalItems = (item.medicinePrescription || []).length;
                                // const customItems = medicineAll.length - medicines.length;
                                const outOfStockItems = medicines.filter((item) => !item!.isInStock)
                                  .length;
                                const outOfStockMeds = medicines
                                  .filter((item) => !item!.isInStock)
                                  .map((item) => `${item!.name}`)
                                  .join(', ');

                                if (outOfStockItems > 0) {
                                  const alertMsg =
                                    totalItems == outOfStockItems
                                      ? 'Unfortunately, we do not have any medicines available right now.'
                                      : `Out of ${totalItems} medicines, you are trying to order, following medicine(s) are out of stock.\n\n${outOfStockMeds}\n`;
                                  // Alert.alert('Uh oh.. :(', alertMsg);
                                }

                                const rxMedicinesCount =
                                  medicines.length == 0
                                    ? 0
                                    : medicines.filter((item: any) => item!.prescriptionRequired)
                                        .length;

                                if (rxMedicinesCount) {
                                  setEPrescriptions!([
                                    ...ePrescriptions.filter((item) => !(item.id == presToAdd.id)),
                                    {
                                      ...presToAdd,
                                      medicines: medicines
                                        .map((item: any) => item!.name)
                                        .join(', '),
                                    },
                                  ]);
                                }
                                // Adding tests to DiagnosticsCart
                                if (!locationDetails) {
                                  // Alert.alert(
                                  //   'Uh oh.. :(',
                                  //   'Our diagnostic services are only available in Chennai and Hyderabad for now. Kindly change location to Chennai or Hyderabad.'
                                  // );
                                  // return;
                                  try {
                                    location = await doRequestAndAccessLocation();
                                    location && setLocationDetails!(location);
                                  } catch (error) {
                                    setGlobalLoading!(false);
                                    Alert.alert(
                                      'Uh oh.. :(',
                                      'Unable to get location. We need your location in order to add tests to your cart.'
                                    );
                                    return;
                                  }
                                }
                                if (!testPrescription.length) {
                                  // Alert.alert(
                                  //   'Uh oh.. :(',
                                  //   'No items are available in your location for now.'
                                  // );
                                  setGlobalLoading!(false);
                                  return Promise.resolve([]);
                                } else {
                                  return addTestsToCart(
                                    testPrescription,
                                    client,
                                    g(locationDetails || location, 'city') || ''
                                  );
                                }
                              })
                              .then((tests) => {
                                if (testPrescription.length) {
                                  addMultipleTestCartItems!(tests! || []);
                                  // Adding ePrescriptions to DiagnosticsCart
                                  if ((tests! || []).length)
                                    addMultipleTestEPrescriptions!([
                                      {
                                        ...presToAdd,
                                        medicines: (tests as DiagnosticsCartItem[])
                                          .map((item) => item!.name)
                                          .join(', '),
                                      },
                                    ]);
                                }
                              })
                              .catch((e) => {
                                CommonBugFender('HealthConsultView_getMedicineDetailsApi', e);
                                console.log({ e });
                                // Alert.alert('Uh oh.. :(', e);
                                handleGraphQlError(e);
                              })
                              .finally(() => {
                                setGlobalLoading!(false);
                                props.navigation.navigate(AppRoutes.MedAndTestCart, {
                                  isComingFromConsult: true,
                                });
                              });
                          } else {
                            Alert.alert('No Medicines');
                          }
                        }
                      }}
                    >
                      {'ORDER MEDS & TESTS'}
                    </Text>
                  ) : null}
                  {g(item, 'followUp') ? (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        CommonLogEvent('HEALTH_CONSULT_VIEW', 'On follow up click'),
                          props.onFollowUpClick && props.onFollowUpClick(props.PastData);
                      }}
                    >
                      <Text style={styles.yellowTextStyle}> BOOK FOLLOW-UP</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text></Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {props.PastData! && props.PastData!.medicineOrderLineItems.length == 0 ? (
              <View>
                {moment(new Date()).format('DD/MM/YYYY') ===
                moment(props.PastData!.quoteDateTime!).format('DD/MM/YYYY') ? (
                  <Text style={styles.labelTextStyle}>
                    Today , {moment(props.PastData!.quoteDateTime!).format('DD MMM YYYY')}
                  </Text>
                ) : (
                  <Text style={styles.labelTextStyle}>
                    {moment(props.PastData!.quoteDateTime).format('DD MMM YYYY')}
                  </Text>
                )}
                <View>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.cardContainerStyle]}
                    onPress={() => {
                      CommonLogEvent('HEALTH_CONSULT_VIEW', 'Navigate to Medicine consult details'),
                        console.log('MedicineConsultDetails', props.PastData);

                      props.navigation.navigate(AppRoutes.MedicineConsultDetails, {
                        data:
                          props.PastData && props.PastData.prescriptionImageUrl.split('/').pop(), //'Prescription uploaded by Patient', //props.PastData.medicineOrderLineItems, //item, //props.PastData.medicineOrderLineItems[0],
                        medicineDate: moment(props.PastData!.quoteDateTime).format('DD MMM YYYY'),
                        PrescriptionUrl: props.PastData!.prescriptionImageUrl,
                        prismPrescriptionFileId: props.PastData!.prismPrescriptionFileId,
                      });
                    }}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity onPress={() => console.log('pharma', item)}>
                        <View style={{ marginTop: 10 }}>
                          <MedicineIcon />
                        </View>
                      </TouchableOpacity>

                      <View style={{ marginLeft: 30 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            ...theme.fonts.IBMPlexSansMedium(16),
                            color: '#01475b',
                            marginBottom: 7,
                            marginRight: 20,
                          }}
                        >
                          {'Prescription uploaded by Patient'}
                        </Text>
                        <Text
                          style={{
                            ...theme.fonts.IBMPlexSansMedium(12),
                            color: '#02475b',
                            opacity: 0.6,
                          }}
                        >
                          {moment(props.PastData!.quoteDateTime!).format('MM/DD/YYYY')}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                {moment(new Date()).format('DD/MM/YYYY') ===
                moment(props.PastData!.quoteDateTime!).format('DD/MM/YYYY') ? (
                  <Text style={styles.labelTextStyle}>
                    Today , {moment(props.PastData!.quoteDateTime!).format('DD MMM YYYY')}
                  </Text>
                ) : (
                  <Text style={styles.labelTextStyle}>
                    {moment(props.PastData!.quoteDateTime).format('DD MMM YYYY')}
                  </Text>
                )}

                {props.PastData!.medicineOrderLineItems! &&
                  props.PastData!.medicineOrderLineItems!.map((item: any) => {
                    return (
                      <TouchableOpacity
                        activeOpacity={1}
                        style={[styles.cardContainerStyle]}
                        onPress={() => {
                          CommonLogEvent(
                            'HEALTH_CONSULT_VIEW',
                            'Navigate to Medicine consult details'
                          ),
                            console.log('MedicineConsultDetails', props.PastData);

                          props.navigation.navigate(AppRoutes.MedicineConsultDetails, {
                            data: item, //props.PastData.medicineOrderLineItems, //item, //props.PastData.medicineOrderLineItems[0],
                            medicineDate: moment(props.PastData!.quoteDateTime).format(
                              'DD MMM YYYY'
                            ),
                            PrescriptionUrl: props.PastData!.prescriptionImageUrl,
                            prismPrescriptionFileId: props.PastData!.prismPrescriptionFileId,
                          });
                        }}
                      >
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity onPress={() => console.log('pharma', item)}>
                            <View style={{ marginTop: 10 }}>
                              <MedicineIcon />
                            </View>
                          </TouchableOpacity>

                          <View style={{ marginLeft: 30 }}>
                            <Text
                              numberOfLines={1}
                              style={{
                                ...theme.fonts.IBMPlexSansMedium(16),
                                color: '#01475b',
                                marginBottom: 7,
                                marginRight: 20,
                              }}
                            >
                              {item.medicineName}
                            </Text>
                            <Text
                              style={{
                                ...theme.fonts.IBMPlexSansMedium(12),
                                color: '#02475b',
                                opacity: 0.6,
                              }}
                            >
                              {moment(props.PastData!.quoteDateTime!).format('MM/DD/YYYY')}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            )}
          </View>
        )}
      </View>
    );
  return null;
};
