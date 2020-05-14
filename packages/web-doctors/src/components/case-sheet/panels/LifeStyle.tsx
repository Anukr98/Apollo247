import React, { useContext, useState } from 'react';
import { Typography, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import { Gender } from 'graphql/types/globalTypes';
import { Script } from 'vm';
import { useParams } from 'hooks/routerHooks';
import { getLocalStorageItem, updateLocalStorageItem } from './LocalStorageUtils';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'wrap',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    width: '49%',
    marginRight: '1%',
  },
  content: {
    borderRadius: '5px',
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    width: '100%',
    position: 'relative',
    marginBottom: 15,
    '& textarea': {
      border: 'none',
      padding: 15,
      fontSize: 15,
      fontWeight: 500,
      paddingRight: 60,
      borderRadius: 0,
    },
    '& p': {
      position: 'absolute',
      bottom: -20,
      color: '#890000 !important',
    },
  },
  textContent: {
    color: '#01475b',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.43,
  },
  header: {
    color: 'rgba(2,71,91,0.6)',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: 500,
  },
  mainContainer: {
    display: 'inline-block',
    width: '100%',
    '& textarea:focus': {
      borderRadius: "5px",
      boxShadow: "0 0 5px #00b38e",
      backgroundColor: "#ffffff",
      boxSizing: "border-box"
    }
  },
  drugAllergies: {
    width: '45%',
    display: 'inline-block',
    paddingRight: 10,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
    },
  },
  dietAllergies: {
    width: '45%',
    display: 'inline-block',
    float: 'right',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
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
}));

type Params = { id: string; patientId: string; tabValue: string };
export const LifeStyle: React.FC = () => {
  const classes = useStyles({});
  const params = useParams<Params>();

  const {
    loading,
    patientDetails,
    setPastMedicalHistory,
    setPastSurgicalHistory,
    setDrugAllergies,
    setDietAllergies,
    setLifeStyle,
    setMenstrualHistory,
    setFamilyHistory,

    pastMedicalHistory,
    pastSurgicalHistory,
    drugAllergies,
    dietAllergies,
    lifeStyle,
    menstrualHistory,
    familyHistory,
    caseSheetEdit,

    medicationHistory,
    setMedicationHistory,
    occupationHistory,
    setOccupationHistory,
    lifeStyleError,
    setLifeStyleError,
  } = useContext(CaseSheetContext);

  const gender = patientDetails && patientDetails.gender ? patientDetails.gender : null;
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
    const localStorageItem = getLocalStorageItem(params.id);
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

  return loading && !patientDetails ? (
    <div></div>
  ) : (
      <Typography component="div" className={classes.mainContainer}>
        <div>
          <Typography className={classes.mainContainer} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Patient's Past Medical History
          </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                defaultValue={getDefaultValue('pastMedicalHistory')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.pastMedicalHistory = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setPastMedicalHistory(e.target.value);
                }}
              />
            </Typography>
          </Typography>

          <Typography className={classes.mainContainer} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Medication History*
          </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                required
                error={lifeStyleError.medicationHistory.trim() === '' ? true : false}
                helperText={lifeStyleError.medicationHistory}
                defaultValue={getDefaultValue('medicationHistory')}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (value === '' || value === null) {
                    setLifeStyleError({
                      medicationHistory: 'This field is requird',
                    });
                  } else {
                    setLifeStyleError({
                      medicationHistory: '',
                    });
                  }
                }}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.medicationHistory = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setMedicationHistory(e.target.value);
                }}
              />
            </Typography>
          </Typography>

          <Typography component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Patient's Past Surgical History
          </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                defaultValue={getDefaultValue('pastSurgicalHistory')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.pastSurgicalHistory = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setPastSurgicalHistory(e.target.value);
                }}
              />
            </Typography>
          </Typography>

          <Typography component="div" className={classes.drugAllergies}>
            <Typography component="h5" variant="h5" className={classes.header}>
              Drug Allergies
          </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                disabled={!caseSheetEdit}
                id="drugAllergies"
                fullWidth
                multiline
                defaultValue={getDefaultValue('drugAllergies')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.drugAllergies = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setDrugAllergies(e.target.value);
                }}
              />
            </Typography>
          </Typography>

          <Typography component="div" className={classes.dietAllergies}>
            <Typography component="h5" variant="h5" className={classes.header}>
              Diet Allergies/Restrictions
          </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                defaultValue={getDefaultValue('dietAllergies')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.dietAllergies = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setDietAllergies(e.target.value);
                }}
              />
            </Typography>
          </Typography>

          <Typography className={classes.mainContainer} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Personal History, Lifestyle & Habits
          </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                defaultValue={getDefaultValue('lifeStyle')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.lifeStyle = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setLifeStyle(e.target.value);
                }}
              />
            </Typography>
          </Typography>

          <Typography className={classes.mainContainer} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Environmental & Occupational History
          </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                defaultValue={getDefaultValue('occupationHistory')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.occupationHistory = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setOccupationHistory(e.target.value);
                }}
              />
            </Typography>
          </Typography>

          {gender === Gender.FEMALE && (
            <Typography component="div">
              <Typography component="h5" variant="h5" className={classes.header}>
                Menstual History*
            </Typography>
              <Typography component="div" className={classes.content}>
                <AphTextField
                  onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                  disabled={!caseSheetEdit}
                  fullWidth
                  multiline
                  defaultValue={getDefaultValue('menstrualHistory')}
                  onBlur={(e) => {
                    const storageItem = getLocalStorageItem(params.id);
                    if (storageItem) {
                      storageItem.menstrualHistory = e.target.value;
                      updateLocalStorageItem(params.id, storageItem);
                    }
                    setMenstrualHistory(e.target.value);
                  }}
                />
              </Typography>
            </Typography>
          )}
          <Typography className={classes.mainContainer} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Patient's Family Medical History
          </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                defaultValue={getDefaultValue('familyHistory')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.familyHistory = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setFamilyHistory(e.target.value);
                }}
              />
            </Typography>
          </Typography>
        </div>
      </Typography>
    );
};