import React, { useContext } from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField } from '@aph/web-ui-components';
import { CaseSheetContextJrd } from 'context/CaseSheetContextJrd';
import { useParams } from 'hooks/routerHooks';
import { Params } from 'components/JuniorDoctors/JDCaseSheet/CaseSheet';
import {
  getLocalStorageItem,
  updateLocalStorageItem,
} from 'components/case-sheet/panels/LocalStorageUtils';

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
}));

export const Vitals: React.FC = () => {
  const classes = useStyles({});
  const params = useParams<Params>();
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

  const getDefaultValue = (type: string) => {
    const localStorageItem = getLocalStorageItem(params.appointmentId);
    switch (type) {
      case 'height':
        return localStorageItem ? localStorageItem.height : height;
      case 'weight':
        return localStorageItem ? localStorageItem.weight : weight;
      case 'bp':
        return localStorageItem ? localStorageItem.bp : bp;
      case 'temperature':
        return localStorageItem ? localStorageItem.temperature : temperature;
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Height</div>
            <div className={`${classes.contentBox} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                disabled={!caseSheetEdit}
                fullWidth
                required
                multiline
                error={
                  getDefaultValue('height') === '' ||
                  getDefaultValue('height') === null ||
                  getDefaultValue('height') === undefined
                }
                helperText={vitalError.height}
                defaultValue={getDefaultValue('height')}
                onBlur={(e) => {
                  if (e.target.value !== '' && e.target.value.trim() !== '')
                    setVitalError({
                      ...vitalError,
                      height: '',
                    });
                  else
                    setVitalError({
                      ...vitalError,
                      height: 'This field is required',
                    });
                  const storageItem = getLocalStorageItem(params.appointmentId);
                  if (storageItem) {
                    storageItem.height = e.target.value;
                    updateLocalStorageItem(params.appointmentId, storageItem);
                  }
                  setHeight(e.target.value);
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
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                fullWidth
                required
                multiline
                error={
                  getDefaultValue('weight') === '' ||
                  getDefaultValue('weight') === null ||
                  getDefaultValue('weight') === undefined
                }
                helperText={vitalError.weight}
                defaultValue={getDefaultValue('weight')}
                onBlur={(e) => {
                  if (e.target.value !== '' && e.target.value.trim() !== '')
                    setVitalError({
                      ...vitalError,
                      weight: '',
                    });
                  else
                    setVitalError({
                      ...vitalError,
                      weight: 'This field is required',
                    });
                  const storageItem = getLocalStorageItem(params.appointmentId);
                  if (storageItem) {
                    storageItem.weight = e.target.value;
                    updateLocalStorageItem(params.appointmentId, storageItem);
                  }
                  setWeight(e.target.value);
                }}
                disabled={!caseSheetEdit}
              />
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>BP</div>
            <div className={`${classes.contentBox} ${caseSheetEdit ? classes.inputFieldEdit : ''}`}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                disabled={!caseSheetEdit}
                fullWidth
                multiline
                defaultValue={getDefaultValue('bp')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.appointmentId);
                  if (storageItem) {
                    storageItem.bp = e.target.value;
                    updateLocalStorageItem(params.appointmentId, storageItem);
                  }
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
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                fullWidth
                multiline
                defaultValue={getDefaultValue('temperature')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.appointmentId);
                  if (storageItem) {
                    storageItem.temperature = e.target.value;
                    updateLocalStorageItem(params.appointmentId, storageItem);
                  }
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
