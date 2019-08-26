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
      padding: 20,
    },
    caseSheet: {
      minHeight: 'calc(100vh - 360px)',
      display: 'flex',
      flexFlow: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
      '& .Mui-expanded': {
        margin: '5px 0 0 0 !important',
        minHeight: 20,
        paddingBottom: 0,
      },
      '& div': {
        color: '#000',
      },
      [theme.breakpoints.down('xs')]: {
        display: 'block',
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
      minWidth: 300,
      [theme.breakpoints.down('xs')]: {
        margin: '0 0 15px 0',
      },
    },
    expandIcon: {
      color: '#02475b',
      margin: '5px 0',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      backgroundColor: '#fff',
      '&:before': {
        backgroundColor: 'transparent',
      },
      '&:first-child': {
        marginTop: 0,
      },
      '& h3': {
        fontSize: 17,
        fontWeight: theme.typography.fontWeightMedium,
        color: '#01475b',
        lineHeight: '24px',
        padding: '4px 0',
      },
    },
    divider: {
      margin: '20px 0',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    notesHeader: {
      color: '#0087ba',
    },
    notesContainer: {
      padding: 20,
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
      padding: 20,
    },
  };
});
interface UserInfoObject {
  patientId: string;
  image: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  uhid: string;
  appointmentId: string;
}
interface CasesheetInfoObj {
  userInfo: UserInfoObject;
}
interface CasesheetInfoProps {
  casesheetInfo: CasesheetInfoObj;
}
export const CaseSheet: React.FC<CasesheetInfoProps> = (props) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState<string | boolean>(false);
  const userInfo = props.casesheetInfo;
  const handlePanelExpansion = (panelName: string) => (
    e: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => setExpanded(isExpanded ? panelName : false);

  return (
    <div className={classes.container}>
      <div className={classes.caseSheet}>
        <section className={`${classes.column} ${classes.right}`}>
          <UserCard casesheetInfo={props.casesheetInfo} />
        </section>
        <section className={classes.column}>
          {/* Symptoms Panel */}
          <ExpansionPanel
            expanded={expanded === 'symptoms'}
            onChange={handlePanelExpansion('symptoms')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Symptoms</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Symptoms />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Patient History & Lifestyle Panel */}
          <ExpansionPanel
            expanded={expanded === 'lifestyle'}
            onChange={handlePanelExpansion('lifestyle')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Patient History &amp; Lifestyle</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <LifeStyle />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Patient Health Vault Panel */}
          <ExpansionPanel
            expanded={expanded === 'healthVault'}
            onChange={handlePanelExpansion('healthVault')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Patient Health Vault</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <HealthVault />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Juniour Doctor's Notes Panel */}
          <ExpansionPanel
            expanded={expanded === 'notes'}
            onChange={handlePanelExpansion('notes')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Juniour Doctor's Notes</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <DoctorsNotes />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Diagnosis Panel */}
          <ExpansionPanel
            expanded={expanded === 'diagnosis'}
            onChange={handlePanelExpansion('diagnosis')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Diagnosis</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Diagnosis />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Medicine Prescription Panel */}
          <ExpansionPanel
            expanded={expanded === 'medicinePrescription'}
            onChange={handlePanelExpansion('medicinePrescription')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Medicine Prescription</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <MedicinePrescription />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Diagnostic Prescription Panel */}
          <ExpansionPanel
            expanded={expanded === 'diagnosticPrescription'}
            onChange={handlePanelExpansion('diagnosticPrescription')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Diagnostic Prescription</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <DiagnosticPrescription />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Follow Up Panel */}
          <ExpansionPanel
            expanded={expanded === 'followup'}
            onChange={handlePanelExpansion('followup')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Follow up</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <FollowUp />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Other Instructions Panel */}
          <ExpansionPanel
            expanded={expanded === 'otherInstructions'}
            onChange={handlePanelExpansion('otherInstructions')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Other Instructions</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <OtherInstructions />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </section>
      </div>
      <Divider className={classes.divider} />
      <Box boxShadow={5} borderRadius={10} className={classes.notesContainer}>
        <Typography component="h4" variant="h4" className={classes.notesHeader}>
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
