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
import { getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription } from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import { getMedicineDetailsApi } from '../../helpers/apiCalls';
import { g } from '../../helpers/helperFunctions';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { AppConfig } from '../../strings/AppConfig';
import { EPrescription, ShoppingCartItem, useShoppingCart } from '../ShoppingCartProvider';
import RNFetchBlob from 'react-native-fetch-blob';

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
const data: rowData = {
  id: 'id',
  salutation: 'Dr',
  firstName: 'Mamatha',
  lastName: 'V',
  qualification: 'MBBS',
  mobileNumber: '2345678909',
  experience: '2',
  languages: 'English,Telugu',
  city: 'Hyderabad',
  awards: '',
  photoUrl:
    'https://image.shutterstock.com/image-photo/smiling-doctor-posing-arms-crossed-600w-519507367.jpg',
  specialty: undefined,
  registrationNumber: '',
  onlineConsultationFees: '',
  physicalConsultationFees: '',
  status: 'Follow-up to 20 Apr 2019',
  desease: 'Cold, Cough, Fever, Nausea',
};
export interface HealthConsultViewProps extends NavigationScreenProps {
  PastData?: any; //getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults;
  onPressOrder?: () => void;
  onClickCard?: () => void;
  onFollowUpClick?: (PastData: any) => void;
}

