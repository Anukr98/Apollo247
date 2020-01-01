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

  // const [disablePastMedicalHistory, setDisablePastMedicalHistory] = useState<boolean>(true);
  // const [disablePastSurgicalHistory, setDisablePastSurgicalHistory] = useState<boolean>(true);
  // const [disableDrugAllergies, setDisableDrugAllergies] = useState<boolean>(true);
  // const [disableDietAllergies, setDisableDietAllergies] = useState<boolean>(true);
  // const [disableLifeStyle, setDisableLifeStyle] = useState<boolean>(true);
  // const [disableFamilyHistory, setDisableFamilyHistory] = useState<boolean>(true);
  // const [disableMenstrualHistory, setDisableMenstrualHistory] = useState<boolean>(true);

  // const pastMedicalHistory =
  //   patientDetails &&
  //   patientDetails.patientMedicalHistory &&
  //   patientDetails.patientMedicalHistory.pastMedicalHistory
  //     ? patientDetails &&
  //       patientDetails.patientMedicalHistory &&
  //       patientDetails.patientMedicalHistory.pastMedicalHistory
  //     : '';
  // const pastSurgicalHistory =
  //   patientDetails &&
  //   patientDetails.patientMedicalHistory &&
  //   patientDetails.patientMedicalHistory.pastSurgicalHistory
  //     ? patientDetails &&
  //       patientDetails.patientMedicalHistory &&
  //       patientDetails.patientMedicalHistory.pastSurgicalHistory
  //     : '';
  // const drugAllergies =
  //   patientDetails &&
  //   patientDetails.patientMedicalHistory &&
  //   patientDetails.patientMedicalHistory.drugAllergies
  //     ? patientDetails &&
  //       patientDetails.patientMedicalHistory &&
  //       patientDetails.patientMedicalHistory.drugAllergies
  //     : '';
  // const dietAllergies =
  //   patientDetails &&
  //   patientDetails.patientMedicalHistory &&
  //   patientDetails.patientMedicalHistory.dietAllergies
  //     ? patientDetails &&
  //       patientDetails.patientMedicalHistory &&
  //       patientDetails.patientMedicalHistory.dietAllergies
  //     : '';
  // const menstrualHistory =
  //   patientDetails &&
  //   patientDetails.patientMedicalHistory &&
  //   patientDetails.patientMedicalHistory.menstrualHistory
  //     ? patientDetails &&
  //       patientDetails.patientMedicalHistory &&
  //       patientDetails.patientMedicalHistory.menstrualHistory
  //     : '';

  const gender = patientDetails && patientDetails.gender ? patientDetails.gender : null;

  // let familyHistoryObj = null,
  //   lifeStyleObj = null;

  // if (patientDetails && patientDetails.familyHistory && patientDetails.familyHistory[0]) {
  //   familyHistoryObj = patientDetails.familyHistory[0];
  // }

  // if (patientDetails && patientDetails.lifeStyle && patientDetails.lifeStyle[0]) {
  //   lifeStyleObj = patientDetails.lifeStyle[0];
  // }

  const pastMedicalRef = (input: HTMLInputElement) => {
    if (input)
      setTimeout(() => {
        input.focus();
      }, 100);
  };
  const pastSurgicalRef = (input: HTMLInputElement) => {
    if (input)
      setTimeout(() => {
        input.focus();
      }, 100);
  };
  const drugAllergiesRef = (input: HTMLInputElement) => {
    if (input)
      setTimeout(() => {
        input.focus();
      }, 100);
  };
  const dietAllergiesRef = (input: HTMLInputElement) => {
    if (input)
      setTimeout(() => {
        input.focus();
      }, 100);
  };
  const lifeStyleRef = (input: HTMLInputElement) => {
    if (input)
      setTimeout(() => {
        input.focus();
      }, 100);
  };
  const familyHistoryRef = (input: HTMLInputElement) => {
    if (input)
      setTimeout(() => {
        input.focus();
      }, 100);
  };
  const menstrualRef = (input: HTMLInputElement) => {
    if (input)
      setTimeout(() => {
        input.focus();
      }, 100);
  };
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
                //setDisablePastMedicalHistory(true);
              }}
              //inputRef={pastMedicalRef}
            />
            {/* <div className={classes.boxActions}>
              <AphButton
                onClick={() => {
                  setDisablePastMedicalHistory(false);
                }}
              >
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={() => {
                  setPastMedicalHistory('');
                  setDisablePastMedicalHistory(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div> */}
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
                //setDisablePastSurgicalHistory(true);
              }}
              //inputRef={pastSurgicalRef}
            />
            {/* <div className={classes.boxActions}>
              <AphButton
                onClick={() => {
                  setDisablePastSurgicalHistory(false);
                }}
              >
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={() => {
                  setPastSurgicalHistory('');
                  setDisablePastSurgicalHistory(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div> */}
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
                //setDisableDrugAllergies(true);
              }}
              //inputRef={drugAllergiesRef}
            />
            {/* <div className={classes.boxActions}>
              <AphButton
                onClick={(e) => {
                  setDisableDrugAllergies(false);
                }}
              >
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={() => {
                  setDrugAllergies('');
                  setDisableDrugAllergies(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div> */}
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
                //setDisableDietAllergies(true);
              }}
              //inputRef={dietAllergiesRef}
            />
            {/* <div className={classes.boxActions}>
              <AphButton
                onClick={() => {
                  setDisableDietAllergies(false);
                }}
              >
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={() => {
                  setDietAllergies('');
                  setDisableDietAllergies(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div> */}
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
                //setDisableLifeStyle(true);
              }}
              //inputRef={lifeStyleRef}
            />
            {/* <div className={classes.boxActions}>
              <AphButton
                onClick={() => {
                  setDisableLifeStyle(false);
                }}
              >
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={() => {
                  setLifeStyle('');
                  setDisableLifeStyle(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div> */}
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
                  //setDisableMenstrualHistory(true);
                }}
                //inputRef={menstrualRef}
              />
              {/* <div className={classes.boxActions}>
                <AphButton
                  onClick={() => {
                    setDisableMenstrualHistory(false);
                  }}
                >
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton
                  onClick={() => {
                    setMenstrualHistory('');
                    setDisableMenstrualHistory(true);
                  }}
                >
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div> */}
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
                //setDisableFamilyHistory(true);
              }}
              //inputRef={familyHistoryRef}
            />
            {/* <div className={classes.boxActions}>
              <AphButton
                onClick={() => {
                  setDisableFamilyHistory(false);
                }}
              >
                <img src={require('images/round_edit_24_px.svg')} alt="" />
              </AphButton>
              <AphButton
                onClick={() => {
                  setFamilyHistory('');
                  setDisableFamilyHistory(true);
                }}
              >
                <img src={require('images/ic_cancel_green.svg')} alt="" />
              </AphButton>
            </div> */}
          </Typography>
        </Typography>
      </div>
    </Typography>
  );
};
