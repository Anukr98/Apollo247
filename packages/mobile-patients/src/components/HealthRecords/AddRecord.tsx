import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { PickerImage } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossYellow, PrescriptionThumbnail } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { ADD_MEDICAL_RECORD } from '@aph/mobile-patients/src/graphql/profiles';
import {
  addPatientMedicalRecord,
  addPatientMedicalRecordVariables,
} from '@aph/mobile-patients/src/graphql/types/addPatientMedicalRecord';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { GraphQLError } from 'graphql';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import {
  InputDropdown,
  InputDropdownMenu,
} from '@aph/mobile-patients/src/components/ui/InputDropdown';
import { AddMedicalRecordParametersInput } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import Moment from 'moment';

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

const RecordType: RecordTypeType[] = [{ name: 'Test Report', value: 'Test Report' }];

const MedicalRecordInitialValues: AddMedicalRecordParametersInput = {
  parameterName: '',
  unit: null,
  result: 0,
  minimum: 0,
  maximum: 0,
};

export interface AddRecordProps extends NavigationScreenProps {}

export const AddRecord: React.FC<AddRecordProps> = (props) => {
  const [showImages, setshowImages] = useState<boolean>(true);
  const [showRecordDetails, setshowRecordDetails] = useState<boolean>(true);
  const [showReportDetails, setshowReportDetails] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [testName, settestName] = useState<string>('');
  const [typeofRecord, settypeofRecord] = useState<string>('');
  const [dateOfTest, setdateOfTest] = useState<string>('');
  const [referringDoctor, setreferringDoctor] = useState<string>('');
  const [observations, setobservations] = useState<string>('');
  const [additionalNotes, setadditionalNotes] = useState<string>('');
  const [medicalRecordParameters, setmedicalRecordParameters] = useState<
    AddMedicalRecordParametersInput[]
  >([MedicalRecordInitialValues]);
  const [showRecordTypePopup, setshowRecordTypePopup] = useState<boolean>(false);
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);

  const [Images, setImages] = useState<PickerImage[]>(
    props.navigation.state.params ? props.navigation.state.params!.images : []
  );
  const { currentPatient } = useAllCurrentPatients();

  const client = useApolloClient();

  const data = {
    doctorInfo: {
      firstName: 'Mamatha',
      photoUrl:
        'https://image.shutterstock.com/image-photo/smiling-doctor-posing-arms-crossed-600w-519507367.jpg',
    },
    id: '34567890987654',
    consult_info: '03 Aug 2019, Online Consult',
    description: 'This is a follow-up consult to the Clinic Visit on 27 Jul 2019',
  };

  const onSavePress = () => {
    setshowSpinner(true);
    console.log(currentPatient, 'currentPatient', currentPatient ? currentPatient.id : '');
    const inputData = {
      patientId: currentPatient ? currentPatient.id : '',
      testName: testName,
      testDate: dateOfTest !== '' ? Moment(dateOfTest).format('YYYY-MM-DD') : '',
      recordType: typeofRecord,
      referringDoctor: referringDoctor,
      sourceName: '',
      observations: observations,
      additionalNotes: additionalNotes,
      medicalRecordParameters: showReportDetails ? medicalRecordParameters : [],
    };
    console.log('inputData', inputData);
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
          console.log(status, 'status');
        })
        .catch((e) => {
          console.log(JSON.stringify(e), 'eeeee');
        });
  };

  const renderImagesRow = (data: PickerImage, i: number) => {
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
            <PrescriptionThumbnail />
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
              console.log(imageCOPY, 'imageCOPYImages remove');
              setImages(imageCOPY);
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
          onPress={() => setshowImages(!showImages)}
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
              onPress={() => setdisplayOrderPopup(true)}
            >
              ADD IMAGE
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
          onPress={() => setshowRecordDetails(!showRecordDetails)}
        >
          <View style={[styles.cardViewStyle, { paddingTop: 6, paddingBottom: 5 }]}>
            {/* <TextInputComponent
              label={'Type Of Record'}
              value={typeofRecord}
              onChangeText={(typeofRecord) => settypeofRecord(typeofRecord)}
            /> */}
            <TextInputComponent label={'Type Of Record'} noInput={true} />
            <InputDropdown
              setShowPopup={(showpopup) => setshowRecordTypePopup(showpopup)}
              label={typeofRecord}
            />
            <TextInputComponent
              label={'Name Of Test'}
              value={testName}
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
                      <TextInputComponent
                        label={'Unit'}
                        placeholder={'Select unit'}
                        value={(item.unit || '').toString()}
                        onChangeText={(value) => setParametersData('unit', value, i)}
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

  if (data.doctorInfo)
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
        {/* {displayOrderPopup && (
          <AddFilePopup
            onClickClose={() => {
              setdisplayOrderPopup(false);
            }}
            getData={(data: (PickerImage | PickerImage[])[]) => {
              console.log(data);
              setImages(data);
            }}
          />
        )} */}
        {showRecordTypePopup && (
          <InputDropdownMenu
            Options={RecordType}
            setShowPopup={(showpopup) => setshowRecordTypePopup(showpopup)}
            setSelectedOption={(value) => settypeofRecord(value)}
          />
        )}
      </View>
    );
  return null;
};
