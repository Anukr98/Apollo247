import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    },
    topContent: {
      padding: 15,
      display: 'flex',
    },
    doctorAvatar: {
      width: 80,
      height: 80,
    },
    doctorInfo: {
      paddingLeft: 15,
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
    },
    doctorType: {
      fontSize: 10,
      fontWeight: 600,
      color: '#0087ba',
    },
    doctorExp: {
      paddingLeft: 5,
      paddingRight: 5,
    },
    doctorDetails: {
      paddingTop: 10,
    },    
  });
});

export const DoctorCard: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.topContent}>
        <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.doctorAvatar} />
        <div className={classes.doctorInfo}>
          <div className={classes.doctorName}>Dr. Gennifer Ghosh</div>
          <div className={classes.doctorType}>General Physician <span className={classes.doctorExp}>7 YRS</span></div>
          <div className={classes.doctorDetails}>
            <p>MBBS, Internal Medicine</p>
            <p>Apollo Hospitals, Jubilee Hills</p>
          </div>
        </div>
      </div>
    </div>
  );
};
