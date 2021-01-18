import { EPrescription } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { EPrescriptionCard } from '@aph/mobile-patients/src/components/ui/EPrescriptionCard';
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
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { ScrollView, NavigationScreenProps } from 'react-navigation';
import { SectionHeader } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  getPatientPrismMedicalRecords_V2,
  getPatientPrismMedicalRecords_V2Variables,
  getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response,
  getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V2';
import { CheckedIcon, UnCheck, TrackerBig } from '@aph/mobile-patients/src/components/ui/Icons';

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
    justifyContent: 'space-around',
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
  checkContainer: {
    position: 'absolute',
    right: 7,
    top: 7,
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

  const renderEPrescription = (
    item: EPrescription,
    i: number,
    arrayLength: number,
    disabled?: boolean
  ) => {
    return (
      <EPrescriptionCard
        key={i}
        actionType="selection"
        isSelected={!!selectedPrescription[item.id]}
        date={item.date}
        doctorName={item.doctorName}
        forPatient={item.forPatient}
        medicines={item.medicines}
        isDisabled={disabled}
        style={{
          marginVertical: 4,
          width: width / 3,
        }}
        onSelect={(isSelected) => {
          setSelectedPrescription({
            ...selectedPrescription,
            [item.id]: isSelected,
          });
        }}
        uploadedUrl={item?.uploadedUrl}
      />
    );
  };

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

  const renderHealthRecords = () => {
    return (
      <View style={styles.healthRecordContainer}>
        {combination &&
          combination.map(({ type, data }, index) => {
            const selected = selectedHealthRecord.findIndex((i) => i === index.toString()) > -1;
            const uploadedBy =
              data.sourceName || data.source || data.labTestSource ? currentPatient?.firstName : '';
            return (
              <TouchableOpacity
                activeOpacity={1}
                onLongPress={() => {
                  if (selected) {
                    setSelectedHealthRecord([
                      ...selectedHealthRecord.filter((i) => i !== index.toString()),
                    ]);
                  } else {
                    setSelectedHealthRecord([...selectedHealthRecord, index.toString()]);
                  }
                }}
                onPress={() => {
                  if (selected) {
                    setSelectedHealthRecord([
                      ...selectedHealthRecord.filter((i) => i !== index.toString()),
                    ]);
                  } else {
                    setImageUrl(data.fileUrl);
                    setImageIndex(index.toString());
                    setShowPreview(true);
                  }
                }}
                style={styles.healthRecord}
              >
                <Image source={{ uri: data.fileUrl }} style={styles.hrImage} />
                <View style={{ padding: 5 }}>
                  <Text numberOfLines={1} style={styles.hrHeading}>
                    {uploadedBy ||
                      data.testName ||
                      data.issuingDoctor ||
                      data.location ||
                      data.diagnosisNotes ||
                      data.healthCheckName ||
                      data.labTestName ||
                      data.prescriptionName}
                  </Text>
                  <Text style={theme.viewStyles.text('R', 13, theme.colors.LIGHT_BLUE, 0.6, 24)}>
                    {moment(
                      data.date ||
                        data.testDate ||
                        data.appointmentDate ||
                        data.dateOfHospitalization
                    ).format('DD MMMM YYYY')}
                  </Text>
                </View>
                <View style={styles.checkContainer}>
                  {selected ? <CheckedIcon /> : <UnCheck />}
                </View>
              </TouchableOpacity>
            );
          })}
      </View>
    );
  };

  const renderPrescriptionPreview = () => {
    return (
      <Overlay
        onRequestClose={() => {}}
        isVisible={showPreview}
        onBackdropPress={() => setShowPreview(false)}
      >
        <Text
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            ...theme.viewStyles.text('M', 18, theme.colors.LIGHT_BLUE, 1, 24),
          }}
        >
          Prescription Image
        </Text>
        <Image style={styles.overlayImage} source={{ uri: imageUrl }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <TouchableOpacity
            onPress={() => {
              setSelectedHealthRecord([...selectedHealthRecord, imageIndex]);
              setTimeout(() => {
                setShowPreview(false);
              }, 1000);
            }}
            activeOpacity={0.7}
            style={styles.selectButton}
          >
            <Text style={styles.selectText}>SELECT</Text>
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

  return (
    <Overlay
      onRequestClose={() => props.onSubmit([])}
      overlayStyle={{
        padding: 0,
        margin: 0,
        backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
      }}
      fullScreen
      isVisible={props.isVisible}
    >
      <View style={theme.viewStyles.container}>
        <SafeAreaView
          style={{
            backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            flex: 1,
          }}
        >
          <Header
            title={'SELECT FROM E-PRESCRIPTIONS'}
            leftIcon="backArrow"
            container={{
              ...theme.viewStyles.cardContainer,
            }}
            onPressLeftIcon={() => props.onSubmit([])}
          />
          <ScrollView bounces={false}>
            {!(loading || (props.displayPrismRecords && medPrismloading)) && (
              <>
                {renderNoPrescriptions()}
                <View style={{ height: 16 }} />
                <View
                  style={{
                    marginLeft: 15,
                  }}
                >
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
                {prescriptionUpto6months.map((item, index, array) => {
                  return (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {renderEPrescription(item, index, array.length)}
                    </View>
                  );
                })}
                {props.displayPrismRecords && renderHealthRecords()}
                {!!prescriptionOlderThan6months.length && (
                  <SectionHeader
                    style={{ marginTop: 14, marginBottom: 10 }}
                    leftText="PRESCRIPTIOINS OLDER THAN 6 MONTHS"
                  />
                )}
                {prescriptionOlderThan6months.map((item, index, array) => {
                  return (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {renderEPrescription(item, index, array.length, true)}
                    </View>
                  );
                })}
                <View style={{ height: 12 }} />
              </>
            )}
          </ScrollView>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 60 }}>
            <Button
              title={'UPLOAD'}
              disabled={
                Object.keys(selectedPrescription).filter((item) => selectedPrescription[item])
                  .length == 0 && selectedHealthRecord.length === 0
              }
              onPress={() => {
                CommonLogEvent('SELECT_PRESCRIPTION_MODAL', 'Formatted e prescription');
                const submitValues = prescriptionUpto6months.filter(
                  (item) => selectedPrescription[item!.id]
                );
                if (combination) {
                  combination.forEach(({ type, data }, index) => {
                    if (selectedHealthRecord.findIndex((i) => i === index.toString()) > -1) {
                      let date = '';
                      let name = '';
                      let message = '';
                      let urls = '';
                      let prismImages = '';
                      let fileName = '';
                      if (type === 'lab') {
                        date = data.date;
                        name = data.labTestName || '-';
                        fileName = g(data, 'testResultFiles', '0', 'fileName') || '';
                        message = `${data.labTestSource || ''} Report\n`;
                        message += `Test Name: ${name}\n`;
                        message += `UHID: ${(currentPatient && currentPatient.uhid) || '-'}\n`;
                        message += `Test Date: ${date || '-'}\n`;
                        message += `${
                          data.observation ? `Observation Notes: ${data.observation}\n` : ``
                        }`;
                        message += `${
                          data.additionalNotes ? `Additional Notes: ${data.additionalNotes}\n` : ``
                        }`;
                        message += `---------------\n`;
                        (data.labTestResults || []).forEach((record: any) => {
                          if (record) {
                            if (record.parameterName) {
                              message += `${record.parameterName}\n`;
                              message += `${
                                record.result
                                  ? `Result: ${record.result} ${
                                      record.unit ? record.unit || '' : ''
                                    }\n`
                                  : ``
                              }`;
                            } else {
                              message += `Summary: ${record.result}`;
                            }
                          }
                        });
                        message = message.slice(0, -1);
                        prismImages = data.id;
                        urls = data.fileUrl ? data.fileUrl : ''; //prismImages;
                      } else if (type === 'prescription') {
                        date = data.date;
                        name = data.prescriptionName || '-';
                        fileName = g(data, 'prescriptionFiles', '0', 'fileName') || '';
                        message = `${data.source || ''} Report\n`;
                        message += `Test Name: ${name}\n`;
                        message += `UHID: ${(currentPatient && currentPatient.uhid) || '-'}\n`;
                        message += `Test Date: ${date || '-'}\n`;
                        message += `${data.notes ? `Additional Notes: ${data.notes}\n` : ``}`;
                        message += `---------------\n`;
                        message = message.slice(0, -1);
                        prismImages = data.id;
                        urls = data.fileUrl ? data.fileUrl : ''; //prismImages;
                      } else if (type === 'medical') {
                        date = data.testDate;
                        name = data.testName;
                        const unit = data?.unit;
                        message = `${data.recordType.replace(/_/g, ' ')} Report\n`;
                        message += `Test Name: ${name}\n`;
                        message += `UHID: ${(currentPatient && currentPatient.uhid) || '-'}\n`;
                        message += `Test Date: ${moment(date).format('DD-MMM-YYYY') || '-'}\n`;
                        message += `${
                          data.observation ? `Observation Notes: ${data.additionalNotes}\n` : ``
                        }`;
                        message += `${
                          data.additionalNotes ? `Additional Notes: ${data.additionalNotes}\n` : ``
                        }`;
                        message += `---------------\n`;
                        (data.medicalRecordParameters || []).forEach((record: any) => {
                          if (record) {
                            message += `${record.parameterName}\n`;
                            message += `${
                              record.result ? `Result: ${record.result} ${unit || ''}\n` : ``
                            }`;
                          }
                        });
                        message = message.slice(0, -1);
                        prismImages = data.prismFileIds;
                        urls = data.documentURLs;
                      } else if (type === 'health') {
                        date = data.healthCheckName;
                        name = data.healthCheckDate;
                        message = `Health Check: ${name}\n`;
                        message += `Date: ${moment(date).format('DD-MMM-YYYY') || '-'}\n`;
                        message += `Summary: ${data.healthCheckSummary}\n`;
                        message += ` ${
                          data.followupDate ? `Follow-up Date: ${data.followupDate}` : ``
                        }`;
                        prismImages =
                          data.healthCheckPrismFileIds && data.healthCheckPrismFileIds.join(',');
                        urls = '';
                      } else if (type === 'hospital') {
                        date = data.dateOfHospitalization;
                        name = 'Hospitalizations';
                        message = `Date of Hospitalization: ${moment(date).format('DD-MMM-YYYY') ||
                          '-'}\n`;
                        message += `Date of Discharge: ${moment(data.dateOfDischarge).format(
                          'DD-MMM-YYYY'
                        ) || '-'}\n`;
                        message += `Diagnosis Notes: ${data.diagnosisNotes}`;
                        prismImages =
                          data.hospitalizationPrismFileIds &&
                          data.hospitalizationPrismFileIds.join(',');
                        urls = '';
                      }
                      submitValues.push({
                        id: data.id,
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
              }}
              style={{ marginHorizontal: 60, marginVertical: 20 }}
            />
          </View>
        </SafeAreaView>
        {(loading || (props.displayPrismRecords && medPrismloading)) && <Spinner />}
        {showPreview && renderPrescriptionPreview()}
      </View>
    </Overlay>
  );
};
