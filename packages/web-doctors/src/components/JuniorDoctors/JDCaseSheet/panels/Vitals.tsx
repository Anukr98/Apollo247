import React, { useContext } from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  sectionGroup: {
    paddingBottom: 0,
  },
  sectionTitle: {
    opacity: 0.6,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: 0.02,
    paddingBottom: 5,
    color: '#02475b',
  },
  listContainer: {
    paddingBottom: 16,
  },
  contentBox: {
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
  noDataFound: {
    borderRadius: 5,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 16,
    paddingTop: 14,
    color: '#02475b',
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

export const Vitals: React.FC = () => {
  const classes = useStyles();
  const {
    height,
    setHeight,
    weight,
    setWeight,
    bp,
    setBp,
    temperature,
    setTemperature,
    caseSheetEdit,
  } = useContext(CaseSheetContextJrd);

  // const [disableheightFocus, setDisableHeightFocus] = useState(true);
  // const [disableWeightFocus, setDisableWeightFocus] = useState(true);
  // const [disableBPFocus, setDisableBPFocus] = useState(true);
  // const [disableTempFocus, setDisableTempFocus] = useState(true);

  // const heightRef = (input: HTMLInputElement) => {
  //   input && input.focus();
  // };
  // const weightRef = (input: HTMLInputElement) => {
  //   input && input.focus();
  // };
  // const bpRef = (input: HTMLInputElement) => {
  //   input && input.focus();
  // };
  // const tempRef = (input: HTMLInputElement) => {
  //   input && input.focus();
  // };

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Height</div>
            <div className={classes.contentBox}>
              <AphTextField
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                }}
                // inputRef={heightRef}
              />
              {caseSheetEdit && height !== '' && (
                <div className={classes.boxActions}>
                  {/* <AphButton
                    onClick={() => {
                      setDisableHeightFocus(false);
                    }}
                  >
                    <img src={require('images/round_edit_24_px.svg')} alt="" />
                  </AphButton> */}
                  <AphButton
                    onClick={() => {
                      setHeight('');
                    }}
                  >
                    <img src={require('images/ic_cancel_green.svg')} alt="" />
                  </AphButton>
                </div>
              )}
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Weight</div>
            <div className={classes.contentBox}>
              <AphTextField
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                }}
                // inputRef={weightRef}
              />
              {caseSheetEdit && weight !== '' && (
                <div className={classes.boxActions}>
                  {/* <AphButton onClick={() => setDisableWeightFocus(false)}>
                    <img src={require('images/round_edit_24_px.svg')} alt="" />
                  </AphButton> */}
                  <AphButton
                    onClick={() => {
                      setWeight('');
                    }}
                  >
                    <img src={require('images/ic_cancel_green.svg')} alt="" />
                  </AphButton>
                </div>
              )}
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>BP</div>
            <div className={classes.contentBox}>
              <AphTextField
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                value={bp}
                onChange={(e) => {
                  setBp(e.target.value);
                }}
                // inputRef={bpRef}
              />
              {caseSheetEdit && bp !== '' && (
                <div className={classes.boxActions}>
                  {/* <AphButton onClick={() => setDisableBPFocus(false)}>
                    <img src={require('images/round_edit_24_px.svg')} alt="" />
                  </AphButton> */}
                  <AphButton
                    onClick={() => {
                      setBp('');
                    }}
                  >
                    <img src={require('images/ic_cancel_green.svg')} alt="" />
                  </AphButton>
                </div>
              )}
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Temperature</div>
            <div className={classes.contentBox}>
              <AphTextField
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                value={temperature}
                onChange={(e) => {
                  setTemperature(e.target.value);
                }}
                // inputRef={tempRef}
              />
              {caseSheetEdit && temperature !== '' && (
                <div className={classes.boxActions}>
                  {/* <AphButton onClick={() => setDisableTempFocus(false)}>
                    <img src={require('images/round_edit_24_px.svg')} alt="" />
                  </AphButton> */}
                  <AphButton
                    onClick={() => {
                      setTemperature('');
                    }}
                  >
                    <img src={require('images/ic_cancel_green.svg')} alt="" />
                  </AphButton>
                </div>
              )}
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};
