import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Divider,
  Box,
  TextField,
  InputBase,
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
    container: {
      padding: '20px',
    },
    caseSheet: {
      minHeight: 'calc(100vh - 360px)',
      display: 'flex',
      flexFlow: 'row',
      flexWrap: 'wrap',
      '& div': {
        color: 'black',
      },
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    right: {
      flex: 'initial',
      margin: '0 15px 0 0',
    },
    expandIcon: {
      color: '#02475b',
    },
    divider: {
      margin: '20px 0',
    },
    notesHeader: {
      color: '#0087ba',
    },
    notesContainer: {
      padding: '20px',
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
      borderRadius: '10px',
      padding: '20px',
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
    <div className={classes.container}>
      <div className={classes.caseSheet}>
        <section className={`${classes.column} ${classes.right}`}>
          <UserCard />
        </section>
        <section className={classes.column}>
          {/* Symptoms Panel */}
          <ExpansionPanel
            expanded={expanded === 'symptoms'}
            onChange={handlePanelExpansion('symptoms')}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
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
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
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
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
              <Typography>Patient Health Vault</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <HealthVault />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Juniour Doctor's Notes Panel */}
          <ExpansionPanel expanded={expanded === 'notes'} onChange={handlePanelExpansion('notes')}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
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
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
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
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
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
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
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
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
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
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}>
              <Typography>Other Instructions</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <OtherInstructions />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </section>
      </div>
      <Divider className={classes.divider} />
      <Box boxShadow={5} borderRadius={10} className={classes.notesContainer}>
        <Typography component="h3" variant="h4" className={classes.notesHeader}>
          Personal Notes
        </Typography>
        <Typography component="div" className={classes.textFieldWrapper}>
          <InputBase
            fullWidth
            className={classes.textFieldColor}
            placeholder="What you enter here won’t be shown to the patient.."
          />
        </Typography>
      </Box>
    </div>
  );
};
