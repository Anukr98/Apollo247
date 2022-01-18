import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  BillGreen,
  BlackPlus,
  CalendarBlackIcon,
  ConsultGreen,
  DropdownGreen,
  FileBig,
  GreenCross,
  HospitalGreen,
  InsuranceGreen,
  LabTestGreen,
  SelectedBills,
  SelectedHospitalization,
  SelectedInsurance,
  UnSelectedPrescription,
  SelectedTestReport,
  RedCross,
  Remove,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SAVE_CLINICAL_DOCUMENTS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  LabTestParameters,
  PrescriptionParameters,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  saveClinicalDocuments,
  saveClinicalDocumentsVariables,
} from '@aph/mobile-patients/src/graphql/types/saveClinicalDocuments';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import {
  g,
  handleGraphQlError,
  isValidText,
  postCleverTapEvent,
  postCleverTapPHR,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  AsyncStorage,
  BackHandler,
  Dimensions,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image, ListItem, Overlay } from 'react-native-elements';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';

export interface AddClinicalDocumentDetailsProps extends NavigationScreenProps {}

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    ...theme.viewStyles.container,
  },
  mainViewStyle: {
    flex: 1,
  },
  imageListViewStyle: {
    marginTop: 6,
    marginHorizontal: 21,
    marginBottom: 80,
    flexDirection: 'row',
  },
  addMoreImageViewStyle: { width: 82, height: 82, paddingTop: 10 },
  imageViewStyle: {
    height: 72,
    width: 72,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
  },
  removeIconViewStyle: {
    position: 'absolute',
    right: -8,
    zIndex: 99,
    top: -8,
    paddingBottom: 10,
    paddingLeft: 10,
  },
  // Image Styling
  imageStyle: { height: 72, width: 60 },
  plusTextStyle: {
    ...theme.viewStyles.text('R', 24, theme.colors.LIGHT_BLUE, 1, 31.2),
    textAlign: 'center',
    paddingTop: 5,
  },
  addMoreTextStyle: {
    ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE, 1, 13),
    textAlign: 'center',
    flex: 1,
  },
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    overflow: 'hidden',
    elevation: 0,
  },
  overlayViewStyle: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  ensureTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 15.6),
    textAlign: 'center',
  },
  reviewPhotoDetailsViewStyle: {
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    justifyContent: 'center',
    marginTop: 23,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  reviewPhotoImageStyle: {
    height: 40,
    width: '100%',
  },
  bottonButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 20,
  },
  bottomWhiteButtonStyle: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
    elevation: 0,
  },
  bottomButtonStyle: {
    flex: 1,
  },
  bottomWhiteButtonTextStyle: {
    color: theme.colors.APP_YELLOW,
  },
  buttonSeperatorStyle: {
    width: 16,
  },
  fieldTitle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: '#01475B',
    bottom: 10,
    left: 0,
  },
  dropDownContainer: {
    flexDirection: 'column',
    width: '90%',
    left: 20,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 14, 'black'),
  },
  recordBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderRadius: 8,
  },
  recordCalendar: {
    ...theme.fonts.IBMPlexSansMedium(15),
    bottom: 3,
    top: 2,
    color: 'grey',
  },
  calendarIcon: {
    width: 20,
    height: 20,
    right: 10,
    left: 0,
  },
  doctorInputContainer: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: 'black',
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#00B38E',
    padding: Platform.OS === 'ios' ? 5 : 2,
  },
  commonTextInputView: {
    marginTop: 25,
    justifyContent: 'space-around',
    padding: 10,
    paddingHorizontal: 2,
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#00B38E',
  },
  recordDetailsView: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: theme.colors.WHITE,
    overflow: 'hidden',
    elevation: 0,
  },
  renderPHRCategories: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '98%',
    padding: 5,
  },
  renderSubPHRCategories: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignSelf: 'flex-start',
  },
  parameterContainerStyle: {
    paddingTop: 4,
    paddingBottom: 3,
    paddingRight: 5,
  },
  parameterNameStyle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: '#01475B',
    bottom: 5,
    right: 10,
  },
  textInputStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.SKY_BLUE, 1, 20.8),
    paddingHorizontal: 14,
    flex: 1,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#00B38E',
  },
  commonView: {
    flexDirection: 'column',
    marginTop: 25,
    width: '100%',
  },
  minView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  cameraView: {
    marginTop: 28,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
});

const TestRecordInitialValues: LabTestParameters = {
  parameterName: '',
  unit: '',
  result: 0,
  minimum: 0,
  maximum: 0,
};

const PrescriptionInitialValues: PrescriptionParameters = {
  dosage: 0,
  unit: '',
  medication: '',
};

type PickerImage = any;

