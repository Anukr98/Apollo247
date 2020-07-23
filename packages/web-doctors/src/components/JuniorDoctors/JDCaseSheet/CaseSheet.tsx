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
  RefferalCode,
} from 'components/JuniorDoctors/JDCaseSheet/panels';
import { Vitals } from 'components/JuniorDoctors/JDCaseSheet/panels/Vitals';
import { HistoryAndLifeStyle } from 'components/JuniorDoctors/JDCaseSheet/panels/HistoryAndLifeStyle';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { AphTextField } from '@aph/web-ui-components';
import {
  getLocalStorageItem,
  updateLocalStorageItem,
} from 'components/case-sheet/panels/LocalStorageUtils';
import { useParams } from 'hooks/routerHooks';

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
          boxShadow: 'none',
        },
        '& img': {
          maxWidth: 20,
          maxHeight: 20,
        },
      },
    },
  };
});

export type Params = {
  appointmentId: string;
  patientId: string;
  isActive: string;
  queueId: string;
};

export const CaseSheet: React.FC = () => {
  const classes = useStyles({});
  const params = useParams<Params>();

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
    setCasesheetNotes,
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
    referralDescription,
    referralSpecialtyName,
    setReferralSpecialtyName,
    setReferralDescription,
    medicationHistory,
    setMedicationHistory,
    occupationHistory,
    setOccupationHistory,
  } = useContext(CaseSheetContextJrd);

  const [symptomsState, setSymptomsState] = useState<boolean>(true);
  const [healthVaultState, setHealthVaultState] = useState<boolean>(true);
  const [diagnosisState, setDiagnosisState] = useState<boolean>(true);
  const [medicinePrescriptionState, setMedicinePrescriptionState] = useState<boolean>(true);
  const [diagnosticPrescriptionState, setDiagnosticPrescriptionState] = useState<boolean>(true);
  const [otherInstructionsState, setOtherInstructionsState] = useState<boolean>(true);
  const [patientHistoryState, setPatientHistoryState] = useState<boolean>(true);
  const [vitalsState, setVitalsState] = useState<boolean>(true);
  const [refferalState, setRefferalState] = useState<boolean>(true);
  const [firstTimeLanding, setFirstTimeLanding] = useState<boolean>(true);

  useEffect(() => {
    if (caseSheetEdit) {
      setSymptomsState(true);
      setHealthVaultState(true);
      setDiagnosisState(true);
      setMedicinePrescriptionState(true);
      setDiagnosticPrescriptionState(true);
      setOtherInstructionsState(true);
      setPatientHistoryState(true);
      setVitalsState(true);
      setRefferalState(true);
    }
  }, [caseSheetEdit]);

  useEffect(() => {
    if (firstTimeLanding) {
      const storageItem = getLocalStorageItem(params.appointmentId);
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
          referralSpecialtyName: referralSpecialtyName,
          referralDescription: referralDescription,
          medicationHistory: medicationHistory,
          occupationHistory: occupationHistory,
        };
        updateLocalStorageItem(params.appointmentId, caseSheetObject);
        setFirstTimeLanding(false);
      } else if (storageItem) {
        setSymptoms(storageItem.symptoms);
        setWeight(storageItem.weight);
        setHeight(storageItem.height);
        setTemperature(storageItem.temperature);
        setBp(storageItem.bp);
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
        setCasesheetNotes(storageItem.notes || '');
        setReferralSpecialtyName(storageItem.referralSpecialtyName || '');
        setReferralDescription(storageItem.referralDescription || '');
        setMedicationHistory(storageItem.medicationHistory || '');
        setOccupationHistory(storageItem.occupationHistory || '');
      }
    }
  }, [firstTimeLanding, caseSheetEdit]);

  const items = [
    { key: 'symptoms', value: 'Chief Complaints', state: symptomsState, component: <Symptoms /> },
    {
      key: 'patientHistory&Lifestyle',
      value: "Patient's Medical and Family History",
      state: patientHistoryState,
      component: <HistoryAndLifeStyle />,
    },
    {
      key: 'vitals',
      value: 'Vitals',
      state: vitalsState,
      component: <Vitals />,
    },
    {
      key: 'healthVault',
      value: 'Patient Health Vault',
      state: healthVaultState,
      component: <HealthVault />,
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
      key: 'refferal',
      value: 'Referral (Optional)',
      state: refferalState,
      component: <RefferalCode />,
    },
  ];

  const handlePanelExpansion = (panelName: string) => (
    e: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    switch (panelName) {
      case 'symptoms':
        setSymptomsState(isExpanded);
        break;
      case 'healthVault':
        setHealthVaultState(isExpanded);
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
      case 'otherInstructions':
        setOtherInstructionsState(isExpanded);
        break;
      case 'patientHistory&Lifestyle':
        setPatientHistoryState(isExpanded);
        break;
      case 'vitals':
        setVitalsState(isExpanded);
        break;
      case 'refferal':
        setRefferalState(isExpanded);
        break;
    }
  };

  const getNotesDefaultValue = () => {
    const storageItem = getLocalStorageItem(params.appointmentId);
    return storageItem ? storageItem.notes : notes;
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
          defaultValue={getNotesDefaultValue()}
          disabled={!caseSheetEdit}
          onBlur={(e) => {
            const storageItem = getLocalStorageItem(params.appointmentId);
            if (storageItem) {
              storageItem.notes = e.target.value;
              updateLocalStorageItem(params.appointmentId, storageItem);
            }
            setCasesheetNotes(e.target.value);
          }}
          multiline
        />
      </div>
    </div>
  );
};
