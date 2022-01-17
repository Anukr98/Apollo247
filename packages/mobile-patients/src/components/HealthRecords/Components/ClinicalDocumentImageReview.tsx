import { EditAddress } from '@aph/mobile-patients/src/components/AddressSelection/EditAddress';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ClinicalPrescription,
  DeleteBlack,
  DeleteBlue,
  DeleteIcon,
  EditBlue,
  EditIcon,
  EditIconNew,
  FileBig,
  PhrEditIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  EDIT_PROFILE,
  GET_ALL_CLINICAL_DOCUMENTS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getClinicalDocuments,
  getClinicalDocumentsVariables,
} from '@aph/mobile-patients/src/graphql/types/getClinicalDocuments';
import { getPatientPrismMedicalRecords_V3_getPatientPrismMedicalRecords_V3_prescriptions_response } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V3';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import {
  deletePatientPrismMedicalRecords,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  g,
  handleGraphQlError,
  phrSortByDate,
  postCleverTapPHR,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { Props, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  BackHandler,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'react-native-elements';
import Pdf from 'react-native-pdf';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    ...theme.viewStyles.container,
  },
  mainViewStyle: {
    flex: 1,
  },
  topView: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  dateViewRender: {
    position: 'absolute',
    right: 20,
    top: 45,
  },
  doctorNameRender: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    left: 70,
    bottom: 7,
    width: '40%',
    top: 37,
    height: 24,
  },
  recordNameTextStyle: {
    ...viewStyles.text('SB', 14, '#000000', 1, 30),
    marginRight: 10,
    width: '95%',
  },
  imagePlaceHolderStyle: {
    height: 425,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  // Image Styling
  imageStyle: {
    width: '100%',
    height: 350,
  },
  addMoreImageViewStyle: { width: '100%', height: 350, paddingTop: 10 },
  imageViewStyle: {
    height: 350,
    width: '90%',
    backgroundColor: 'transparent',
    paddingHorizontal: 6,
  },
  stickyBottomComponentStyle: {
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginBottom: 10,
    width: '100%',
  },
  bottomStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
    marginBottom: 80,
  },
  imageListViewStyle: {
    marginTop: 100,
    marginHorizontal: 21,
    marginBottom: 150,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 22,
  },
  clinicalPrescriptionView: {
    position: 'absolute',
    left: 10,
    top: 45,
  },
  selfUploadTxtView: {
    ...viewStyles.text('R', 14, '#000000', 1, 30),
    marginRight: 10,
    width: '95%',
  },
});

type PickerImage = any;

export interface ClinicalDocumentImageReviewProps extends NavigationScreenProps {
  onRecordAdded: () => void;
  onPressBack: () => void;
}

