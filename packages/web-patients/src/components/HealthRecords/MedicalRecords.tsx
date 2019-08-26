import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import { MedicalCard } from 'components/HealthRecords/MedicalCard';
import { ToplineReport } from 'components/HealthRecords/ToplineReport';
import { DetailedFindings } from 'components/HealthRecords/DetailedFindings';

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
      marginBottom: 10,
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
      marginTop: 10,
      '& >div:last-child >div': {
        position: 'relative',
        '&:before': {
          position: 'absolute',
          content: '""',
          left: -29,
          top: -24,
          width: 4,
          height: '200%',
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
    medicalRecordsDetails: {
      paddingLeft: 20,
      paddingRight: 15,
      paddingTop: 10,
    },
    addReportActions: {
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 10,
    },
    cbcDetails: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: 12,
      padding: 14,
      display: 'flex',
      '&:before': {
        display: 'none',
      },
    },
    reportsDetails: {
      paddingLeft: 25,
      paddingRight: 25,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: '#01475b',
        paddingBottom: 3,
      },
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        color: '#0087ba',
        margin: 0,
      },
    },
  };
});

export const MedicalRecords: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <div className={classes.topFilters}>
          <AphButton className={classes.buttonActive}>All Consults</AphButton>
          <AphButton>Online</AphButton>
          <AphButton>Physical</AphButton>
        </div>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 336px)'}>
          <div className={classes.consultationsList}>
            <div className={classes.consultGroupHeader}>
              <div className={classes.circle}></div>
              <span>Today, 12 Aug 2019</span>
            </div>
            <MedicalCard />
            <div className={classes.consultGroupHeader}>
              <div className={classes.circle}></div>
              <span>Today, 9 Aug 2019</span>
            </div>
            <MedicalCard />
            <div className={classes.consultGroupHeader}>
              <div className={classes.circle}></div>
              <span>Today, 6 Aug 2019</span>
            </div>
            <MedicalCard />
            <div className={classes.consultGroupHeader}>
              <div className={classes.circle}></div>
              <span>Today, 6 Aug 2019</span>
            </div>
            <MedicalCard />
          </div>
        </Scrollbars>
        <div className={classes.addReportActions}>
          <AphButton color="primary" fullWidth>
            Add a Report
          </AphButton>
        </div>
      </div>
      <div className={classes.rightSection}>
        <div className={classes.sectionHeader}>
          <span>CBC Details</span>
          <div className={classes.headerActions}>
            <div className={classes.shareIcon}>
              <img src={require('images/ic_round-share.svg')} alt="" />
            </div>
            <div className={classes.downloadIcon}>
              <img src={require('images/ic_download.svg')} alt="" />
            </div>
          </div>
        </div>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 262px)'}>
          <div className={classes.medicalRecordsDetails}>
            <div className={classes.cbcDetails}>
              <div className={classes.reportsDetails}>
                <label>Check-up Date</label>
                <p>03 May 2019</p>
              </div>
              <div className={classes.reportsDetails}>
                <label>Source</label>
                <p>Apollo Hospital, Jubilee Hills</p>
              </div>
              <div className={classes.reportsDetails}>
                <label>Referring Doctor</label>
                <p>Dr. Simran Rai</p>
              </div>
            </div>
            <ToplineReport />
            <DetailedFindings />
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};
