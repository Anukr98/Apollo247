import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab, Avatar, CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';
import Scrollbars from 'react-custom-scrollbars';
import { useMutation } from 'react-apollo-hooks';
import { GET_PAST_CONSULTS_PRESCRIPTIONS } from 'graphql/profiles';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptionsVariables,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults as Prescription,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders as MedicineOrder,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems,
} from 'graphql/types/getPatientPastConsultsAndPrescriptions';
import { useAllCurrentPatients } from 'hooks/authHooks';
import moment from 'moment';

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
      padding: '12px 15px 0 15px ',
      '&:nth-child(1)': {
        padding: '15px 15px 0 15px',
      },
      '&:last-child': {
        padding: '12px 15px 15px 15px',
      },
    },
    checkbox: {
      alignItems: 'baseline',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    closeBtn: {
      marginLeft: 'auto',
      paddingLeft: 20,
      '& button': {
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    imgThumb: {
      paddingRight: 12,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    followUpText: {
      opacity: 0.6,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
    },
    progressRoot: {
      height: 2,
      marginTop: 5,
    },
    priscriptionInfo: {
      paddingTop: 5,
      fontSize: 12,
      fontWeight: 500,
      color: '#0087ba',
      lineHeight: '1.67px',
      letterSpacing: 0.04,
      display: 'inline-block',
      width: '100%',
      '& span': {
        borderRight: '0.5px solid rgba(2,71,91,0.3)',
        paddingRight: 10,
        marginRight: 10,
      },
      '& span:last-child': {
        marginRight: 0,
        paddingRight: 0,
        border: 'none',
      },
    },
    name: {
      opacity: 0.6,
      color: '#02475b',
    },
    date: {
      opacity: 0.6,
      color: '#02475b',
    },
    tabsRoot: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      backgroundColor: '#fff',
      '& span': {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#02475b',
      },
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      padding: '15px 10px',
      color: '#01475b',
      opacity: 0.6,
      minWidth: '50%',
      textTransform: 'none',
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
      opacity: 1,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 5,
    },
    rootTabContainer: {
      padding: 0,
    },
    followUpWrapper: {
      backgroundColor: '#fff',
      margin: '0 0 0 8px',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      width: '100%',
      padding: 10,
    },
    followUpDetails: {
      display: 'flex',
      alignItems: 'baseline',
    },
    fileInfo: {
      display: 'flex',
      margin: '10px 0 0 0',
    },
    doctorImage: {
      borderRadius: '50%',
      margin: '0 13px 0 0',
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
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
    cbcText: {
      margin: '10px 0 0 0',
      fontSize: 16,
      color: '#01475b',
    },
    typeOfClinic: {
      opacity: 0.6,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
    },
    uploadPrescription: {
      width: '100%',
      borderRadius: 10,
    },
    uploadButtonWrapper: {
      padding: '0 20px',
      margin: '15px 0 0 0',
    },
  };
});

type EPrescriptionCardProps = {
  setIsEPrescriptionOpen?: (isEPrescriptionOpen: boolean) => void;
  setPhrPrescriptionData?: (phrPrescriptionData: Prescription[]) => void;
  setMedicineOrderData?: (medicineOrderData: MedicineOrder[]) => void;
  phrPrescriptionData?: Prescription[] | null;
  medicineOrderData?: MedicineOrder[] | null;
};

let selectedPrescriptions: Prescription[] = [];
let selectedMedicalRecords: MedicineOrder[] = [];

export const UploadEPrescriptionCard: React.FC<EPrescriptionCardProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const [pastPrescriptions, setPastPrescriptions] = useState<Prescription[] | null>(null);
  const [pastMedicalOrders, setPastMedicalOrders] = useState<MedicineOrder[] | null>(null);

  const patientPastConsultAndPrescriptionMutation = useMutation<
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

  useEffect(() => {
    if (props.phrPrescriptionData && props.phrPrescriptionData.length > 0) {
      selectedPrescriptions = props.phrPrescriptionData;
    }
  }, [props.phrPrescriptionData]);

  useEffect(() => {
    if (props.medicineOrderData && props.medicineOrderData.length > 0) {
      selectedMedicalRecords = props.medicineOrderData;
    }
  }, [props.medicineOrderData]);

  useEffect(() => {
    if (!pastPrescriptions || !pastMedicalOrders) {
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
          } else {
            setPastPrescriptions([]);
            setPastMedicalOrders([]);
          }
        })
        .catch((e) => console.log(e));
    }
  }, [pastPrescriptions, pastMedicalOrders]);

  const DATE_FORMAT = 'DD MMM YYYY';

  const getMedicines = (
    medicines: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems | null)[]
  ) =>
    medicines
      .filter((item) => item!.medicineName)
      .map((item) => item!.medicineName)
      .join(', ');

  return (
    <div className={classes.root}>
      <div className={classes.tabsWrapper}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(45vh)'}>
          {pastPrescriptions &&
            pastPrescriptions.length > 0 &&
            pastPrescriptions.map((pastPrescription: Prescription) => (
              <>
                <div className={classes.prescriptionGroup}>
                  <AphCheckbox
                    onChange={() => {
                      selectedPrescriptions.push(pastPrescription);
                    }}
                    className={classes.checkbox}
                    color="primary"
                  />
                  <div className={classes.fileInfo}>
                    {pastPrescription.doctorInfo
                      ? `${pastPrescription.doctorInfo.salutation} ${pastPrescription.doctorInfo.firstName}`
                      : null}
                    <div className={classes.priscriptionInfo}>
                      <span className={classes.name}>
                        {currentPatient && currentPatient.firstName}
                      </span>
                      <span className={classes.date}>
                        {' '}
                        {moment(pastPrescription.appointmentDateTime).format(DATE_FORMAT)}
                      </span>
                      <span>
                        {pastPrescription.caseSheet &&
                          pastPrescription.caseSheet.length > 0 &&
                          pastPrescription.caseSheet.map((caseSheet) =>
                            caseSheet && caseSheet.symptoms
                              ? caseSheet.symptoms.map(
                                  (symptomData) =>
                                    symptomData &&
                                    symptomData.symptom && <span>{symptomData.symptom} </span>
                                )
                              : null
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ))}
          {pastMedicalOrders && pastMedicalOrders.length > 0 ? (
            pastMedicalOrders.map((medicalOrder: MedicineOrder) => (
              <div className={classes.prescriptionGroup}>
                <AphCheckbox
                  onChange={() => selectedMedicalRecords.push(medicalOrder)}
                  className={classes.checkbox}
                  color="primary"
                />
                <div className={classes.fileInfo}>
                  {`Meds Rx ${medicalOrder.id &&
                    medicalOrder.id.substring(0, medicalOrder.id.indexOf('-'))}`}
                  <div className={classes.priscriptionInfo}>
                    <span className={classes.name}>
                      {currentPatient && currentPatient.firstName}
                    </span>
                    <span className={classes.date}>
                      {moment(medicalOrder.quoteDateTime).format(DATE_FORMAT)}
                    </span>
                    <span>
                      {medicalOrder && medicalOrder.medicineOrderLineItems && (
                        <div className={classes.patientHistory}>
                          {medicalOrder.medicineOrderLineItems.length > 0 &&
                            getMedicines(medicalOrder.medicineOrderLineItems)}
                        </div>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <CircularProgress />
          )}
        </Scrollbars>
        <div className={classes.uploadButtonWrapper}>
          <AphButton
            onClick={() => {
              props.setPhrPrescriptionData && props.setPhrPrescriptionData(selectedPrescriptions);
              props.setMedicineOrderData && props.setMedicineOrderData(selectedMedicalRecords);
              props.setIsEPrescriptionOpen && props.setIsEPrescriptionOpen(false);
            }}
            className={classes.uploadPrescription}
            color="primary"
          >
            Upload
          </AphButton>
        </div>
      </div>
    </div>
  );
};
