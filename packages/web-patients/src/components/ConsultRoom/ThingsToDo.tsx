import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      padding: '20px 5px',
    },
    thingsSection: {
      paddingLeft: 15,
      paddingRight: 15,
    },
    pageHeader: {
      borderBottom: '0.5px solid rgba(2,71,91,0.2)',
      paddingBottom: 10,
      marginBottom: 10,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    thingsCard: {
      backgroundColor: '#f7f8f5',
      padding: 15,
      borderRadius: 10,
      display: 'flex',
      marginBottom: 5,
    },
    thingsInfo: {
      paddingRight: 10,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      width: 'calc(100% - 72px)',
      '& p': {
        margin: 0,
      },
      '& button': {
        boxShadow: 'none',
        padding: 0,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fc9916',
        marginTop: 10,
      },
    },
    imgCircle: {
      marginLeft: 'auto',
      width: 72,
      height: 72,
      borderRadius: '50%',
      backgroundColor: theme.palette.common.white,
    },
    marginTop15: {
      paddingTop: 15,
    },
    fullImage: {
      maxWidth: 102,
      borderRadius: '10px 0 0 10px',
      overflow: 'hidden',
      '& img': {
        maxWidth: 102,
        verticalAlign: 'middle',
      },
    },
    noPadding: {
      padding: 0,
    },
    thingsNew: {
      padding: 15,
      width: 'calc(100% - 102px)',
      paddingRight: 0,
    },
  };
});

export const ThingsToDo: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 214px)'}>
        <div className={classes.thingsSection}>
          <div className={classes.pageHeader}>Things To Do</div>
          <div className={classes.thingsCard}>
            <div className={classes.thingsInfo}>
              <p>Your Health Profile is just 30% complete. Update it now!</p>
              <AphButton>Update Health Profile</AphButton>
            </div>
            <div className={classes.imgCircle}></div>
          </div>
          <div className={classes.thingsCard}>
            <div className={classes.thingsInfo}>
              <p>Add your family members and live a tension free life.</p>
              <AphButton>Add Family Member</AphButton>
            </div>
            <div className={classes.imgCircle}></div>
          </div>
          <div className={`${classes.pageHeader} ${classes.marginTop15}`}>Things To Do</div>
          <div className={`${classes.thingsCard} ${classes.noPadding}`}>
            <div className={classes.fullImage}>
              <img src="https://via.placeholder.com/102x90" alt="" />
            </div>
            <div className={`${classes.thingsInfo} ${classes.thingsNew}`}>
              Study reveals how much fiber we should eat to prevent disease.
            </div>
          </div>
          <div className={`${classes.thingsCard} ${classes.noPadding}`}>
            <div className={classes.fullImage}>
              <img src="https://via.placeholder.com/102x90" alt="" />
            </div>
            <div className={`${classes.thingsInfo} ${classes.thingsNew}`}>
              Common BP drug may increase cardiac arrest risk.
            </div>
          </div>
          <div className={`${classes.thingsCard} ${classes.noPadding}`}>
            <div className={classes.fullImage}>
              <img src="https://via.placeholder.com/102x90" alt="" />
            </div>
            <div className={`${classes.thingsInfo} ${classes.thingsNew}`}>
              5 Simple Daily Yoga Exercises For Good Health!
            </div>
          </div>
        </div>
      </Scrollbars>
    </div>
  );
};
