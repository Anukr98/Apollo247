import React, { Fragment, useContext } from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { AphTextField, AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles(() => ({
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
  },
  vitalRight: {
    width: '45%',
    display: 'inline-block',
    float: 'right',
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
  const { loading, patientDetails } = useContext(CaseSheetContext);
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
              {/* <AphTextField className={classes.casesheetInput}>
                {patientDetails!.patientMedicalHistory!.height
                  ? patientDetails!.patientMedicalHistory!.height
                  : '-'}
              </AphTextField> */}
              <AphTextField fullWidth multiline />
              <div className={classes.boxActions}>
                <AphButton>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton>
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div>
            </Typography>
          </Typography>
          <Typography component="div" className={classes.vitalRight}>
            <Typography component="h5" variant="h5" className={classes.header}>
              Weight
            </Typography>
            <Typography component="div" className={classes.content}>
              {/* <List>
                <ListItem>
                  <Fragment>
                    <Typography component="p" className={classes.textContent}>
                      {patientDetails!.patientMedicalHistory!.weight
                        ? patientDetails!.patientMedicalHistory!.weight
                        : '-'}
                    </Typography>
                  </Fragment>
                </ListItem>
              </List> */}
              <AphTextField fullWidth multiline />
              <div className={classes.boxActions}>
                <AphButton>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton>
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div>
            </Typography>
          </Typography>

          <div>
            <Typography component="div" className={classes.vitalLeft}>
              <Typography component="h5" variant="h5" className={classes.header}>
                BP
              </Typography>
              <Typography component="div" className={classes.content}>
                {/* <List>
                  <ListItem>
                    <Fragment>
                      <Typography component="p" className={classes.textContent}>
                        {patientDetails!.patientMedicalHistory!.bp
                          ? patientDetails!.patientMedicalHistory!.bp
                          : '-'}
                      </Typography>
                    </Fragment>
                  </ListItem>
                </List> */}
                <AphTextField fullWidth multiline />
                <div className={classes.boxActions}>
                  <AphButton>
                    <img src={require('images/round_edit_24_px.svg')} alt="" />
                  </AphButton>
                  <AphButton>
                    <img src={require('images/ic_cancel_green.svg')} alt="" />
                  </AphButton>
                </div>
              </Typography>
            </Typography>
            <Typography component="div" className={classes.vitalRight}>
              <Typography component="h5" variant="h5" className={classes.header}>
                Temperature
              </Typography>
              <Typography component="div" className={classes.content}>
                {/* <List>
                  <ListItem>
                    <Fragment>
                      <Typography component="p" className={classes.textContent}>
                        {patientDetails!.patientMedicalHistory!.temperature
                          ? patientDetails!.patientMedicalHistory!.temperature
                          : '-'}
                      </Typography>
                    </Fragment>
                  </ListItem>
                </List> */}
                <AphTextField fullWidth multiline />
                <div className={classes.boxActions}>
                  <AphButton>
                    <img src={require('images/round_edit_24_px.svg')} alt="" />
                  </AphButton>
                  <AphButton>
                    <img src={require('images/ic_cancel_green.svg')} alt="" />
                  </AphButton>
                </div>
              </Typography>
            </Typography>
          </div>
        </div>
      ) : (
        <span>No data Found</span>
      )}
      {/* {data.map((item, idx) => (
        <Typography key={idx} className={classes.column} component="div">
          <Typography component="h5" variant="h5" className={classes.header}>
            {Object.keys(item)[0]}
          </Typography>
          <Typography component="div" className={classes.content}>
            <List>
              {!!Object.values(item).length &&
                Object.values(item).map((text, i) => (
                  <ListItem key={i}>
                    <Fragment>
                      <Typography component="p" className={classes.textContent}>
                        {text}
                      </Typography>
                    </Fragment>
                  </ListItem>
                ))}
            </List>
          </Typography>
        </Typography>
      ))} */}
    </Typography>
  );
};
