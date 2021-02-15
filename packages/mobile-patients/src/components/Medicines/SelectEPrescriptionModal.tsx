import React, { useEffect, useState } from 'react';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { ScrollView, NavigationScreenProps } from 'react-navigation';
import { EPrescription } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_PAST_CONSULTS_PRESCRIPTIONS,
  GET_MEDICAL_PRISM_RECORD_V2,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptionsVariables,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import { DoctorType, MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { g, handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import {
  getPatientPrismMedicalRecords_V2,
  getPatientPrismMedicalRecords_V2Variables,
  getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response,
  getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V2';
import { TrackerBig } from '@aph/mobile-patients/src/components/ui/Icons';
import Pdf from 'react-native-pdf';
import { SelectEprescriptionCard } from '@aph/mobile-patients/src/components/Medicines/Components/SelectEprescriptionCard';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  healthRecordContainer: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  healthRecord: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 5,
    marginVertical: 20,
    alignItems: 'center',
  },
  hrImage: {
    resizeMode: 'cover',
    width: width / 4,
    height: width / 3.5,
    borderRadius: 8,
    marginTop: 3,
  },
  hrHeading: {
    ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE, 1, 24),
    marginLeft: 7,
  },
  overlayImage: {
    resizeMode: 'contain',
    flex: 1,
    width: undefined,
    height: undefined,
  },
  selectButton: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FCB716',
    paddingVertical: 7,
    paddingHorizontal: 20,
  },
  selectText: {
    ...theme.viewStyles.text('B', 14, '#FFFFFF', 1, 30, 0.35),
    textAlign: 'center',
  },
  closeButton: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#FCB716',
  },
  closeText: {
    ...theme.viewStyles.text('B', 14, '#FCB716', 1, 25, 0.35),
    textAlign: 'center',
  },
  stepsIcon: {
    resizeMode: 'contain',
    width: 8,
    height: 8,
    marginTop: 9,
    marginRight: 8,
  },
  pdfThumbnail: {
    flex: 1,
    marginTop: 6,
    width: width / 4,
    height: width / 3.5,
    backgroundColor: 'transparent',
  },
  pdfPreview: {
    flex: 1,
    marginTop: 10,
    width: width / 1.3,
    height: height / 2.7,
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  previewHeading: {
    position: 'absolute',
    top: 10,
    left: 10,
    ...theme.viewStyles.text('M', 18, theme.colors.LIGHT_BLUE, 1, 24),
  },
  sectionHeadings: {
    ...theme.viewStyles.text('SB', 17, theme.colors.LIGHT_BLUE, 1, 30),
    paddingLeft: 15,
    paddingTop: 10,
  },
  overLayStyle: {
    padding: 0,
    margin: 0,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  safeAreaStyle: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    flex: 1,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 60,
  },
  buttonCta: {
    marginHorizontal: 60,
    marginVertical: 10,
  },
});

export interface SelectEPrescriptionModalProps extends NavigationScreenProps {
  onSubmit: (prescriptions: EPrescription[]) => void;
  isVisible: boolean;
  selectedEprescriptionIds?: EPrescription['id'][];
  displayPrismRecords?: boolean;
  displayMedicalRecords?: boolean;
  showLabResults?: boolean;
}

