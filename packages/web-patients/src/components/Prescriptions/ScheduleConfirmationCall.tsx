import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
    },
    timleSlots: {
      paddingTop: 20,
      display: 'flex',
      '& button': {
        fontSize: 16,
        fontWeight: 500,
        borderRadius: 10,
        marginRight: 8,
      },
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white + '!important',
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white + '!important',
      },
    },
  };
});

export const ScheduleConfirmationCall: React.FC = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.root}>
      Pick a time for our executive to call back & confirm your order details.
      <div className={classes.timleSlots}>
        <AphButton color="secondary" className={classes.buttonActive}>
          9 am - 12 pm
        </AphButton>
        <AphButton color="secondary">12 pm - 3 pm</AphButton>
      </div>
    </div>
  );
};
