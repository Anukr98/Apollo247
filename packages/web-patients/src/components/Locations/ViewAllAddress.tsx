import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { AphRadio } from '@aph/web-ui-components';

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
      paddingTop: 16,
      paddingBottom: 6,
      marginBottom: 10,
    },
  };
});

export const ViewAllAddress: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.addressGroup}>
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
          <li>
            <FormControlLabel
              className={classes.radioLabel}
              value="b"
              control={<AphRadio color="primary" />}
              label="27/A, Kalpataru Enclave Jubilee Hills Hyderabad, Telangana — 500033"
            />
          </li>
        </ul>
      </div>
    </div>
  );
};
