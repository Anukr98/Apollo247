import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Typography,
  Divider,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  InputBase,
} from '@material-ui/core';
import {
  Symptoms,
  HealthVault,
  DoctorsNotes,
  Diagnosis,
  MedicinePrescription,
  DiagnosticPrescription,
  FollowUp,
  OtherInstructions,
} from 'components/JuniorDoctors/JDCaseSheet/panels';
import { CaseSheetContext } from 'context/CaseSheetContext';

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
    marginNone: {
      margin: 0,
    },
  };
});

export const CaseSheet: React.FC = () => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState<string | boolean>(false);
  const handlePanelExpansion = (panelName: string) => (
    e: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => setExpanded(isExpanded ? panelName : false);

  const { setCasesheetNotes, notes } = useContext(CaseSheetContext);

  return (
    <div className={classes.root}>
      {/* Symptoms Panel */}
      <ExpansionPanel defaultExpanded={true} className={classes.panelRoot}>
        <ExpansionPanelSummary
          classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
          expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
        >
          Symptoms
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <Symptoms />
        </ExpansionPanelDetails>
      </ExpansionPanel>

      {/* Patient Health Vault Panel */}
      <ExpansionPanel
        expanded={expanded === 'healthVault'}
        onChange={handlePanelExpansion('healthVault')}
        className={classes.panelRoot}
      >
        <ExpansionPanelSummary
          classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
          expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
        >
          Patient Health Vault
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <HealthVault />
        </ExpansionPanelDetails>
      </ExpansionPanel>

      {/* Diagnosis Panel */}
      <ExpansionPanel
        expanded={expanded === 'diagnosis'}
        onChange={handlePanelExpansion('diagnosis')}
        className={classes.panelRoot}
      >
        <ExpansionPanelSummary
          classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
          expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
        >
          Diagnosis
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <Diagnosis />
        </ExpansionPanelDetails>
      </ExpansionPanel>

      {/* Medicine Prescription Panel */}
      <ExpansionPanel
        expanded={expanded === 'medicinePrescription'}
        onChange={handlePanelExpansion('medicinePrescription')}
        className={classes.panelRoot}
      >
        <ExpansionPanelSummary
          classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
          expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
        >
          Medicine Prescription
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <MedicinePrescription />
        </ExpansionPanelDetails>
      </ExpansionPanel>

      {/* Diagnostic Prescription Panel */}
      <ExpansionPanel
        expanded={expanded === 'diagnosticPrescription'}
        onChange={handlePanelExpansion('diagnosticPrescription')}
        className={classes.panelRoot}
      >
        <ExpansionPanelSummary
          classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
          expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
        >
          Diagnostic Prescription
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <DiagnosticPrescription />
        </ExpansionPanelDetails>
      </ExpansionPanel>

      {/* Other Instructions Panel */}
      <ExpansionPanel
        expanded={expanded === 'otherInstructions'}
        onChange={handlePanelExpansion('otherInstructions')}
        className={classes.panelRoot}
      >
        <ExpansionPanelSummary
          classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
          expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
        >
          Other Instructions
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <OtherInstructions />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel className={classes.panelRoot} defaultExpanded={true}>
        <ExpansionPanelSummary
          expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
          classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
        >
          Patient History & Lifestyle
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <div className={classes.sectionTitle}>Family History</div>
          <div className={classes.historyBox}>
            Father: Cardiac patient
            <br /> Mother: Severe diabetes
            <br /> Married, No kids
          </div>
          <div className={classes.sectionTitle}>Allergies</div>
          <div className={classes.historyBox}>Paracetamol, Dairy, Dust</div>
          <div className={classes.sectionTitle}>Lifestyle & Habits</div>
          <div className={`${classes.historyBox} ${classes.marginNone}`}>
            Patient doesn’t smoke, She recovered from chickenpox 6 months ago
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <Divider className={classes.divider} />
      <div className={classes.notesBox}>
        <Typography component="h4" variant="h4" className={classes.notesHeader}>
          Notes
        </Typography>
        <Typography component="div" className={classes.textFieldWrapper}>
          <InputBase
            fullWidth
            className={classes.textFieldColor}
            placeholder="What you enter here won't be shown to the patient.."
            defaultValue={notes}
            onChange={(e) => {
              setCasesheetNotes(e.target.value);
            }}
          />
        </Typography>
      </div>
    </div>
  );
};
