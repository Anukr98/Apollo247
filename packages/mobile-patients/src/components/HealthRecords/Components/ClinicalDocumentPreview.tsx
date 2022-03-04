import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  FileBig,
  Remove,
  GreenCross,
  YellowCamera,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { Overlay } from 'react-native-elements';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useApolloClient } from 'react-apollo-hooks';
import {
  saveClinicalDocuments,
  saveClinicalDocumentsVariables,
} from '@aph/mobile-patients/src/graphql/types/saveClinicalDocuments';
import { SAVE_CLINICAL_DOCUMENTS } from '@aph/mobile-patients/src/graphql/profiles';
import { AddClinicalDocumentDetails } from '@aph/mobile-patients/src/components/HealthRecords/Components/AddClinicalDocumentDetails';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  g,
  handleGraphQlError,
  postCleverTapEvent,
  postCleverTapPHR,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

const styles = StyleSheet.create({
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
  bottonButtonContainer: {
    flex: 1,
    // flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 20,
  },
  bottomButtonStyle: {
    flex: 1,
  },
  bottomWhiteButtonStyle: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
    elevation: 0,
  },
  bottomWhiteButtonTextStyle: {
    color: theme.colors.APP_YELLOW,
  },
  buttonSeperatorStyle: {
    width: 16,
  },
  reviewPhotoDetailsViewStyle: {
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    justifyContent: 'center',
    marginTop: 23,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  imageViewStyle: {
    height: 122,
    width: 112,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
  },
  imageStyle: { height: 122, width: 112 },
  stickyBottomComponentStyle: {
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
    top: Dimensions.get('window').height - 300,
    width: '90%',
  },
  ensureTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 15.6),
    textAlign: 'center',
  },
  reviewPhotoImageStyle: {
    height: 350,
    width: '100%',
  },
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  imageListViewStyle: {
    marginTop: 6,
    marginHorizontal: 21,
    marginBottom: 100,
    flexDirection: 'row',
  },
  addMoreImageViewStyle: { width: 112, height: 122, paddingTop: 10 },
  removeIconViewStyle: {
    position: 'absolute',
    right: -8,
    zIndex: 99,
    top: -8,
    paddingBottom: 10,
    paddingLeft: 10,
  },
  saveBtnStyle: {
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCB716',
    backgroundColor: 'white',
    width: '40%',
  },
  clickMore: {
    left: 10,
    width: '45%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  photoViewText: {
    marginTop: 28,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
});

type PickerImage = any;

export enum MedicRecordType {
  TEST_REPORT = 'TEST_REPORT',
  CONSULTATION = 'CONSULTATION',
  PRESCRIPTION = 'PRESCRIPTION',
  HEALTHCHECK = 'HEALTHCHECK',
  HOSPITALIZATION = 'HOSPITALIZATION',
}

export interface ClinicalDocumentPreviewProps
  extends NavigationScreenProps<{
    onRecordAdded: () => void;
  }> {}

