import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import _startCase from 'lodash/startCase';
import _lowerCase from 'lodash/lowerCase';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    actions: {
      padding: '10px 20px 20px 20px',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        minWidth: 'auto',
        boxShadow: 'none',
        '&:first-child': {
          color: '#fc9916',
        },
        '&:last-child': {
          marginLeft: 'auto',
        },
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
  };
});

export const MedicineNotifyPopover: React.FC<{
  medicineName: string;
  setIsPopoverOpen: (isPopoverOpen: boolean) => void;
}> = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">Okay! :)</Typography>
        <p>{`You will be notified when ${_startCase(
          _lowerCase(props.medicineName)
        )} is back in stock.`}</p>
      </div>
      <div className={classes.actions}>
        <AphButton onClick={() => props.setIsPopoverOpen(false)}>Ok, Got it</AphButton>
      </div>
    </div>
  );
};
