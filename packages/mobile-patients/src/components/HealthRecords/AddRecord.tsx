import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { AddFilePopup } from '@aph/mobile-patients/src/components/HealthRecords/AddFilePopup';
import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossYellow, PrescriptionThumbnail } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  InputDropdown,
  InputDropdownMenu,
} from '@aph/mobile-patients/src/components/ui/InputDropdown';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { ADD_MEDICAL_RECORD, UPLOAD_FILE } from '@aph/mobile-patients/src/graphql/profiles';
import {
  addPatientMedicalRecord,
  addPatientMedicalRecordVariables,
} from '@aph/mobile-patients/src/graphql/types/addPatientMedicalRecord';
import {
  AddMedicalRecordParametersInput,
  MedicalRecordType,
  MedicalTestUnit,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { uploadFile, uploadFileVariables } from '@aph/mobile-patients/src/graphql/types/uploadFile';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';

const styles = StyleSheet.create({
  labelStyle: {
    paddingBottom: 4,
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
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
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
});

type RecordTypeType = {
  name: string;
  value: string;
};

const RecordType: RecordTypeType[] = [
  { name: MedicalRecordType.EHR.toLowerCase().replace('_', ' '), value: MedicalRecordType.EHR },
  {
    name: MedicalRecordType.OPERATIVE_REPORT.toLowerCase().replace('_', ' '),
    value: MedicalRecordType.OPERATIVE_REPORT,
  },
  {
    name: MedicalRecordType.PATHOLOGY_REPORT.toLowerCase().replace('_', ' '),
    value: MedicalRecordType.PATHOLOGY_REPORT,
  },
  {
    name: MedicalRecordType.PHYSICAL_EXAMINATION.toLowerCase().replace('_', ' '),
    value: MedicalRecordType.PHYSICAL_EXAMINATION,
  },
];

const charactersList = {
  _PERCENT_: '%',
  _SLASH_: '/',
};

const replaceStringWithChar = (str: string) => {
  const ss = str;
  Object.entries(charactersList).forEach(([key, value]) => {
    ss.replace(key, value);
  });

  return ss.toLowerCase();
};

const MedicalTest: RecordTypeType[] = [
  { name: 'gm', value: MedicalTestUnit.GM },
  {
    name: 'gm/dl',
    value: MedicalTestUnit.GM_SLASH_DL,
  },
  {
    name: '%', //replaceStringWithChar(MedicalTestUnit._PERCENT_),
    value: MedicalTestUnit._PERCENT_,
  },
];

const MedicalRecordInitialValues: AddMedicalRecordParametersInput = {
  parameterName: '',
  unit: null,
  result: 0,
  minimum: 0,
  maximum: 0,
};

export interface AddRecordProps extends NavigationScreenProps {}

export const AddRecord: React.FC<AddRecordProps> = (props) => {
  var fin = '';
  const [showImages, setshowImages] = useState<boolean>(true);
  const [showRecordDetails, setshowRecordDetails] = useState<boolean>(true);
  const [showReportDetails, setshowReportDetails] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [testName, settestName] = useState<string>('');
  const [typeofRecord, settypeofRecord] = useState<MedicalRecordType>();
  const [dateOfTest, setdateOfTest] = useState<string>('');
  const [referringDoctor, setreferringDoctor] = useState<string>('');
  const [observations, setobservations] = useState<string>('');
  const [additionalNotes, setadditionalNotes] = useState<string>('');
  const [medicalRecordParameters, setmedicalRecordParameters] = useState<
    AddMedicalRecordParametersInput[]
  >([MedicalRecordInitialValues]);
  const [showRecordTypePopup, setshowRecordTypePopup] = useState<boolean>(false);
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);

  const [showUnitPopup, setshowUnitPopup] = useState<boolean>(false);

  const [selectedUnitIndex, setselectedUnitIndex] = useState<number>();

  const [Images, setImages] = useState<PickerImage[]>(
    props.navigation.state.params ? props.navigation.state.params!.images : []
  );
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const client = useApolloClient();

  const multiplePhysicalPrescriptionUpload = (prescriptions: PickerImage[]) => {
    return Promise.all(
      prescriptions.map((item) =>
        client.mutate<uploadFile, uploadFileVariables>({
          mutation: UPLOAD_FILE,
          fetchPolicy: 'no-cache',
          variables: {
            fileType: item.path!.substring(item.path!.lastIndexOf('.') + 1),
            base64FileInput: item.data,
          },
        })
      )
    );
  };

  const onSavePress = () => {
    setshowSpinner(true);
    let uploadedUrls = [];
    multiplePhysicalPrescriptionUpload(Images)
      .then((data) => {
        const uploadUrls = data.map((item) => item.data!.uploadFile.filePath);
        const uploadedPrescriptions = Images.map((item, index) => ({
          ...item,
          uploadedUrl: uploadUrls[index],
        }));

        uploadedUrls = uploadedPrescriptions.map((item) => item.uploadedUrl);

        // setPhysicalPrescriptions && setPhysicalPrescriptions(uploadedPrescriptions);
        // setshowSpinner(false);
        // props.navigation.navigate(AppRoutes.CheckoutScene);

        const inputData = {
          patientId: currentPatient ? currentPatient.id : '',
          testName: testName,
          testDate: dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
          recordType: typeofRecord,
          referringDoctor: referringDoctor,
          sourceName: '',
          observations: observations,
          additionalNotes: additionalNotes,
          medicalRecordParameters: showReportDetails ? medicalRecordParameters : [],
          documentURLs: uploadedUrls.join(','),
        };

        if (currentPatient && currentPatient.id)
          client
            .mutate<addPatientMedicalRecord, addPatientMedicalRecordVariables>({
              mutation: ADD_MEDICAL_RECORD,
              variables: {
                AddMedicalRecordInput: inputData,
              },
            })
            .then(({ data }) => {
              setshowSpinner(false);
              const status = g(data, 'addPatientMedicalRecord', 'status');

              if (status) {
                props.navigation.goBack();
              }
            })
            .catch((e) => {
              setshowSpinner(false);
              console.log(JSON.stringify(e), 'eeeee');
              Alert.alert('Alert', 'Please fill all the details', [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
              ]);
            });
      })
      .catch((e) => {
        setshowSpinner(false);
        console.error({ e });
        Alert.alert('Alert', 'Error occurred while uploading prescriptions.');
      });
  };

  const renderImagesRow = (data: PickerImage, i: number) => {
    var base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(data.data!);
    return (
      <TouchableOpacity activeOpacity={1} key={i} onPress={() => {}}>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            shadowRadius: 4,
            height: 56,
            marginHorizontal: 20,
            backgroundColor: theme.colors.WHITE,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: i === 0 ? 16 : 4,
            marginBottom: Images.length === i + 1 ? 16 : 4,
          }}
          key={i}
        >
          <View
            style={{
              paddingLeft: 8,
              paddingRight: 16,
              width: 54,
            }}
          >
            {fin == '' ? (
              <PrescriptionThumbnail />
            ) : (
              <Image
                style={{
                  height: 40,
                  width: 30,
                }}
                source={{ uri: fin }}
              />
            )}
            {/* <PrescriptionThumbnail /> */}
          </View>
          <View style={{ flex: 1 }}>
            <Text>
              {data!
                .path!.split('\\')!
                .pop()!
                .split('/')
                .pop()}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: 40,
              paddingHorizontal: 8,
            }}
            onPress={() => {
              const imageCOPY = [...Images];
              imageCOPY.splice(i, 1);

              setImages(imageCOPY);
              CommonLogEvent('ADD_RECORD', 'Set Images');
            }}
          >
            <CrossYellow />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUploadedImages = () => {
    return (
      <View>
        <CollapseCard
          heading="IMAGES UPLOADED"
          collapse={showImages}
          onPress={() => (CommonLogEvent('ADD_RECORD', 'Show Images'), setshowImages(!showImages))}
        >
          <View style={[styles.cardViewStyle, { paddingHorizontal: 8 }]}>
            <FlatList
              bounces={false}
              data={Images}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) => renderImagesRow(item, index)}
              keyExtractor={(_, index) => index.toString()}
            />
            <Text
              style={[theme.viewStyles.yellowTextStyle, { textAlign: 'right', paddingBottom: 16 }]}
              onPress={() => (
                CommonLogEvent('ADD_RECORD', 'Display order popup'), setdisplayOrderPopup(true)
              )}
            >
              ADD DOCUMENT
            </Text>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderRecordDetails = () => {
    return (
      <View>
        <CollapseCard
          heading="RECORD DETAILS"
          collapse={showRecordDetails}
          onPress={() => (
            CommonLogEvent('ADD_RECORD', 'RECORD DETAILS'), setshowRecordDetails(!showRecordDetails)
          )}
        >
          <View style={[styles.cardViewStyle, { paddingTop: 6, paddingBottom: 5 }]}>
            {/* <TextInputComponent
              label={'Type Of Record'}
              value={typeofRecord}
              onChangeText={(typeofRecord) => settypeofRecord(typeofRecord)}
            /> */}
            <TextInputComponent
              label={'Type Of Record'}
              noInput={true}
              conatinerstyles={{
                paddingBottom: 0,
              }}
            />
            <InputDropdown
              setShowPopup={(showpopup) => setshowRecordTypePopup(showpopup)}
              label={typeofRecord ? typeofRecord.toLowerCase().replace('_', ' ') : ''}
              containerStyle={{
                paddingBottom: 10,
              }}
              placeholder={'Select type of record'}
            />
            <TextInputComponent
              label={'Name Of Test'}
              value={testName}
              placeholder={'Enter name of test'}
              onChangeText={(testName) => settestName(testName)}
            />
            <TextInputComponent
              label={'Date Of Test'}
              noInput={true}
              // value={dateOfTest}
              // onChangeText={(dateOfTest) => setdateOfTest(dateOfTest)}
            />
            <View style={{ paddingTop: 0, paddingBottom: 10 }}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.placeholderViewStyle}
                onPress={() => {
                  Keyboard.dismiss();
                  setIsDateTimePickerVisible(true);
                  CommonLogEvent('ADD_RECORD', 'Date picker visible');
                }}
              >
                <Text
                  style={[
                    styles.placeholderTextStyle,
                    ,
                    dateOfTest !== '' ? null : styles.placeholderStyle,
                  ]}
                >
                  {dateOfTest !== '' ? dateOfTest : 'dd/mm/yyyy'}
                </Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              isDateTimePickerVisible={isDateTimePickerVisible}
              handleDatePicked={(date) => {
                const formatDate = Moment(date).format('DD/MM/YYYY');
                setdateOfTest(formatDate);
                setIsDateTimePickerVisible(false);
                Keyboard.dismiss();
              }}
              hideDateTimePicker={() => {
                setIsDateTimePickerVisible(false);
                Keyboard.dismiss();
              }}
            />
          </View>
        </CollapseCard>
      </View>
    );
  };

  const setParametersData = (key: string, value: string, i: number, isNumber?: boolean) => {
    const dataCopy = [...medicalRecordParameters];
    dataCopy[i] = {
      ...dataCopy[i],
      [key]: isNumber ? Number(value) : value,
    };
    setmedicalRecordParameters(dataCopy);
  };

  const renderReportDetails = () => {
    return (
      <View>
        <CollapseCard
          heading="REPORT DETAILS (Optional)"
          collapse={showReportDetails}
          onPress={() => setshowReportDetails(!showReportDetails)}
        >
          <View
            style={[
              //   styles.cardViewStyle,
              {
                ...theme.viewStyles.cardContainer,
                marginTop: 15,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 20,
              },
            ]}
          >
            <View>
              <View style={styles.labelViewStyle}>
                <Text style={styles.labelStyle}>Parameters</Text>
              </View>
              {medicalRecordParameters.map((item, i) => (
                <View
                  key={i}
                  style={{
                    marginTop: 16,
                    ...theme.viewStyles.cardViewStyle,
                    shadowRadius: 4,
                    paddingHorizontal: 16,
                    paddingTop: 6,
                    paddingBottom: 5,
                  }}
                >
                  <TextInputComponent
                    label={'Name Of Parameter'}
                    placeholder={'Enter name'}
                    value={item.parameterName}
                    onChangeText={(value) => setParametersData('parameterName', value, i)}
                  />
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TextInputComponent
                        label={'Result'}
                        placeholder={'Enter value'}
                        value={item.result.toString()}
                        onChangeText={(value) => setParametersData('result', value, i, true)}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      {/* <TextInputComponent
                        label={'Unit'}
                        placeholder={'Select unit'}
                        value={(item.unit || '').toString()}
                        onChangeText={(value) => setParametersData('unit', value, i)}
                      /> */}
                      <TextInputComponent
                        label={'Unit'}
                        noInput={true}
                        conatinerstyles={{
                          paddingBottom: 0,
                        }}
                      />
                      <InputDropdown
                        setShowPopup={(showpopup) => {
                          setshowUnitPopup(showpopup);
                          setselectedUnitIndex(i);
                        }}
                        containerStyle={{
                          paddingBottom: 10,
                        }}
                        label={(item.unit || '').toString()}
                        placeholder={'Select unit'}
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TextInputComponent
                        label={'Min'}
                        placeholder={'Enter value'}
                        value={(item.minimum || '').toString()}
                        onChangeText={(value) => setParametersData('minimum', value, i, true)}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <TextInputComponent
                        label={'Max'}
                        placeholder={'Enter value'}
                        value={(item.maximum || '').toString()}
                        onChangeText={(value) => setParametersData('maximum', value, i, true)}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <Text
              style={{ ...theme.viewStyles.yellowTextStyle, textAlign: 'right', paddingTop: 16 }}
              onPress={() => {
                const dataCopy = [...medicalRecordParameters];
                dataCopy.push(MedicalRecordInitialValues);
                setmedicalRecordParameters(dataCopy);
              }}
            >
              ADD PARAMETER
            </Text>
            <View>
              <View style={styles.labelViewStyle}>
                <Text style={[styles.labelStyle, { paddingTop: 20 }]}>Observation Details</Text>
              </View>
              <View
                style={{
                  marginTop: 16,
                  ...theme.viewStyles.cardViewStyle,
                  shadowRadius: 4,
                  paddingHorizontal: 16,
                  paddingTop: 6,
                  paddingBottom: 5,
                }}
              >
                <TextInputComponent
                  label={'Referring Doctor'}
                  placeholder={'Enter name'}
                  value={referringDoctor}
                  onChangeText={(referringDoctor) => setreferringDoctor(referringDoctor)}
                />
                <TextInputComponent
                  label={'Observations / Impressions'}
                  placeholder={'Enter observations'}
                  value={observations}
                  onChangeText={(observations) => setobservations(observations)}
                />
                <TextInputComponent
                  label={'Additional Notes'}
                  placeholder={'Enter name'}
                  value={additionalNotes}
                  onChangeText={(additionalNotes) => setadditionalNotes(additionalNotes)}
                />
              </View>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderData = () => {
    return (
      <View
        style={{
          marginTop: 28,
        }}
      >
        {renderUploadedImages()}
        {renderRecordDetails()}
        {renderReportDetails()}
      </View>
    );
  };

  const renderBottomButton = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="ADD RECORD"
          style={{ flex: 1, marginHorizontal: 60 }}
          onPress={onSavePress}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          title="ADD A RECORD"
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <KeyboardAwareScrollView bounces={false}>
          {renderData()}
          <View style={{ height: 80 }} />
        </KeyboardAwareScrollView>
      </SafeAreaView>
      {renderBottomButton()}
      {displayOrderPopup && (
        <AddFilePopup
          onClickClose={() => {
            setdisplayOrderPopup(false);
          }}
          getData={(data: (PickerImage | PickerImage[])[]) => {
            setImages([...(Images as PickerImage[]), ...(data as PickerImage[])]);
            setdisplayOrderPopup(false);
          }}
        />
      )}
      {showRecordTypePopup && (
        <InputDropdownMenu
          width={200}
          Options={RecordType}
          setShowPopup={(showpopup) => setshowRecordTypePopup(showpopup)}
          setSelectedOption={(value: MedicalRecordType) => settypeofRecord(value)}
        />
      )}
      {showUnitPopup && (
        <InputDropdownMenu
          Options={MedicalTest}
          setShowPopup={(showpopup) => setshowUnitPopup(showpopup)}
          setSelectedOption={(value: MedicalTestUnit) => {
            console.log(value, 'value', selectedUnitIndex);
            selectedUnitIndex !== undefined && setParametersData('unit', value, selectedUnitIndex);
          }}
        />
      )}
      {showSpinner && <Spinner />}
    </View>
  );
};
