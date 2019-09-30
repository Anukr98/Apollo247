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
  };
});

interface CaseSheetProps {
  lifeStyle: string;
  allergies: string;
  familyHistory: string;
  setFamilyHistory: (familyHistory: string) => void;
  setAllergies: (allergies: string) => void;
  setLifeStyle: (lifeStyle: string) => void;
}

interface HistoryAndLifeStyleProps {
  lifeStyle: string;
  allergies: string;
  familyHistory: string;
  setFamilyHistory: (familyHistory: string) => void;
  setAllergies: (allergies: string) => void;
  setLifeStyle: (lifeStyle: string) => void;
}

const HistoryAndLifeStyle: React.FC<HistoryAndLifeStyleProps> = (props) => {
  const classes = useStyles();
  const { setFamilyHistory, setAllergies, setLifeStyle } = props;
  return (
    <>
      <div className={classes.sectionTitle}>Family History</div>
      <div className={classes.inputFieldGroup}>
        <AphTextField
          fullWidth
          value={props.familyHistory}
          onChange={(e) => {
            setFamilyHistory(e.target.value);
          }}
          multiline
        />
      </div>
      <div className={classes.sectionTitle}>Allergies</div>
      <div className={classes.inputFieldGroup}>
        <AphTextField
          fullWidth
          value={props.allergies}
          onChange={(e) => {
            setAllergies(e.target.value);
          }}
          multiline
        />
      </div>
      <div className={classes.sectionTitle}>Lifestyle & Habits</div>
      <div className={`${classes.inputFieldGroup} ${classes.marginNone}`}>
        <AphTextField
          fullWidth
          value={props.lifeStyle}
          onChange={(e) => {
            setLifeStyle(e.target.value);
          }}
          multiline
        />
      </div>
    </>
  );
};

export const CaseSheet: React.FC<CaseSheetProps> = (props) => {
  const classes = useStyles();
  const { setCasesheetNotes, notes, caseSheetEdit } = useContext(CaseSheetContextJrd);
  const [symptoms, setSymptoms] = useState<boolean>(caseSheetEdit);
  const [healthVault, setHealthVault] = useState<boolean>(caseSheetEdit);
  const [diagnosis, setDiagnosis] = useState<boolean>(caseSheetEdit);
  const [medicinePrescription, setMedicinePrescription] = useState<boolean>(caseSheetEdit);
  const [diagnosticPrescription, setDiagnosticPrescription] = useState<boolean>(caseSheetEdit);
  const [otherInstructions, setOtherInstructions] = useState<boolean>(caseSheetEdit);
  const [patientHistory, setPatientHistory] = useState<boolean>(caseSheetEdit);

  useEffect(() => {
    if (caseSheetEdit) {
      setSymptoms(true);
      setHealthVault(true);
      setDiagnosis(true);
      setMedicinePrescription(true);
      setDiagnosticPrescription(true);
      setOtherInstructions(true);
      setPatientHistory(true);
    }
  }, [caseSheetEdit]);

  const items = [
    { key: 'symptoms', value: 'Symptoms', state: symptoms, component: <Symptoms /> },
    {
      key: 'healthVault',
      value: 'Patient Health Vault',
      state: healthVault,
      component: <HealthVault />,
    },
    { key: 'diagnosis', value: 'Diagnosis', state: diagnosis, component: <Diagnosis /> },
    {
      key: 'medicinePrescription',
      value: 'Medicines',
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
      value: 'Other Instructions',
      state: otherInstructions,
      component: <OtherInstructions />,
    },
    {
      key: 'patientHistory&Lifestyle',
      value: 'Patient History & Lifestyle',
      state: patientHistory,
      component: (
        <HistoryAndLifeStyle
          lifeStyle={props.lifeStyle}
          allergies={props.allergies}
          familyHistory={props.familyHistory}
          setFamilyHistory={props.setFamilyHistory}
          setAllergies={props.setAllergies}
          setLifeStyle={props.setLifeStyle}
        />
      ),
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
          Notes
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
