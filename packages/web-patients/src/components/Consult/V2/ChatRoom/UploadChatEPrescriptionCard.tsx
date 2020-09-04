import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';
import Scrollbars from 'react-custom-scrollbars';
import { useMutation } from 'react-apollo-hooks';
import { GET_PAST_CONSULTS_PRESCRIPTIONS } from 'graphql/profiles';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptionsVariables,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet as CaseSheet,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems,
} from 'graphql/types/getPatientPastConsultsAndPrescriptions';
import { useAllCurrentPatients } from 'hooks/authHooks';
import moment from 'moment';
import { EPrescription } from 'components/MedicinesCartProvider';
import { DoctorType } from 'graphql/types/globalTypes';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { GET_MEDICAL_PRISM_RECORD } from 'graphql/profiles';
import {
  getPatientPrismMedicalRecords,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response as LabResultsType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response as PrescriptionsType,
} from 'graphql/types/getPatientPrismMedicalRecords';
import { useAuth } from 'hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import { Alerts } from 'components/Alerts/Alerts';
import { ADD_CHAT_DOCUMENTS } from 'graphql/consult';
import Pubnub, { HereNowResponse } from 'pubnub';

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_PATIENTS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      borderRadius: 5,
      display: 'flex',
      textAlign: 'left',
      backgroundColor: '#f7f8f5',
      zIndex: 999,
    },
    tabsWrapper: {
      width: '100%',
      padding: '0 0 20px 0',
    },
    prescriptionGroup: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      backgroundColor: '#fff',
      margin: '10px 20px 10px 20px',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: 10,
      borderRadius: 5,
      '&:nth-child(1)': {
        margin: '15px 20px 10px 20px',
      },
      '&:last-child': {
        padding: '12px 15px 15px 15px',
      },
    },
    checkbox: {
      alignItems: 'baseline',
      margin: '0 0 0 auto',
      '&:hover': {
        backgroundColor: 'transparent !important',
      },
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    imgThumb: {
      paddingRight: 12,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    priscriptionInfo: {
      paddingTop: 5,
      fontSize: 12,
      fontWeight: 500,
      color: '#0087ba',
      letterSpacing: 0.04,
      display: 'inline-block',
      width: '100%',
    },
    name: {
      opacity: 0.6,
      color: '#02475b',
      margin: '0 10px 0 0',
    },
    date: {
      opacity: 0.6,
      color: '#02475b',
      margin: '0 10px 0 0',
    },
    patientHistory: {
      opacity: 0.6,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
      '& span': {
        margin: '0 5px 0 0',
      },
    },
    uploadPrescription: {
      width: '100%',
      borderRadius: 10,
      backgroundColor: '#fcb716',
      color: '#fff',
      padding: '9px 8px',
      '&:hover': {
        backgroundColor: '#fcb716',
        color: '#fff',
      },
    },
    uploadButtonWrapper: {
      padding: '0 20px',
      margin: '15px 0 0 0',
    },
    circularProgressWrapper: {
      textAlign: 'center',
      margin: '10px 0 0 0',
    },
    uploadBtnDisable: {
      backgroundColor: '#fcb716',
      color: '#fff',
      opacity: 0.5,
    },
  };
});

interface EPrescriptionCardProps {
  setIsEPrescriptionOpen?: (isEPrescriptionOpen: boolean) => void;
  appointmentId: string;
}

