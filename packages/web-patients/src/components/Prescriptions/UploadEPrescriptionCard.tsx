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
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults as Prescription,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders as MedicineOrder,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems,
} from 'graphql/types/getPatientPastConsultsAndPrescriptions';
import { useAllCurrentPatients } from 'hooks/authHooks';
import moment from 'moment';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';

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
      margin: '10px 20px 0 20px',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: 10,
      borderRadius: 5,
      '&:nth-child(1)': {
        margin: '15px 20px 0 20px',
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
    },
    uploadButtonWrapper: {
      padding: '0 20px',
      margin: '15px 0 0 0',
    },
    circularProgressWrapper: {
      textAlign: 'center',
      margin: '10px 0 0 0',
    },
  };
});

type EPrescriptionCardProps = {
  setIsEPrescriptionOpen?: (isEPrescriptionOpen: boolean) => void;
};

let selectedPrescriptions: Prescription[] = [];
let selectedMedicalRecords: MedicineOrder[] = [];

export const UploadEPrescriptionCard: React.FC<EPrescriptionCardProps> = (props) => {
  const classes = useStyles({});
  const {
    setPhrPrescriptionData,
    phrPrescriptionData,
    medicineOrderData,
    setMedicineOrderData,
  } = useShoppingCart();
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
    if (phrPrescriptionData && phrPrescriptionData.length > 0) {
      selectedPrescriptions = phrPrescriptionData;
    }
  }, [phrPrescriptionData]);

  useEffect(() => {
    if (medicineOrderData && medicineOrderData.length > 0) {
      selectedMedicalRecords = medicineOrderData;
    }
  }, [medicineOrderData]);

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
              <div className={classes.prescriptionGroup}>
                <div className={classes.imgThumb}>
                  <img src={require('images/ic_prescription.svg')} alt="" />
                </div>
                <div>
                  <div>
                    {pastPrescription.doctorInfo
                      ? `${pastPrescription.doctorInfo.salutation} ${pastPrescription.doctorInfo.firstName}`
                      : null}
                  </div>
                  <div className={classes.priscriptionInfo}>
                    <span className={classes.name}>
                      {currentPatient && currentPatient.firstName}
                    </span>
                    <span className={classes.date}>
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
                                  symptomData.symptom && <span>{symptomData.symptom}, </span>
                              )
                            : null
                        )}
                    </span>
                  </div>
                </div>
                <AphCheckbox
                  onChange={() => {
                    selectedPrescriptions.push(pastPrescription);
                  }}
                  className={classes.checkbox}
                  color="primary"
                />
              </div>
            ))}
          {pastMedicalOrders && pastMedicalOrders.length > 0 ? (
            pastMedicalOrders.map((medicalOrder: MedicineOrder) => (
              <div className={classes.prescriptionGroup}>
                <div className={classes.imgThumb}>
                  <img src={require('images/ic_prescription.svg')} alt="" />
                </div>
                <div>
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
                <AphCheckbox
                  onChange={() => selectedMedicalRecords.push(medicalOrder)}
                  className={classes.checkbox}
                  color="primary"
                />
              </div>
            ))
          ) : (
            <div className={classes.circularProgressWrapper}>
              <CircularProgress />
            </div>
          )}
        </Scrollbars>
        <div className={classes.uploadButtonWrapper}>
          <AphButton
            onClick={() => {
              const finalPrescription = selectedPrescriptions;
              phrPrescriptionData && finalPrescription.concat(phrPrescriptionData);
              setPhrPrescriptionData && setPhrPrescriptionData(finalPrescription);
              const finalMedicineOrderData = selectedMedicalRecords;
              medicineOrderData && finalMedicineOrderData.concat(medicineOrderData);
              setMedicineOrderData && setMedicineOrderData(finalMedicineOrderData);
              props.setIsEPrescriptionOpen && props.setIsEPrescriptionOpen(false);
              const currentUrl = window.location.href;
              if (currentUrl.endsWith('/medicines')) {
                window.location.href = clientRoutes.medicinesCart();
              }
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