export const SelectEPrescriptionModal: React.FC<SelectEPrescriptionModalProps> = (props) => {
  const [selectedPrescription, setSelectedPrescription] = useState<{ [key: string]: boolean }>({});
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageIndex, setImageIndex] = useState<string>('');
  const [isPdfPrescription, setIsPdfPrescription] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const DATE_FORMAT = 'DD MMM YYYY';
  const client = useApolloClient();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    const pIds = props.selectedEprescriptionIds;
    const selectedPrescr = {} as typeof selectedPrescription;
    if (pIds) {
      pIds!.forEach((id) => {
        selectedPrescr[id] = true;
      });
      setSelectedPrescription(selectedPrescr);
    }
  }, [props.selectedEprescriptionIds]);

  const { data, loading, error } = useQuery<
    getPatientPastConsultsAndPrescriptions,
    getPatientPastConsultsAndPrescriptionsVariables
  >(GET_PAST_CONSULTS_PRESCRIPTIONS, {
    variables: {
      consultsAndOrdersInput: {
        patient: currentPatient && currentPatient.id ? currentPatient.id : '',
      },
    },
    fetchPolicy: 'no-cache',
  });

  const { data: medPrismRecords, loading: medPrismloading, error: medPrismerror } = useQuery<
    getPatientPrismMedicalRecords_V2,
    getPatientPrismMedicalRecords_V2Variables
  >(GET_MEDICAL_PRISM_RECORD_V2, {
    variables: {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
      records: props.showLabResults
        ? [MedicalRecordType.PRESCRIPTION, MedicalRecordType.TEST_REPORT]
        : [MedicalRecordType.PRESCRIPTION],
    },
    fetchPolicy: 'no-cache',
  });
  const [labResults, setLabResults] = useState<
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response | null)[]
    | null
    | undefined
  >([]);
  const [prescriptions, setPrescriptions] = useState<
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response | null)[]
    | null
    | undefined
  >([]);

  useEffect(() => {
    if (props.showLabResults) {
      setLabResults(
        g(medPrismRecords, 'getPatientPrismMedicalRecords_V2', 'labResults', 'response') || []
      );
    }
    setPrescriptions(
      g(medPrismRecords, 'getPatientPrismMedicalRecords_V2', 'prescriptions', 'response') || []
    );
  }, [medPrismRecords]);

  useEffect(() => {
    if (medPrismerror) {
      handleGraphQlError(
        medPrismerror,
        'Oops! seems like we are having an issue. Please try again.'
      );
      CommonBugFender('SelectEPrescriptionModal_medPrismerror', medPrismerror);
    }
  }, [medPrismerror]);

  const [combination, setCombination] = useState<
    { type: 'medical' | 'lab' | 'health' | 'hospital' | 'prescription'; data: any }[]
  >();
  const [selectedHealthRecord, setSelectedHealthRecord] = useState<string[]>([]);

  useEffect(() => {
    let mergeArray: {
      type: 'medical' | 'lab' | 'health' | 'hospital' | 'prescription';
      data: any;
    }[] = [];
    if (props.showLabResults) {
      labResults?.forEach((item) => {
        mergeArray.push({ type: 'lab', data: item });
      });
    }
    prescriptions?.forEach((item) => {
      mergeArray.push({ type: 'prescription', data: item });
    });
    setCombination(sordByDate(mergeArray));
  }, [labResults, prescriptions]);

  const sordByDate = (
    array: { type: 'medical' | 'lab' | 'health' | 'hospital' | 'prescription'; data: any }[]
  ) => {
    return array.sort(({ data: data1 }, { data: data2 }) => {
      let date1 = new Date(
        data1.testDate ||
          data1.labTestDate ||
          data1.appointmentDate ||
          data1.dateOfHospitalization ||
          data1.date
      );
      let date2 = new Date(
        data2.testDate ||
          data2.labTestDate ||
          data2.appointmentDate ||
          data2.dateOfHospitalization ||
          data2.date
      );
      return date1 > date2 ? -1 : date1 < date2 ? 1 : data2.id - data1.id;
    });
  };

  const getMedicines = (
    medicines: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems | null)[]
  ) =>
    medicines
      .filter((item) => item!.medicineName)
      .map((item) => item!.medicineName)
      .join(', ');

  const ePrescriptions = g(data, 'getPatientPastConsultsAndPrescriptions', 'medicineOrders')! || [];
  const ePrescriptionsFromConsults =
    g(data, 'getPatientPastConsultsAndPrescriptions', 'consults')! || [];

  const getCaseSheet = (
    caseSheet: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet[]
  ) => caseSheet!.find((item) => item!.doctorType !== DoctorType.JUNIOR)!;

  const getBlobUrl = (url: string | null) =>
    url ? `${AppConfig.Configuration.DOCUMENT_BASE_URL}${url}` : '';

  const formattedEPrescriptions = ePrescriptions
    .map(
      (item) =>
        ({
          id: item!.id,
          date: moment(item!.quoteDateTime).format(DATE_FORMAT),
          uploadedUrl: item!.prescriptionImageUrl,
          doctorName: `Meds Rx ${(item!.id && item!.id.substring(0, item!.id.indexOf('-'))) || ''}`, // item.referringDoctor ? `Dr. ${item.referringDoctor}` : ''
          forPatient: (currentPatient && currentPatient.firstName) || '',
          medicines: getMedicines(item!.medicineOrderLineItems! || []),
          prismPrescriptionFileId: item!.prismPrescriptionFileId,
        } as EPrescription)
    )
    .concat(
      ePrescriptionsFromConsults.map(
        (item) =>
          ({
            id: item!.id,
            date: moment(item!.appointmentDateTime).format(DATE_FORMAT),
            uploadedUrl: getBlobUrl(
              (getCaseSheet(item!.caseSheet as any) || { blobName: '' }).blobName
            ),
            doctorName: item!.doctorInfo ? `${item!.doctorInfo.fullName}` : '',
            forPatient: (currentPatient && currentPatient.firstName) || '',
            medicines: (
              (getCaseSheet(item!.caseSheet as any) || { medicinePrescription: [] })
                .medicinePrescription || []
            )
              .map((item) => item!.medicineName)
              .join(', '),
          } as EPrescription)
      )
    )
    .filter((item) => !!item.uploadedUrl)
    .sort(
      (a, b) =>
        moment(b.date, DATE_FORMAT)
          .toDate()
          .getTime() -
        moment(a.date, DATE_FORMAT)
          .toDate()
          .getTime()
    );

  const PRESCRIPTION_VALIDITY_IN_DAYS = 180;

  const prescriptionOlderThan6months = formattedEPrescriptions.filter((item) => {
    const prescrTime = moment(item.date, DATE_FORMAT);
    const currTime = moment(new Date());
    const diff = currTime.diff(prescrTime, 'days');
    return diff > PRESCRIPTION_VALIDITY_IN_DAYS ? true : false;
  });

  const prescriptionUpto6months = formattedEPrescriptions.filter((item) => {
    const prescrTime = moment(item.date, DATE_FORMAT);
    const currTime = moment(new Date());
    const diff = currTime.diff(prescrTime, 'days');
    return diff <= PRESCRIPTION_VALIDITY_IN_DAYS ? true : false;
  });

  const renderNoPrescriptions = () => {
    if (
      !loading &&
      formattedEPrescriptions.length == 0 &&
      ((props.displayPrismRecords && combination && combination.length === 0) ||
        !props.displayPrismRecords)
    ) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={'Uh oh! :('}
          description={'No Records Found!'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      );
    }
  };

  const renderHealthRecord = ({ item, index }) => {
    const { data } = item;
    const selected = selectedHealthRecord?.findIndex((i) => i === index.toString()) > -1;
    const uploadedBy =
      data?.sourceName || data?.source || data?.labTestSource ? currentPatient?.firstName : '';
    const isPdf = data?.fileUrl?.split('.')?.pop() === 'pdf';
    const heading =
      uploadedBy ||
      data?.testName ||
      data?.issuingDoctor ||
      data?.location ||
      data?.diagnosisNotes ||
      data?.healthCheckName ||
      data?.labTestName ||
      data?.prescriptionName;
    const dateOfPrescription = moment(
      data?.date || data?.testDate || data?.appointmentDate || data?.dateOfHospitalization
    ).format('DD MMMM YYYY');
    return (
      <SelectEprescriptionCard
        selected={selected}
        isPdf={isPdf}
        url={data?.fileUrl || ''}
        heading={heading}
        date={dateOfPrescription}
        onLongPressCard={() => {
          setIsPdfPrescription(isPdf);
          setImageUrl(data?.fileUrl);
          setImageIndex(index.toString());
          setShowPreview(true);
        }}
        onPressCard={() => {
          if (selected) {
            setSelectedHealthRecord([
              ...selectedHealthRecord?.filter((i) => i !== index?.toString()),
            ]);
          } else {
            setSelectedHealthRecord([...selectedHealthRecord, index?.toString()]);
          }
        }}
      />
    );
  };

  const renderHealthRecords = () => {
    return (
      <View>
        <Text style={styles.sectionHeadings}>Health Records</Text>
        <FlatList
          data={combination || []}
          renderItem={renderHealthRecord}
          keyExtractor={(item) => item.id}
          numColumns={3}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>
    );
  };

  const renderPrescriptionPreview = () => {
    const selected = selectedHealthRecord?.findIndex((i) => i === imageIndex.toString()) > -1;
    return (
      <Overlay
        onRequestClose={() => {}}
        isVisible={showPreview}
        onBackdropPress={() => setShowPreview(false)}
      >
        <Text style={styles.previewHeading}>
          {isPdfPrescription ? `Prescription PDF` : `Prescription Image`}
        </Text>
        {isPdfPrescription ? (
          <Pdf
            key={imageUrl}
            onError={(error) => {
              console.log(error);
            }}
            source={{ uri: imageUrl }}
            style={styles.pdfPreview}
          />
        ) : (
          <Image style={styles.overlayImage} source={{ uri: imageUrl }} />
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <TouchableOpacity
            onPress={() => {
              if (!selected) setSelectedHealthRecord([...selectedHealthRecord, imageIndex]);
              setTimeout(() => {
                setShowPreview(false);
              }, 700);
            }}
            activeOpacity={0.7}
            style={styles.selectButton}
          >
            <Text style={styles.selectText}>{selected ? `SELECTED` : `SELECT`}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowPreview(false);
            }}
            activeOpacity={0.7}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </Overlay>
    );
  };

  const renderEPrescriptions = (isOldPrescription: boolean) => {
    return (
      <View>
        <Text style={styles.sectionHeadings}>
          {isOldPrescription ? `E-Prescriptions older than 6 months` : `E-Prescriptions`}
        </Text>
        <FlatList
          data={isOldPrescription ? prescriptionOlderThan6months : prescriptionUpto6months}
          renderItem={renderEPrescription}
          keyExtractor={(item) => item.id}
          numColumns={3}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>
    );
  };

  const renderEPrescription = ({ item, index }) => {
    const isPdf = item?.uploadedUrl?.split('.')?.pop() === 'pdf';
    const selected = !!selectedPrescription[item.id];
    const heading = item?.doctorName || '';
    const dateOfPrescription = item?.date;
    return (
      <SelectEprescriptionCard
        selected={selected}
        isPdf={isPdf}
        url={item?.uploadedUrl || ''}
        heading={heading}
        date={dateOfPrescription}
        onLongPressCard={() => {
          setIsPdfPrescription(isPdf);
          setImageUrl(item?.uploadedUrl);
          setImageIndex(index.toString());
          setShowPreview(true);
        }}
        onPressCard={() => {
          setSelectedPrescription({
            ...selectedPrescription,
            [item.id]: !selected,
          });
        }}
      />
    );
  };

  const onPressUpload = () => {
    CommonLogEvent('SELECT_PRESCRIPTION_MODAL', 'Formatted e prescription');
    const submitValues = prescriptionUpto6months?.filter((item) => selectedPrescription[item!.id]);
    if (combination) {
      combination.forEach(({ type, data }, index) => {
        if (selectedHealthRecord?.findIndex((i) => i === index.toString()) > -1) {
          let date = '';
          let name = '';
          let message = '';
          let urls = '';
          let prismImages = '';
          let fileName = '';
          if (type === 'lab') {
            date = data?.date;
            name = data?.labTestName || '-';
            fileName = g(data, 'testResultFiles', '0', 'fileName') || '';
            message = `${data?.labTestSource || ''} Report\n`;
            message += `Test Name: ${name}\n`;
            message += `UHID: ${(currentPatient && currentPatient.uhid) || '-'}\n`;
            message += `Test Date: ${date || '-'}\n`;
            message += `${data?.observation ? `Observation Notes: ${data?.observation}\n` : ``}`;
            message += `${
              data?.additionalNotes ? `Additional Notes: ${data?.additionalNotes}\n` : ``
            }`;
            message += `---------------\n`;
            (data?.labTestResults || []).forEach((record: any) => {
              if (record) {
                if (record.parameterName) {
                  message += `${record.parameterName}\n`;
                  message += `${
                    record.result
                      ? `Result: ${record.result} ${record.unit ? record.unit || '' : ''}\n`
                      : ``
                  }`;
                } else {
                  message += `Summary: ${record.result}`;
                }
              }
            });
            message = message.slice(0, -1);
            prismImages = data?.id;
            urls = data?.fileUrl ? data?.fileUrl : ''; //prismImages;
          } else if (type === 'prescription') {
            date = data?.date;
            name = data?.prescriptionName || '-';
            fileName = g(data, 'prescriptionFiles', '0', 'fileName') || '';
            message = `${data?.source || ''} Report\n`;
            message += `Test Name: ${name}\n`;
            message += `UHID: ${(currentPatient && currentPatient.uhid) || '-'}\n`;
            message += `Test Date: ${date || '-'}\n`;
            message += `${data?.notes ? `Additional Notes: ${data?.notes}\n` : ``}`;
            message += `---------------\n`;
            message = message.slice(0, -1);
            prismImages = data?.id;
            urls = data?.fileUrl ? data?.fileUrl : ''; //prismImages;
          } else if (type === 'medical') {
            date = data?.testDate;
            name = data?.testName;
            const unit = data?.unit;
            message = `${data?.recordType.replace(/_/g, ' ')} Report\n`;
            message += `Test Name: ${name}\n`;
            message += `UHID: ${(currentPatient && currentPatient.uhid) || '-'}\n`;
            message += `Test Date: ${moment(date).format('DD-MMM-YYYY') || '-'}\n`;
            message += `${
              data?.observation ? `Observation Notes: ${data?.additionalNotes}\n` : ``
            }`;
            message += `${
              data?.additionalNotes ? `Additional Notes: ${data?.additionalNotes}\n` : ``
            }`;
            message += `---------------\n`;
            (data?.medicalRecordParameters || []).forEach((record: any) => {
              if (record) {
                message += `${record.parameterName}\n`;
                message += `${record.result ? `Result: ${record.result} ${unit || ''}\n` : ``}`;
              }
            });
            message = message.slice(0, -1);
            prismImages = data?.prismFileIds;
            urls = data?.documentURLs;
          } else if (type === 'health') {
            date = data?.healthCheckName;
            name = data?.healthCheckDate;
            message = `Health Check: ${name}\n`;
            message += `Date: ${moment(date).format('DD-MMM-YYYY') || '-'}\n`;
            message += `Summary: ${data?.healthCheckSummary}\n`;
            message += ` ${data?.followupDate ? `Follow-up Date: ${data?.followupDate}` : ``}`;
            prismImages = data?.healthCheckPrismFileIds && data?.healthCheckPrismFileIds.join(',');
            urls = '';
          } else if (type === 'hospital') {
            date = data?.dateOfHospitalization;
            name = 'Hospitalizations';
            message = `Date of Hospitalization: ${moment(date).format('DD-MMM-YYYY') || '-'}\n`;
            message += `Date of Discharge: ${moment(data?.dateOfDischarge).format('DD-MMM-YYYY') ||
              '-'}\n`;
            message += `Diagnosis Notes: ${data?.diagnosisNotes}`;
            prismImages =
              data?.hospitalizationPrismFileIds && data?.hospitalizationPrismFileIds.join(',');
            urls = '';
          }
          submitValues.push({
            id: data?.id,
            uploadedUrl: urls,
            fileName: fileName,
            forPatient: (currentPatient && currentPatient.firstName) || '',
            doctorName: name,
            date: moment(date).format(DATE_FORMAT),
            prismPrescriptionFileId: prismImages,
            message: message,
            healthRecord: true,
          } as EPrescription);
        }
      });
    }
    setSelectedHealthRecord([]);
    props.onSubmit(submitValues);
  };

  const renderHeader = () => (
    <Header
      title={'SELECT FROM MY PRESCRIPTIONS'}
      leftIcon="backArrow"
      container={{
        ...theme.viewStyles.cardContainer,
      }}
      onPressLeftIcon={() => props.onSubmit([])}
    />
  );

  const renderSteps = () => (
    <View style={{ marginLeft: 15 }}>
      <View style={{ flexDirection: 'row' }}>
        <TrackerBig style={styles.stepsIcon} />
        <Text style={theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 24)}>
          Click on icon to select prescription.
        </Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <TrackerBig style={styles.stepsIcon} />
        <Text style={theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 24)}>
          Long press to preview prescription.
        </Text>
      </View>
    </View>
  );

  const renderBottomButton = () => (
    <View style={styles.buttonContainer}>
      <Button
        title={'UPLOAD'}
        disabled={
          Object.keys(selectedPrescription)?.filter((item) => selectedPrescription?.[item])
            ?.length == 0 && selectedHealthRecord.length === 0
        }
        onPress={onPressUpload}
        style={styles.buttonCta}
      />
    </View>
  );

  return (
    <Overlay
      onRequestClose={() => props.onSubmit([])}
      overlayStyle={styles.overLayStyle}
      fullScreen
      isVisible={props.isVisible}
    >
      <View style={theme.viewStyles.container}>
        <SafeAreaView style={styles.safeAreaStyle}>
          {renderHeader()}
          <ScrollView bounces={false}>
            {!(loading || (props.displayPrismRecords && medPrismloading)) && (
              <>
                {renderNoPrescriptions()}
                <View style={{ height: 16 }} />
                {(!!prescriptionUpto6months.length ||
                  (!!combination?.length && props.displayPrismRecords) ||
                  !!prescriptionOlderThan6months.length) &&
                  renderSteps()}
                {!!prescriptionUpto6months.length && renderEPrescriptions(false)}
                {!!combination?.length && props.displayPrismRecords && renderHealthRecords()}
                {!!prescriptionOlderThan6months.length && renderEPrescriptions(true)}
                <View style={{ height: 12 }} />
              </>
            )}
          </ScrollView>
          {renderBottomButton()}
        </SafeAreaView>
        {(loading || (props.displayPrismRecords && medPrismloading)) && <Spinner />}
        {showPreview && renderPrescriptionPreview()}
      </View>
    </Overlay>
  );
};
