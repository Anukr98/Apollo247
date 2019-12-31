import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';
import {
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
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      display: 'flex',
      marginBottom: 10,
      textAlign: 'left',
    },
    prescriptionGroup: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      width: 'calc(100% - 44px)',
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
      paddingRight: 14,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    fileInfo: {
      width: 'calc(90% - 44px)',
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
  };
});

type EPrescriptionCardProps = {
  prescription?: Prescription;
  medicineOrder?: MedicineOrder;
  removePrescription?: (id: string, type: string) => void;
};

export const EPrescriptionCard: React.FC<EPrescriptionCardProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();

  const getMedicines = (
    medicines: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems | null)[]
  ) =>
    medicines
      .filter((item) => item!.medicineName)
      .map((item) => item!.medicineName)
      .join(', ');

  return props.prescription || props.medicineOrder ? (
    <div className={classes.root}>
      <div className={classes.prescriptionGroup}>
        <div className={classes.imgThumb}>
          <img src={require('images/ic_prescription.svg')} alt="" />
        </div>
        <div className={classes.fileInfo}>
          {props.prescription && props.prescription.doctorInfo
            ? `${props.prescription.doctorInfo.salutation} ${props.prescription.doctorInfo.firstName}`
            : props.medicineOrder &&
              props.medicineOrder.id &&
              `${`Meds Rx ${props.medicineOrder.id &&
                props.medicineOrder.id.substring(0, props.medicineOrder.id.indexOf('-'))}`}`}
          <div className={classes.priscriptionInfo}>
            <span className={classes.name}>{currentPatient && currentPatient.firstName}</span>
            <span className={classes.date}>
              {moment(
                props.prescription
                  ? props.prescription.appointmentDateTime
                  : props.medicineOrder && props.medicineOrder.quoteDateTime
              ).format('DD MMM YYYY')}
            </span>
            <span>
              {props.medicineOrder &&
              props.medicineOrder.medicineOrderLineItems &&
              props.medicineOrder.medicineOrderLineItems.length > 0
                ? getMedicines(props.medicineOrder.medicineOrderLineItems)
                : null}
            </span>
          </div>
        </div>
      </div>
      <div className={classes.closeBtn}>
        <AphButton
          onClick={() => {
            props.removePrescription && props.medicineOrder
              ? props.removePrescription(props.medicineOrder.id, 'medicineOrder')
              : props.prescription &&
                props.removePrescription &&
                props.removePrescription(props.prescription.id, 'consults');
          }}
        >
          <img src={require('images/ic_cross_onorange_small.svg')} alt="" />
        </AphButton>
        {/* <AphCheckbox color="primary" />
        <AphButton>
          <img src={require("images/ic_tickmark.svg")} alt="" />
        </AphButton> */}
      </div>
    </div>
  ) : null;
};
