import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 65,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 9999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      padding: 20,
    },
    profileBlock: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      width: 328,
    },
    doctorImg: {
      borderRadius: '10px 10px 0 0',
      overflow: 'hidden',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      padding: '20px 5px',
    },
    customScroll: {
      padding: '0 15px',
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
    },
    doctorType: {
      fontSize: 16,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.8)',
    },
    contactNo: {
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      paddingTop: 5,
    },
    bottomActions: {
      padding: 20,
    },
  };
});

export const JDProfile: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.profileBlock}>
            <div className={classes.doctorImg}>
              <img src="https://via.placeholder.com/328x228" alt="" />
            </div>
            <div className={classes.doctorInfo}>
              <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 474px' }}>
                <div className={classes.customScroll}>
                  <div className={classes.doctorName}>Seema Singh</div>
                  <div className={classes.doctorType}>MBBS, Internal Medicine</div>
                  <div className={classes.contactNo}>+91 98765 43210</div>
                </div>
              </Scrollbars>
            </div>
            <div className={classes.bottomActions}>
              <AphButton color="primary" fullWidth>
                Logout
              </AphButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
