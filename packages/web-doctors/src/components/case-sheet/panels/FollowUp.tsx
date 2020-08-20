import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphCustomDropdown } from '@aph/web-ui-components';
import { MenuItem } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
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
}));

export const FollowUp = () => {
  const classes = useStyles({});
  return (
    <div>
      <span className={classes.header}> {'Set your patient follow up chat days limit.'}</span>
      <br />
      <AphTextField type={'number'} className={classes.followUpInput} />
      <span className={classes.daysLabel}>{'Days'}</span>
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
