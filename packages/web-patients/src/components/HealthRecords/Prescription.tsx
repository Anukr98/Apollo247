import React from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
} from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import {
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet as CaseSheetType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription as PrescriptionType,
} from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import { MEDICINE_TIMINGS, MEDICINE_TO_BE_TAKEN } from '../../graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '12px !important',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '4px 20px',
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      textTransform: 'uppercase',
    },
    panelExpanded: {
      minHeight: 'auto !important',
      '& >div:first-child': {
        marginTop: 12,
        marginBottom: 12,
      },
    },
    panelDetails: {
      padding: 20,
      paddingTop: 0,
      display: 'inline-block',
      width: '100%',
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      letterSpacing: 0.02,
      paddingBottom: 8,
      opacity: 0.8,
    },
    cardSection: {
      padding: 12,
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      lineHeight: 1.43,
      minHeight: 84,
    },
    bottomActions: {
      paddingTop: 20,
      paddingBottom: 10,
      textAlign: 'right',
      '& button': {
        color: '#fc9916',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: 'none',
        padding: 0,
        border: 'none',
        backgroundColor: 'transparent',
      },
    },
  };
});

type PrescriptionProps = {
  caseSheetList: (CaseSheetType | null)[] | null;
};

export const Prescription: React.FC<PrescriptionProps> = (props) => {
  const classes = useStyles({});
  const caseSheetList = props.caseSheetList;

  const prescriptions: PrescriptionType[] = [];

  caseSheetList &&
    caseSheetList.length > 0 &&
    caseSheetList.forEach(
      (caseSheet: CaseSheetType | null) =>
        caseSheet &&
        caseSheet.doctorType !== 'JUNIOR' &&
        caseSheet.medicinePrescription &&
        caseSheet.medicinePrescription.length > 0 &&
        caseSheet.medicinePrescription.forEach(
          (prescription: PrescriptionType | null) =>
            prescription && prescriptions.push(prescription)
        )
    );

  return (
    <ExpansionPanel className={classes.root} defaultExpanded={true}>
      <ExpansionPanelSummary
        expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
        classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
      >
        Prescription
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.panelDetails}>
        <Grid container spacing={2}>
          {prescriptions && prescriptions.length > 0
            ? prescriptions.map((prescription: PrescriptionType) => (
                <Grid item xs={12} sm={6}>
                  <div className={classes.cardTitle}>{prescription.medicineName}</div>
                  {prescription && (
                    <div className={classes.cardSection}>
                      {prescription.medicineUnit && prescription.medicineFormTypes == 'OTHERS'
                        ? 'Take ' +
                          prescription.medicineDosage +
                          ' ' +
                          prescription.medicineUnit.toLowerCase() +
                          ' (s)' +
                          ' '
                        : 'Apply ' + prescription &&
                          prescription.medicineUnit &&
                          prescription.medicineUnit.toLowerCase() + ' '}

                      {prescription.medicineFrequency! &&
                        prescription.medicineFrequency!.replace(/[^a-zA-Z ]/g, ' ').toLowerCase() +
                          ' '}
                      {prescription.medicineToBeTaken
                        ? prescription.medicineToBeTaken
                            .map(
                              (item: MEDICINE_TO_BE_TAKEN | null) =>
                                item &&
                                item
                                  .split('_')
                                  .join(' ')
                                  .toLowerCase()
                            )
                            .join(', ')
                        : ''}
                      {prescription.medicineTimings && prescription.medicineTimings.length > 0
                        ? ' in the '
                        : ''}
                      {prescription.medicineTimings
                        ? prescription.medicineTimings
                            .map(
                              (item: MEDICINE_TIMINGS | null) =>
                                item &&
                                item
                                  .split('_')
                                  .join(' ')
                                  .toLowerCase()
                            )
                            .map(
                              (val: string | null, idx: number, array: (string | null)[]) =>
                                val &&
                                array &&
                                `${val}${
                                  idx == array.length - 2
                                    ? ' and '
                                    : idx > array.length - 2
                                    ? ''
                                    : ', '
                                }`
                            )
                        : ''}

                      {prescription.medicineInstructions
                        ? '\n' + prescription.medicineInstructions
                        : ''}
                      {prescription.medicineConsumptionDurationInDays == ''
                        ? ''
                        : prescription.medicineConsumptionDurationInDays &&
                          prescription.medicineConsumptionDurationInDays === '1'
                        ? ' for ' + prescription.medicineConsumptionDurationInDays! + ' day'
                        : ' for ' + prescription.medicineConsumptionDurationInDays! + ' days'}
                    </div>
                  )}
                </Grid>
              ))
            : 'No Prescription'}
        </Grid>

        <div className={classes.bottomActions}>
          <AphButton>Order Medicines</AphButton>
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
