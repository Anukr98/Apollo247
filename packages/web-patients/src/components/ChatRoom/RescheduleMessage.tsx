import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingBottom: 20,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
    },
    addressGroup: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 16,
    },
    formGroup: {
      paddingBottom: 20,
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
      '& label': {
        fontSize: 14,
        fontWeight: 500,
        color: '#02475b',
      },
    },
    dialogContent: {
      paddingTop: 10,
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #f7f8f5',
      position: 'relative',
      textAlign: 'center',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        width: 'calc(100% - 8px)',
      },
      '& button:first-child': {
        marginRight: 8,
        backgroundColor: theme.palette.common.white,
        color: '#fc9916',
      },
      '& button:last-child': {
        marginLeft: 8,
      },
    },
    customScrollBar: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    shadowHide: {
      overflow: 'hidden',
    },
    dateTime: {
      fontSize: 16,
      fontWeight: 500,
      color: '#0087ba',
    },
  };
});

export const RescheduleMessage: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <p>
                We’re sorry that you have to reschedule. You can reschedule up to 3 times for free.
              </p>
              <p>Next slot for Dr. Jayanth is available on —</p>
              <div className={classes.dateTime}>
                <div>18th May, Monday</div>
                <div>12:00 pm</div>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.dialogActions}>
        <AphButton color="primary">Change Slot</AphButton>
        <AphButton color="primary">Accept</AphButton>
      </div>
    </div>
  );
};
