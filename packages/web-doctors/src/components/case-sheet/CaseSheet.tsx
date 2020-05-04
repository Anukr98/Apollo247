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
import { useParams } from 'hooks/routerHooks';
import { getLocalStorageItem, updateLocalStorageItem } from './panels/LocalStorageUtils';

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
let autoSaveIntervalId: any;
type Params = { id: string; patientId: string; tabValue: string };
export const CaseSheet: React.FC<CashSheetProps> = (props) => {
  const classes = useStyles({});
  const {
    symptoms,
    setSymptoms,
    weight,
    setWeight,
    height,
    setHeight,
    temperature,
    setTemperature,
    bp,
    setBp,
    notes,
    setSRDNotes,
    pastMedicalHistory,
    setPastMedicalHistory,
    pastSurgicalHistory,
    setPastSurgicalHistory,
    drugAllergies,
    setDrugAllergies,
    dietAllergies,
    setDietAllergies,
    lifeStyle,
    setLifeStyle,
    menstrualHistory,
    setMenstrualHistory,
    familyHistory,
    setFamilyHistory,
    diagnosis,
    setDiagnosis,
    medicinePrescription,
    setMedicinePrescription,
    followUp,
    setFollowUp,
    followUpAfterInDays,
    setFollowUpAfterInDays,
    followUpDate,
    setFollowUpDate,
    diagnosticPrescription,
    setDiagnosticPrescription,
    otherInstructions,
    setOtherInstructions,
    caseSheetEdit,
  } = useContext(CaseSheetContext);
  const params = useParams<Params>();

  const [symptomsState, setSymptomsState] = useState<boolean>(props.startAppointment);
  const [lifestyleState, setLifestyleState] = useState<boolean>(props.startAppointment);
  const [healthVaultState, setHealthVaultState] = useState<boolean>(props.startAppointment);
  const [noteState, setNotesState] = useState<boolean>(props.startAppointment);
  const [diagnosisState, setDiagnosisState] = useState<boolean>(props.startAppointment);
  const [medicinePrescriptionState, setMedicinePrescriptionState] = useState<boolean>(
    props.startAppointment
  );
  const [diagnosticPrescriptionState, setDiagnosticPrescriptionState] = useState<boolean>(
    props.startAppointment
  );
  const [followUpPanelState, setFollowUpPanelState] = useState<boolean>(props.startAppointment);
  const [otherInstructionsState, setOtherInstructionsState] = useState<boolean>(
    props.startAppointment
  );
  const [vitalsState, setVitalsState] = useState<boolean>(props.startAppointment);
  const [firstTimeLanding, setFirstTimeLanding] = useState<boolean>(true);
  const items = [
    {
      key: 'symptoms',
      value: 'Chief Complaints',
      state: symptomsState,
      component: <Symptoms />,
    },
    {
      key: 'lifestyle',
      value: 'Patient’s Medical and Family History',
      state: lifestyleState,
      component: <LifeStyle />,
    },
    {
      key: 'vital',
      value: 'Vitals',
      state: vitalsState,
      component: <Vital />,
    },
    {
      key: 'healthVault',
      value: 'Patient Health Vault',
      state: healthVaultState,
      component: <HealthVault />,
    },
    {
      key: 'note',
      value: "Junior Doctor's Notes",
      state: noteState,
      component: <DoctorsNotes />,
    },
    {
      key: 'diagnosis',
      value: 'Diagnosis',
      state: diagnosisState,
      component: <Diagnosis />,
    },
    {
      key: 'medicinePrescription',
      value: 'Medication Prescribed',
      state: medicinePrescriptionState,
      component: <MedicinePrescription />,
    },
    {
      key: 'diagnosticPrescription',
      value: 'Tests',
      state: diagnosticPrescriptionState,
      component: <DiagnosticPrescription />,
    },
    {
      key: 'otherInstructions',
      value: 'Advice/Instructions',
      state: otherInstructionsState,
      component: <OtherInstructions />,
    },
    {
      key: 'followup',
      value: 'Follow up (Free)',
      state: followUpPanelState,
      component: <FollowUp startAppointment={props.startAppointment} />,
    },
  ];

  useEffect(() => {
    setDiagnosisState(props.startAppointment);
    setSymptomsState(props.startAppointment);
    setLifestyleState(props.startAppointment);
    setHealthVaultState(props.startAppointment);
    setNotesState(props.startAppointment);
    setMedicinePrescriptionState(props.startAppointment);
    setDiagnosticPrescriptionState(props.startAppointment);
    setFollowUpPanelState(props.startAppointment);
    setOtherInstructionsState(props.startAppointment);
    setVitalsState(props.startAppointment);
  }, [props.startAppointment]);

  useEffect(() => {
    if (firstTimeLanding) {
      const storageItem = getLocalStorageItem(params.id);
      if (!storageItem && caseSheetEdit) {
        const caseSheetObject = {
          symptoms: symptoms,
          weight: weight,
          height: height,
          temperature: temperature,
          bp: bp,
          pastMedicalHistory: pastMedicalHistory,
          pastSurgicalHistory: pastSurgicalHistory,
          drugAllergies: drugAllergies,
          dietAllergies: dietAllergies,
          lifeStyle: lifeStyle,
          menstrualHistory: menstrualHistory,
          familyHistory: familyHistory,
          diagnosis: diagnosis,
          medicinePrescription: medicinePrescription,
          otherInstructions: otherInstructions,
          followUp: followUp,
          followUpAfterInDays: followUpAfterInDays,
          followUpDate: followUpDate,
          notes: notes,
          diagnosticPrescription: diagnosticPrescription,
        };
        updateLocalStorageItem(params.id, caseSheetObject);
        setFirstTimeLanding(false);
      } else if(storageItem) {
        setSymptoms(storageItem.symptoms);
        setWeight(storageItem.weight);
        setHeight(storageItem.height);
        setTemperature(storageItem.temperature);
        setBp(storageItem.bp);
        setSRDNotes(storageItem.notes);
        setPastMedicalHistory(storageItem.pastMedicalHistory);
        setPastSurgicalHistory(storageItem.pastSurgicalHistory);
        setDrugAllergies(storageItem.drugAllergies);
        setDietAllergies(storageItem.dietAllergies);
        setLifeStyle(storageItem.lifeStyle);
        setMenstrualHistory(storageItem.menstrualHistory);
        setFamilyHistory(storageItem.familyHistory);
        setDiagnosis(storageItem.diagnosis);
        setMedicinePrescription(storageItem.medicinePrescription);
        setFollowUp(storageItem.followUp);
        setFollowUpAfterInDays(storageItem.followUpAfterInDays);
        setFollowUpDate(storageItem.followUpDate);
        setDiagnosticPrescription(storageItem.diagnosticPrescription);
        setOtherInstructions(storageItem.otherInstructions);
        setFirstTimeLanding(false);
      }
    }
  }, [firstTimeLanding, caseSheetEdit]);

  const handlePanelExpansion = (expansionKey: string) => (
    e: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    switch (expansionKey) {
      case 'symptoms':
        setSymptomsState(isExpanded);
        break;
      case 'lifestyle':
        setLifestyleState(isExpanded);
        break;
      case 'vital':
        setVitalsState(isExpanded);
        break;
      case 'healthVault':
        setHealthVaultState(isExpanded);
        break;
      case 'note':
        setNotesState(isExpanded);
        break;
      case 'diagnosis':
        setDiagnosisState(isExpanded);
        break;
      case 'medicinePrescription':
        setMedicinePrescriptionState(isExpanded);
        break;
      case 'diagnosticPrescription':
        setDiagnosticPrescriptionState(isExpanded);
        break;
      case 'followup':
        setFollowUpPanelState(isExpanded);
        break;
      case 'otherInstructions':
        setOtherInstructionsState(isExpanded);
        break;
    }
  };

  const getNotesDefaultValue = () => {
    const storageItem = getLocalStorageItem(params.id);
    return storageItem ? storageItem.notes : notes;
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
            defaultValue={getNotesDefaultValue()}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.id);
              if (storageItem) {
                storageItem.notes = e.target.value;
                updateLocalStorageItem(params.id, storageItem);
              }
              setSRDNotes(e.target.value);
            }}
            disabled={!props.startAppointment}
          />
        </Typography>
      </Box>
    </div>
  );
};
