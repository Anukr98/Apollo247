import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Divider,
  Box,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { AphTextField } from '@aph/web-ui-components';
import {
  Symptoms,
  LifeStyle,
  Vital,
  HealthVault,
  DoctorsNotes,
  Diagnosis,
  MedicinePrescription,
  DiagnosticPrescription,
  FollowUp,
  OtherInstructions,
} from 'components/case-sheet/panels';
import { UserCard } from 'components/case-sheet/UserCard';
import { CaseSheetContext } from 'context/CaseSheetContext';

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
        paddingRight: 6,
        paddingTop: 3,
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
      maxWidth: 707,
    },
    right: {
      flex: 'initial',
      margin: '0 15px 0 0',
      minWidth: 300,
      maxWidth: 300,
      [theme.breakpoints.down('xs')]: {
        margin: '0 0 15px 0',
        maxWidth: '100%',
        minWidth: 200,
      },
      '& h2': {
        fontSize: 20,
        lineHeight: 'normal',
        fontWeight: 600,
        color: '#02475b',
      },
      '& h5': {
        fontSize: 16,
        lineHeight: 'normal',
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.8)',
        marginBottom: 10,
        textTransform: 'capitalize',
      },
      '& h6': {
        fontSize: 14,
        lineHeight: 'normal',
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.8)',
        marginBottom: 10,
      },
      '& hr': {
        marginBottom: 10,
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
      fontSize: 17,
      fontWeight: 500,
      marginBottom: 10,
    },
    notesContainer: {
      padding: 16,
      backgroundColor: '#fff',
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
    none: {
      display: 'none',
    },
  };
});

interface CashSheetProps {
  startAppointment: boolean;
}

export const CaseSheet: React.FC<CashSheetProps> = (props) => {
  const classes = useStyles();

  const [symptoms, setSymptoms] = useState<boolean>(props.startAppointment);
  const [lifestyle, setLifestyle] = useState<boolean>(props.startAppointment);
  const [healthVault, setHealthVault] = useState<boolean>(props.startAppointment);
  const [note, setNotes] = useState<boolean>(props.startAppointment);
  const [diagnosis, setDiagnosis] = useState<boolean>(props.startAppointment);
  const [medicinePrescription, setMedicinePrescription] = useState<boolean>(props.startAppointment);
  const [diagnosticPrescription, setDiagnosticPrescription] = useState<boolean>(
    props.startAppointment
  );
  const [followUpPanel, setFollowUpPanel] = useState<boolean>(props.startAppointment);
  const [otherInstructions, setOtherInstructions] = useState<boolean>(props.startAppointment);
  const [vitals, setVitals] = useState<boolean>(props.startAppointment);

  const items = [
    {
      key: 'symptoms',
      value: 'Chief Complaints',
      state: symptoms,
      component: <Symptoms />,
    },
    {
      key: 'lifestyle',
      value: 'Patient’s Medical and Family History',
      state: lifestyle,
      component: <LifeStyle />,
    },
    {
      key: 'vital',
      value: 'Vitals',
      state: vitals,
      component: <Vital />,
    },
    {
      key: 'healthVault',
      value: 'Patient Health Vault',
      state: healthVault,
      component: <HealthVault />,
    },
    {
      key: 'note',
      value: "Junior Doctor's Notes",
      state: note,
      component: <DoctorsNotes />,
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
    {
      key: 'followup',
      value: 'Follow up (Free)',
      state: followUpPanel,
      component: <FollowUp startAppointment={props.startAppointment} />,
    },
  ];

  useEffect(() => {
    setDiagnosis(props.startAppointment);
    setSymptoms(props.startAppointment);
    setLifestyle(props.startAppointment);
    setHealthVault(props.startAppointment);
    setNotes(props.startAppointment);
    setMedicinePrescription(props.startAppointment);
    setDiagnosticPrescription(props.startAppointment);
    setFollowUpPanel(props.startAppointment);
    setOtherInstructions(props.startAppointment);
    setVitals(props.startAppointment);
  }, [props.startAppointment]);
  const { notes, setSRDNotes } = useContext(CaseSheetContext);
  const handlePanelExpansion = (expansionKey: string) => (
    e: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    switch (expansionKey) {
      case 'symptoms':
        setSymptoms(isExpanded);
        break;
      case 'lifestyle':
        setLifestyle(isExpanded);
        break;
      case 'vital':
        setVitals(isExpanded);
        break;
      case 'healthVault':
        setHealthVault(isExpanded);
        break;
      case 'note':
        setNotes(isExpanded);
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
      case 'followup':
        setFollowUpPanel(isExpanded);
        break;
      case 'otherInstructions':
        setOtherInstructions(isExpanded);
        break;
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.caseSheet}>
        <section className={`${classes.column} ${classes.right}`}>
          <UserCard />
        </section>
        <section className={classes.column}>
          {items.map((item) => (
            <ExpansionPanel
              key={item.key}
              expanded={item.state}
              onChange={handlePanelExpansion(item.key)}
              className={`${classes.expandIcon} ${item.key === 'followup' && classes.none}`}
            >
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h3">{item.value}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>{item.component}</ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
        </section>
      </div>
      <Divider className={classes.divider} />
      <Box boxShadow={5} borderRadius={10} className={classes.notesContainer}>
        <Typography component="h4" variant="h4" className={classes.notesHeader}>
          Personal Notes (What you enter here won't be shown to the patient..)
        </Typography>
        <Typography component="div" className={classes.textFieldWrapper}>
          <AphTextField
            fullWidth
            className={classes.textFieldColor}
            placeholder="What you enter here won't be shown to the patient.."
            defaultValue={notes}
            onBlur={(e) => {
              setSRDNotes(e.target.value);
            }}
            disabled={!props.startAppointment}
          />
        </Typography>
      </Box>
    </div>
  );
};
