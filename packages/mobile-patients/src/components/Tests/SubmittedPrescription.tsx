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
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useApolloClient } from 'react-apollo-hooks';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { ExpectCall } from '@aph/mobile-patients/src/components/Medicines/Components/ExpectCall';
import _ from 'lodash';
import {
  useShoppingCart,
  PhysicalPrescription,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  nameFormater,
  formatAddressBookAddress,
  handleGraphQlError,
  g,
  removeObjectProperty,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  RxPrescriptionCallIc,
  PrescriptionCallIcon,
  BlueTick,
  GreenCircleTick,
  FileBig,
  Close,
  PhrCloseIcon,
  RemoveIcon,
  WhiteCross,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  ADD_PRESCRIPTION_RECORD,
  GET_PATIENT_PRESCRIPTIONS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  CommonBugFender,
  setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
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
const { width, height } = Dimensions.get('window');
import LottieView from 'lottie-react-native';
const GreenTickAnimation = '@aph/mobile-patients/src/components/Tests/greenTickAnimation.json'

export interface SubmittedPrescriptionProps extends NavigationScreenProps {
  showHeader?: boolean;
}
type PickerImage = any;
export const SubmittedPrescription: React.FC<SubmittedPrescriptionProps> = (props) => {
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const phyPrescriptionsProp = props.navigation.getParam('phyPrescriptionsProp') || [];
  const ePrescriptionsProp = props.navigation.getParam('ePrescriptionsProp') || [];
  const [docName, setDocName] = useState<string>('');
  const [PhysicalPrescriptionsProps, setPhysicalPrescriptionsProps] = useState<
    PhysicalPrescription[]
  >(phyPrescriptionsProp);
  const [EPrescriptionsProps, setEPrescriptionsProps] = useState<EPrescription[]>(
    ePrescriptionsProp
  );
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const [testName, settestName] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [additionalNotes, setadditionalNotes] = useState<string>('');
  const [dateOfTest, setdateOfTest] = useState<string>('');
  const [onSumbitSuccess, setOnSumbitSuccess] = useState<boolean>(false);
  const [Images, setImages] = useState<PickerImage>(props.navigation.state.params ? [] : []);
  const [isErrorOccured, setIsErrorOccured] = useState<boolean>(false);
  const recordType = props.navigation.state.params
  ? props.navigation.state.params.recordType
  : false;
  const selectedRecordID = props.navigation.state.params
    ? props.navigation.state.params.selectedRecordID
    : null;
  useEffect(() => {
    setLoading?.(false);
    fetchPatientPrescriptions();
  }, []);


  useEffect(() => {
    setTimeout(() => {
      setIsErrorOccured(false);
    }, 3000);
  }, [isErrorOccured])


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
        CommonBugFender('AddressBook__getAddressList', error);
      });
  };
  const renderExpectCall = () => {
    return (
      <View
        style={styles.expectCallView}
      >
        <PrescriptionCallIcon style={{ margin: 10 }} />
        <Text style={styles.expectText}>
          Expect a call in the next 2 hours from an Apollo agent to assist you in placing an order
        </Text>
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

  const getAddedImages = () => {
    let imagesArray = [] as any;
    
    ePrescriptionsProp?.forEach((item: any) => {
      let imageObj = {} as any;
      imageObj.fileName = item?.fileName;
      imageObj.mimeType = mimeType(item?.fileName);
      imageObj.content = item?.uploadedUrl;
      imagesArray.push(imageObj);
    });
    return imagesArray;
  };

  
  const onSubmitPrescription = () => {
    const inputData: AddPrescriptionRecordInput = {
      id: ePrescriptionsProp?.[0]?.id,
      patientId: currentPatient?.id || '',
      prescriptionName: ePrescriptionsProp?.[0]?.fileName,
      issuingDoctor: ePrescriptionsProp?.[0]?.doctorName,
      location: locationName,
      additionalNotes: additionalNotes,
      dateOfPrescription: moment(ePrescriptionsProp?.[0]?.date, 'DD MMM YYYY').format('YYYY-MM-DD'),
      recordType: MedicalRecordType.PRESCRIPTION,
      prescriptionFiles: getAddedImages(),
    };
    client
      .mutate<addPatientPrescriptionRecord>({
        mutation: ADD_PRESCRIPTION_RECORD,
        variables: {
          AddPrescriptionRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        const status = g(data, 'addPatientPrescriptionRecord', 'status');
        const eventInputData = removeObjectProperty(inputData, 'prescriptionFiles');
        DiagnosticPrescriptionSubmitted(
          currentPatient,
          inputData?.prescriptionFiles,
          inputData?.prescriptionName,
          isDiagnosticCircleSubscription
        );
        setOnSumbitSuccess(true);
      })
      .catch((error) => {
          setIsErrorOccured(true);
        CommonBugFender('SubmittedPrescription_ADD_PRESCRIPTION_RECORD', error);
      });
  };
  const renderErrorMessage = () => {
    return (
      <View style={styles.errorMessageView}>
        <Text style={styles.errorMsgText}>
          Sorry cannot submit precription, an error occured
        </Text>
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
        <Text style={styles.successText}>Prescription Successfully Uploaded</Text>
      </View>
    );
  };

  return (
    <View style={styles.containerStyle}>
      <SafeAreaView style={theme.viewStyles.container}>
        {props?.showHeader == false ? null : (
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
                {phyPrescriptionsProp && phyPrescriptionsProp?.length ? (
                  <View>
                    <Text style={styles.textStyle}>
                      {nameFormater('Physical Prescriptions', 'upper')}
                    </Text>
                    <View style={styles.presText}>
                      {phyPrescriptionsProp.map((item: any) => {
                        return (
                          <View style={styles.phyView}>
                            <View
                              style={styles.phyView2}
                            >
                              <View
                                style={styles.phyView3}
                              >
                                {item.fileType == 'pdf' ? (
                                  <FileBig
                                    style={styles.fileBigStyle}
                                  />
                                ) : (
                                  <Image
                                    style={styles.imageView}
                                    source={{ uri: `data:image/jpeg;base64,${item.base64}` }}
                                  />
                                )}
                              </View>
                              <Text style={styles.leftText}>{item?.title}</Text>
                            </View>
                            <View style={{ justifyContent: 'center' }}>
                              <RemoveIcon />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
                <>
                  {ePrescriptionsProp && ePrescriptionsProp?.length ? (
                    <View>
                      <Text style={styles.textStyle}>PRESCRIPTION FROM HEALTH RECORDS</Text>
                      <View style={styles.presText}>
                        {ePrescriptionsProp.map((item: any) => {
                          return (
                            <View
                              style={styles.epresView}
                            >
                              <View
                                style={styles.epresView2}
                              >
                                <View
                                  style={styles.epresView3}
                                >
                                  {item.fileType == 'pdf' ? (
                                    <FileBig
                                      style={styles.fileBigStyle}
                                    />
                                  ) : (
                                    <Image
                                      style={{
                                        height: 40,
                                        width: 30,
                                        borderRadius: 5,
                                      }}
                                      source={{ uri: `${item.uploadedUrl}` }}
                                    />
                                  )}
                                </View>
                                <Text style={styles.leftText}>{item?.fileName}</Text>
                              </View>
                              <View style={{ justifyContent: 'center' }}>
                                <RemoveIcon />
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}
                </>
                <TouchableOpacity style={styles.addPresView} onPress={()=>{
                }}>
                  <Text style={styles.addPresText}>+ADD MORE PRESCRIPTIONS</Text>
                </TouchableOpacity>
              </>
            ) : (
              renderSuccessUploadView()
            )}
          </View>
          <View>
            {renderExpectCall()}
            <Button
              title={onSumbitSuccess ? 'GO TO HOME' : 'SUBMIT'}
              style={styles.buttonStyle}
              onPress={() => {
                if (onSumbitSuccess) {
                  props.navigation.navigate('TESTS');
                } else {
                  onSubmitPrescription();
                }
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      {loading && !props?.showHeader ? null : loading && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
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
  expectCallView:{
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    flexDirection: 'row',
    padding: 10,
    alignContent: 'center',
  },
  errorMsgText:{ ...theme.viewStyles.text('SB', 12, 'white', 1), padding: 10 },
  whiteCrossIcon:{ alignSelf: 'center', margin: 10 },
  phyView:{ flexDirection: 'row', margin: 5, alignContent: 'center' },
  phyView2:{
    flexDirection: 'row',
    width: '90%',
    alignContent: 'center',
  },
  phyView3:{
    paddingLeft: 8,
    paddingRight: 16,
    width: 54,
  },
  fileBigStyle:{
    height: 45,
    width: 30,
    borderRadius: 5,
  },
  imageView:{
    height: 40,
    width: 30,
    borderRadius: 5,
  },
  epresView:{ flexDirection: 'row', margin: 5, alignContent: 'center' },
  epresView2:{
    flexDirection: 'row',
    width: '90%',
    alignContent: 'center',
  },
  epresView3:{
    paddingLeft: 8,
    paddingRight: 16,
    width: 54,
  },
  successText: {
    ...theme.viewStyles.text('B', 16, '#1084A9', 1),
  },
  successView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent:'center',
    flexDirection:'column',
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
    zIndex:1,
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
});
