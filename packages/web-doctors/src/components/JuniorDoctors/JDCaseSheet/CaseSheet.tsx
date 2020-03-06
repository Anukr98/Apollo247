import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Typography,
  Divider,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import {
  Symptoms,
  HealthVault,
  Diagnosis,
  MedicinePrescription,
  DiagnosticPrescription,
  OtherInstructions,
} from 'components/JuniorDoctors/JDCaseSheet/panels';
import { Vitals } from 'components/JuniorDoctors/JDCaseSheet/panels/Vitals';
import { HistoryAndLifeStyle } from 'components/JuniorDoctors/JDCaseSheet/panels/HistoryAndLifeStyle';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { AphTextField } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    divider: {
      margin: '20px 0',
      backgroundColor: 'rgba(2, 71, 91, 0.3)',
    },
    notesHeader: {
      color: '#0087ba',
      fontSize: 17,
      fontWeight: 500,
      marginBottom: 10,
    },
    notesBox: {
      padding: 16,
      borderRadius: 10,
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    textFieldColor: {
      '& input': {
        color: 'initial',
        '& :before': {
          border: 0,
        },
      },
    },
    textFieldWrapper: {
      border: 'solid 1px #30c1a3',
      borderRadius: 10,
      padding: 16,
      color: '#01475b',
      fontSize: 14,
      fontWeight: 500,
    },
    panelRoot: {
      borderRadius: 10,
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      marginBottom: 16,
      '&:before': {
        display: 'none',
      },
    },
    panelDetails: {
      padding: 16,
      paddingTop: 0,
      display: 'inline-block',
      width: '100%',
    },
    panelHeader: {
      padding: '4px 16px',
      fontSize: 17,
      fontWeight: 500,
      color: '#02475b',
    },
    panelExpanded: {
      minHeight: 'auto !important',
      '& >div:first-child': {
        marginTop: 12,
        marginBottom: 12,
      },
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
      paddingBottom: 8,
    },
    historyBox: {
      padding: '12px 16px',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      color: '#01475b',
      borderRadius: 5,
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      marginBottom: 16,
    },
    inputFieldGroup: {
      marginBottom: 16,
    },
    marginNone: {
      margin: 0,
    },
    inputFieldContent: {
      borderRadius: 5,
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      padding: 12,
      color: '#02475b',
      position: 'relative',
      '& textarea': {
        border: 'none',
        padding: 0,
        fontSize: 15,
        fontWeight: 500,
        paddingRight: 60,
      },
    },
    boxActions: {
      position: 'absolute',
      right: 12,
      top: 12,
      display: 'flex',
      alignItems: 'center',
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        minWidth: 'auto',
        padding: 0,
        marginLeft: 12,
        '&:hover': {
          backgroundColor: 'transparent',
        },
        '& img': {
          maxWidth: 20,
          maxHeight: 20,
        },
      },
    },
  };
});

export const CaseSheet: React.FC = () => {
  const classes = useStyles();
  const { setCasesheetNotes, notes, caseSheetEdit } = useContext(CaseSheetContextJrd);

  const [symptoms, setSymptoms] = useState<boolean>(true);
  const [healthVault, setHealthVault] = useState<boolean>(true);
  const [diagnosis, setDiagnosis] = useState<boolean>(true);
  const [medicinePrescription, setMedicinePrescription] = useState<boolean>(true);
  const [diagnosticPrescription, setDiagnosticPrescription] = useState<boolean>(true);
  const [otherInstructions, setOtherInstructions] = useState<boolean>(true);
  const [patientHistory, setPatientHistory] = useState<boolean>(true);
  const [vitals, setVitals] = useState<boolean>(true);

  useEffect(() => {
    if (caseSheetEdit) {
      setSymptoms(true);
      setHealthVault(true);
      setDiagnosis(true);
      setMedicinePrescription(true);
      setDiagnosticPrescription(true);
      setOtherInstructions(true);
      setPatientHistory(true);
      setVitals(true);
    }
  }, [caseSheetEdit]);

  const items = [
    { key: 'symptoms', value: 'Chief Complaints', state: symptoms, component: <Symptoms /> },
    {
      key: 'patientHistory&Lifestyle',
      value: 'Patient’s Medical and Family History',
      state: patientHistory,
      component: <HistoryAndLifeStyle />,
    },
    {
      key: 'vitals',
      value: 'Vitals',
      state: vitals,
      component: <Vitals />,
    },
    {
      key: 'healthVault',
      value: 'Patient Health Vault',
      state: healthVault,
      component: <HealthVault />,
    },
    {
      key: 'diagnosis',
      value: 'Provisional Diagnosis',
      state: diagnosis,
      component: <Diagnosis />,
    },
    {
      key: 'medicinePrescription',
      value: 'Medication Prescribed',
      state: medicinePrescription,
      component: <MedicinePrescription />,
    },
    {
      key: 'diagnosticPrescription',
      value: 'Tests',
      state: diagnosticPrescription,
      component: <DiagnosticPrescription />,
    },
    {
      key: 'otherInstructions',
      value: 'Advice/Instructions',
      state: otherInstructions,
      component: <OtherInstructions />,
    },
  ];

  const handlePanelExpansion = (panelName: string) => (
    e: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    switch (panelName) {
      case 'symptoms':
        setSymptoms(isExpanded);
        break;
      case 'healthVault':
        setHealthVault(isExpanded);
        break;
      case 'diagnosis':
        setDiagnosis(isExpanded);
        break;
      case 'medicinePrescription':
        setMedicinePrescription(isExpanded);
        break;
      case 'diagnosticPrescription':
        setDiagnosticPrescription(isExpanded);
        break;
      case 'otherInstructions':
        setOtherInstructions(isExpanded);
        break;
      case 'patientHistory&Lifestyle':
        setPatientHistory(isExpanded);
        break;
      case 'vitals':
        setVitals(isExpanded);
        break;
    }
  };

  return (
    <div className={classes.root}>
      {items.map((item, index) => (
        <ExpansionPanel
          expanded={item.state}
          onChange={handlePanelExpansion(item.key)}
          className={classes.panelRoot}
          key={index}
        >
          <ExpansionPanelSummary
            classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
            expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
          >
            {item.value}
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.panelDetails}>
            {item.component}
          </ExpansionPanelDetails>
        </ExpansionPanel>
      ))}

      <Divider className={classes.divider} />
      <div className={classes.notesBox}>
        <Typography component="h4" variant="h4" className={classes.notesHeader}>
          Notes (This is for Senior Doctor view only)
        </Typography>
        <AphTextField
          fullWidth
          placeholder="What you enter here won't be shown to the patient.."
          defaultValue={notes}
          onChange={(e) => {
            setCasesheetNotes(e.target.value);
          }}
          multiline
        />
      </div>
    </div>
  );
};
