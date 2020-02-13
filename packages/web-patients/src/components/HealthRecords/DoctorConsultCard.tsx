import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#f7f8f5',
      borderRadius: 10,
      padding: 10,
      border: '1px solid #f7f8f5',
      marginBottom: 28,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    doctorInfoGroup: {
      display: 'flex',
    },
    doctorImg: {
      '& img': {
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      paddingLeft: 16,
      width: 'calc(100% - 40px)',
    },
    avatar: {
      width: 40,
      height: 40,
    },
    doctorName: {
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
    },
    doctorService: {
      display: 'flex',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      letterSpacing: 0.04,
      color: '#02475b',
      '& span:first-child': {
        opacity: 0.6,
      },
      '& span:last-child': {
        marginLeft: 'auto',
        '& img': {
          verticalAlign: 'middle',
          maxWidth: 20,
        },
      },
    },
    bottomActions: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 15,
      marginTop: -1,
      display: 'flex',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        color: '#fc9916',
        fontSize: 12,
      },
      '& button:last-child': {
        marginLeft: 'auto',
      },
    },
    activeCard: {
      border: '1px solid #00b38e',
      position: 'relative',
      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        left: '100%',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        top: '50%',
        borderColor: 'transparent transparent transparent #00b38e',
        borderWidth: 9,
        marginTop: -9,
      },
      '&:after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        left: '100%',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        top: '50%',
        borderColor: 'transparent transparent transparent #f7f8f5',
        borderWidth: 8,
        marginTop: -8,
      },
    },
  };
});

export const DoctorConsultCard: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={`${classes.root}`}>
      <div className={classes.doctorInfoGroup}>
        <div className={classes.doctorImg}>
          <Avatar
            alt="Dr. Simran Rai"
            src={require('images/doctordp_01.png')}
            className={classes.avatar}
          />
        </div>
        <div className={classes.doctorInfo}>
          <div className={classes.doctorName}>Dr. Simran Rai</div>
          <div className={classes.doctorService}>
            <span>Follow-up to 20 Apr 2019</span>
            <span>
              <img src={require('images/ic_onlineconsult.svg')} alt="" />
            </span>
          </div>
          <div className={classes.doctorService}>
            <span>Cold, Cough, Fever, Nausea</span>
            <span>
              <img src={require('images/ic_prescription_blue.svg')} alt="" />
            </span>
          </div>
        </div>
      </div>
      <div className={classes.bottomActions}>
        <AphButton>Book Follow-up</AphButton>
        <AphButton>Order Meds & Tests</AphButton>
      </div>
    </div>
  );
};
