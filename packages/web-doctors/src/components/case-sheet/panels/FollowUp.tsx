import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphCustomDropdown } from '@aph/web-ui-components';
import { MenuItem } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { isValid } from 'date-fns/esm';
const useStyles = makeStyles(() => ({
  header: {
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: 14,
    lineHeight: '18px',
    letterSpacing: '0.0233333px',
    color: 'rgba(2, 71, 91, 0.6)',
  },
  followUpInput: {
    width: 60,
  },
  daysLabel: {
    fontWeight: 500,
    fontSize: 14,
    color: '#02475B',
    letterSpacing: '0.0233333px',
    verticalAlign: 'bottom',
    marginLeft: 13,
    display: 'inline-block',
    width: '60%',
  },
  infoWrapper: {
    display: 'flex',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: '16px',
    letterSpacing: 1,
    color: '#00B38E',
    marginTop: 20,
  },
  infoErrorWrapper: {
    display: 'flex',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: '16px',
    letterSpacing: 1,
    color: 'red',
    marginTop: 20,
  },
}));

export const FollowUp = () => {
  const classes = useStyles({});
  const [value, setValue] = useState(null);
  const [errorType, setErrorType] = useState('');
  const minError = 'Value cannot be less than default value';
  const maxError = 'Value cannot be more than 30 days';

  return (
    <div>
      <span className={classes.header}> {'Set your patient follow up chat days limit.'}</span>
      <br />
      <AphTextField
        type={'number'}
        className={classes.followUpInput}
        value={value}
        onChange={(e) => {
          let val = e.target.value;
          let intValue = parseInt(val, 10);
          if (val === '' || (intValue >= 0 && intValue <= 30)) setValue(val);
        }}
        onBlur={(e) => {
          if (e.target.value === '') setValue(0);
        }}
      />

      <span className={classes.daysLabel}>{'Days'}</span>
      {/* <span>{errorType === 'min' && minError}</span> */}
      <span className={classes.infoWrapper}>
        <InfoOutlinedIcon
          style={{
            marginTop: 3,
          }}
        />
        <span style={{ marginLeft: 10 }}>
          {
            'The follow up chat days count will be changed for this individual patient. Your default follow up chat day count is set at 7.'
          }
        </span>
      </span>
    </div>
  );
};