export const UploadChatEPrescriptionCard: React.FC<EPrescriptionCardProps> = (props) => {
  const classes = useStyles({});
  const { isSigningIn } = useAuth();
  const apolloClient = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [pastPrescriptions, setPastPrescriptions] = useState<any[] | null>(null);
  const [pastMedicalOrders, setPastMedicalOrders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecordChecked, setIsRecordChecked] = useState<boolean>(false);
  const [selectedEPrescriptions, setSelectedEPrescriptions] = useState([]);
  const [mutationLoading, setMutationLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const [medicalLoading, setMedicalLoading] = useState<boolean>(false);
  const [prismCombinedData, setPrismCombinedData] = useState<any>(null);
  const patientId = currentPatient ? currentPatient.id : '';

  const patientPastConsultAndPrescriptionMutation = useMutation<
    getPatientPastConsultsAndPrescriptions,
    getPatientPastConsultsAndPrescriptionsVariables
  >(GET_PAST_CONSULTS_PRESCRIPTIONS, {
    variables: {
      consultsAndOrdersInput: {
        patient: patientId,
      },
    },
    fetchPolicy: 'no-cache',
  });

  const sortByDate = (array: EPrescription[]) => {
    return array.sort((data1, data2) => {
      let date1 = moment(data1.date)
        .toDate()
        .getTime();
      let date2 = moment(data2.date)
        .toDate()
        .getTime();
      return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
    });
  };

  const fetchPrismData = () => {
    apolloClient
      .query<getPatientPrismMedicalRecords>({
        query: GET_MEDICAL_PRISM_RECORD,
        variables: {
          patientId: patientId,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }: any) => {
        if (data && data.getPatientPrismMedicalRecords) {
          const prismMedicalRecords = data.getPatientPrismMedicalRecords;
          let mergeArray: EPrescription[] = [];
          if (prismMedicalRecords.labResults && prismMedicalRecords.labResults.response) {
            const prismLabResults = prismMedicalRecords.labResults.response;
            prismLabResults.forEach((item: LabResultsType) => {
              mergeArray.push({
                id: `${item.id}-${item.labTestName}`,
                uploadedUrl: item.fileUrl || '',
                forPatient: (currentPatient && currentPatient.firstName) || '',
                date: item.date,
                medicines: '',
                doctorName: item.labTestName,
                prismPrescriptionFileId: '',
              });
            });
          }
          if (prismMedicalRecords.prescriptions && prismMedicalRecords.prescriptions.response) {
            const prismPrescriptions = prismMedicalRecords.prescriptions.response;
            prismPrescriptions.forEach((item: PrescriptionsType) => {
              mergeArray.push({
                id: `${item.id}-${item.prescriptionName}`,
                uploadedUrl: item.fileUrl || '',
                forPatient: (currentPatient && currentPatient.firstName) || '',
                date: item.date,
                medicines: '',
                doctorName: item.prescriptionName,
                prismPrescriptionFileId: '',
              });
            });
          }
          const sortedData = sortByDate(mergeArray);
          setPrismCombinedData(sortedData);
        } else {
          setPrismCombinedData([]);
        }
      })
      .catch((error) => {
        console.log(error);
        setIsAlertOpen(true);
        setAlertMessage('Something went wrong :(');
      })
      .finally(() => {
        setMedicalLoading(false);
      });
  };

  useEffect(() => {
    if (!pastPrescriptions || !pastMedicalOrders) {
      setLoading(true);
      patientPastConsultAndPrescriptionMutation()
        .then(({ data }: any) => {
          if (
            data &&
            data.getPatientPastConsultsAndPrescriptions &&
            (data.getPatientPastConsultsAndPrescriptions.consults ||
              data.getPatientPastConsultsAndPrescriptions.medicineOrders)
          ) {
            data.getPatientPastConsultsAndPrescriptions.consults &&
              setPastPrescriptions(data.getPatientPastConsultsAndPrescriptions.consults || []);
            data.getPatientPastConsultsAndPrescriptions.medicineOrders &&
              setPastMedicalOrders(
                data.getPatientPastConsultsAndPrescriptions.medicineOrders || []
              );
            setLoading(false);
          } else {
            setLoading(false);
            setPastPrescriptions([]);
            setPastMedicalOrders([]);
          }
        })
        .catch((e) => {
          console.log(e);
          setLoading(false);
        });
    }
  }, [pastPrescriptions, pastMedicalOrders]);

  useEffect(() => {
    if (!isSigningIn && !prismCombinedData) {
      setMedicalLoading(true);
      fetchPrismData();
    }
  }, [prismCombinedData, isSigningIn]);

  const DATE_FORMAT = 'DD MMM YYYY';

  const getMedicines = (
    medicines: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems | null)[]
  ) =>
    medicines
      .filter((item) => item!.medicineName)
      .map((item) => item!.medicineName)
      .join(', ');

  const getCaseSheet = (caseSheet: CaseSheet[]) =>
    caseSheet!.find(
      (item) =>
        item!.doctorType == DoctorType.STAR_APOLLO ||
        item!.doctorType == DoctorType.APOLLO ||
        item!.doctorType == DoctorType.PAYROLL
    )!;

  const getBlobName = (caseSheet: CaseSheet[]) =>
    caseSheet.length > 0 && caseSheet.filter((item) => item.blobName);

  const formattedEPrescriptions =
    pastMedicalOrders &&
    pastMedicalOrders
      .map(
        (item: any) =>
          item &&
          ({
            id: item.id,
            date: moment(item.quoteDateTime).format(DATE_FORMAT),
            uploadedUrl: item.prescriptionImageUrl,
            doctorName: `Meds Rx ${(item.id && item.id.substring(0, item.id.indexOf('-'))) || ''}`, // item.referringDoctor ? `Dr. ${item.referringDoctor}` : ''
            forPatient: (currentPatient && currentPatient.firstName) || '',
            medicines: getMedicines(item!.medicineOrderLineItems! || []),
            prismPrescriptionFileId: item!.prismPrescriptionFileId,
          } as any)
      )
      .concat(
        pastPrescriptions &&
          pastPrescriptions.map(
            (item: any) =>
              item &&
              getBlobName(item.caseSheet).length > 0 && {
                id: item.id,
                date: moment(item.appointmentDateTime).format(DATE_FORMAT),
                uploadedUrl: `${process.env.AZURE_PDF_BASE_URL}${
                  getBlobName(item.caseSheet)[0].blobName
                }`,
                doctorName: item.doctorInfo ? `${item.doctorInfo.fullName}` : '',
                forPatient: (currentPatient && currentPatient.firstName) || '',
                medicines: (
                  (getCaseSheet(item.caseSheet) || { medicinePrescription: [] })
                    .medicinePrescription || []
                )
                  .map((item) => item && item.medicineName)
                  .join(', '),
              }
          )
      )
      .filter((item: any) => item && !!item.uploadedUrl)
      .sort(
        (a: any, b: any) =>
          moment(b.date, DATE_FORMAT)
            .toDate()
            .getTime() -
          moment(a.date, DATE_FORMAT)
            .toDate()
            .getTime()
      );

  const PRESCRIPTION_VALIDITY_IN_DAYS = 180;

  const prescriptionOlderThan6months =
    formattedEPrescriptions &&
    formattedEPrescriptions.filter((item: any) => {
      const prescrTime = moment(item.date, DATE_FORMAT);
      const currTime = moment(new Date());
      const diff = currTime.diff(prescrTime, 'days');
      return diff > PRESCRIPTION_VALIDITY_IN_DAYS ? true : false;
    });

  const prescriptionUpto6months =
    formattedEPrescriptions &&
    formattedEPrescriptions.filter((item: any) => {
      const prescrTime = moment(item.date, DATE_FORMAT);
      const currTime = moment(new Date());
      const diff = currTime.diff(prescrTime, 'days');
      return diff <= PRESCRIPTION_VALIDITY_IN_DAYS ? true : false;
    });

  if (loading || medicalLoading) {
    return (
      <div className={classes.circularProgressWrapper}>
        <CircularProgress />
      </div>
    );
  }

  const config: Pubnub.PubnubConfig = {
    subscribeKey: process.env.SUBSCRIBE_KEY || '',
    publishKey: process.env.PUBLISH_KEY || '',
    ssl: true,
    uuid: `PATIENT_${patientId}`,
    restore: true,
    keepAlive: true,
    heartbeatInterval: 20,
    origin: 'apollo.pubnubapi.com',
  };
  const pubnub = new Pubnub(config);

  return (
    <div className={classes.root}>
      <div className={classes.tabsWrapper}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(45vh)'}>
          {prescriptionUpto6months &&
            prescriptionUpto6months.length > 0 &&
            prescriptionUpto6months.map((pastPrescription: EPrescription) => (
              <div className={classes.prescriptionGroup}>
                <div className={classes.imgThumb}>
                  <img src={require('images/ic_prescription.svg')} alt="" />
                </div>
                <div>
                  <div>{pastPrescription.doctorName}</div>
                  <div className={classes.priscriptionInfo}>
                    <span className={classes.name}>
                      {currentPatient && currentPatient.firstName}
                    </span>
                    <span className={classes.date}>
                      {moment(pastPrescription.date).format(DATE_FORMAT)}
                    </span>
                  </div>
                </div>
                <AphCheckbox
                  disabled={mutationLoading}
                  checked={
                    selectedEPrescriptions.findIndex(
                      (selectedPrescription) => selectedPrescription.id === pastPrescription.id
                    ) !== -1
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const selectedRecords = selectedEPrescriptions;
                      selectedRecords.push(pastPrescription);
                      setSelectedEPrescriptions(selectedRecords);
                    } else {
                      const selectedRecords = selectedEPrescriptions.filter(
                        (record) => record.id != pastPrescription.id
                      );
                      setSelectedEPrescriptions(selectedRecords);
                    }
                    setIsRecordChecked(!isRecordChecked);
                  }}
                  className={classes.checkbox}
                  color="primary"
                />
              </div>
            ))}
          {prismCombinedData &&
            prismCombinedData.map((prismPrescription: any) => (
              <div className={classes.prescriptionGroup}>
                <div className={classes.imgThumb}>
                  <img src={require('images/ic_prescription.svg')} alt="" />
                </div>
                <div>
                  <div>{prismPrescription.doctorName}</div>
                  <div className={classes.priscriptionInfo}>
                    <span className={classes.name}>
                      {currentPatient && currentPatient.firstName}
                    </span>
                    <span className={classes.date}>
                      {moment(prismPrescription.date).format(DATE_FORMAT)}
                    </span>
                  </div>
                </div>
                <AphCheckbox
                  disabled={mutationLoading}
                  checked={
                    selectedEPrescriptions.findIndex(
                      (selectedPrescription) => selectedPrescription.id === prismPrescription.id
                    ) !== -1
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const selectedRecords = selectedEPrescriptions;
                      selectedRecords.push(prismPrescription);
                      setSelectedEPrescriptions(selectedRecords);
                    } else {
                      const selectedRecords = selectedEPrescriptions.filter(
                        (record) => record.id != prismPrescription.id
                      );
                      setSelectedEPrescriptions(selectedRecords);
                    }
                    setIsRecordChecked(!isRecordChecked);
                  }}
                  className={classes.checkbox}
                  color="primary"
                />
              </div>
            ))}
          {prescriptionOlderThan6months &&
            prescriptionOlderThan6months.length > 0 &&
            prescriptionOlderThan6months.map((pastPrescription: EPrescription) => (
              <div className={classes.prescriptionGroup}>
                <div className={classes.imgThumb}>
                  <img src={require('images/ic_prescription.svg')} alt="" />
                </div>
                <div>
                  <div>{pastPrescription.doctorName}</div>
                  <div className={classes.priscriptionInfo}>
                    <span className={classes.name}>
                      {currentPatient && currentPatient.firstName}
                    </span>
                    <span className={classes.date}>
                      {moment(pastPrescription.date).format(DATE_FORMAT)}
                    </span>
                  </div>
                </div>
                <AphCheckbox
                  disabled={mutationLoading}
                  checked={
                    selectedEPrescriptions.findIndex(
                      (selectedPrescription) => selectedPrescription.id === pastPrescription.id
                    ) !== -1
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const selectedRecords = selectedEPrescriptions;
                      selectedRecords.push(pastPrescription);
                      setSelectedEPrescriptions(selectedRecords);
                    } else {
                      const selectedRecords = selectedEPrescriptions.filter(
                        (record) => record.id != pastPrescription.id
                      );
                      setSelectedEPrescriptions(selectedRecords);
                    }
                    setIsRecordChecked(!isRecordChecked);
                  }}
                  className={classes.checkbox}
                  color="primary"
                />
              </div>
            ))}
        </Scrollbars>
        <div className={classes.uploadButtonWrapper}>
          <AphButton
            disabled={
              ((!pastMedicalOrders || (pastMedicalOrders && pastMedicalOrders.length === 0)) &&
                (!pastPrescriptions || (pastPrescriptions && pastPrescriptions.length === 0)) &&
                prismCombinedData &&
                prismCombinedData.length === 0) ||
              selectedEPrescriptions.length === 0 ||
              mutationLoading
            }
            onClick={() => {
              setMutationLoading(true);
              props.setIsEPrescriptionOpen(false);
              if (selectedEPrescriptions.length === 0) {
                return;
              } else {
                selectedEPrescriptions.forEach((item) => {
                  const url = item.uploadedUrl ? item.uploadedUrl : '';
                  const prism = item.prismPrescriptionFileId ? item.prismPrescriptionFileId : '';
                  // url &&
                  //   url.map((item, index) => {
                  if (url) {
                    setLoading(true);
                    apolloClient
                      .mutate({
                        mutation: ADD_CHAT_DOCUMENTS,
                        fetchPolicy: 'no-cache',
                        variables: {
                          prismFileId: prism,
                          documentPath: url,
                          appointmentId: props.appointmentId,
                        },
                      })
                      .then((res) => {
                        const prismFieldId = res.data.addChatDocument.prismFileId;
                        const documentPath = res.data.addChatDocument.documentPath;

                        const text = {
                          id: patientId,
                          message: '^^#DocumentUpload',
                          fileType: (documentPath ? documentPath : url).match(/\.(pdf)$/)
                            ? 'pdf'
                            : 'image',
                          prismId: (prismFieldId ? prismFieldId : prism) || '',
                          url: documentPath ? documentPath : url,
                          messageDate: new Date(),
                        };
                        pubnub.publish(
                          {
                            channel: props.appointmentId,
                            message: text,
                            storeInHistory: true,
                            sendByPost: true,
                          },
                          (status, response) => {}
                        );
                        setLoading(false);
                      })
                      .catch((e) => {
                        console.log(e);
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }
                  // });
                  item.message &&
                    pubnub.publish(
                      {
                        channel: props.appointmentId,
                        message: {
                          id: patientId,
                          message: item.message,
                          type: 'PHR',
                          messageDate: new Date(),
                        },
                        storeInHistory: true,
                        sendByPost: true,
                      },
                      (status, response) => {
                        if (status.statusCode == 200) {
                          // HereNowPubnub('EprescriptionUploaded');
                          // InsertMessageToDoctor('EprescriptionUploaded');
                        }
                      }
                    );
                });
              }
              setMutationLoading(false);
            }}
            className={classes.uploadPrescription}
            classes={{
              disabled: classes.uploadBtnDisable,
            }}
            color="primary"
          >
            {mutationLoading ? <CircularProgress size={22} color="secondary" /> : 'Upload'}
          </AphButton>
        </div>
      </div>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};