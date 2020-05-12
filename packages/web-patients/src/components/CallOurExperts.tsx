import React, { useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    expertBox: {
      padding: 20,
      textAlign: 'center',
      '& h2': {
        fontSize: 16,
        margin: 0,
      },
      '& a': {
        fontSize: 14,
        paddingTop: 5,
        display: 'inline-block',
        color: '#0087ba',
        fontWeight: 500,
      },
      '& button': {
        marginTop: 20,
      },
    },
    serviceCard: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#00485d',
      borderRadius: 10,
      color: '#fff',
      fontSize: 14,
      padding: '9px 16px',
      cursor: 'pointer',
      fontWeight: 500,
      '& img': {
        verticalAlign: 'middle',
      },
      '& span:first-child': {
        paddingRight: 16,
      },
    },
  };
});

export const CallOurExperts: React.FC = () => {
  const classes = useStyles({});
  const isDesktopOnly = useMediaQuery('(min-width:768px)');

  const [iscoronaDialogOpen, setIscoronaDialogOpen] = useState<boolean>(false);
  return (
    <>
      <a href={isDesktopOnly ? '#' : 'tel:08047192606'}>
        <div
          onClick={() => {
            isDesktopOnly ? setIscoronaDialogOpen(true) : '';
          }}
          className={classes.serviceCard}
        >
          <span>
            <img src={require('images/ic_family_doctor.svg')} alt="" />
          </span>
          <span>Call our experts</span>
        </div>
      </a>
      <AphDialog open={iscoronaDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIscoronaDialogOpen(false)} title={'Close'} />
        <AphDialogTitle></AphDialogTitle>
        <div className={classes.expertBox}>
          <h2>CORONAVIRUS? Talk to our expert.</h2>
          <a href="tel:08047192606">Call 08047192606 in emergency</a>
          <AphButton onClick={() => setIscoronaDialogOpen(false)} color="primary">
            Ok, Got It
          </AphButton>
        </div>
      </AphDialog>
    </>
  );
};
