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
  GET_MEDICAL_RECORD,
  GET_MEDICAL_PRISM_RECORD,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptionsVariables,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import { DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  aphConsole,
  g,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import { Alert, SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements';
import { ScrollView, NavigationContext, NavigationScreenProps } from 'react-navigation';
import { SectionHeader } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  getPatientMedicalRecords,
  getPatientMedicalRecordsVariables,
  getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords,
} from '../../graphql/types/getPatientMedicalRecords';
import {
  getPatientPrismMedicalRecords,
  getPatientPrismMedicalRecordsVariables,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations,
} from '../../graphql/types/getPatientPrismMedicalRecords';
import { MedicalRecords } from '../HealthRecords/MedicalRecords';
import { CheckedIcon, UnCheck } from '../ui/Icons';
import { getPrismUrls } from '../../helpers/clientCalls';
import { MedicalTest } from '../HealthRecords/AddRecord';

const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
});

export interface SelectEPrescriptionModalProps extends NavigationScreenProps {
  onSubmit: (prescriptions: EPrescription[]) => void;
  isVisible: boolean;
  selectedEprescriptionIds?: EPrescription['id'][];
  displayPrismRecords?: boolean;
  displayMedicalRecords?: boolean;
}

export const SelectEPrescriptionModal: React.FC<SelectEPrescriptionModalProps> = (props) => {
  const [selectedPrescription, setSelectedPrescription] = useState<{ [key: string]: boolean }>({});
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
  // aphConsole.log({ data, loading, error });

  const { data: medRecords, loading: medloading, error: mederror } = useQuery<
    getPatientMedicalRecords,
    getPatientMedicalRecordsVariables
  >(GET_MEDICAL_RECORD, {
    variables: {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
    fetchPolicy: 'no-cache',
  });

  const [medicalRecords, setmedicalRecords] = useState<
    (getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords | null)[] | null | undefined
  >([]);
  useEffect(() => {
    setmedicalRecords(g(medRecords, 'getPatientMedicalRecords', 'medicalRecords') || []);
  }, [medRecords]);

  const { data: medPrismRecords, loading: medPrismloading, error: medPrismerror } = useQuery<
    getPatientPrismMedicalRecords,
    getPatientPrismMedicalRecordsVariables
  >(GET_MEDICAL_PRISM_RECORD, {
    variables: {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
    fetchPolicy: 'no-cache',
  });
  const [labTests, setlabTests] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests | null)[]
    | null
    | undefined
  >([]);
  const [healthChecks, sethealthChecks] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks | null)[]
    | null
    | undefined
  >([]);
  const [hospitalizations, sethospitalizations] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations | null)[]
    | null
    | undefined
  >([]);

  useEffect(() => {
    console.log(medPrismRecords);

    setlabTests(g(medPrismRecords, 'getPatientPrismMedicalRecords', 'labTests') || []);
    sethealthChecks(g(medPrismRecords, 'getPatientPrismMedicalRecords', 'healthChecks') || []);
    sethospitalizations(
      g(medPrismRecords, 'getPatientPrismMedicalRecords', 'hospitalizations') || []
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

  useEffect(() => {
    if (mederror) {
      CommonBugFender('SelectEPrescriptionModal_mederror', mederror);
    }
  }, [mederror]);

  const [combination, setCombination] = useState<
    { type: 'medical' | 'lab' | 'health' | 'hospital'; data: any }[]
  >();
  const [selectedHealthRecord, setSelectedHealthRecord] = useState<string[]>([]);

  useEffect(() => {
    let mergeArray: { type: 'medical' | 'lab' | 'health' | 'hospital'; data: any }[] = [];
    console.log('combination before', mergeArray);
    medicalRecords &&
      medicalRecords.forEach((item) => {
        mergeArray.push({ type: 'medical', data: item });
      });
    labTests &&
      labTests.forEach((item) => {
        mergeArray.push({ type: 'lab', data: item });
      });
    healthChecks &&
      healthChecks.forEach((item) => {
        mergeArray.push({ type: 'health', data: item });
      });
    hospitalizations &&
      hospitalizations.forEach((item) => {
        mergeArray.push({ type: 'hospital', data: item });
      });
    console.log('combination after', mergeArray);
    setCombination(sordByDate(mergeArray));
  }, [medicalRecords, labTests, healthChecks, hospitalizations]);

  const sordByDate = (array: { type: 'medical' | 'lab' | 'health' | 'hospital'; data: any }[]) => {
    return array.sort(({ data: data1 }, { data: data2 }) => {
      let date1 = new Date(
        data1.testDate || data1.labTestDate || data1.appointmentDate || data1.dateOfHospitalization
      );
      let date2 = new Date(
        data2.testDate || data2.labTestDate || data2.appointmentDate || data2.dateOfHospitalization
      );
      return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
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
  ) =>
    caseSheet!.find(
      (item) =>
        item!.doctorType == DoctorType.STAR_APOLLO ||
        item!.doctorType == DoctorType.APOLLO ||
        item!.doctorType == DoctorType.PAYROLL
    )!;

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
            doctorName: item!.doctorInfo ? `Dr. ${item!.doctorInfo.firstName}` : '',
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
          marginTop: 4,
          marginBottom: 4,
        }}
        onSelect={(isSelected) => {
          setSelectedPrescription({
            ...selectedPrescription,
            [item.id]: isSelected,
          });
        }}
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
      <View>
        {combination &&
          combination.map(({ type, data }, index) => {
            // if (item.type === 'medical') {
            //   data = item.data as getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords;
            // } else if (item.type === 'lab') {
            //   data = item.data as getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests;
            // } else if (item.type === 'hospital') {
            //   data = item.data as getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks;
            // } else if (item.type === 'health') {
            //   data = item.data as getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations;
            // }
            const selected = selectedHealthRecord.findIndex((i) => i === index.toString()) > -1;
            return (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  if (selected) {
                    setSelectedHealthRecord([
                      ...selectedHealthRecord.filter((i) => i !== index.toString()),
                    ]);
                  } else {
                    setSelectedHealthRecord([...selectedHealthRecord, index.toString()]);
                  }
                }}
              >
                <View
                  style={{
                    ...theme.viewStyles.cardViewStyle,
                    marginHorizontal: 20,
                    marginVertical: 4,
                    padding: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text
                      style={{
                        ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 24),
                        flex: 0.9,
                      }}
                    >
                      {data.testName ||
                        data.issuingDoctor ||
                        data.location ||
                        data.diagnosisNotes ||
                        data.healthCheckName ||
                        data.labTestName}
                    </Text>
                    {selected ? <CheckedIcon /> : <UnCheck />}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text
                      style={{
                        ...theme.viewStyles.text(
                          'M',
                          14,
                          theme.colors.TEXT_LIGHT_BLUE,
                          1,
                          20,
                          0.04
                        ),
                        width: '49%',
                      }}
                    >
                      {moment(
                        data.testDate ||
                          data.labTestDate ||
                          data.appointmentDate ||
                          data.dateOfHospitalization
                      ).format('DD MMMM YYYY')}
                    </Text>
                    {data.sourceName ||
                      data.source ||
                      (data.labTestSource && (
                        <>
                          <View
                            style={{
                              borderRightWidth: 0.5,
                              // borderBottomColor: 'rgba(2, 71, 91, 0.2)',
                              borderBottomColor: '#02475b',
                              opacity: 0.2,
                              marginHorizontal: 12,
                            }}
                          />
                          <Text
                            style={{
                              ...theme.viewStyles.text(
                                'M',
                                14,
                                theme.colors.TEXT_LIGHT_BLUE,
                                1,
                                20,
                                0.04
                              ),
                              width: '49%',
                              textAlign: 'left',
                            }}
                          >
                            {(currentPatient && currentPatient.firstName) || ''}
                          </Text>
                        </>
                      ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </View>
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
            {!(loading || (props.displayPrismRecords && (medloading || medPrismloading))) && (
              <>
                {renderNoPrescriptions()}
                <View style={{ height: 16 }} />
                {prescriptionUpto6months.map((item, index, array) => {
                  return renderEPrescription(item, index, array.length);
                })}
                {!!prescriptionOlderThan6months.length && (
                  <SectionHeader
                    style={{ marginTop: 14 }}
                    leftText="PRESCRIPTIOINS OLDER THAN 6 MONTHS"
                  />
                )}
                {prescriptionOlderThan6months.map((item, index, array) => {
                  return renderEPrescription(item, index, array.length, true);
                })}
                {props.displayPrismRecords && renderHealthRecords()}
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
                    console.log(data, 'bdfiunio');

                    if (selectedHealthRecord.findIndex((i) => i === index.toString()) > -1) {
                      let date = '';
                      let name = '';
                      let message = '';
                      let urls = '';
                      let prismImages = '';
                      if (type === 'lab') {
                        date = data.labTestDate;
                        name = data.labTestName || '-';
                        message = `${data.departmentName} Report\n`;
                        message += `Test Name: ${name}\n`;
                        message += `UHID: ${(currentPatient && currentPatient.uhid) || '-'}\n`;
                        message += `Test Date: ${moment(date).format('DD-MMM-YYYY') || '-'}\n`;
                        message += `${
                          data.observation ? `Observation Notes: ${data.observation}\n` : ``
                        }`;
                        message += `${
                          data.additionalNotes ? `Additional Notes: ${data.additionalNotes}\n` : ``
                        }`;
                        message += `---------------\n`;
                        (data.labTestResultParameters || []).forEach((record: any) => {
                          console.log(record);
                          if (record) {
                            if (record.setParameterName) {
                              message += `${record.parameterName}\n`;
                              message += `${
                                record.result
                                  ? `Result: ${record.result} ${
                                      record.setUnit ? record.unit || '' : ''
                                    }\n`
                                  : ``
                              }`;
                            } else {
                              message += `Summary: ${record.result}`;
                            }
                          }
                        });
                        message = message.slice(0, -1);
                        prismImages =
                          data.testResultPrismFileIds && data.testResultPrismFileIds.join(',');
                        urls = ''; //prismImages;
                      } else if (type === 'medical') {
                        date = data.testDate;
                        name = data.testName;
                        const unit = MedicalTest.find((itm) => itm.key === data.unit);
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
                          console.log(record);
                          if (record) {
                            message += `${record.parameterName}\n`;
                            message += `${
                              record.result
                                ? `Result: ${record.result} ${unit ? unit.value : ''}\n`
                                : ``
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
                        forPatient: (currentPatient && currentPatient.firstName) || '',
                        doctorName: name,
                        date: date,
                        prismPrescriptionFileId: prismImages,
                        message: message,
                        healthRecord: true,
                      } as EPrescription);
                    }
                  });
                }
                console.log(submitValues, 'sub anvio');

                setSelectedHealthRecord([]);
                props.onSubmit(submitValues);
              }}
              style={{ marginHorizontal: 60, marginVertical: 20 }}
            />
          </View>
        </SafeAreaView>
        {(loading || (props.displayPrismRecords && (medloading || medPrismloading))) && <Spinner />}
      </View>
    </Overlay>
  );
};
