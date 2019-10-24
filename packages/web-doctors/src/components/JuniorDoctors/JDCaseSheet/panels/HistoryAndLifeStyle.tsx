import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid } from '@material-ui/core';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import { Gender } from 'graphql/types/globalTypes';

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
        borderRadius: 0,
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
  };
});

export const HistoryAndLifeStyle: React.FC = (props) => {
  const classes = useStyles();
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
  } = useContext(CaseSheetContextJrd);
  const [disablePastMedicalHistoryFocus, setDisablePastMedicalHistoryFocus] = useState(true);
  const [disablePastSurgicalHistoryFocus, setDisablePastSurgicalHistoryFocus] = useState(true);
  const [disableDrugAllergiesFocus, setDisableDrugAllergiesFocus] = useState(true);
  const [disableDietAllergiesFocus, setDisableDietAllergiesFocus] = useState(true);
  const [disableLifeStyleFocus, setDisableLifeStyleFocus] = useState(true);
  const [disableMenstrualHistoryFocus, setDisableMenstrualHistoryFocus] = useState(true);
  const [disableFamilyHistoryFocus, setDisableFamilyHistoryFocus] = useState(true);

  const pastMedicalHistoryElement = (input: HTMLInputElement) => {
    input && input.focus();
  };
  const pastSurgicalHistoryElement = (input: HTMLInputElement) => {
    input && input.focus();
  };
  const drugAllergiesElement = (input: HTMLInputElement) => {
    input && input.focus();
  };
  const dietAllergiesElement = (input: HTMLInputElement) => {
    input && input.focus();
  };
  const lifeStyleElement = (input: HTMLInputElement) => {
    input && input.focus();
  };
  const menstrualElement = (input: HTMLInputElement) => {
    input && input.focus();
  };
  const familyHistoryElement = (input: HTMLInputElement) => {
    input && input.focus();
  };

  return (
    <Grid container spacing={1}>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Patient’s Past Medical History</div>
        <div className={classes.inputFieldContent}>
          <AphTextField
            disabled={disablePastMedicalHistoryFocus}
            fullWidth
            multiline
            value={pastMedicalHistory}
            onChange={(e) => {
              setPastMedicalHistory(e.target.value);
            }}
            inputRef={pastMedicalHistoryElement}
          />
          {caseSheetEdit && (
            <div className={classes.boxActions}>
              <AphButton onClick={() => setDisablePastMedicalHistoryFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={() => {
                  setPastMedicalHistory('');
                  setDisablePastMedicalHistoryFocus(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          )}
        </div>
      </Grid>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Patient's Past Surgical History</div>
        <div className={classes.inputFieldContent}>
          <AphTextField
            disabled={disablePastSurgicalHistoryFocus}
            fullWidth
            multiline
            value={pastSurgicalHistory}
            onChange={(e) => {
              setPastSurgicalHistory(e.target.value);
            }}
            inputRef={pastSurgicalHistoryElement}
          />
          {caseSheetEdit && (
            <div className={classes.boxActions}>
              <AphButton onClick={() => setDisablePastSurgicalHistoryFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={(e) => {
                  setPastSurgicalHistory('');
                  setDisablePastSurgicalHistoryFocus(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          )}
        </div>
      </Grid>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Drug Allergies</div>
        <div className={classes.inputFieldContent}>
          <AphTextField
            disabled={disableDrugAllergiesFocus}
            fullWidth
            multiline
            value={drugAllergies}
            onChange={(e) => {
              setDrugAllergies(e.target.value);
            }}
            inputRef={drugAllergiesElement}
          />
          {caseSheetEdit && (
            <div className={classes.boxActions}>
              <AphButton onClick={() => setDisableDrugAllergiesFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={(e) => {
                  setDrugAllergies('');
                  setDisableDrugAllergiesFocus(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          )}
        </div>
      </Grid>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Diet Allergies/Restrictions</div>
        <div className={classes.inputFieldContent}>
          <AphTextField
            disabled={disableDietAllergiesFocus}
            fullWidth
            multiline
            value={dietAllergies}
            onChange={(e) => {
              setDietAllergies(e.target.value);
            }}
            inputRef={dietAllergiesElement}
          />
          {caseSheetEdit && (
            <div className={classes.boxActions}>
              <AphButton onClick={() => setDisableDietAllergiesFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={(e) => {
                  setDietAllergies('');
                  setDisableDietAllergiesFocus(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          )}
        </div>
      </Grid>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Lifestyle & Habits</div>
        <div className={`${classes.inputFieldContent} ${classes.marginNone}`}>
          <AphTextField
            disabled={disableLifeStyleFocus}
            fullWidth
            multiline
            value={lifeStyle}
            onChange={(e) => {
              setLifeStyle(e.target.value);
            }}
            inputRef={lifeStyleElement}
          />
          {caseSheetEdit && (
            <div className={classes.boxActions}>
              <AphButton onClick={(e) => setDisableLifeStyleFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={(e) => {
                  setLifeStyle('');
                  setDisableLifeStyleFocus(false);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          )}
        </div>
      </Grid>
      {gender === Gender.FEMALE && (
        <Grid item sm={12}>
          <div className={classes.sectionTitle}>Menstrual History*</div>
          <div className={`${classes.inputFieldContent} ${classes.marginNone}`}>
            <AphTextField
              disabled={disableMenstrualHistoryFocus}
              fullWidth
              multiline
              value={menstrualHistory}
              onChange={(e) => {
                setMenstrualHistory(e.target.value);
              }}
              inputRef={menstrualElement}
            />
            {caseSheetEdit && (
              <div className={classes.boxActions}>
                <AphButton onClick={() => setDisableMenstrualHistoryFocus(false)}>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton
                  onClick={() => {
                    setMenstrualHistory('');
                    setDisableMenstrualHistoryFocus(true);
                  }}
                >
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div>
            )}
          </div>
        </Grid>
      )}
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Patient’s Family Medical History</div>
        <div className={`${classes.inputFieldContent} ${classes.marginNone}`}>
          <AphTextField
            disabled={disableFamilyHistoryFocus}
            fullWidth
            multiline
            value={familyHistory}
            onChange={(e) => {
              setFamilyHistory(e.target.value);
            }}
            inputRef={familyHistoryElement}
          />
          {caseSheetEdit && (
            <div className={classes.boxActions}>
              <AphButton onClick={() => setDisableFamilyHistoryFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={() => {
                  setFamilyHistory('');
                  setDisableFamilyHistoryFocus(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div>
          )}
        </div>
      </Grid>
    </Grid>
  );
};
