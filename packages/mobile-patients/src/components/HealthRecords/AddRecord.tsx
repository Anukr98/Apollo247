import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { AddFilePopup } from '@aph/mobile-patients/src/components/HealthRecords/AddFilePopup';
// import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CrossYellow,
  PrescriptionThumbnail,
  DropdownGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
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
  Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';
import { MaterialMenu } from '../ui/MaterialMenu';

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
  key: string;
  value: string;
};
type PickerImage = any;

const RecordType: RecordTypeType[] = [
  { value: MedicalRecordType.EHR.toLowerCase().replace('_', ' '), key: MedicalRecordType.EHR },
  {
    value: MedicalRecordType.OPERATIVE_REPORT.toLowerCase().replace('_', ' '),
    key: MedicalRecordType.OPERATIVE_REPORT,
  },
  {
    value: MedicalRecordType.PATHOLOGY_REPORT.toLowerCase().replace('_', ' '),
    key: MedicalRecordType.PATHOLOGY_REPORT,
  },
  {
    value: MedicalRecordType.PHYSICAL_EXAMINATION.toLowerCase().replace('_', ' '),
    key: MedicalRecordType.PHYSICAL_EXAMINATION,
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
  { value: 'gm', key: MedicalTestUnit.GM },
  {
    value: 'gm/dl',
    key: MedicalTestUnit.GM_SLASH_DL,
  },
  {
    value: '%', //replaceStringWithChar(MedicalTestUnit._PERCENT_),
    key: MedicalTestUnit._PERCENT_,
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
  const { width, height } = Dimensions.get('window');
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
  const isValid = () => {
    const valid = medicalRecordParameters.map((item) => {
      return (
        (item.maximum || item.minimum || item.result || item.parameterName) &&
        item.maximum! > item.minimum! &&
        item.result! <= item.maximum! &&
        item.result! >= item.minimum!
      );
    });
    return valid.find((i) => i === false) !== undefined;
  };

  const setParametersData = (key: string, value: string, i: number, isNumber?: boolean) => {
    const dataCopy = [...medicalRecordParameters];
    dataCopy[i] = {
      ...dataCopy[i],
      [key]: isNumber ? formatNumber(value) : value,
    };
    setmedicalRecordParameters(dataCopy);
  };

  const formatNumber = (value: string) => {
    let number = value.indexOf('.') === value.length - 1 ? value : parseFloat(value);
    return number;
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
        console.log('in', inputData);

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
            <MaterialMenu
              menuContainerStyle={[
                {
                  alignItems: 'flex-end',
                  marginTop: 16,
                  marginLeft: width / 2 - 95,
                },
              ]}
              options={RecordType}
              selectedText={typeofRecord}
              onPress={(data) => {
                setshowRecordTypePopup(false);
                settypeofRecord(data.key as MedicalRecordType);
              }}
              // setSelectedOption={(value: MedicalRecordType) => settypeofRecord(value)}
            >
              <TextInputComponent
                label={'Type Of Record'}
                noInput={true}
                conatinerstyles={{
                  paddingBottom: 0,
                }}
              />
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <View style={[styles.placeholderViewStyle]}>
                  <Text
                    style={[
                      styles.placeholderTextStyle,
                      typeofRecord !== undefined ? null : styles.placeholderStyle,
                    ]}
                  >
                    {typeofRecord !== undefined
                      ? RecordType.find((item) => item.key === typeofRecord)!.value
                      : 'Select type of record'}
                  </Text>
                  <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                    <DropdownGreen />
                  </View>
                </View>
              </View>
              {/* <TextInputComponent
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
              /> */}
            </MaterialMenu>
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

  // const setParametersData = (key: string, value: string, i: number, isNumber?: boolean) => {
  //   const dataCopy = [...medicalRecordParameters];
  //   dataCopy[i] = {
  //     ...dataCopy[i],
  //     [key]: isNumber ? Number(value) : value,
  //   };
  //   console.log('da', dataCopy);

  //   setmedicalRecordParameters(dataCopy);
  // };

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
                    value={item.parameterName || ''}
                    onChangeText={(value) => setParametersData('parameterName', value, i)}
                  />
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TextInputComponent
                        label={'Result'}
                        placeholder={'Enter value'}
                        value={(item.result || '').toString()}
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
                      <MaterialMenu
                        options={MedicalTest}
                        selectedText={typeofRecord}
                        onPress={(data) => {
                          setParametersData('unit', data.key as MedicalTestUnit, i);
                          setselectedUnitIndex(i);
                        }}
                        // setShowPopup={(showpopup) => setshowUnitPopup(showpopup)}
                        // setSelectedOption={(value: MedicalTestUnit) => {
                        //   console.log(value, 'value', selectedUnitIndex);
                        //   selectedUnitIndex !== undefined && setParametersData('unit', value, selectedUnitIndex);
                        // }}
                      >
                        <TextInputComponent
                          label={'Unit'}
                          noInput={true}
                          conatinerstyles={{
                            paddingBottom: 3,
                          }}
                        />
                        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                          <View style={[styles.placeholderViewStyle]}>
                            <Text
                              style={[
                                styles.placeholderTextStyle,
                                item.unit !== null && item.unit !== undefined
                                  ? null
                                  : styles.placeholderStyle,
                              ]}
                            >
                              {item.unit !== null && item.unit !== undefined
                                ? MedicalTest.find((itm) => itm.key === item.unit)!.value
                                : 'Select unit'}
                            </Text>
                            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                              <DropdownGreen />
                            </View>
                          </View>
                        </View>
                        {/* <TextInputComponent
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
                        /> */}
                      </MaterialMenu>
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
                  placeholder={'Enter notes'}
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
          disabled={isValid()}
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
            console.log('dataimage', data);

            setImages([...(Images as PickerImage[]), ...(data as PickerImage[])]);
            setdisplayOrderPopup(false);
          }}
        />
      )}
      {/* {showRecordTypePopup && (
        <MaterialMenu
          // width={200}
          options={RecordType}
          selectedText={typeofRecord}
          onPress={(data) => {
            setshowRecordTypePopup(false);
            settypeofRecord(data.key as MedicalRecordType);
          }}
          // setSelectedOption={(value: MedicalRecordType) => settypeofRecord(value)}
        />
      )} */}
      {/* {showUnitPopup && (
        <MaterialMenu
          Options={MedicalTest}
          setShowPopup={(showpopup) => setshowUnitPopup(showpopup)}
          setSelectedOption={(value: MedicalTestUnit) => {
            console.log(value, 'value', selectedUnitIndex);
            selectedUnitIndex !== undefined && setParametersData('unit', value, selectedUnitIndex);
          }}
        />
      )} */}
      {showSpinner && <Spinner />}
    </View>
  );
};