export const ClinicalDocumentPreview: React.FC<ClinicalDocumentPreviewProps> = (props) => {
  let fin = '';
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [displayReviewPhotoPopup, setDisplayReviewPhotoPopup] = useState<boolean>(false);
  const [Images, setImages] = useState<PickerImage>(props.navigation.state.params ? [] : []);
  const [currentImage, setCurrentImage] = useState<PickerImage>(null);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [deleteFileArray, setDeleteFileArray] = useState<any>([]);
  const [updatedImageArray, setUpdatedImageArray] = useState<PickerImage>([]);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const client = useApolloClient();
  const { showAphAlert } = useUIElements();

  const selectedRecord = props.navigation.state.params
    ? props.navigation.state.params.selectedRecord
    : null;

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    setdisplayOrderPopup(true);
  }, []);

  const onPressBack = () => {
    setShowSpinner(false);
  };

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

  const renderImagesRow = (data: PickerImage, i: number, id: number) => {
    const base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(data?.base64);
    const fileType = data?.fileType;
    const deleteImage = () => {
      const imageCOPY = [...Images];
      if (data?.id) {
        setDeleteFileArray([...deleteFileArray, { index: data?.index }]);
      }
      imageCOPY.splice(i, 1);
      setImages(imageCOPY);
      CommonLogEvent('ADD_RECORD', 'Set Images');
    };

    return (
      <View style={[styles.addMoreImageViewStyle, { marginRight: 15 }]}>
        <View style={styles.imageViewStyle}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={deleteImage}
            style={styles.removeIconViewStyle}
          >
            <GreenCross style={{ width: 18, height: 18 }} />
          </TouchableOpacity>
          {fileType === 'pdf' || fileType === 'application/pdf' ? (
            <FileBig style={styles.imageStyle} />
          ) : (
            <Image style={styles.imageStyle} source={{ uri: data?.id ? data?.base64 : fin }} />
          )}
        </View>
      </View>
    );
  };

  const renderUploadedImages = (id: number) => {
    const imagesArray = Images;
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
        />
      </View>
    );
  };

  const renderData = () => {
    return <View style={{ marginTop: 28 }}>{renderUploadedImages(1)}</View>;
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

  const isValidImage = () => {
    setShowSpinner(false);
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
      description: 'Maximum of 10 documents can be uploaded',
    });
  };

  const pushToReviewPage = () => {
    const addedImages = getAddedImages();
    var pdfStringHandler = addedImages[0]?.fileName.includes('.pdf')
      ? addedImages[0]?.fileName?.slice(0, -4)
      : addedImages[0]?.fileName;
    const dateFormat = new Date();
    const dateMoment = moment(dateFormat).format('YYYY-MM-DD');
    const imageTitle = Date.parse(String(dateFormat));
    const supressMobileNo = currentPatient?.mobileNumber.slice(-10);
    if (isValidImage()) {
      setShowSpinner!(true);
      client
        .mutate<saveClinicalDocuments, saveClinicalDocumentsVariables>({
          mutation: SAVE_CLINICAL_DOCUMENTS,
          variables: {
            addClinicalDocumentInput: {
              id: '',
              createdDate: dateMoment,
              lastmodifieddate: '0',
              mobileNumber: supressMobileNo,
              uhid: currentPatient?.uhid,
              uploadedVia: 'PHR',
              fileType: '',
              fileInfoList: addedImages,
              source: '247self',
              documentName: pdfStringHandler,
            },
          },
        })
        .then((response: any) => {
          let dateOfBirth = g(currentPatient, 'dateOfBirth');
          let attributes = {
            'Nav src': 'Clinical Documents',
            'Patient UHID': g(currentPatient, 'uhid'),
            'Patient gender': g(currentPatient, 'gender'),
            'Patient age': moment(dateOfBirth).format('YYYY-MM-DD'),
          };
          postCleverTapEvent(CleverTapEventName.PHR_ADD_RECORD, attributes);
          props.navigation.navigate(AppRoutes.ClinicalDocumentImageReview, {
            imageArray: Images,
            imageTitle: pdfStringHandler,
            selfUpload: 'Self upload',
            dateFormat: dateMoment,
            onPressBack: onPressBack,
            selectedID: response?.data?.saveClinicalDocuments?.id,
            selectedImageName: addedImages[0]?.fileName,
          });
          setShowSpinner!(false);
        })
        .catch((error: any) => {
          setShowSpinner!(false);
          currentPatient && handleGraphQlError(error);
          CommonBugFender('OOPS Something went wrong', error);
        });
    }
  };

  const renderBottomButton = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          position: 'absolute',
          bottom: 20,
          alignSelf: 'center',
        }}
      >
        <Button
          title={'SAVE'}
          style={styles.saveBtnStyle}
          titleTextStyle={{ color: '#FCB716' }}
          onPress={() => pushToReviewPage()}
        />
        <Button
          title={'CLICK MORE PHOTOS'}
          style={styles.clickMore}
          onPress={() => setdisplayOrderPopup(true)}
        />
      </View>
    );
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
        <View style={styles.photoViewText}>
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
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                onPressReviewPhotoSave();
              }}
            >
              <YellowCamera />
            </TouchableOpacity>
            {/* UI for multiple images */}
            <View style={styles.buttonSeperatorStyle} />
          </View>
        </View>
      </ScrollView>
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

  const headerRightComponent = () => {
    return (
      <TouchableOpacity activeOpacity={0.5} onPress={onPressCloseReview}>
        <Remove />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        <Header
          container={styles.headerContainerStyle}
          title={'REVIEW YOUR DOCUMENT'}
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        {renderData()}
        {renderBottomButton()}
      </SafeAreaView>
      {displayReviewPhotoPopup && currentImage && renderReviewPhotoPopup()}
      {displayOrderPopup && renderUploadPrescriptionPopup(1)}
    </View>
  );
};
