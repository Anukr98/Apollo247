import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import { DoctorConsultCard } from 'components/HealthRecords/DoctorConsultCard';
import { Symptoms } from 'components/HealthRecords/Symptoms';
import { Prescription } from 'components/HealthRecords/Prescription';
import { Diagnosis } from 'components/HealthRecords/Diagnosis';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      PaddingRight: 3,
      display: 'flex',
    },
    leftSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      padding: '20px 5px',
      borderRadius: 5,
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
      textTransform: 'uppercase',
      marginLeft: 20,
      marginRight: 15,
    },
    headerActions: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      '& button': {
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#fc9916',
        fontSize: 12,
        padding: 0,
      },
    },
    shareIcon: {
      marginLeft: 40,
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    downloadIcon: {
      marginLeft: 40,
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    topFilters: {
      textAlign: 'right',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 1,
      marginLeft: 15,
      marginRight: 15,
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        borderRadius: 0,
        fontSize: 12,
        fontWeight: 500,
        color: '#658f9b',
        textTransform: 'none',
        padding: '0 0 12px 0',
        borderBottom: '5px solid #fff',
        minWidth: 'auto',
        marginLeft: 8,
        marginRight: 8,
      },
    },
    buttonActive: {
      borderBottom: '5px solid #00b38e !important',
      color: '#02475b !important',
    },
    consultationsList: {
      marginLeft: 13,
      paddingRight: 15,
      borderLeft: '4px solid #0087ba',
      paddingLeft: 14,
      marginTop: 20,
      '& >div:last-child': {
        position: 'relative',
        '&:before': {
          position: 'absolute',
          content: '""',
          left: -19,
          top: -14,
          width: 4,
          height: '110%',
          backgroundColor: theme.palette.common.white,
        },
      },
    },
    consultGroupHeader: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      marginLeft: -26,
      paddingBottom: 13,
    },
    circle: {
      width: 20,
      height: 20,
      backgroundColor: '#01475b',
      borderRadius: '50%',
      marginRight: 10,
    },
    consultationDetails: {
      paddingLeft: 20,
      paddingRight: 15,
      paddingTop: 10,
    },
  };
});

export const Consultations: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <div className={classes.topFilters}>
          <AphButton className={classes.buttonActive}>All Consults</AphButton>
          <AphButton>Online</AphButton>
          <AphButton>Physical</AphButton>
        </div>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 276px)'}>
          <div className={classes.consultationsList}>
            <div className={classes.consultGroupHeader}>
              <div className={classes.circle}></div>
              <span>Today, 12 Aug 2019</span>
            </div>
            <DoctorConsultCard />
            <div className={classes.consultGroupHeader}>
              <div className={classes.circle}></div>
              <span>Today, 9 Aug 2019</span>
            </div>
            <DoctorConsultCard />
            <div className={classes.consultGroupHeader}>
              <div className={classes.circle}></div>
              <span>Today, 6 Aug 2019</span>
            </div>
            <DoctorConsultCard />
            <div className={classes.consultGroupHeader}>
              <div className={classes.circle}></div>
              <span>Today, 6 Aug 2019</span>
            </div>
            <DoctorConsultCard />
          </div>
        </Scrollbars>
      </div>
      <div className={classes.rightSection}>
        <div className={classes.sectionHeader}>
          <span>Online Follow up consultation - case #362079</span>
          <div className={classes.headerActions}>
            <AphButton>View Consult</AphButton>
            <div className={classes.shareIcon}>
              <img src={require('images/ic_round-share.svg')} alt="" />
            </div>
            <div className={classes.downloadIcon}>
              <img src={require('images/ic_download.svg')} alt="" />
            </div>
          </div>
        </div>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 262px)'}>
          <div className={classes.consultationDetails}>
            <Symptoms />
            <Prescription />
            <Diagnosis />
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};
