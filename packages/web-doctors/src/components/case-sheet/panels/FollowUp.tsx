import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphCustomDropdown } from '@aph/web-ui-components';
import { MenuItem, Theme } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { isValid } from 'date-fns/esm';
const useStyles = makeStyles((theme: Theme) => ({
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

  menu: {
    width: 125,
    maxHeight: 450,
    boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
    backgroundColor: theme.palette.common.white,
    color: '#02475b',
    // marginLeft: -18,
    '& ul': {
      textAlign: 'center',
      '& li': {
        minHeight: 'auto',
        paddingLeft: 50,
        paddingRight: 0,
        borderBottom: '1px solid rgba(1,71,91,0.2)',
        textAlign: 'center',
        '&:last-child': {
          borderBottom: 'none',
        },
      },
    },
  },

  menuSelected: {
    backgroundColor: 'transparent !important',
    color: '#00b38e',
    fontWeight: 600,
  },

  select: {
    width: 40,
  },
}));

export const FollowUp = () => {
  const classes = useStyles({});
  const [value, setValue] = useState(null);
  const [errorType, setErrorType] = useState('');
  const minError = 'Value cannot be less than default value';
  const maxError = 'Value cannot be more than 30 days';
  const defaultValue = 7;
  const NO_OF_DAYS = new Array(31 - defaultValue).fill(0);

  return (
    <div>
      <span className={classes.header}> {'Set your patient follow up chat days limit.'}</span>
      <br />
      {/* <AphTextField
        type={'tel'}
        className={classes.followUpInput}
        value={value}
        onChange={(e) => {
          let val = e.target.value;
          let intValue = parseInt(val, 10);
          setValue(val);
        }}
        onBlur={(e) => {
          if (e.target.value === '') setValue(0);
        }}
      /> */}
      <div style={{ top: 10, left: 3, position: 'relative' }}>
        <AphCustomDropdown
          label={'Days'}
          value={value}
          onChange={(e) => {
            console.log(e);
            setValue(e.target.value);
          }}
          classes={{
            root: classes.select,
            select: classes.select,
          }}
          MenuProps={{
            classes: { paper: classes.menu },
          }}
        >
          {NO_OF_DAYS.map((val, index) => (
            <MenuItem
              classes={{
                root: classes.menu,
                selected: classes.menuSelected,
              }}
              key={index + defaultValue}
              value={index + defaultValue}
            >
              {index + defaultValue}
            </MenuItem>
          ))}
        </AphCustomDropdown>
        <span className={classes.daysLabel}>{'Days'}</span>
      </div>
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