export const ClinicalDocumentImageReview: React.FC<ClinicalDocumentImageReviewProps> = (props) => {
  var fin = '';
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [prescriptions, setPrescriptions] = useState<
    | (getPatientPrismMedicalRecords_V3_getPatientPrismMedicalRecords_V3_prescriptions_response | null)[]
    | null
    | undefined
  >([]);
  const [testAndHealthCheck, setTestAndHealthCheck] = useState<{ type: string; data: any }[]>();
  const imageArrays = props.navigation.state.params ? props.navigation.state.params.imageArray : [];

  const imageTitle = props.navigation.state.params
    ? props.navigation.state.params.imageTitle
    : null;
  const selfUpload = props.navigation.state.params
    ? props.navigation.state.params.selfUpload
    : null;
  const dateFormat = props.navigation.state.params
    ? props.navigation.state.params.dateFormat
    : null;
  const comingFromListing = props.navigation.state.params
    ? props.navigation.state.params.comingFromListing
    : false;

  const documentType = props.navigation.state.params
    ? props.navigation.state.params.documentType
    : '';

  const imageID = props.navigation.state.params ? props.navigation.state.params.selectedID : '';
  const id = props.navigation.state.params ? props.navigation.state.params.id : '';
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    onGoBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const getLatestLabAndHealthCheckRecords = () => {
    setShowSpinner(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [
      MedicalRecordType.TEST_REPORT,
      MedicalRecordType.HEALTHCHECK,
    ])
      .then((data: any) => {
        const labResultsData = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'labResults',
          'response'
        );
        const healthChecksData = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'healthChecks',
          'response'
        );
        let mergeArray: { type: string; data: any }[] = [];
        labResultsData?.forEach((c) => {
          mergeArray.push({ type: 'testReports', data: c });
        });
        healthChecksData?.forEach((c) => {
          mergeArray.push({ type: 'healthCheck', data: c });
        });
        setShowSpinner(false);
        props.navigation.navigate(AppRoutes.TestReportScreen, {
          testReportsData: phrSortByDate(mergeArray),
          callDataBool: true,
        });
      })
      .catch((error) => {
        CommonBugFender('TestReportScreen_getPatientPrismMedicalRecordsApi', error);
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  const fetchPrescriptionData = () => {
    setShowSpinner(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [MedicalRecordType.PRESCRIPTION])
      .then((data: any) => {
        const prescriptionsData = g(
          data,
          'getPatientPrismMedicalRecords_V3',
          'prescriptions',
          'response'
        );
        setShowSpinner(false);
        props.navigation.navigate(AppRoutes.ConsultRxScreen, {
          prescriptionArray: prescriptionsData,
          callDataBool: true,
        });
      })
      .catch((error) => {
        CommonBugFender('HealthRecordsHome_fetchPrescriptionData', error);
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setShowSpinner(false));
  };

  const onGoBack = () => {
    if (documentType === 'LabTest') {
      getLatestLabAndHealthCheckRecords();
    } else if (documentType === 'Hospitalization') {
      props.navigation.navigate(AppRoutes.HospitalizationScreen, { callDataBool: true });
    } else if (documentType === 'Prescription') {
      fetchPrescriptionData();
    } else if (documentType === 'Insurance') {
      props.navigation.navigate(AppRoutes.InsuranceScreen, { callDataBool: true });
    } else if (documentType === 'Bill') {
      props.navigation.navigate(AppRoutes.BillScreen, { callDataBool: true });
    } else {
      props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
      props.navigation.navigate(AppRoutes.ClinicalDocumentListing, { apiCall: true });
    }
  };

  const renderUploadedImages = (id: number) => {
    const imagesArray = imageArrays;
    return (
      <View style={styles.imageListViewStyle}>
        <FlatList
          bounces={false}
          data={imagesArray}
          collapsable
          onEndReachedThreshold={0.5}
          renderItem={({ item, index }) => renderImagesRow(item, index, id)}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
    );
  };

  const renderImagesRow = (data: PickerImage, i: number, id: number) => {
    const base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(data?.base64);
    const fileType = comingFromListing ? data?.mimeType : data?.fileType;
    return (
      <View style={[styles.addMoreImageViewStyle, { marginRight: 15, marginTop: 15 }]}>
        <View style={styles.imageViewStyle}>
          {fileType === 'pdf' || fileType === 'application/pdf' ? (
            <Pdf
              key={comingFromListing ? data?.file_Url : ''}
              source={{ uri: comingFromListing ? data?.file_Url : '' }}
              style={styles.imageStyle}
            />
          ) : (
            <Image
              style={styles.imageStyle}
              source={{ uri: comingFromListing ? data?.file_Url : data?.id ? data?.base64 : fin }}
            />
          )}
        </View>
      </View>
    );
  };

  const renderTestTopDetailsView = () => {
    const renderDateView = () => {
      return <Text style={{ ...viewStyles.text('R', 12, '#000000', 1, 14) }}>{dateFormat}</Text>;
    };
    return (
      <View style={styles.topView}>
        <View style={styles.dateViewRender}>{renderDateView()}</View>
        <View style={styles.clinicalPrescriptionView}>
          <ClinicalPrescription />
        </View>
        <View style={styles.doctorNameRender}>
          <Text numberOfLines={1} style={styles.recordNameTextStyle}>
            {imageTitle}
          </Text>
          <Text style={styles.selfUploadTxtView}>{selfUpload}</Text>
        </View>
      </View>
    );
  };

  const navigateToListingPage = (editBool: boolean) => {
    const supressMobileNo = currentPatient?.mobileNumber.slice(-10);
    client
      .query<getClinicalDocuments, getClinicalDocumentsVariables>({
        query: GET_ALL_CLINICAL_DOCUMENTS,
        variables: { uhid: currentPatient?.uhid, mobileNumber: supressMobileNo },
        fetchPolicy: 'no-cache',
      })
      .then((item: any) => {
        props.navigation.navigate(AppRoutes.ClinicalDocumentListing, {
          clinicalDocs: item?.data?.getClinicalDocuments?.response,
          callDataBool: true,
          apiCall: editBool ? false : true,
        });
      })
      .catch((err: any) => {
        CommonBugFender('GET_ALL_CLINICIAL_DOCUMENTS', err);
        currentPatient && handleGraphQlError(err);
      });
  };

  const renderDelete = () => {
    setShowSpinner(true);
    deletePatientPrismMedicalRecords(
      client,
      !!id ? id : imageID,
      currentPatient?.id || '',
      MedicalRecordType.CLINICAL_DOCUMENTS
    )
      .then((status) => {
        if (status) {
          postCleverTapPHR(
            currentPatient,
            CleverTapEventName.PHR_DELETE_CLINICAL_DOCUMENT,
            'Clinical Documents Image Review',
            status
          );
          navigateToListingPage(false);
        } else {
          setShowSpinner(false);
        }
        setShowSpinner(false);
      })
      .catch((error) => {
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  const renderButton = () => {
    return (
      <StickyBottomComponent style={styles.bottomStyle}>
        <TouchableOpacity onPress={() => navigateToListingPage(true)}>
          <Text style={{ ...viewStyles.text('B', 16, '#FCB716', 1, 30) }}>
            {'GO TO CLINICAL DOCUMENTS'}
          </Text>
        </TouchableOpacity>
      </StickyBottomComponent>
    );
  };

  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          title={'UPLOADED DOCUMENTS'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
        <ScrollView bounces={false}>
          {renderTestTopDetailsView()}
          {renderUploadedImages(1)}
        </ScrollView>
        {comingFromListing ? null : renderButton()}
        {showSpinner && <Spinner />}
        <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
          <TouchableOpacity style={{ top: 10 }} onPress={() => renderDelete()}>
            <DeleteBlue size="sm" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ top: 10 }}
            onPress={() => {
              props.navigation.navigate(AppRoutes.AddClinicalDocumentDetails, {
                imageArray: imageArrays,
                selectedID: imageID,
                documentType: documentType,
              });
            }}
          >
            <EditBlue size="sm" />
          </TouchableOpacity>
        </StickyBottomComponent>
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
