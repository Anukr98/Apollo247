import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphRadio } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingBottom: 20,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
    },
    dialogContent: {
      paddingTop: 10,
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #ffffff',
      position: 'relative',
      textAlign: 'center',
      '& button': {
        borderRadius: 10,
      },
    },
    customScrollBar: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    shadowHide: {
      overflow: 'hidden',
    },
    chooseGroup: {
      padding: '15px 12px',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      display: 'flex',
      marginBottom: 10,
    },
    leftCol: {
      width: 42,
    },
    rightCol: {
      width: 'calc(100% - 42px)',
      marginLeft: 'auto',
    },
    topSection: {
      paddingRight: 53,
      position: 'relative',
    },
    avatar: {
      width: 40,
      height: 40,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
    },
    doctorInfo: {
      fontSize: 12,
      fontWeight: 600,
      color: '#0087ba',
      textTransform: 'uppercase',
    },
    bottomSection: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 10,
      paddingTop: 10,
    },
  };
});

export const ChooseDoctor: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.shadowHide}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
          <div className={classes.customScrollBar}>
            <div className={classes.root}>
              <p>Here are few doctors available for your appointment —</p>
              <div className={classes.chooseGroup}>
                <div className={classes.leftCol}>
                  <AphRadio color="primary" />
                </div>
                <div className={classes.rightCol}>
                  <div className={classes.topSection}>
                    <div className={classes.doctorName}>Dr. Jayanth Reddy</div>
                    <div className={classes.doctorInfo}>General Physician | 5 YRS</div>
                    <Avatar
                      alt=""
                      src={require('images/doctordp_01.png')}
                      className={classes.avatar}
                    />
                  </div>
                  <div className={classes.bottomSection}>18th May, Monday, 9:00 am</div>
                </div>
              </div>
              <div className={classes.chooseGroup}>
                <div className={classes.leftCol}>
                  <AphRadio color="primary" />
                </div>
                <div className={classes.rightCol}>
                  <div className={classes.topSection}>
                    <div className={classes.doctorName}>Dr. Jayanth Reddy</div>
                    <div className={classes.doctorInfo}>General Physician | 5 YRS</div>
                    <Avatar
                      alt=""
                      src={require('images/doctordp_01.png')}
                      className={classes.avatar}
                    />
                  </div>
                  <div className={classes.bottomSection}>18th May, Monday, 9:00 am</div>
                </div>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.dialogActions}>
        <AphButton color="primary" fullWidth>
          Confirm
        </AphButton>
      </div>
    </div>
  );
};