export const AddClinicalDocumentDetails: React.FC<AddClinicalDocumentDetailsProps> = (props) => {
  var fin = '';
  const { width, height } = Dimensions.get('window');
  const selectedID = props?.navigation?.state?.params
    ? props?.navigation?.state?.params?.selectedID
    : '';
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const imageArray = props.navigation?.getParam('imageArray') || [];
  const [Images, setImages] = useState<PickerImage>(props.navigation.state.params ? [] : []);
  const [displayReviewPhotoPopup, setDisplayReviewPhotoPopup] = useState<boolean>(false);
  const [deleteFileArray, setDeleteFileArray] = useState<any>([]);
  const [testName, settestName] = useState<string>('');
  const [imageUpdate, setImageUpdate] = useState<boolean>(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<PickerImage>(null);
  const [updatedImageArray, setUpdatedImageArray] = useState<PickerImage>([]);
  const [callDeleteAttachmentApi, setCallDeleteAttachmentApi] = useState<boolean>(false);
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [testRecordParameters, setTestRecordParameters] = useState<LabTestParameters[]>([]);
  const [prescriptionParameters, setPrescriptionParameters] = useState<PrescriptionParameters[]>(
    []
  );
  const { showAphAlert } = useUIElements();
  const [showTime, setShowTime] = useState<boolean>(false);
  const [showEndTime, setShowEndTime] = useState<boolean>(false);
  const [dateOfTest, setdateOfTest] = useState<string>('');
  const [endDateTest, setEndDateTest] = useState<string>('');
  const [consultColor, setConsultColor] = useState<boolean>(false);
  const [hospitalColor, setHospitalColor] = useState<boolean>(false);
  const [insuranceColor, setInsuranceColor] = useState<boolean>(false);
  const [billColor, setBillColor] = useState<boolean>(false);
  const [labTestColor, setLabTestColor] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [recordName, setRecordName] = useState<string>('');
  const [recordIDNumber, setRecordIDNumber] = useState<string>('');
  const [recordDoctorName, setRecordDoctorName] = useState<string>('');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [recordBillNo, setRecordBillNo] = useState<string>('');
  const [insuranceAmount, setInsuranceAmount] = useState<string>('');
  const [patientNames, setPatientNames] = useState<[]>([]);
  const [showName, setShowName] = useState<string>('');
  const { getPatientByPrism } = useAuth();
  const numberKeyboardType = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const selectedRecord = props.navigation.state.params
    ? props.navigation.state.params.selectedRecord
    : null;
  const [documentType, setDocumentType] = useState<any>(
    props.navigation.state.params ? props.navigation.state.params.documentType : ''
  );

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    onGoBack();
    return true;
  };

  useEffect(() => {
    setShowSpinner(true);
    const fetchAllPatientsName = async () => {
      const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
      const item = JSON.parse(retrievedItem || 'null');
      const allPatients = item?.data?.getPatientByMobileNumber?.patients;
      setPatientNames(allPatients);
      setShowSpinner(false);
      // try {
      //   const res = await getPatientByPrism();
      //   if (res) {
      //     const allPatients = res?.data?.getCurrentPatients?.patients || null;
      //     setPatientNames(allPatients);
      //     setShowSpinner(false);
      //   }
      // } catch (error) {
      //   setShowSpinner(false);
      // }
    };
    // setImageUpdate(selectedRecord?.fileUrl ? true : false);
    fetchAllPatientsName();
    setUploadedImages(imageArray);
    setImages(setUploadedImages(imageArray));
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

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

  const renderImagesRow = (data: PickerImage, i: number, id: number) => {
    const base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(data?.base64);
    const fileType = data?.fileType;
    return (
      <View style={[styles.addMoreImageViewStyle, { marginRight: 5 }]}>
        <View style={styles.imageViewStyle}>
          {fileType === 'pdf' || fileType === 'application/pdf' ? (
            <FileBig style={styles.imageStyle} />
          ) : (
            <Image
              style={styles.imageStyle}
              source={{ uri: !!data?.file_Url ? data?.file_Url : data?.id ? data?.base64 : fin }}
            />
          )}
        </View>
      </View>
    );
  };

  const renderUploadedImages = (id: number) => {
    const imagesArray = imageArray;
    return (
      <View
        style={[
          styles.imageListViewStyle,
          id !== 1 && {
            marginHorizontal: 14,
            marginBottom: 0,
            marginTop: 0,
          },
        ]}
      >
        <FlatList
          bounces={false}
          data={imagesArray}
          collapsable
          onEndReachedThreshold={0.5}
          horizontal
          renderItem={({ item, index }) => renderImagesRow(item, index, id)}
          keyExtractor={(_, index) => index.toString()}
          // ListFooterComponent={() => (imagesArray?.length > 3 ? null : renderAddMorePagesCard())}
        />
        {/* UI for multiple images */}
        {/* {imagesArray?.length > 3 ? renderAddMorePagesCard() : null} */}
      </View>
    );
  };

  const onPressCloseReview = () => {
    const imageCOPY = [...Images];
    const index = imageCOPY.findIndex((item) => item.title === currentImage?.title);
    imageCOPY.splice(index, 1);
    setImages(imageCOPY);
    setDisplayReviewPhotoPopup(false);
    setdisplayOrderPopup(false);
    setOpenCamera(false);
  };

  const renderReviewPhotoDetails = () => {
    const base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(currentImage?.base64 || '');

    const onPressReviewPhotoSave = () => {
      setOpenCamera(false);
      setDisplayReviewPhotoPopup(false);
      setdisplayOrderPopup(false);
    };

    const onPressClickMorePhoto = () => {
      setDisplayReviewPhotoPopup(false);
      setTimeout(() => {
        setdisplayOrderPopup(true);
        setTimeout(() => {
          setOpenCamera(true);
        }, 200);
      }, 200);
    };

    return (
      <ScrollView bounces={false} style={{ flex: 1 }}>
        <View style={styles.cameraView}>
          <Text style={styles.ensureTextStyle}>
            {'Ensure your document is in focus and placed with in the box'}
          </Text>
          <View style={styles.reviewPhotoDetailsViewStyle}>
            <Image
              style={styles.reviewPhotoImageStyle}
              resizeMode={'contain'}
              source={{ uri: fin }}
            />
          </View>
          <View style={styles.bottonButtonContainer}>
            <Button
              onPress={onPressReviewPhotoSave}
              title={'SAVE'}
              style={styles.bottomWhiteButtonStyle}
              titleTextStyle={styles.bottomWhiteButtonTextStyle}
            />
            {/* UI for multiple images */}
            <View style={styles.buttonSeperatorStyle} />
            <View style={styles.bottomButtonStyle}>
              <Button
                onPress={onPressClickMorePhoto}
                title={string.health_records_home.clickPhotos}
                style={styles.bottomButtonStyle}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderUploadPrescriptionPopup = (id: number) => {
    const displayPopup = displayOrderPopup;
    const _setUpdatedImageArray = (response: any) => {
      if (selectedRecord) {
        setUpdatedImageArray([...updatedImageArray, ...response]);
      }
    };

    const onResponseCall = (selectedType: any, response: any, type: any) => {
      setdisplayOrderPopup(false);
      if (selectedType == 'CAMERA_AND_GALLERY') {
        if (response.length == 0) return;
        if (type === 'Camera') {
          setDisplayReviewPhotoPopup(true);
          setCurrentImage(response[0]);
        }
        // Logic for multiple images
        setImages([...Images, ...response]);
        _setUpdatedImageArray(response);
        setdisplayOrderPopup(false);
      }
    };

    const onClickClose = () => {
      setdisplayOrderPopup(false);
    };

    return (
      <UploadPrescriprionPopup
        type={'Consult Flow'}
        isVisible={displayPopup}
        openCamera={openCamera}
        phrUpload={true}
        disabledOption="NONE"
        heading={'Upload File'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
        }}
        onClickClose={onClickClose}
        onResponse={(selectedType: any, response: any, type) => {
          onResponseCall(selectedType, response, type);
        }}
      />
    );
  };

  const renderReviewPhotoPopup = () => {
    return (
      <Overlay
        onRequestClose={() => setDisplayReviewPhotoPopup(false)}
        isVisible={displayReviewPhotoPopup}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        overlayStyle={styles.phrOverlayStyle}
      >
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            <Header
              container={styles.headerContainerStyle}
              title="REVIEW YOUR DOCUMENT"
              leftIcon="backArrow"
              onPressLeftIcon={onPressCloseReview}
              rightComponent={headerRightComponent()}
            />
            {renderReviewPhotoDetails()}
          </SafeAreaView>
        </View>
      </Overlay>
    );
  };

  const renderTopView = () => {
    return (
      <View style={styles.dropDownContainer}>
        {/* <Text style={styles.fieldTitle}>{'Record for'}</Text>
        {renderDropDownContainer()} */}
        <Text style={[styles.fieldTitle, { marginTop: 25 }]}>
          {'Record Type'}
          <Text style={{ color: 'red' }}>{'*'}</Text>
        </Text>
        <View style={[styles.renderPHRCategories, { marginRight: 5 }]}>
          <TouchableOpacity style={{ top: 5, marginLeft: 5 }} onPress={() => handleConsultDoctor()}>
            {!!consultColor || documentType === 'Prescription' ? (
              <ConsultGreen size="sm" style={{ width: 30, height: 30 }} />
            ) : (
              <UnSelectedPrescription size="sm" style={{ width: 18, height: 18 }} />
            )}
            <Text
              style={[
                styles.fieldTitle,
                {
                  marginTop: 13,
                  color: !!consultColor || documentType === 'Prescription' ? 'black' : 'grey',
                },
              ]}
            >
              {'Consult & Prescription'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ top: 5, marginRight: 23 }} onPress={() => handleTestReport()}>
            {!!labTestColor || documentType === 'LabTest' ? (
              <SelectedTestReport size="sm" style={{ width: 30, height: 30 }} />
            ) : (
              <LabTestGreen size="sm" style={{ width: 20, height: 20 }} />
            )}
            <Text
              style={[
                styles.fieldTitle,
                {
                  marginTop: 13,
                  color: !!labTestColor || documentType === 'LabTest' ? 'black' : 'grey',
                },
              ]}
            >
              {'Test Report'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.renderPHRCategories]}>
          <TouchableOpacity style={{ top: 5, marginLeft: 5 }} onPress={() => handleBills()}>
            {!!billColor || documentType === 'Bill' ? (
              <SelectedBills size="sm" style={{ width: 30, height: 30 }} />
            ) : (
              <BillGreen size="sm" style={{ width: 20, height: 20 }} />
            )}
            <Text
              style={[
                styles.fieldTitle,
                { marginTop: 13, color: !!billColor || documentType === 'Bill' ? 'black' : 'grey' },
              ]}
            >
              {'Bills'}
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={{ top: 5 }} onPress={() => handleInsurance()}>
            {!!insuranceColor || documentType === 'Insurance' ? (
              <SelectedInsurance size="sm" style={{ width: 30, height: 30 }} />
            ) : (
              <InsuranceGreen size="sm" style={{ width: 20, height: 20 }} />
            )}
            <Text
              style={[
                styles.fieldTitle,
                {
                  marginTop: 13,
                  color: !!insuranceColor || documentType === 'Insurance' ? 'black' : 'grey',
                },
              ]}
            >
              {'Insurance'}
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={{ top: 5, right: 5 }} onPress={() => handleHospitalization()}>
            {!!hospitalColor || documentType === 'Hospitalization' ? (
              <SelectedHospitalization size="sm" style={{ width: 30, height: 30 }} />
            ) : (
              <HospitalGreen size="sm" style={{ width: 20, height: 20 }} />
            )}
            <Text
              style={[
                styles.fieldTitle,
                {
                  marginTop: 13,
                  color: !!hospitalColor || documentType === 'Hospitalization' ? 'black' : 'grey',
                },
              ]}
            >
              {'Hospitalization'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.commonTextInputView}>
          <Text style={[styles.fieldTitle]}>{'Record Date*'}</Text>
          <TouchableOpacity style={styles.recordBtn} onPress={() => renderDatePicker()}>
            <Text style={styles.recordCalendar}>
              {dateOfTest !== '' ? dateOfTest : 'DD/MM/YYYY'}
            </Text>
            <CalendarBlackIcon style={styles.calendarIcon} />
          </TouchableOpacity>
        </View> */}

        {/* {!!insuranceColor ? (
          <View style={styles.commonTextInputView}>
            <Text style={[styles.fieldTitle]}>{'Record End Date*'}</Text>
            <TouchableOpacity style={styles.recordBtn} onPress={() => renderEndDatePicker()}>
              <Text style={styles.recordCalendar}>
                {endDateTest !== '' ? endDateTest : 'DD/MM/YYYY'}
              </Text>
              <CalendarBlackIcon style={styles.calendarIcon} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.commonView}>
          <Text style={[styles.fieldTitle]}>{'Record Name*'}</Text>
          <TextInput
            placeholder={'Enter Record Name'}
            style={styles.doctorInputContainer}
            numberOfLines={1}
            value={recordName}
            onChangeText={(recordName) => {
              if (isValidText(recordName)) {
                setRecordName(recordName);
              }
            }}
          ></TextInput>
        </View> */}

        {/* {!!insuranceColor ? (
          <>
            <View style={styles.commonView}>
              <Text style={[styles.fieldTitle]}>{'Record ID Number'}</Text>
              <TextInput
                placeholder={'Enter ID Number'}
                style={styles.doctorInputContainer}
                numberOfLines={1}
                value={recordIDNumber}
                onChangeText={(recId) => {
                  if (isValidText(recId)) {
                    setRecordIDNumber(recId);
                  }
                }}
              ></TextInput>
            </View>
            <View style={styles.commonView}>
              <Text style={[styles.fieldTitle]}>{'Record Insurance Amount'}</Text>
              <TextInput
                placeholder={'Enter Insurance Amount'}
                style={styles.doctorInputContainer}
                numberOfLines={1}
                value={insuranceAmount}
                onChangeText={(amount) => {
                  if (isValidText(amount)) {
                    setInsuranceAmount(amount);
                  }
                }}
              ></TextInput>
            </View>
          </>
        ) : null} */}

        {/* {!!billColor || !!insuranceColor ? null : (
          <View style={styles.commonTextInputView}>
            <Text style={[styles.fieldTitle]}>{`Record Doctor's Name*`}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <Text
                style={[
                  styles.fieldTitle,
                  { left: 7, top: 9, ...theme.fonts.IBMPlexSansMedium(15) },
                ]}
              >
                {'Dr.'}
              </Text>
              <TextInput
                placeholder={'Enter Doctor Name'}
                style={[
                  styles.doctorInputContainer,
                  { left: 13, borderBottomWidth: 0, borderBottomColor: 'transparent', top: 5 },
                ]}
                numberOfLines={1}
                value={recordDoctorName}
                onChangeText={(docName) => {
                  if (isValidText(docName)) {
                    setRecordDoctorName(docName);
                  }
                }}
              ></TextInput>
            </View>
          </View>
        )} */}
        {/* {!!labTestColor || !!billColor || !!hospitalColor ? (
          <View style={styles.commonView}>
            <Text style={[styles.fieldTitle]}>{`Record Hospital's Name*`}</Text>
            <TextInput
              placeholder={'Enter Hospital Name'}
              style={styles.doctorInputContainer}
              numberOfLines={1}
              value={hospitalName}
              onChangeText={(hospName) => {
                if (isValidText(hospName)) {
                  setHospitalName(hospName);
                }
              }}
            ></TextInput>
          </View>
        ) : null} */}
        {/* {!!billColor ? (
          <View
            style={[
              {
                marginBottom: Platform.OS === 'android' ? 120 : 30,
                flexDirection: 'column',
                top: 25,
                width: '100%',
              },
            ]}
          >
            <Text
              style={[styles.fieldTitle, { left: Platform.OS === 'ios' ? 4 : 0 }]}
            >{`Record Bill Number`}</Text>
            <TextInput
              placeholder={'Enter Bill Number'}
              style={[
                styles.doctorInputContainer,
                {
                  borderBottomWidth: 2,
                  borderBottomColor: '#00B38E',
                  padding: Platform.OS === 'ios' ? 5 : 2,
                },
              ]}
              numberOfLines={1}
              value={recordBillNo}
              onChangeText={(billNo) => {
                if (isValidText(billNo)) {
                  setRecordBillNo(billNo);
                }
              }}
            ></TextInput>
          </View>
        ) : null} */}
        {/* {!!consultColor || !!labTestColor ? (
          <View
            style={{
              marginTop: 25,
              justifyContent: 'space-around',
              width: '100%',
              marginBottom: !!consultColor ? 40 : 0,
            }}
          >
            {!!labTestColor ? renderRecordDetailsTestReports() : null}
          </View>
        ) : null} */}
        {/* {!!labTestColor || !!insuranceColor || !!hospitalColor ? (
          <View
            style={[
              styles.commonView,
              {
                marginBottom: Platform.OS === 'android' ? 120 : 70,
              },
            ]}
          >
            <Text style={[styles.fieldTitle, { left: Platform.OS === 'ios' ? 4 : 2 }]}>
              {'Additional Notes'}
            </Text>
            <TextInput
              placeholder={'Enter Additional Notes'}
              style={[
                styles.doctorInputContainer,
                {
                  borderBottomWidth: 2,
                  borderBottomColor: '#00B38E',
                  padding: Platform.OS === 'ios' ? 5 : 0,
                },
              ]}
              numberOfLines={1}
              value={additionalNotes}
              onChangeText={(addNotes) => {
                if (isValidText(addNotes)) {
                  setAdditionalNotes(addNotes);
                }
              }}
            ></TextInput>
          </View>
        ) : null} */}
      </View>
    );
  };

  const handleTestReport = () => {
    setLabTestColor(true);
    setDocumentType('');
    setConsultColor(false);
    setBillColor(false);
    setInsuranceColor(false);
    setHospitalColor(false);
    // setdateOfTest('');
    // setRecordName('');
    // setRecordDoctorName('');
    // setTestRecordParameters([]);
    // setHospitalName('');
    // setAdditionalNotes('');
  };

  const handleConsultDoctor = () => {
    setConsultColor(true);
    setDocumentType('');
    setBillColor(false);
    setInsuranceColor(false);
    setHospitalColor(false);
    setLabTestColor(false);
    // setdateOfTest('');
    // setRecordName('');
    // setRecordDoctorName('');
    // setPrescriptionParameters([]);
  };

  const handleBills = () => {
    setBillColor(true);
    setDocumentType('');
    setLabTestColor(false);
    setConsultColor(false);
    setInsuranceColor(false);
    setHospitalColor(false);
    // setdateOfTest('');
    // setRecordName('');
    // setEndDateTest('');
    // setHospitalName('');
  };

  const handleInsurance = () => {
    setInsuranceColor(true);
    setDocumentType('');
    setBillColor(false);
    setLabTestColor(false);
    setConsultColor(false);
    setHospitalColor(false);
    // setdateOfTest('');
    // setRecordName('');
    // setEndDateTest('');
    // setAdditionalNotes('');
  };

  const handleHospitalization = () => {
    setHospitalColor(true);
    setDocumentType('');
    setInsuranceColor(false);
    setBillColor(false);
    setLabTestColor(false);
    setConsultColor(false);
    // setRecordName('');
    // setRecordDoctorName('');
    // setdateOfTest('');
    // setHospitalName('');
    // setAdditionalNotes('');
  };

  const renderDatePicker = () => {
    Keyboard.dismiss();
    setIsDateTimePickerVisible(true);
    setShowTime(true);
  };

  const renderEndDatePicker = () => {
    Keyboard.dismiss();
    setIsDateTimePickerVisible(true);
    setShowEndTime(true);
  };

  const headerRightComponent = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPressCloseReview}>
        <Remove />
      </TouchableOpacity>
    );
  };

  const renderDropDownContainer = () => {
    return (
      <MaterialMenu
        options={patientNames?.map((item) => ({
          key: item?.firstName,
          value: item?.firstName,
        }))}
        menuContainerStyle={{ alignItems: 'flex-end', marginLeft: width / 2 - 95 }}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 14, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        bottomPadding={{ paddingBottom: 20 }}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 14, '#01475b') }}
        onPress={(item: any) => {
          setShowName(item?.value);
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text style={[styles.placeholderTextStyle]}>
              {!!showName ? showName : 'Patient Name'}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderRecordDetailsTestReports = () => {
    const onPressAddRecordParameter = () => {
      const dataCopy = [...testRecordParameters];
      dataCopy.push(TestRecordInitialValues);
      setTestRecordParameters(dataCopy);
    };

    const onPressRemoveRecordParameter = (i: number) => {
      const dataCopy = [...testRecordParameters];
      dataCopy?.splice(i, 1);
      setTestRecordParameters(dataCopy);
    };

    const setTestParametersData = (key: string, value: string, i: number, isNumber?: boolean) => {
      const dataCopy = [...testRecordParameters];
      dataCopy[i] = {
        ...dataCopy[i],
        [key]: isNumber ? formatNumber(value) : value,
      };
      setTestRecordParameters(dataCopy);
    };

    const formatNumber = (value: string) => {
      let number =
        value.indexOf('.') === value.length - 1 ||
        value.indexOf('0', value.length - 1) === value.length - 1 ||
        value.indexOf('-') === value.length - 1
          ? value
          : parseFloat(value);
      return number || 0;
    };

    const rightElementParameter = (i: number) => {
      return (
        <TouchableOpacity activeOpacity={1} onPress={() => onPressRemoveRecordParameter(i)}>
          <RedCross style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
      );
    };

    const renderListItem = (
      title: string,
      rightIcon: boolean = true,
      inputRef?: TextInput | any | null,
      onPressEditDate?: () => void
    ) => {
      const renderTitle = () => {
        return <Text style={styles.parameterNameStyle}>{title}</Text>;
      };
      const renderRightElement = () => {
        return (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              onPressEditDate?.();
              if (inputRef?.current) {
                inputRef?.current?.focus();
              }
            }}
          ></TouchableOpacity>
        );
      };
      return (
        <ListItem
          title={renderTitle()}
          pad={14}
          containerStyle={{ paddingTop: 0, paddingBottom: 3, paddingRight: 10 }}
          rightElement={rightIcon ? renderRightElement() : undefined}
        />
      );
    };

    const renderTitleParameter = () => {
      return <Text style={styles.parameterNameStyle}>{'Parameter Name'}</Text>;
    };

    return (
      <View style={{ backgroundColor: 'white', borderRadius: 5 }}>
        <View style={[styles.recordDetailsView, { marginBottom: 0 }]}>
          <TouchableOpacity style={styles.recordBtn} onPress={() => onPressAddRecordParameter()}>
            <Text style={[styles.recordCalendar, { color: '#01475B' }]}>{'RECORD DETAILS'}</Text>
            <BlackPlus style={styles.calendarIcon} />
          </TouchableOpacity>
        </View>
        {testRecordParameters.map((item, i) => (
          <View
            style={{
              borderBottomWidth: testRecordParameters?.length > 1 ? 0.5 : 0,
              padding: 20,
              marginBottom: 5,
              borderBottomColor: testRecordParameters?.length > 1 ? 'grey' : 'transparent',
            }}
          >
            <View style={{ marginTop: 5 }}>
              <ListItem
                title={renderTitleParameter()}
                pad={14}
                containerStyle={styles.parameterContainerStyle}
                rightElement={rightElementParameter(i)}
              />
              <TextInput
                placeholder={'Enter name'}
                style={[styles.textInputStyle, { marginBottom: 0 }]}
                selectionColor={theme.colors.SKY_BLUE}
                numberOfLines={1}
                placeholderTextColor={theme.colors.placeholderTextColor}
                underlineColorAndroid={'transparent'}
                value={item.parameterName || ''}
                onChangeText={(value) => {
                  if (isValidText(value)) {
                    setTestParametersData('parameterName', value, i);
                  }
                }}
              />
            </View>
            <View style={{ marginTop: 20 }}>
              {renderListItem('Result', true)}
              <View
                style={{
                  flexDirection: 'row',
                }}
              >
                <TextInput
                  placeholder={'0'}
                  style={[styles.textInputStyle, { marginBottom: 0 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.result || '').toString()}
                  onChangeText={(value) => setTestParametersData('result', value, i, true)}
                  keyboardType={numberKeyboardType}
                />
                <TextInput
                  placeholder={'unit'}
                  style={[styles.textInputStyle, { marginBottom: 0, left: 20, marginRight: 15 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.unit || '').toString()}
                  onChangeText={(value) => {
                    if (/^([a-zA-Z0-9 %]+[ ]{0,1}[a-zA-Z0-9\-.\\/%?,&]*)*$/.test(value)) {
                      setTestParametersData('unit', value, i);
                    }
                  }}
                />
              </View>
            </View>
            <View style={{ marginTop: 20 }}>
              {renderListItem('Range', true)}
              <View style={styles.minView}>
                <TextInput
                  placeholder={'min'}
                  style={[styles.textInputStyle, { marginBottom: 0 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.minimum || '').toString()}
                  onChangeText={(value) => setTestParametersData('minimum', value, i, true)}
                  keyboardType={numberKeyboardType}
                />
                <TextInput
                  placeholder={'unit'}
                  style={[styles.textInputStyle, { marginBottom: 0, left: 15 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.unit || '').toString()}
                  onChangeText={(value) => {
                    if (/^([a-zA-Z0-9 %]+[ ]{0,1}[a-zA-Z0-9\-.\\/%?,&]*)*$/.test(value)) {
                      setTestParametersData('unit', value, i);
                    }
                  }}
                />
                <TextInput
                  placeholder={'max'}
                  style={[styles.textInputStyle, { marginBottom: 0, left: 30 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.maximum || '').toString()}
                  onChangeText={(value) => setTestParametersData('maximum', value, i, true)}
                  keyboardType={numberKeyboardType}
                />
                <TextInput
                  placeholder={'unit'}
                  style={[styles.textInputStyle, { marginBottom: 0, left: 45, marginRight: 40 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.unit || '').toString()}
                  onChangeText={(value) => {
                    if (/^([a-zA-Z0-9 %]+[ ]{0,1}[a-zA-Z0-9\-.\\/%?,&]*)*$/.test(value)) {
                      setTestParametersData('unit', value, i);
                    }
                  }}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // const renderMedicalDetailsPrescription = () => {
  //   const onPressAddRecordParameter = () => {
  //     const dataCopy = [...prescriptionParameters];
  //     dataCopy.push(PrescriptionInitialValues);
  //     setPrescriptionParameters(dataCopy);
  //   };

  //   const onPressRemoveRecordParameter = (i: number) => {
  //     const dataCopy = [...prescriptionParameters];
  //     dataCopy?.splice(i, 1);
  //     setPrescriptionParameters(dataCopy);
  //   };

  //   const setPrescriptionParametersData = (
  //     key: string,
  //     value: string,
  //     i: number,
  //     isNumber?: boolean
  //   ) => {
  //     const dataCopy = [...prescriptionParameters];
  //     dataCopy[i] = {
  //       ...dataCopy[i],
  //       [key]: isNumber ? formatNumber(value) : value,
  //     };
  //     setPrescriptionParameters(dataCopy);
  //   };

  //   const formatNumber = (value: string) => {
  //     let number =
  //       value.indexOf('.') === value.length - 1 ||
  //       value.indexOf('0', value.length - 1) === value.length - 1 ||
  //       value.indexOf('-') === value.length - 1
  //         ? value
  //         : parseFloat(value);
  //     return number || 0;
  //   };

  //   const rightElementParameter = (i: number) => {
  //     return (
  //       <TouchableOpacity activeOpacity={1} onPress={() => onPressRemoveRecordParameter(i)}>
  //         <RedCross style={{ width: 20, height: 20 }} />
  //       </TouchableOpacity>
  //     );
  //   };

  //   const renderListItem = (
  //     title: string,
  //     rightIcon: boolean = true,
  //     inputRef?: TextInput | any | null,
  //     onPressEditDate?: () => void
  //   ) => {
  //     const renderTitle = () => {
  //       return <Text style={styles.parameterNameStyle}>{title}</Text>;
  //     };
  //     const renderRightElement = () => {
  //       return (
  //         <TouchableOpacity
  //           activeOpacity={1}
  //           onPress={() => {
  //             onPressEditDate?.();
  //             if (inputRef?.current) {
  //               inputRef?.current?.focus();
  //             }
  //           }}
  //         ></TouchableOpacity>
  //       );
  //     };
  //     return (
  //       <ListItem
  //         title={renderTitle()}
  //         pad={14}
  //         containerStyle={{ paddingTop: 0, paddingBottom: 3, paddingRight: 10 }}
  //         rightElement={rightIcon ? renderRightElement() : undefined}
  //       />
  //     );
  //   };

  //   const renderTitleParameter = () => {
  //     return <Text style={styles.parameterNameStyle}>{'Medication'}</Text>;
  //   };

  //   return (
  //     <View
  //       style={{
  //         backgroundColor: 'white',
  //         borderRadius: 5,
  //         marginBottom: Platform.OS === 'android' ? 40 : 0,
  //       }}
  //     >
  //       <View style={[styles.recordDetailsView, { marginBottom: 0 }]}>
  //         <TouchableOpacity style={styles.recordBtn} onPress={() => onPressAddRecordParameter()}>
  //           <Text style={[styles.recordCalendar, { color: '#01475B' }]}>
  //             {'MEDICATION DETAILS'}
  //           </Text>
  //           <BlackPlus style={styles.calendarIcon} />
  //         </TouchableOpacity>
  //       </View>
  //       {prescriptionParameters.map((item, i) => (
  //         <View
  //           style={{
  //             borderBottomWidth: prescriptionParameters?.length > 1 ? 0.5 : 0,
  //             padding: 20,
  //             marginBottom: 5,
  //             borderBottomColor: prescriptionParameters?.length > 1 ? 'grey' : 'transparent',
  //           }}
  //         >
  //           <View style={{ marginTop: 5 }}>
  //             <ListItem
  //               title={renderTitleParameter()}
  //               pad={14}
  //               containerStyle={styles.parameterContainerStyle}
  //               rightElement={rightElementParameter(i)}
  //             />
  //             <TextInput
  //               placeholder={'Enter name'}
  //               style={[styles.textInputStyle, { marginBottom: 0 }]}
  //               selectionColor={theme.colors.SKY_BLUE}
  //               numberOfLines={1}
  //               placeholderTextColor={theme.colors.placeholderTextColor}
  //               underlineColorAndroid={'transparent'}
  //               value={item.medication || ''}
  //               onChangeText={(value) => {
  //                 if (isValidText(value)) {
  //                   setPrescriptionParametersData('medication', value, i);
  //                 }
  //               }}
  //             />
  //           </View>
  //           <View style={{ marginTop: 20 }}>
  //             {renderListItem('Result', true)}
  //             <View
  //               style={{
  //                 flexDirection: 'row',
  //               }}
  //             >
  //               <TextInput
  //                 placeholder={'0'}
  //                 style={[styles.textInputStyle, { marginBottom: 0 }]}
  //                 selectionColor={theme.colors.SKY_BLUE}
  //                 numberOfLines={1}
  //                 placeholderTextColor={theme.colors.placeholderTextColor}
  //                 underlineColorAndroid={'transparent'}
  //                 value={(item.dosage || '').toString()}
  //                 onChangeText={(value) => setPrescriptionParametersData('dosage', value, i, true)}
  //                 keyboardType={numberKeyboardType}
  //               />
  //               <TextInput
  //                 placeholder={'unit'}
  //                 style={[styles.textInputStyle, { marginBottom: 0, left: 20, marginRight: 15 }]}
  //                 selectionColor={theme.colors.SKY_BLUE}
  //                 numberOfLines={1}
  //                 placeholderTextColor={theme.colors.placeholderTextColor}
  //                 underlineColorAndroid={'transparent'}
  //                 value={(item.unit || '').toString()}
  //                 onChangeText={(value) => {
  //                   if (/^([a-zA-Z0-9 %]+[ ]{0,1}[a-zA-Z0-9\-.\\/%?,&]*)*$/.test(value)) {
  //                     setPrescriptionParametersData('unit', value, i);
  //                   }
  //                 }}
  //               />
  //             </View>
  //           </View>
  //         </View>
  //       ))}
  //     </View>
  //   );
  // };

  const isTestReportValid = () => {
    const validRecordDetails1 = dateOfTest && testName && recordDoctorName;
    const valid = isTestRecordParameterFilled().map((item) => {
      return {
        maxmin: (item?.maximum || item?.minimum) && item?.maximum! > item?.minimum!,
        changed: true,
        notinitial:
          item?.parameterName === '' &&
          item?.result === 0 &&
          item?.maximum === 0 &&
          item?.minimum === 0,
      };
    });

    let message = !dateOfTest
      ? 'Please enter Record date'
      : !testName
      ? 'Please enter record name'
      : !recordDoctorName
      ? 'Please enter record doctor’s name'
      : '';

    message === '' &&
      valid.forEach((item) => {
        if (item?.maxmin === false) {
          message = 'Please enter valid Maximum and Minimum';
        }
      });

    const finval = validRecordDetails1;
    return {
      isvalid: finval,
      isValidParameter:
        valid.find((i) => i?.maxmin === false || (i?.changed === false && !i?.notinitial)) !==
        undefined,
      message: message,
    };
  };

  const isPrescriptionValid = () => {
    const validRecordDetails1 = dateOfTest && testName && recordDoctorName;
    const valid = isPrescriptionParameterFilled().map((item) => {
      return {
        changed: true,
        notinitial: item?.medication === '' && item?.dosage === 0 && item?.unit === '',
      };
    });

    const message = !dateOfTest
      ? 'Please enter Record date'
      : !testName
      ? 'Please enter record name'
      : !recordDoctorName
      ? 'Please enter record doctor’s name'
      : '';

    const finval = validRecordDetails1;
    return {
      isvalid: finval,
      message: message,
    };
  };

  const isTestRecordParameterFilled = () => {
    const testRecordsVaild = testRecordParameters
      .map((item) => {
        return item !== TestRecordInitialValues
          ? {
              ...item,
              result: parseFloat((item?.result || 0).toString()),
              maximum: parseFloat((item?.maximum || 0).toString()),
              minimum: parseFloat((item?.minimum || 0).toString()),
            }
          : undefined;
      })
      .filter((item) => item !== undefined) as LabTestParameters[];

    if (testRecordsVaild?.length > 0) {
      setTestRecordParameters(testRecordsVaild);
      return testRecordsVaild;
    } else {
      return [];
    }
  };

  const isPrescriptionParameterFilled = () => {
    const prescriptionRecordsVaild = prescriptionParameters
      .map((item) => {
        return item !== PrescriptionInitialValues
          ? {
              ...item,
              dosage: parseFloat((item?.dosage || 0).toString()),
            }
          : undefined;
      })
      .filter((item) => item !== undefined) as PrescriptionParameters[];

    if (prescriptionRecordsVaild?.length > 0) {
      setTestRecordParameters(prescriptionRecordsVaild);
      return prescriptionRecordsVaild;
    } else {
      return [];
    }
  };

  const isValidImage = () => {
    if (Images?.length === 0) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please add document',
      });
      return false;
    } else if (Images?.length > 10) {
      showMaxFileUploadAlert();
      return false;
    } else {
      return true;
    }
  };

  const showMaxFileUploadAlert = () => {
    showAphAlert!({
      title: 'Alert!',
      description: string.common.phr_max_file_text,
    });
  };

  const getAddedImages = () => {
    let imagesArray = [] as any;
    Images?.forEach((item: any) => {
      let imageObj = {} as any;
      imageObj.fileName = item?.title + '.' + item?.fileType;
      imageObj.mimeType = mimeType(item?.title + '.' + item?.fileType);
      imageObj.content = item?.base64;
      imagesArray.push(imageObj);
    });
    return imagesArray;
  };

  const onUploadDocument = () => {
    const addedImages = getAddedImages();
    const fileType = labTestColor
      ? 'LabTest'
      : insuranceColor
      ? 'Insurance'
      : hospitalColor
      ? 'Hospitalization'
      : billColor
      ? 'Bill'
      : consultColor
      ? 'Prescription'
      : documentType;
    setShowSpinner(true);
    if (isValidImage()) {
      const supressMobileNo = currentPatient?.mobileNumber.slice(-10);
      client
        .mutate<saveClinicalDocuments, saveClinicalDocumentsVariables>({
          mutation: SAVE_CLINICAL_DOCUMENTS,
          variables: {
            addClinicalDocumentInput: {
              id: selectedID,
              mobileNumber: supressMobileNo,
              uhid: currentPatient?.uhid,
              lastmodifieddate: '0',
              uploadedVia: 'PHR',
              fileType: fileType,
              fileInfoList: [],
              source: '247self',
            },
          },
        })
        .then((response: any) => {
          setShowSpinner(false);
          let dateOfBirth = g(currentPatient, 'dateOfBirth');
          let attributes = {
            'Nav src': 'Clinical Documents',
            'Patient UHID': g(currentPatient, 'uhid'),
            'Patient gender': g(currentPatient, 'gender'),
            'Patient age': moment(dateOfBirth).format('YYYY-MM-DD'),
          };
          postCleverTapEvent(CleverTapEventName.PHR_UPDATE_RECORD, attributes);
          props.navigation.navigate(AppRoutes.ClinicalDocumentListing, { apiCall: true });
        })
        .catch((error: any) => {
          setShowSpinner(false);
          currentPatient && handleGraphQlError(error);
          CommonBugFender('OOPS Something went wrong', error);
        });
    } else {
      setShowSpinner(false);
    }
  };

  const onGoBack = () => {
    props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
  };

  const renderAddButton = () => {
    return (
      <View style={{ marginTop: 30, width: '80%', alignSelf: 'center', marginBottom: 20 }}>
        <Button
          style={{ width: '100%' }}
          title={'EDIT RECORD'}
          onPress={() => onUploadDocument()}
        />
      </View>
    );
  };
  return (
    <View style={styles.mainViewStyle}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          title={'EDIT RECORD'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
        <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
          {renderUploadedImages(1)}
          {renderTopView()}
          {renderAddButton()}
        </ScrollView>
        {displayReviewPhotoPopup && currentImage && renderReviewPhotoPopup()}
        {displayOrderPopup && renderUploadPrescriptionPopup(1)}
        <DatePicker
          isDateTimePickerVisible={isDateTimePickerVisible}
          handleDatePicked={(date) => {
            const formatDate = moment(date).format(string.common.date_placeholder_text);
            !!showTime ? setdateOfTest(formatDate) : setEndDateTest(formatDate);
            setShowTime(false);
            setShowEndTime(false);
            setIsDateTimePickerVisible(false);
            Keyboard.dismiss();
          }}
          hideDateTimePicker={() => {
            setIsDateTimePickerVisible(false);
            Keyboard.dismiss();
          }}
        />
      </SafeAreaView>
    </View>
  );
  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
      </SafeAreaView>
    </View>
  );
};
