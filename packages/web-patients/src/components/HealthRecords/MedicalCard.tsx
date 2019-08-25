import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#f7f8f5',
      borderRadius: 10,
      padding: 10,
      border: '1px solid #f7f8f5',
      marginBottom: 28,
    },
    doctorInfoGroup: {
      display: 'flex',
    },
    moreIcon: {
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      paddingRight: 16,
      width: 'calc(100% - 24px)',
    },
    doctorName: {
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
    },
    doctorService: {
      paddingTop: 8,
      paddingBottom: 8,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      letterSpacing: 0.04,
      color: '#02475b',
    },
    activeCard: {
      border: '1px solid #00b38e',
    },
  };
});

export const MedicalCard: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={`${classes.root} ${classes.activeCard}`}>
      <div className={classes.doctorInfoGroup}>
        <div className={classes.doctorInfo}>
          <div className={classes.doctorName}>CBC</div>
          <div className={classes.doctorService}>
            <span>Apollo Sugar Clinic, Hyderabad</span>
          </div>
        </div>
        <div className={classes.moreIcon}>
          <img src={require('images/ic_more.svg')} alt="" />
        </div>
      </div>
    </div>
  );
};
