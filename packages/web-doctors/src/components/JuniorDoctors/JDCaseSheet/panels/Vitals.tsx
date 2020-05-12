import React, { useContext } from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField } from '@aph/web-ui-components';
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
  inputFieldEdit: {
    border: '1px solid #00b38e',
    borderRadius: 10,
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
}));

export const Vitals: React.FC = () => {
  const classes = useStyles({});
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
    vitalError,
    setVitalError,
  } = useContext(CaseSheetContextJrd);

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Height</div>
            <div className={`${classes.contentBox} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}>
              <AphTextField
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                required
                value={height}
                error={height.trim() === '' || height === null || height === undefined}
                helperText={vitalError.height}
                onChange={(e) => {
                  setHeight(e.target.value);
                }}
                onBlur={(e) => {
                  if (e.target.value.trim() !== '')
                    setVitalError({
                      ...vitalError,
                      height: '',
                    });
                  else
                    setVitalError({
                      ...vitalError,
                      height: 'This field is required',
                    });
                }}
              />
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Weight</div>
            <div className={`${classes.contentBox} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}>
              <AphTextField
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                value={weight}
                required
                error={weight.trim() === '' || weight === null || weight === undefined}
                helperText={vitalError.weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                }}
                onBlur={(e) => {
                  if (e.target.value.trim() !== '')
                    setVitalError({
                      ...vitalError,
                      weight: '',
                    });
                  else
                    setVitalError({
                      ...vitalError,
                      weight: 'This field is required',
                    });
                }}
              />
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>BP</div>
            <div className={`${classes.contentBox} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}>
              <AphTextField
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                value={bp}
                onChange={(e) => {
                  setBp(e.target.value);
                }}
              />
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Temperature</div>
            <div className={`${classes.contentBox} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}>
              <AphTextField
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                value={temperature}
                onChange={(e) => {
                  setTemperature(e.target.value);
                }}
              />
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};