export const HealthConsultView: React.FC<HealthConsultViewProps> = (props) => {
  const { setCartItems, cartItems, setEPrescriptions, ePrescriptions } = useShoppingCart();
  const [loading, setLoading] = useState<boolean>(true);
  const { currentPatient } = useAllCurrentPatients();

  let item = (g(props, 'PastData', 'caseSheet') || []).find((obj: any) => {
    return (
      obj!.doctorType === 'STAR_APOLLO' ||
      obj!.doctorType === 'APOLLO' ||
      obj!.doctorType === 'PAYROLL'
    );
  });
  console.log('pharama', item);

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
  });

  const downloadPrescription = () => {
    console.log('pharama', item);
    if (item.blobName == null) {
      Alert.alert('No Image');
    } else {
      if (Platform.OS === 'ios') {
        try {
          Linking.openURL(AppConfig.Configuration.DOCUMENT_BASE_URL.concat(item.blobName)).catch(
            (err) => console.error('An error occurred', err)
          );
        } catch {}
      }
      let dirs = RNFetchBlob.fs.dirs;

      setLoading(true);
      RNFetchBlob.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: false,
          mime: 'application/pdf',
          path: Platform.OS === 'ios' ? dirs.MainBundleDir : dirs.DownloadDir,
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
            : RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
        })
        .catch((err) => {
          console.log('error ', err);
          setLoading(false);
          // ...
        });
    }
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
      console.log('error', error);
    }
  };
  if (
    (props.PastData &&
      props.PastData.medicineOrderLineItems &&
      props.PastData.medicineOrderLineItems.length) ||
    (props.PastData && props.PastData!.patientId!)
  )
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
                props.onClickCard ? props.onClickCard() : null;
              }}
            >
              <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.imageView}>
                    {/* {data.image} */}
                    {data.photoUrl &&
                      data.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/) && (
                        <Image style={styles.profileImageStyle} source={{ uri: data.photoUrl }} />
                      )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity activeOpacity={1}>
                      <Text style={styles.doctorNameStyles}>
                        Dr. {props.PastData!.doctorInfo && props.PastData!.doctorInfo.firstName} 
                        {props.PastData!.doctorInfo && props.PastData!.doctorInfo.lastName}
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
                                    <Text style={styles.descriptionTextStyles}>
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
                          <TouchableOpacity onPress={() => downloadPrescription()}>
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
                  {g(item, 'followUp') ? (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        props.onFollowUpClick ? props.onFollowUpClick(props.PastData) : null;
                      }}
                    >
                      <Text style={styles.yellowTextStyle}> BOOK FOLLOW-UP</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text></Text>
                  )}
                  {g(item, 'medicinePrescription') ? (
                    <Text
                      style={styles.yellowTextStyle}
                      onPress={() => {
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
                          Alert.alert('No Medicines');
                        } else {
                          if (item.medicinePrescription != null) {
                            //write here stock condition

                            setLoading(true);

                            const medPrescription = (item.medicinePrescription ||
                              []) as getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription[];
                            const docUrl = AppConfig.Configuration.DOCUMENT_BASE_URL.concat(
                              item!.blobName!
                            );

                            Promise.all(
                              medPrescription.map((item: any) => getMedicineDetailsApi(item!.id!))
                            )
                              .then((result) => {
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
                                      prescriptionRequired:
                                        medicineDetails.is_prescription_required == '1',
                                    } as ShoppingCartItem;
                                  })
                                  .filter((item: any) => (item ? true : false));

                                const filteredItemsFromCart = cartItems.filter(
                                  (cartItem) =>
                                    !medicines.find((item: any) => (item && item.id) == cartItem.id)
                                );

                                setCartItems!([
                                  ...filteredItemsFromCart,
                                  ...(medicines as ShoppingCartItem[]),
                                ]);

                                if (medPrescription.length > medicines.length) {
                                  const outOfStockCount = medPrescription.length - medicines.length;
                                  Alert.alert(
                                    'Alert',
                                    `${outOfStockCount} item(s) are out of stock.`
                                  );
                                  // props.navigation.push(AppRoutes.YourCart, { isComingFromConsult: true });
                                }

                                const rxMedicinesCount =
                                  medicines.length == 0
                                    ? 0
                                    : medicines.filter((item: any) => item!.prescriptionRequired)
                                        .length;

                                const presToAdd = {
                                  id: item!.id!,
                                  date: moment(g(props.PastData, 'appointmentDateTime')).format(
                                    'DD MMM YYYY'
                                  ),
                                  doctorName: '',
                                  forPatient: (currentPatient && currentPatient.firstName) || '',
                                  medicines: (medicines || [])
                                    .map((item: any) => item!.name)
                                    .join(', '),
                                  uploadedUrl: docUrl,
                                } as EPrescription;

                                if (rxMedicinesCount) {
                                  setEPrescriptions!([
                                    ...ePrescriptions.filter((item) => !(item.id == presToAdd.id)),
                                    presToAdd,
                                  ]);
                                }
                                props.navigation.push(AppRoutes.YourCart, {
                                  isComingFromConsult: true,
                                });
                              })
                              .catch((e) => {
                                setLoading(false);
                                console.log({ e });
                                Alert.alert('Alert', 'Oops! Something went wrong.');
                              });

                            // const medicines: ShoppingCartItem[] =
                            //   item.medicinePrescription &&
                            //   item.medicinePrescription.map(
                            //     (item: any) =>
                            //       ({
                            //         id: item!.id!,
                            //         mou: '10',
                            //         name: item!.medicineName!,
                            //         price: 50,
                            //         quantity: parseInt(item!.medicineDosage!),
                            //         prescriptionRequired: false,
                            //       } as ShoppingCartItem)
                            //   );
                            // setCartItems && setCartItems(medicines);

                            props.navigation.push(AppRoutes.YourCart, {
                              isComingFromConsult: true,
                            });
                          } else {
                            Alert.alert('No Medicines');
                          }
                        }
                      }}
                    >
                      ORDER MEDS & TESTS
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {props.PastData! && props.PastData!.medicineOrderLineItems.length == 0 ? null : (
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
                          props.navigation.navigate(AppRoutes.MedicineConsultDetails, {
                            data: item, //props.PastData.medicineOrderLineItems, //item, //props.PastData.medicineOrderLineItems[0],
                            medicineDate: moment(props.PastData!.quoteDateTime).format(
                              'DD MMM YYYY'
                            ),
                            PrescriptionUrl: props.PastData!.prescriptionImageUrl,
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
