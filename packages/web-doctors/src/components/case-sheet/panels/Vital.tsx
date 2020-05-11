import React, { useContext } from 'react';
import { Theme } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { AphTextField } from '@aph/web-ui-components';
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
    position: 'relative',
    borderRadius: '5px',
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    width: '100%',
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
  },
  vitalLeft: {
    width: '45%',
    display: 'inline-block',
    paddingRight: 10,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
    },
  },
  vitalRight: {
    width: '45%',
    display: 'inline-block',
    float: 'right',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
    },
  },
  casesheetInput: {
    '& input': {
      padding: '12px 8px',
      fontSize: 15,
      color: '#01475b',
    },
    '& div:hover': {
      '&:before': {
        borderBottom: '2px solid #f7f8f5',
      },
    },
    '& :before': {
      borderBottom: '2px solid #f7f8f5',
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
export const Vital: React.FC = () => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const {
    loading,
    patientDetails,
    weight,
    height,
    temperature,
    bp,
    setWeight,
    setBp,
    setTemperature,
    setHeight,
    caseSheetEdit,
    vitalError,
    setVitalError,
  } = useContext(CaseSheetContext);

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
    const localStorageItem = getLocalStorageItem(params.id);
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

  return loading && !patientDetails ? (
    <div></div>
  ) : (
    <Typography component="div" className={classes.mainContainer}>
      <div>
        <Typography className={classes.vitalLeft} component="div">
          <Typography component="h5" variant="h5" className={classes.header}>
            Height
          </Typography>
          <Typography component="div" className={classes.content}>
            <AphTextField
              onFocus={(e) => moveCursorToEnd(e.currentTarget)}
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
                const storageItem = getLocalStorageItem(params.id);
                if (storageItem) {
                  storageItem.height = e.target.value;
                  updateLocalStorageItem(params.id, storageItem);
                }
                setHeight(e.target.value);
              }}
              disabled={!caseSheetEdit}
            />
          </Typography>
        </Typography>
        <Typography component="div" className={classes.vitalRight}>
          <Typography component="h5" variant="h5" className={classes.header}>
            Weight
          </Typography>
          <Typography component="div" className={classes.content}>
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
                const storageItem = getLocalStorageItem(params.id);
                if (storageItem) {
                  storageItem.weight = e.target.value;
                  updateLocalStorageItem(params.id, storageItem);
                }
                setWeight(e.target.value);
              }}
              disabled={!caseSheetEdit}
            />
          </Typography>
        </Typography>
        <div>
          <Typography component="div" className={classes.vitalLeft}>
            <Typography component="h5" variant="h5" className={classes.header}>
              BP
            </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                fullWidth
                multiline
                defaultValue={getDefaultValue('bp')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.bp = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setBp(e.target.value);
                }}
                disabled={!caseSheetEdit}
              />
            </Typography>
          </Typography>
          <Typography component="div" className={classes.vitalRight}>
            <Typography component="h5" variant="h5" className={classes.header}>
              Temperature
            </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                fullWidth
                multiline
                defaultValue={getDefaultValue('temperature')}
                onBlur={(e) => {
                  const storageItem = getLocalStorageItem(params.id);
                  if (storageItem) {
                    storageItem.temperature = e.target.value;
                    updateLocalStorageItem(params.id, storageItem);
                  }
                  setTemperature(e.target.value);
                }}
                disabled={!caseSheetEdit}
              />
            </Typography>
          </Typography>
        </div>
      </div>
    </Typography>
  );
};
