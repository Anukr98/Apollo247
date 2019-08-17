import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  Symptoms,
  LifeStyle,
  HealthVault,
  DoctorsNotes,
  Diagnosis,
  MedicinePrescription,
  DiagnosticPrescription,
  FollowUp,
  OtherInstructions,
} from 'components/case-sheet/panels';
import { UserCard } from 'components/case-sheet/UserCard';

const useStyles = makeStyles((theme: Theme) => {
  return {
    caseSheet: {
      minHeight: 'calc(100vh - 360px)',
      display: 'flex',
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

  return (
    <div className={classes.caseSheet}>
      <section>
        <UserCard />
      </section>
      <section>
        {/* Symptoms Panel */}
        <ExpansionPanel
          expanded={expanded === 'symptoms'}
          onChange={handlePanelExpansion('symptoms')}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Symptoms</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Symptoms />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {/* Patient History & Lifestyle Panel */}
        <ExpansionPanel
          expanded={expanded === 'lifestyle'}
          onChange={handlePanelExpansion('lifestyle')}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Patient History &amp; Lifestyle</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <LifeStyle />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {/* Patient Health Vault Panel */}
        <ExpansionPanel
          expanded={expanded === 'healthVault'}
          onChange={handlePanelExpansion('healthVault')}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Patient Health Vault</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <HealthVault />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {/* Juniour Doctor's Notes Panel */}
        <ExpansionPanel expanded={expanded === 'notes'} onChange={handlePanelExpansion('notes')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Juniour Doctor's Notes</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <DoctorsNotes />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {/* Diagnosis Panel */}
        <ExpansionPanel
          expanded={expanded === 'diagnosis'}
          onChange={handlePanelExpansion('diagnosis')}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Diagnosis</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Diagnosis />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {/* Medicine Prescription Panel */}
        <ExpansionPanel
          expanded={expanded === 'medicinePrescription'}
          onChange={handlePanelExpansion('medicinePrescription')}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Medicine Prescription</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <MedicinePrescription />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {/* Diagnostic Prescription Panel */}
        <ExpansionPanel
          expanded={expanded === 'diagnosticPrescription'}
          onChange={handlePanelExpansion('diagnosticPrescription')}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Diagnostic Prescription</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <DiagnosticPrescription />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {/* Follow Up Panel */}
        <ExpansionPanel
          expanded={expanded === 'followup'}
          onChange={handlePanelExpansion('followup')}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Follow up</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <FollowUp />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        {/* Other Instructions Panel */}
        <ExpansionPanel
          expanded={expanded === 'otherInstructions'}
          onChange={handlePanelExpansion('otherInstructions')}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Other Instructions</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <OtherInstructions />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </section>
    </div>
  );
};
