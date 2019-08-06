import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { AphRadio, AphButton, AphTextField } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 10,
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
    searchAddress: {
      paddingBottom: 20,
    },
  };
});

export const StorePickUp: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.searchAddress}>
        <AphTextField value="500033" />
      </div>
      <ul>
        <li>
          <FormControlLabel
            className={classes.radioLabel}
            value="a"
            control={<AphRadio color="primary" />}
            checked
            label="Apollo Pharmacy
            Plot No B/88, Opposite Andhra Bank, Jubilee Hills"
          />
        </li>
        <li>
          <FormControlLabel
            className={classes.radioLabel}
            value="b"
            control={<AphRadio color="primary" />}
            label="Apollo Pharmacy
            Plot No B/88, Opposite Andhra Bank, Jubilee Hills"
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
