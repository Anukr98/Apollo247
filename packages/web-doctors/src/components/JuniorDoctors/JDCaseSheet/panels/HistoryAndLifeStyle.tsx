import React, { useContext } from 'react';
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
    inputFieldEdit: {
      border: '1px solid #00b38e',
      borderEadius: 10,
      backgroundColor: '#fff',
      padding: 0,
      '& textarea': {
        color: '#01475b',
        padding: 16,
        fontSize: 16,
        fontWeight: 500,
        paddingRight: 40,
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

  // const [disablePastMedicalHistoryFocus, setDisablePastMedicalHistoryFocus] = useState(true);
  // const [disablePastSurgicalHistoryFocus, setDisablePastSurgicalHistoryFocus] = useState(true);
  // const [disableDrugAllergiesFocus, setDisableDrugAllergiesFocus] = useState(true);
  // const [disableDietAllergiesFocus, setDisableDietAllergiesFocus] = useState(true);
  // const [disableLifeStyleFocus, setDisableLifeStyleFocus] = useState(true);
  // const [disableMenstrualHistoryFocus, setDisableMenstrualHistoryFocus] = useState(true);
  // const [disableFamilyHistoryFocus, setDisableFamilyHistoryFocus] = useState(true);

  // const pastMedicalHistoryElement = useRef<HTMLInputElement>(null);
  // const pastSurgicalHistoryElement = useRef<HTMLInputElement>(null);
  // const drugAllergiesElement = useRef<HTMLInputElement>(null);
  // const dietAllergiesElement = useRef<HTMLInputElement>(null);
  // const lifeStyleElement = useRef<HTMLInputElement>(null);
  // const menstrualElement = useRef<HTMLInputElement>(null);
  // const familyHistoryElement = useRef<HTMLInputElement>(null);

  // useEffect(() => {

  // }, [
  //   pastMedicalHistoryElement,
  //   pastSurgicalHistoryElement,
  //   drugAllergiesElement,
  //   dietAllergiesElement,
  //   lifeStyleElement,
  //   menstrualElement,
  //   familyHistoryElement,
  // ]);

  return (
    <Grid container spacing={1}>
      <Grid item sm={12}>
        <div className={classes.sectionTitle}>Patient’s Past Medical History</div>
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}
        >
          <AphTextField
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            value={pastMedicalHistory}
            onChange={(e) => {
              setPastMedicalHistory(e.target.value);
            }}
          />
          {caseSheetEdit && pastMedicalHistory !== '' && (
            <div className={classes.boxActions}>
              {/* <AphButton
                onClick={() => {
                  setDisablePastMedicalHistoryFocus(false);
                  if (pastMedicalHistoryElement && pastMedicalHistoryElement.current)
                    console.log(pastMedicalHistoryElement && pastMedicalHistoryElement.current);
                }}
              >
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton> */}
              <AphButton
                onClick={() => {
                  setPastMedicalHistory('');
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
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}
        >
          <AphTextField
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            value={pastSurgicalHistory}
            onChange={(e) => {
              setPastSurgicalHistory(e.target.value);
            }}
            // inputRef={pastSurgicalHistoryElement}
          />
          {caseSheetEdit && pastSurgicalHistory !== '' && (
            <div className={classes.boxActions}>
              {/* <AphButton onClick={() => setDisablePastSurgicalHistoryFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton> */}
              <AphButton
                onClick={(e) => {
                  setPastSurgicalHistory('');
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
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}
        >
          <AphTextField
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            value={drugAllergies}
            onChange={(e) => {
              setDrugAllergies(e.target.value);
            }}
            // inputRef={drugAllergiesElement}
          />
          {caseSheetEdit && drugAllergies !== '' && (
            <div className={classes.boxActions}>
              {/* <AphButton onClick={() => setDisableDrugAllergiesFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton> */}
              <AphButton
                onClick={(e) => {
                  setDrugAllergies('');
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
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}
        >
          <AphTextField
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            value={dietAllergies}
            onChange={(e) => {
              setDietAllergies(e.target.value);
            }}
            // inputRef={dietAllergiesElement}
          />
          {caseSheetEdit && dietAllergies !== '' && (
            <div className={classes.boxActions}>
              {/* <AphButton onClick={() => setDisableDietAllergiesFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton> */}
              <AphButton
                onClick={(e) => {
                  setDietAllergies('');
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
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''} ${
            classes.marginNone
          }`}
        >
          <AphTextField
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            value={lifeStyle}
            onChange={(e) => {
              setLifeStyle(e.target.value);
            }}
            // inputRef={lifeStyleElement}
          />
          {caseSheetEdit && lifeStyle !== '' && (
            <div className={classes.boxActions}>
              {/* <AphButton onClick={(e) => setDisableLifeStyleFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton> */}
              <AphButton
                onClick={(e) => {
                  setLifeStyle('');
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
          <div
            className={`${classes.inputFieldContent} ${
              caseSheetEdit ? classes.inputFieldEdit : ''
            } ${classes.marginNone}`}
          >
            <AphTextField
              disabled={!caseSheetEdit}
              fullWidth
              multiline
              value={menstrualHistory}
              onChange={(e) => {
                setMenstrualHistory(e.target.value);
              }}
              // inputRef={menstrualElement}
            />
            {caseSheetEdit && menstrualHistory !== '' && (
              <div className={classes.boxActions}>
                {/* <AphButton onClick={() => setDisableMenstrualHistoryFocus(false)}>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton> */}
                <AphButton
                  onClick={() => {
                    setMenstrualHistory('');
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
        <div
          className={`${classes.inputFieldContent} ${caseSheetEdit ? classes.inputFieldEdit : ''} ${
            classes.marginNone
          }`}
        >
          <AphTextField
            disabled={!caseSheetEdit}
            fullWidth
            multiline
            value={familyHistory}
            onChange={(e) => {
              setFamilyHistory(e.target.value);
            }}
            // inputRef={familyHistoryElement}
          />
          {caseSheetEdit && familyHistory !== '' && (
            <div className={classes.boxActions}>
              {/* <AphButton onClick={() => setDisableFamilyHistoryFocus(false)}>
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton> */}
              <AphButton
                onClick={() => {
                  setFamilyHistory('');
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
