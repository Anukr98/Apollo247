import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import axios from 'axios';
import { useContext } from 'react';
import { LocationContext, Address } from 'components/LocationProvider';

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
        minWidth: 156,
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

type AllowLocationProps = {
  setIsLocationPopoverOpen: (isLocationPopoverOpen: boolean) => void;
  setIsPopoverOpen: (isPopoverOpen: boolean) => void;
  isPopoverOpen: boolean;
};

export const AllowLocation: React.FC<AllowLocationProps> = (props) => {
  const classes = useStyles({});
  const { locateCurrentLocation } = useContext(LocationContext);

  return (
    <div className={classes.root}>
      <div className={classes.windowBody}>
        <Typography variant="h2">Hi! :)</Typography>
        <p>
          We need to know your location to function better. Please allow us to auto detect your
          location or enter location manually.
        </p>
      </div>
      <div className={classes.actions}>
        <AphButton
          onClick={() => {
            props.setIsLocationPopoverOpen(true);
          }}
        >
          Enter Manualy
        </AphButton>
        <AphButton
          color="primary"
          onClick={() => {
            // props.setIsPopoverOpen(false);
            locateCurrentLocation();
          }}
        >
          Allow Auto Detect
        </AphButton>
      </div>
    </div>
  );
};
