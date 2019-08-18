import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { AphRadio, AphTextField } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 14,
      paddingBottom: 20,
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
    addressGroup: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      paddingTop: 11,
      paddingBottom: 6,
      marginBottom: 10,
    },
    pinSearch: {
      paddingBottom: 20,
    },
    sectionHeader: {
      marginBottom: 20,
      paddingBottom: 4,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
  };
});

export const ViewAllStoreAddress: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.addressGroup}>
        <div className={classes.pinSearch}>
          <AphTextField value="500033" placeholder="500033" />
        </div>
        <div className={classes.sectionHeader}>Stores In This Region</div>
        <ul>
          <li>
            <FormControlLabel
              className={classes.radioLabel}
              value="a"
              control={<AphRadio color="primary" />}
              checked
              label="Apollo Pharmacy Plot No B/88, Opposite Andhra Bank, Jubilee Hills"
            />
          </li>
          <li>
            <FormControlLabel
              className={classes.radioLabel}
              value="b"
              control={<AphRadio color="primary" />}
              label="Apollo Pharmacy Plot No B/88, Opposite Andhra Bank, Jubilee Hills"
            />
          </li>
          <li>
            <FormControlLabel
              className={classes.radioLabel}
              value="b"
              control={<AphRadio color="primary" />}
              label="Apollo Pharmacy Plot No B/88, Opposite Andhra Bank, Jubilee Hills"
            />
          </li>
        </ul>
      </div>
    </div>
  );
};
