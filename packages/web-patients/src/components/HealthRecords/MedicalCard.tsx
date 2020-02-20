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
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
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

type MedicalCardProps = {
  name: string;
  isActiveCard: boolean;
};

export const MedicalCard: React.FC<MedicalCardProps> = (props) => {
  const classes = useStyles({});

  return (
    <div className={`${classes.root} ${props.isActiveCard ? classes.activeCard : ''}`}>
      <div className={classes.doctorInfoGroup}>
        <div className={classes.doctorInfo}>
          <div className={classes.doctorName}>{props.name}</div>
          {/* <div className={classes.doctorService}>
            <span>Apollo Sugar Clinic, Hyderabad</span>
          </div> */}
        </div>
        <div className={classes.moreIcon}>
          <img src={require('images/ic_more.svg')} alt="" />
        </div>
      </div>
    </div>
  );
};
