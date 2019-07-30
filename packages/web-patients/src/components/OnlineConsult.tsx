import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState } from 'react';
import { AphButton } from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';
import { DayTimeSlots } from 'components/DayTimeSlots';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    consultGroup: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.text.primary,
      padding: 15,
      marginTop: 10,
      marginBottom: 10,
      display: 'inline-block',
      width: '100%',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.35,
      color: theme.palette.secondary.light,
      '& p': {
        marginTop: 0,
      },
    },
    actions: {
      paddingTop: 10,
      paddingBottom: 10,
      marginLeft: -7,
      marginRight: -8,
    },
    button: {
      fontSize: 16,
      fontWeight: 500,
      marginLeft: 8,
      marginRight: 8,
      textTransform: 'none',
      borderRadius: 10,
      paddingLeft: 10,
      paddingRight: 10,
      letterSpacing: 'normal',
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
    bottomActions: {
      padding: '30px 15px 15px 15px',
      '& button': {
        borderRadius: 10,
        textTransform: 'none',
      },
    },
    customScrollBar: {
      paddingTop: 10,
      paddingBottom: 10,
    },
    timeSlots: {
      paddingTop: 0,
    },
    scheduleCalendar: {
      display: 'none',
    },
    scheduleTimeSlots: {
      display: 'none',
    },
    showCalendar: {
      display: 'block',
    },
    showTimeSlot: {
      display: 'block',
    },
  };
});

export const OnlineConsult: React.FC = (props) => {
  const classes = useStyles();
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'50vh'}>
        <div className={classes.customScrollBar}>
          <div className={classes.consultGroup}>
            <p>
              Dr. Simran is available in 15mins!
              <br /> Would you like to consult now or schedule for later?
            </p>
            <div className={classes.actions}>
              <AphButton
                onClick={(e) => {
                  setShowCalendar(false);
                }}
                color="secondary"
                className={`${classes.button} ${!showCalendar ? classes.buttonActive : ''}`}
              >
                Consult Now
              </AphButton>
              <AphButton
                onClick={(e) => {
                  setShowCalendar(!showCalendar);
                }}
                color="secondary"
                className={`${classes.button} ${showCalendar ? classes.buttonActive : ''}`}
              >
                Schedule For Later
              </AphButton>
            </div>
          </div>
          <div
            className={`${classes.consultGroup} ${classes.scheduleCalendar} ${
              showCalendar ? classes.showCalendar : ''
            }`}
          >
            <AphCalendar />
          </div>
          <div
            className={`${classes.consultGroup} ${classes.scheduleTimeSlots} ${
              showCalendar ? classes.showTimeSlot : ''
            }`}
          >
            <DayTimeSlots />
          </div>
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <AphButton fullWidth color="primary">
          PAY Rs. 299
        </AphButton>
      </div>
    </div>
  );
};
