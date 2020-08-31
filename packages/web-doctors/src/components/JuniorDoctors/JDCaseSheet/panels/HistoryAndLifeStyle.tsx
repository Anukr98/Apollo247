import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid } from '@material-ui/core';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { AphTextField } from '@aph/web-ui-components';
import { Gender } from 'graphql/types/globalTypes';
import { useParams } from 'hooks/routerHooks';
import { Params } from 'components/JuniorDoctors/JDCaseSheet/CaseSheet';
import {
  getLocalStorageItem,
  updateLocalStorageItem,
} from 'components/case-sheet/panels/LocalStorageUtils';

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
      marginBottom: 15,
      '& textarea': {
        border: 'none',
        padding: 0,
        fontSize: 15,
        fontWeight: 500,
        borderRadius: 0,
      },
      '& p': {
        position: 'absolute',
        bottom: -20,
        color: '#890000 !important',
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
    inputFieldEdit: {
      borderRadius: 10,
      padding: 0,
      '& textarea': {
        color: '#01475b',
        padding: 16,
        fontSize: 16,
        fontWeight: 500,
        paddingRight: 40,
      },

      '& textarea:focus': {
        borderRadius: '5px',
        boxShadow: '0 0 5px #00b38e',
        backgroundColor: '#ffffff',
      },
    },
  };
});

export const HistoryAndLifeStyle: React.FC = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const {
    caseSheetEdit,
    pastMedicalHistory,
    pastSurgicalHistory,
    dietAllergies,
    drugAllergies,
    lifeStyle,
    familyHistory,
    menstrualHistory,
    setPastMedicalHistory,
    setPastSurgicalHistory,
    setDietAllergies,
    setDrugAllergies,
    setLifeStyle,
    setFamilyHistory,
    setMenstrualHistory,
    gender,
    medicationHistory,
    setMedicationHistory,
    occupationHistory,
    setOccupationHistory,
  } = useContext(CaseSheetContextJrd);

  const moveCursorToEnd = (element: any) => {
    if (typeof element.selectionStart == 'number') {
      element.selectionStart = element.selectionEnd = element.value.length;
    } else if (typeof element.createTextRange != 'undefined') {
      element.focus();
      const range = element.createTextRange();
      range.collapse(false);
      range.select();
    }
  };

  const getDefaultValue = (type: string) => {
    const localStorageItem = getLocalStorageItem(params.appointmentId);
    switch (type) {
      case 'pastMedicalHistory':
        return localStorageItem ? localStorageItem.pastMedicalHistory : pastMedicalHistory;
      case 'pastSurgicalHistory':
        return localStorageItem ? localStorageItem.pastSurgicalHistory : pastSurgicalHistory;
      case 'drugAllergies':
        return localStorageItem ? localStorageItem.drugAllergies : drugAllergies;
      case 'dietAllergies':
        return localStorageItem ? localStorageItem.dietAllergies : dietAllergies;
      case 'lifeStyle':
        return localStorageItem ? localStorageItem.lifeStyle : lifeStyle;
      case 'menstrualHistory':
        return localStorageItem ? localStorageItem.menstrualHistory : menstrualHistory;
      case 'familyHistory':
        return localStorageItem ? localStorageItem.familyHistory : familyHistory;
      case 'medicationHistory':
        return localStorageItem ? localStorageItem.medicationHistory : medicationHistory;
      case 'occupationHistory':
        return localStorageItem ? localStorageItem.occupationHistory : occupationHistory;
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Patient's Past Medical History</div>
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}
        >
          <AphTextField
            onFocus={(e) => moveCursorToEnd(e.currentTarget)}
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            defaultValue={getDefaultValue('pastMedicalHistory')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.pastMedicalHistory = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setPastMedicalHistory(e.target.value);
            }}
          />
        </div>
      </Grid>

      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Medication History</div>
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}
        >
          <AphTextField
            onFocus={(e) => moveCursorToEnd(e.currentTarget)}
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            defaultValue={getDefaultValue('medicationHistory')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.medicationHistory = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setMedicationHistory(e.target.value);
            }}
          />
        </div>
      </Grid>

      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Patient's Past Surgical History</div>
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}
        >
          <AphTextField
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            defaultValue={getDefaultValue('pastSurgicalHistory')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.pastSurgicalHistory = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setPastSurgicalHistory(e.target.value);
            }}
          />
        </div>
      </Grid>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Drug Allergies</div>
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}
        >
          <AphTextField
            onFocus={(e) => moveCursorToEnd(e.currentTarget)}
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            id="drugAllergies"
            defaultValue={getDefaultValue('drugAllergies')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.drugAllergies = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setDrugAllergies(e.target.value);
            }}
          />
        </div>
      </Grid>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Diet Allergies/Restrictions</div>
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}
        >
          <AphTextField
            onFocus={(e) => moveCursorToEnd(e.currentTarget)}
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            defaultValue={getDefaultValue('dietAllergies')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.dietAllergies = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setDietAllergies(e.target.value);
            }}
          />
        </div>
      </Grid>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Personal History, Lifestyle & Habits</div>
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''} ${
            classes.marginNone
          }`}
        >
          <AphTextField
            onFocus={(e) => moveCursorToEnd(e.currentTarget)}
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            defaultValue={getDefaultValue('lifeStyle')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.lifeStyle = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setLifeStyle(e.target.value);
            }}
          />
        </div>
      </Grid>

      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Environmental & Occupational History</div>
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''} ${
            classes.marginNone
          }`}
        >
          <AphTextField
            onFocus={(e) => moveCursorToEnd(e.currentTarget)}
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            defaultValue={getDefaultValue('occupationHistory')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.occupationHistory = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setOccupationHistory(e.target.value);
            }}
          />
        </div>
      </Grid>

      {gender === Gender.FEMALE && (
        <Grid item sm={12}>
          <div className={classes.sectionTitle}>Menstrual and Obstetric History*</div>
          <div
            className={`${classes.inputFieldContent} ${
              caseSheetEdit ? classes.inputFieldEdit : ''
            } ${classes.marginNone}`}
          >
            <AphTextField
              onFocus={(e) => moveCursorToEnd(e.currentTarget)}
              disabled={!caseSheetEdit}
              fullWidth
              multiline
              defaultValue={getDefaultValue('menstrualHistory')}
              onBlur={(e) => {
                const storageItem = getLocalStorageItem(params.appointmentId);
                if (storageItem) {
                  storageItem.menstrualHistory = e.target.value;
                  updateLocalStorageItem(params.appointmentId, storageItem);
                }
                setMenstrualHistory(e.target.value);
              }}
            />
          </div>
        </Grid>
      )}
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Patient's Family Medical History</div>
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''} ${
            classes.marginNone
          }`}
        >
          <AphTextField
            onFocus={(e) => moveCursorToEnd(e.currentTarget)}
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            defaultValue={getDefaultValue('familyHistory')}
            onBlur={(e) => {
              const storageItem = getLocalStorageItem(params.appointmentId);
              if (storageItem) {
                storageItem.familyHistory = e.target.value;
                updateLocalStorageItem(params.appointmentId, storageItem);
              }
              setFamilyHistory(e.target.value);
            }}
          />
        </div>
      </Grid>
    </Grid>
  );
};
