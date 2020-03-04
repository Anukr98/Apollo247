import React, { useContext } from 'react';
import { Theme } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { AphTextField } from '@aph/web-ui-components';

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

export const Vital: React.FC = () => {
  const classes = useStyles();
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

  return loading && !patientDetails ? (
    <div></div>
  ) : (
    <Typography component="div" className={classes.mainContainer}>
      {patientDetails && patientDetails!.patientMedicalHistory ? (
        <div>
          <Typography className={classes.vitalLeft} component="div">
            <Typography component="h5" variant="h5" className={classes.header}>
              Height
            </Typography>
            <Typography component="div" className={classes.content}>
              <AphTextField
                onFocus={(e) => moveCursorToEnd(e.currentTarget)}
                fullWidth
                multiline
                defaultValue={height}
                onBlur={(e) => {
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
                multiline
                defaultValue={weight}
                onBlur={(e) => {
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
                  defaultValue={bp}
                  onBlur={(e) => {
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
                  defaultValue={temperature}
                  onBlur={(e) => {
                    setTemperature(e.target.value);
                  }}
                  disabled={!caseSheetEdit}
                />
              </Typography>
            </Typography>
          </div>
        </div>
      ) : (
        <span>No data Found</span>
      )}
    </Typography>
  );
};
