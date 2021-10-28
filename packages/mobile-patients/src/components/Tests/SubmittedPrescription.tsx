import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useApolloClient } from 'react-apollo-hooks';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import _ from 'lodash';
import {
  useShoppingCart,
  PhysicalPrescription,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  nameFormater,
  removeObjectProperty,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  PrescriptionCallIcon,
  RemoveIcon,
  WhiteCross,
  PrescriptionColored,
  Pdf,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  ADD_PRESCRIPTION_RECORD,
  GET_PATIENT_PRESCRIPTIONS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { addPatientPrescriptionRecord } from '@aph/mobile-patients/src/graphql/types/addPatientPrescriptionRecord';
import {
  AddPrescriptionRecordInput,
  MedicalRecordType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import moment from 'moment';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { DiagnosticPrescriptionSubmitted } from '@aph/mobile-patients/src/components/Tests/Events';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  getPatientPrescriptions,
  getPatientPrescriptionsVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrescriptions';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
const { height } = Dimensions.get('window');
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { getPatientPrismMedicalRecordsApi } from '@aph/mobile-patients/src/helpers/clientCalls';
const GreenTickAnimation = '@aph/mobile-patients/src/components/Tests/greenTickAnimation.json';

export interface SubmittedPrescriptionProps extends NavigationScreenProps {
  showHeader?: boolean;
}

export const SubmittedPrescription: React.FC<SubmittedPrescriptionProps> = (props) => {
  const { loading, setLoading } = useUIElements();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const phyPrescriptionsProp = props.navigation.getParam('phyPrescriptionsProp') || [];
  const ePrescriptionsProp = props.navigation.getParam('ePrescriptionsProp') || [];
  const [PhysicalPrescriptionsProps, setPhysicalPrescriptionsProps] = useState<
    PhysicalPrescription[]
  >(phyPrescriptionsProp);
  const [EPrescriptionsProps, setEPrescriptionsProps] = useState<EPrescription[]>(
    ePrescriptionsProp
  );
  const { setEPrescriptions, setPhysicalPrescriptions } = useShoppingCart();
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const [locationName, setLocationName] = useState<string>('');
  const [additionalNotes, setadditionalNotes] = useState<string>('');
  const [onSumbitSuccess, setOnSumbitSuccess] = useState<boolean>(false);
  const [isErrorOccured, setIsErrorOccured] = useState<boolean>(false);

  useEffect(() => {
    setLoading?.(false);
    fetchPatientPrescriptions();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsErrorOccured(false);
    }, 3000);
  }, [isErrorOccured]);

  useEffect(() => {
    if (onSumbitSuccess) {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBack);
      };
    }
  }, [onSumbitSuccess]);

  const handleBack = () => {
    setEPrescriptions?.([]);
    setPhysicalPrescriptions?.([]);
    props.navigation.navigate('TESTS', {
      phyPrescriptionUploaded: [],
      ePresscriptionUploaded: [],
      phyPrescriptionsProp: [],
      ePrescriptionsProp: [],
      movedFrom: '',
    });
    return true;
  };

  const fetchPatientPrescriptions = () => {
    client
      .query<getPatientPrescriptions, getPatientPrescriptionsVariables>({
        query: GET_PATIENT_PRESCRIPTIONS,

        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
          limit: 100,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        if (data) {
          const response = data?.data?.getPatientPrescriptions?.response || [];
        }
      })
      .catch((error) => {
        CommonBugFender('fetchPatientPrescriptions_SubmiitedPrescriptions', error);
      });
  };
  const renderExpectCall = () => {
    return (
      <View style={styles.expectCallView}>
        <PrescriptionCallIcon style={{ margin: 10 }} />
        <Text style={styles.expectText}>{string.diagnostics.prescriptionCallBack}</Text>
      </View>
    );
  };
  const setUploadedImages = (selectedImages: any) => {
    let imagesArray = [] as any;
    selectedImages?.forEach((item: any) => {
      let imageObj = {} as any;
      imageObj.title = item?.fileName;
      imageObj.fileType = item?.mimeType;
      imageObj.base64 = item?.file_Url;
      imageObj.id = item?.id;
      imageObj.index = item?.index;
      imagesArray.push(imageObj);
    });
    return imagesArray;
  };
  useEffect(() => {
    if (EPrescriptionsProps && EPrescriptionsProps?.length) {
      const ePrescriptionArray = EPrescriptionsProps?.filter(
        (item: any, index: any) =>
          EPrescriptionsProps?.findIndex((obj) => obj?.id == item?.id) === index
      );
      setEPrescriptionsProps(ePrescriptionArray);
    }
    if (PhysicalPrescriptionsProps && PhysicalPrescriptionsProps?.length) {
      const phyPrescriptionArray = PhysicalPrescriptionsProps?.filter(
        (item: any, index: any) =>
          PhysicalPrescriptionsProps?.findIndex((obj) => obj?.title == item?.title) === index
      );
      setPhysicalPrescriptionsProps(phyPrescriptionArray);
    }
  }, []);

  const getAddedImages = () => {
    let imagesArray = [] as any;

    PhysicalPrescriptionsProps?.forEach((item: any) => {
      let imageObj = {} as any;
      imageObj.fileName = item?.title + '.' + item?.fileType;
      imageObj.mimeType = mimeType(item?.title + '.' + item?.fileType);
      imageObj.content = item?.base64;
      imagesArray.push(imageObj);
    });
    return imagesArray;
  };

  const onSubmitPrescription = () => {
    setLoading?.(true);
    const inputData: AddPrescriptionRecordInput = {
      id: PhysicalPrescriptionsProps?.length
        ? ''
        : EPrescriptionsProps?.[0]?.id
        ? EPrescriptionsProps?.[0]?.id
        : '',
      patientId: currentPatient?.id || '',
      prescriptionName: PhysicalPrescriptionsProps?.[0]?.title
        ? PhysicalPrescriptionsProps?.[0]?.title
        : EPrescriptionsProps?.[0]?.fileName
        ? EPrescriptionsProps?.[0]?.fileName
        : '',
      issuingDoctor: PhysicalPrescriptionsProps?.length
        ? ''
        : EPrescriptionsProps?.[0]?.doctorName
        ? EPrescriptionsProps?.[0]?.doctorName
        : '',
      location: locationName,
      additionalNotes: additionalNotes,
      dateOfPrescription: PhysicalPrescriptionsProps?.length
        ? moment().format('YYYY-MM-DD')
        : EPrescriptionsProps?.[0]?.date
        ? moment(EPrescriptionsProps?.[0]?.date, 'DD MMM YYYY').format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD'),
      recordType: MedicalRecordType.PRESCRIPTION,
      prescriptionFiles: PhysicalPrescriptionsProps?.length
        ? getAddedImages()
        : EPrescriptionsProps?.length
        ? setUploadedImages(EPrescriptionsProps)
        : [],
    };
    if (PhysicalPrescriptionsProps && PhysicalPrescriptionsProps?.length) {
      client
        .mutate<addPatientPrescriptionRecord>({
          mutation: ADD_PRESCRIPTION_RECORD,
          variables: {
            AddPrescriptionRecordInput: inputData,
          },
        })
        .then(({ data }) => {
          const status = data?.addPatientPrescriptionRecord?.status;
          const eventInputData = removeObjectProperty(inputData, 'prescriptionFiles');
          getUploadedRecords(inputData, 'physicalPrescription');
        })
        .catch((error) => {
          setLoading?.(false);
          setIsErrorOccured(true);
          CommonBugFender('SubmittedPrescription_ADD_PRESCRIPTION_RECORD', error);
        });
    } else {
      getUploadedRecords(inputData, 'uploaded');
    }
  };

  async function getUploadedRecords(inputData: AddPrescriptionRecordInput, source: string) {
    const getUserType = await AsyncStorage.getItem('diagnosticUserType');
    const diagnosticUserType = !!getUserType && JSON.parse(getUserType);
    const getUploadedItemName = inputData?.prescriptionName;
    const getUploadedItemData = inputData?.dateOfPrescription;

    try {
      const getUploadedResponse: any = await getPatientPrismMedicalRecordsApi(
        client,
        currentPatient?.id,
        [MedicalRecordType.PRESCRIPTION],
        'Diagnostics'
      );
      const getPrescriptionResponse =
        !!getUploadedResponse &&
        getUploadedResponse?.getPatientPrismMedicalRecords_V3?.prescriptions;
      if (!!getPrescriptionResponse && getPrescriptionResponse?.errorCode == 0) {
        const getAllPrescriptions = getPrescriptionResponse?.response;
        if (getAllPrescriptions?.length > 0) {
          const getSortedPrescriptions = getAllPrescriptions?.sort((a: any, b: any) => {
            return new Date(b?.date).getTime() - new Date(a?.date).getTime();
          });
          const findSelectedPrescription = getSortedPrescriptions?.find(
            (item: any) =>
              item?.date == getUploadedItemData && item?.prescriptionName == getUploadedItemName
          );
          //send that one to webengage.
          !!findSelectedPrescription
            ? triggerPrescriptionSubmittedEvent(
                inputData,
                diagnosticUserType,
                findSelectedPrescription
              )
            : triggerPrescriptionSubmittedEvent_1(inputData, diagnosticUserType, source);
        } else {
          triggerPrescriptionSubmittedEvent_1(inputData, diagnosticUserType, source);
        }
      } else {
        triggerPrescriptionSubmittedEvent_1(inputData, diagnosticUserType, source);
      }
    } catch (error) {
      triggerPrescriptionSubmittedEvent_1(inputData, diagnosticUserType, source);
      CommonBugFender('getPatientPrismMedicalRecordsApi_getPatientPrismMedicalRecordsApi', error);
    } finally {
      setLoading?.(false);
    }
  }

  function triggerPrescriptionSubmittedEvent_1(inputData: any, userType: string, source: string) {
    if (source == 'physicalPrescription') {
      const prescriptionUrl = {
        content: inputData?.prescriptionFiles?.[0]?.content,
        fileName: inputData?.prescriptionFiles?.[0]?.fileName,
        mimeType: inputData?.prescriptionFiles?.[0]?.mimeType,
      };

      DiagnosticPrescriptionSubmitted(
        currentPatient,
        prescriptionUrl ? prescriptionUrl : '',
        inputData?.prescriptionName ? inputData?.prescriptionName : '',
        userType,
        isDiagnosticCircleSubscription
      );
    } else {
      let uploadUrl;
      if (EPrescriptionsProps?.length == 1) {
        uploadUrl = EPrescriptionsProps?.[0]?.uploadedUrl;
      } else {
        uploadUrl = EPrescriptionsProps?.map(
          (attributes, index: number) => `${index + 1} - ${attributes?.uploadedUrl}`
        )?.join(' ');
      }
      DiagnosticPrescriptionSubmitted(
        currentPatient,
        !!uploadUrl ? uploadUrl : '',
        inputData?.prescriptionName ? inputData?.prescriptionName : '',
        userType,
        isDiagnosticCircleSubscription
      );
    }
    setOnSumbitSuccess(true);
  }

  async function triggerPrescriptionSubmittedEvent(
    inputData: AddPrescriptionRecordInput,
    userType: string,
    responseResult: any
  ) {
    let url;
    if (responseResult?.prescriptionFiles?.length == 1) {
      url = responseResult?.prescriptionFiles?.[0]?.fileUrl;
    } else {
      url = responseResult?.prescriptionFiles?.map(
        (attributes: any, index: number) => `${index + 1} - ${attributes?.file_Url}`
      );
    }

    const newUrl = url?.map((item: any) => item)?.join(' ');
    DiagnosticPrescriptionSubmitted(
      currentPatient,
      !!newUrl ? newUrl : '',
      inputData?.prescriptionName ? inputData?.prescriptionName : '',
      userType,
      isDiagnosticCircleSubscription
    );
    setOnSumbitSuccess(true);
  }

  const renderErrorMessage = () => {
    return (
      <View style={styles.errorMessageView}>
        <Text style={styles.errorMsgText}>{string.diagnostics.prescriptionError}</Text>
        <TouchableOpacity
          onPress={() => {
            setIsErrorOccured(false);
          }}
        >
          <WhiteCross width={14} height={14} style={styles.whiteCrossIcon} />
        </TouchableOpacity>
      </View>
    );
  };
  const renderSuccessUploadView = () => {
    return (
      <View style={styles.successView}>
        <LottieView
          source={require(GreenTickAnimation)}
          autoPlay
          loop={false}
          style={{ marginBottom: 80 }}
        />
        <Text style={styles.successText}>{string.diagnostics.prescriptionSuccess}</Text>
      </View>
    );
  };

  const renderButtonCTA = () => {
    return (
      <Button
        title={onSumbitSuccess ? 'GO TO HOME' : 'SUBMIT'}
        style={styles.buttonStyle}
        disabled={EPrescriptionsProps?.length || PhysicalPrescriptionsProps?.length ? false : true}
        onPress={() => {
          if (onSumbitSuccess) {
            setEPrescriptions?.([]);
            setPhysicalPrescriptions?.([]);
            props.navigation.navigate('TESTS', {
              phyPrescriptionUploaded: [],
              ePresscriptionUploaded: [],
              phyPrescriptionsProp: [],
              ePrescriptionsProp: [],
              movedFrom: '',
            });
          } else {
            onSubmitPrescription();
          }
        }}
      />
    );
  };

  return (
    <View style={styles.containerStyle}>
      <SafeAreaView
        style={[
          styles.containerStyleView,
          { backgroundColor: onSumbitSuccess ? theme.colors.WHITE : theme.colors.CARD_BG },
        ]}
      >
        {props?.showHeader == false ? null : onSumbitSuccess ? (
          <View style={{ height: 56 }}></View>
        ) : (
          <Header
            leftIcon="backArrow"
            title={'SUBMIT PRESCRIPTION'}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
        )}

        <ScrollView bounces={false} scrollEventThrottle={1}>
          {isErrorOccured ? renderErrorMessage() : null}
          <View style={styles.presStyle}>
            {!onSumbitSuccess ? (
              <>
                {PhysicalPrescriptionsProps && PhysicalPrescriptionsProps?.length ? (
                  <View>
                    <Text style={styles.textStyle}>
                      {nameFormater('Physical Prescriptions', 'upper')}
                    </Text>
                    <View style={styles.presText}>
                      {PhysicalPrescriptionsProps.map((item: any) => {
                        return (
                          <View style={styles.phyView}>
                            <View style={styles.phyView2}>
                              <View style={styles.phyView3}>
                                {item.fileType == 'application/pdf' || item.fileType == 'pdf' ? (
                                  <Pdf style={styles.pdfIconStyle} />
                                ) : (
                                  <Image
                                    style={styles.imageView}
                                    source={{ uri: `data:image/jpeg;base64,${item.base64}` }}
                                  />
                                )}
                              </View>
                              <Text style={styles.leftText}>{item?.title}</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => {
                                const phyPrescription = PhysicalPrescriptionsProps;
                                const filteredPres = phyPrescription?.filter(
                                  (_item) => _item?.title != item?.title
                                );
                                setPhysicalPrescriptionsProps([...filteredPres]);
                              }}
                              style={styles.centerStyle}
                            >
                              <RemoveIcon />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
                <>
                  {EPrescriptionsProps && EPrescriptionsProps?.length ? (
                    <View>
                      <Text style={styles.textStyle}>{string.diagnostics.fromHealthRecord}</Text>
                      <View style={styles.presText}>
                        {EPrescriptionsProps.map((item: any) => {
                          return (
                            <View style={styles.epresView}>
                              <View style={styles.epresView2}>
                                <View style={styles.epresView3}>
                                  <PrescriptionColored style={{ height: 35 }} />
                                </View>
                                <View style={{ flexDirection: 'column', width: '80%' }}>
                                  <Text style={styles.healthText}>{item?.doctorName}</Text>
                                  <Text style={styles.healthDetailText}>
                                    {item?.date} • Prescription for {item?.forPatient}
                                  </Text>
                                </View>
                              </View>
                              <TouchableOpacity
                                onPress={() => {
                                  setEPrescriptionsProps(
                                    EPrescriptionsProps?.filter((_item) => _item?.id != item?.id)
                                  );
                                }}
                                style={styles.centerStyleWidth}
                              >
                                <RemoveIcon />
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}
                </>
                <TouchableOpacity
                  style={styles.addPresView}
                  onPress={() => {
                    props.navigation.navigate('TESTS', {
                      phyPrescriptionUploaded: PhysicalPrescriptionsProps,
                      ePresscriptionUploaded: EPrescriptionsProps,
                      movedFrom: AppRoutes.SubmittedPrescription,
                    });
                  }}
                >
                  <Text style={styles.addPresText}>{string.diagnostics.addMorePrescription}</Text>
                </TouchableOpacity>
              </>
            ) : (
              renderSuccessUploadView()
            )}
          </View>
        </ScrollView>
        <View>
          {renderExpectCall()}
          {renderButtonCTA()}
        </View>
      </SafeAreaView>
      {loading && !props?.showHeader ? null : loading && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
  containerStyleView: {
    flex: 1,
  },
  prescriptionCardStyle: {
    paddingTop: 7,
    marginTop: 5,
    marginBottom: 7,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    backgroundColor: theme.colors.CARD_BG,
  },
  labelView: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
  },
  leftText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
    alignSelf: 'center',
    width: '80%',
  },
  healthText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansSemiBold(14),
  },
  healthDetailText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansRegular(12),
  },
  addPresView: {
    width: '100%',
    padding: 10,
  },
  addPresText: {
    ...theme.viewStyles.text('SB', 14, theme.colors.TANGERINE_YELLOW, 1, 20),
    alignSelf: 'center',
  },
  expectText: {
    width: '85%',
    ...theme.viewStyles.text('SB', 12, theme.colors.SHERPA_BLUE, 1, 20),
    paddingHorizontal: 5,
  },
  expectCallView: {
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    flexDirection: 'row',
    padding: 10,
    alignContent: 'center',
  },
  errorMsgText: { ...theme.viewStyles.text('SB', 12, 'white', 1), padding: 10 },
  whiteCrossIcon: { alignSelf: 'center', margin: 10 },
  phyView: { flexDirection: 'row', margin: 5, alignContent: 'center' },
  phyView2: {
    flexDirection: 'row',
    width: '90%',
    alignContent: 'center',
  },
  phyView3: {
    paddingLeft: 8,
    paddingRight: 16,
    width: 54,
  },
  fileBigStyle: {
    height: 45,
    width: 30,
    borderRadius: 5,
  },
  pdfIconStyle: {
    height: 40,
    width: 30,
    borderRadius: 5,
  },
  imageView: {
    height: 40,
    width: 30,
    borderRadius: 5,
  },
  epresView: { flexDirection: 'row', margin: 5, alignContent: 'center' },
  epresView2: {
    flexDirection: 'row',
    width: '90%',
    alignContent: 'center',
  },
  epresView3: {
    paddingLeft: 8,
    paddingRight: 16,
    width: '12%',
  },
  successText: {
    ...theme.viewStyles.text('B', 16, '#1084A9', 1),
  },
  successView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
  },
  starText: {
    color: theme.colors.RED,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  textStyle: {
    ...theme.viewStyles.text('SB', 13, theme.colors.SHERPA_BLUE, 1),
    padding: 5,
  },
  subtitleStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  errorMessageView: {
    backgroundColor: '#D23D3D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    zIndex: 1,
    alignSelf: 'center',
  },
  textContainerStyle: {
    padding: 20,
    borderRadius: 10,
    borderBottomColor: 'black',
    marginTop: -20,
    marginBottom: 20,
  },
  userCommentTextBoxStyle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    borderWidth: 1,
    padding: 10,
    borderBottomWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(2,71,91, 0.3)',
    backgroundColor: theme.colors.WHITE,
    flexWrap: 'wrap',
  },
  buttonStyle: { margin: 10, width: '90%', alignSelf: 'center' },
  presText: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 5,
  },
  presStyle: { flex: 1, padding: 10, height: height - 180 },
  containerStyle: { flex: 1, height: height },
  centerStyle: { justifyContent: 'center', alignItems: 'center' },
  centerStyleWidth: {
    justifyContent: 'center',
    width: '10%',
    alignItems: 'center',
  },
});
