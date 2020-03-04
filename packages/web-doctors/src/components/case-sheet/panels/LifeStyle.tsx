import React, { useContext, useState } from 'react';
import { Typography, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import { Gender } from 'graphql/types/globalTypes';
import { Script } from 'vm';

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
    '& textarea': {
      border: 'none',
      padding: 15,
      fontSize: 15,
      fontWeight: 500,
      paddingRight: 60,
      borderRadius: 0,
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
export const LifeStyle: React.FC = () => {
  const classes = useStyles();
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
  } = useContext(CaseSheetContext);

  const gender = patientDetails && patientDetails.gender ? patientDetails.gender : null;
  const moveCursorToEnd = (element: any) => {
    if (typeof element.selectionStart == 'number') {
      element.selectionStart = element.selectionEnd = element.value.length;
    } else if (typeof element.createTextRange != 'undefined') {
      element.focus();
      var range = element.createTextRange();
      range.collapse(false);
      range.select();
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
              defaultValue={pastMedicalHistory}
              onBlur={(e) => {
                setPastMedicalHistory(e.target.value);
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
              defaultValue={pastSurgicalHistory}
              onBlur={(e) => {
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
              defaultValue={drugAllergies}
              onBlur={(e) => {
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
              defaultValue={dietAllergies}
              onBlur={(e) => {
                setDietAllergies(e.target.value);
              }}
            />
          </Typography>
        </Typography>

        <Typography className={classes.mainContainer} component="div">
          <Typography component="h5" variant="h5" className={classes.header}>
            Lifestyle & Habits
          </Typography>
          <Typography component="div" className={classes.content}>
            <AphTextField
              onFocus={(e) => moveCursorToEnd(e.currentTarget)}
              disabled={!caseSheetEdit}
              fullWidth
              multiline
              defaultValue={lifeStyle}
              onBlur={(e) => {
                setLifeStyle(e.target.value);
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
                defaultValue={menstrualHistory}
                onBlur={(e) => {
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
              defaultValue={familyHistory}
              onBlur={(e) => {
                setFamilyHistory(e.target.value);
              }}
            />
          </Typography>
        </Typography>
      </div>
    </Typography>
  );
};
