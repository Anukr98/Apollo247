import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '0 5px',
    },
    consultationSection: {
      paddingLeft: 15,
      paddingRight: 15,
      paddingBottom: 10,
    },
    consultCard: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 10,
      display: 'flex',
      padding: 16,
      position: 'relative',
    },
    doctorAvatar: {
      width: 80,
      height: 80,
    },
    doctorInfo: {
      paddingLeft: 15,
      paddingTop: 15,
      width: 'calc(100% - 80px)',
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      paddingBottom: 10,
    },
    doctorType: {
      fontSize: 10,
      fontWeight: 600,
      color: '#0087ba',
      textTransform: 'uppercase',
      letterSpacing: 0.25,
    },
    doctorExp: {
      paddingLeft: 8,
      marginLeft: 5,
      paddingRight: 5,
      position: 'relative',
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 1,
        height: 10,
        top: 1,
        left: 0,
        backgroundColor: '#0087ba',
      },
    },
    consultaitonType: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 8,
      paddingTop: 5,
    },
    appointBooked: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 5,
      paddingTop: 5,
      '& ul': {
        padding: 0,
        margin: 0,
        marginLeft: -2,
        marginRight: -2,
        '& li': {
          borderRadius: 10,
          backgroundColor: 'rgba(0,135,186,0.08)',
          listStyleType: 'none',
          padding: '6px 12px',
          fontSize: 9,
          fontWeight: 'bold',
          color: '#0087ba',
          marginTop: 5,
          display: 'inline-block',
          textTransform: 'uppercase',
          marginLeft: 2,
          marginRight: 2,
        },
      },
    },
    availability: {
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: 'rgba(0,135,186,0.11)',
      padding: '6px 12px',
      color: '#02475b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 10,
      position: 'absolute',
      right: 0,
      top: 0,
      minWidth: 134,
    },
    availableNow: {
      backgroundColor: '#ff748e',
      color: theme.palette.common.white,
    },
    startDoctor: {
      position: 'relative',
      '& span': {
        position: 'absolute',
        top: 66,
        left: '50%',
        marginLeft: -14,
        '& img': {
          verticalAlign: 'middle',
        },
      },
    },
  };
});

export const ConsultationsCard: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 214px)'}>
        <div className={classes.consultationSection}>
          <Grid container spacing={2}>
            <Grid item sm={6}>
              <div className={classes.consultCard}>
                <div className={classes.startDoctor}>
                  <Avatar
                    alt=""
                    src={require('images/ic_placeholder.png')}
                    className={classes.doctorAvatar}
                  />
                  <span>
                    <img src={require('images/ic_star.svg')} alt="" />
                  </span>
                </div>
                <div className={classes.doctorInfo}>
                  <div className={`${classes.availability} ${classes.availableNow}`}>
                    Available in 15 mins
                  </div>
                  <div className={classes.doctorName}>Dr. Simran Rai</div>
                  <div className={classes.doctorType}>
                    General Physician
                    <span className={classes.doctorExp}>7 YRS</span>
                  </div>
                  <div className={classes.consultaitonType}>Online Consultaiton</div>
                  <div className={classes.appointBooked}>
                    <ul>
                      <li>Fever</li>
                      <li>Cough &amp; Cold</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item sm={6}>
              <div className={classes.consultCard}>
                <div className={classes.startDoctor}>
                  <Avatar
                    alt=""
                    src={require('images/ic_placeholder.png')}
                    className={classes.doctorAvatar}
                  />
                  <span>
                    <img src={require('images/ic_star.svg')} alt="" />
                  </span>
                </div>
                <div className={classes.doctorInfo}>
                  <div className={`${classes.availability}`}>6:30 PM</div>
                  <div className={classes.doctorName}>Dr. Jayanth Reddy</div>
                  <div className={classes.doctorType}>
                    General Physician
                    <span className={classes.doctorExp}>5 YRS</span>
                  </div>
                  <div className={classes.consultaitonType}>Apollo Hospital, Jubilee Hills</div>
                  <div className={classes.appointBooked}>
                    <ul>
                      <li>Fever</li>
                      <li>Cough &amp; Cold</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </Scrollbars>
    </div>
  );
};
