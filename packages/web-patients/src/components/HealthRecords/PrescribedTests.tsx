import React from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import {
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet as CaseSheetType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_diagnosticPrescription as DiagnosisType,
} from '../../graphql/types/getPatientPastConsultsAndPrescriptions';

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
    noWrapper: {
      color: '#01475b',
      fontWeight: 500,
      fontSize: 14,
      textTransform: 'uppercase',
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

type PrescribedTestsProps = {
  caseSheetList: (CaseSheetType | null)[] | null;
};

export const PrescribedTests: React.FC<PrescribedTestsProps> = (props) => {
  const classes = useStyles({});
  const caseSheetList = props.caseSheetList;

  const diagnosticPrescriptions: DiagnosisType[] = [];

  caseSheetList &&
    caseSheetList.length > 0 &&
    caseSheetList.forEach(
      (caseSheet: CaseSheetType | null) =>
        caseSheet &&
        caseSheet.doctorType !== 'JUNIOR' &&
        caseSheet.diagnosticPrescription &&
        caseSheet.diagnosticPrescription.length > 0 &&
        caseSheet.diagnosticPrescription.forEach(
          (diagnosticPrescription: DiagnosisType | null) =>
            diagnosticPrescription && diagnosticPrescriptions.push(diagnosticPrescription)
        )
    );

  return (
    <ExpansionPanel className={classes.root} defaultExpanded={true}>
      <ExpansionPanelSummary
        expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
        classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
      >
        Prescribed Tests
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.panelDetails}>
        {diagnosticPrescriptions && diagnosticPrescriptions.length > 0 ? (
          diagnosticPrescriptions.map((prescription: DiagnosisType) => (
            <div className={classes.cardTitle}>{prescription.itemname}</div>
          ))
        ) : (
          <div className={classes.noWrapper}>No Tests</div>
        )}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
