import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { AphRadio, AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '20px 10px 10px 10px',
      '& ul': {
        padding: 0,
        margin: 0,
      },
      '& li': {
        listStyleType: 'none',
        paddingBottom: 10,
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    radioLabel: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      alignItems: 'start',
      '& span:last-child': {
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    bottomActions: {
      display: 'flex',
      alignItems: 'center',
      '& button': {
        boxShadow: 'none',
        padding: 0,
        color: '#fc9916',
      },
    },
    viewAllBtn: {
      marginLeft: 'auto',
    },
  };
});

export const HomeDelivery: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ul>
        <li>
          <FormControlLabel
            className={classes.radioLabel}
            value="a"
            control={<AphRadio color="primary" />}
            checked
            label="27/A, Kalpataru Enclave Jubilee Hills Hyderabad, Telangana — 500033"
          />
        </li>
        <li>
          <FormControlLabel
            className={classes.radioLabel}
            value="b"
            control={<AphRadio color="primary" />}
            label="27/A, Kalpataru Enclave Jubilee Hills Hyderabad, Telangana — 500033"
          />
        </li>
      </ul>
      <div className={classes.bottomActions}>
        <AphButton>Add new address</AphButton>
        <AphButton className={classes.viewAllBtn}>View All</AphButton>
      </div>
    </div>
  );
};
