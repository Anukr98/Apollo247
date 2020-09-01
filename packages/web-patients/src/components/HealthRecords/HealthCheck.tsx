import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import { MedicalCard } from 'components/HealthRecords/MedicalCard';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import moment from 'moment';
import { RenderImage } from 'components/HealthRecords/RenderImage';
import { getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response as HealthCheckType } from '../../graphql/types/getPatientPrismMedicalRecords';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      PaddingRight: 3,
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
      },
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    sourceField: {
      maxWidth: 70,
      fontSize: 14,
      color: '#67909C',
      fontWeight: 'normal',
      [theme.breakpoints.down('xs')]: {
        maxWidth: '100%',
      },
    },
    leftSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      padding: '0 0 20px 5px',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        backgroundColor: '#f0f1ec',
        padding: 0,
        borderRadius: 0,
      },
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        display: 'none',
        paddingRight: 0,
      },
    },
    mobileOverlay: {
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#f0f1ec',
        zIndex: 999,
      },
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
      [theme.breakpoints.down('xs')]: {
        margin: 0,
        display: 'block',
        padding: 0,
      },
    },
    headerActions: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        padding: '10px 15px',
        position: 'absolute',
        top: 5,
        right: 0,
      },
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
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
      '& img': {
        verticalAlign: 'middle',
      },
    },
    downloadIcon: {
      marginLeft: 40,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
      '& img': {
        verticalAlign: 'middle',
      },
    },
    tabsWrapper: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '8px 8px 8px 20px',
      },
    },
    addReportMobile: {
      '& img': {
        verticalAlign: 'middle',
      },
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    topFilters: {
      textAlign: 'right',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 1,
      marginLeft: 15,
      marginRight: 15,
      marginBottom: 10,
      [theme.breakpoints.down('xs')]: {
        flex: 1,
        margin: 0,
      },
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        borderRadius: 0,
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 12,
        fontWeight: 500,
        color: '#658f9b',
        textTransform: 'none',
        borderBottom: '5px solid #fff',
        minWidth: 'auto',
      },
    },
    buttonActive: {
      borderBottom: '5px solid #00b38e !important',
      color: '#02475b !important',
    },
    consultationsList: {
      marginLeft: 13,
      paddingRight: 20,
      borderLeft: '4px solid #0087ba',
      paddingLeft: 14,
      marginTop: 10,
      [theme.breakpoints.down('xs')]: {
        marginLeft: 15,
      },
      '& >div:last-child >div': {
        position: 'relative',
        '&:before': {
          [theme.breakpoints.down('xs')]: {
            backgroundColor: '#f0f1ec',
          },
        },
      },
    },
    consultGroup: {
      position: 'relative',
      '&:last-child': {
        '&:before': {
          content: '""',
          position: 'absolute',
          left: -18,
          width: 4,
          height: '100%',
          backgroundColor: '#fff',
          [theme.breakpoints.down('xs')]: {
            backgroundColor: '#f0f1ec',
          },
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
      [theme.breakpoints.down('xs')]: {
        padding: 20,
        paddingBottom: 10,
      },
    },
    addReportActions: {
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 10,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    noRecordFoundWrapper: {
      textAlign: 'center',
      '& p': {
        width: 260,
        margin: 'auto',
        fontWeight: 500,
        fontSize: 14,
        textAlign: 'left',
      },
    },
    cbcDetails: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: 12,
      padding: 14,
      '& hr': {
        opacity: '0.2',
      },
      '&:before': {
        display: 'none',
      },
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
      '& >div:first-child': {
        paddingLeft: 0,
      },
      '& >div:last-child': {
        paddingRight: 0,
      },
    },
    reportsDetails: {
      paddingLeft: 10,
      paddingRight: 10,
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 5,
        paddingRight: 5,
      },
      '& label': {
        fontSize: 16,
        fontWeight: 500,
        color: '#02475b',
        paddingBottom: 3,
      },
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        color: '#0087ba',
        margin: 0,
        wordBreak: 'break-word',
      },
    },
    headerBackArrow: {
      zIndex: 2,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: 15,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
      '& button': {
        display: 'none',
        boxShadow: 'none',
        minWidth: 'auto',
        MozBoxShadow: 'none',
        padding: 0,
        marginRight: 15,
        '& img': {
          verticalAlign: 'middle',
        },
        [theme.breakpoints.down('xs')]: {
          display: 'block',
        },
      },
    },
    doctorInfo: {
      paddingRight: 16,
      width: 'calc(100% - 24px)',
    },
    doctorName: {
      fontSize: 17,
      color: '#0087BA',
      fontWeight: 600,
      marginBottom: 5,
    },
    testName: {
      fontSize: 23,
      color: '#02475b',
      fontWeight: 500,
      marginBottom: 12,
    },
    checkDate: {
      fontSize: 14,
      color: '#02475b',
      lineHeight: '21px',
      fontWeight: 500,
    },
    sitedisplayName: {
      fontSize: 14,
      color: '#67909C',
      fontWeight: 'normal',
    },
  };
});

type MedicalRecordProps = {
  allCombinedData: HealthCheckType[];
  loading: boolean;
  setActiveData: (activeData: HealthCheckType) => void;
  activeData: HealthCheckType;
  error: boolean;
  deleteReport: (id: string, type: string) => void;
};

export const HealthCheck: React.FC<MedicalRecordProps> = (props) => {
  const classes = useStyles({});
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:990px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [showMobileDetails, setShowMobileDetails] = useState<boolean>(false);

  const { allCombinedData, loading, activeData, setActiveData, error, deleteReport } = props;

  const getFormattedDate = (combinedData: HealthCheckType, dateFor: string) => {
    return dateFor === 'title' &&
      moment().format('DD/MM/YYYY') === moment(combinedData.date).format('DD/MM/YYYY') ? (
      <span>Today , {moment(combinedData.date).format('DD MMM YYYY')}</span>
    ) : (
      <span>{moment(combinedData.date).format('DD MMM YYYY')}</span>
    );
  };

  const getName = (combinedData: any, type: string) => {
    switch (type) {
      case 'lab':
        return combinedData.labTestName;
      case 'prescription':
        return combinedData.prescriptionName;
      default:
        return '';
    }
  };

  const getSource = (activeData: any, type: string) => {
    switch (type) {
      case 'lab':
        return activeData && activeData.siteDisplayName
          ? activeData.siteDisplayName
          : !!activeData.labTestSource
          ? activeData.labTestSource
          : '-';
      case 'prescription':
        return !!activeData.prescriptionSource ? activeData.prescriptionSource : '-';
      default:
        return '-';
    }
  };

  if (loading) {
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div>Error while fetching the medical records</div>;
  }

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <div className={classes.tabsWrapper}>
          <Link className={classes.addReportMobile} to={clientRoutes.addRecords()}>
            <img src={require('images/ic_addfile.svg')} />
          </Link>
        </div>
        <Scrollbars
          autoHide={true}
          autoHeight
          autoHeightMin={
            isMediumScreen
              ? 'calc(100vh - 240px)'
              : isSmallScreen
              ? 'calc(100vh - 230px)'
              : 'calc(100vh - 270px)'
          }
        >
          <div className={classes.consultationsList}>
            {allCombinedData &&
              allCombinedData.length > 0 &&
              allCombinedData.map((combinedData: any) => (
                <div
                  className={classes.consultGroup}
                  onClick={() => {
                    setActiveData(combinedData);
                    if (isSmallScreen) {
                      setShowMobileDetails(true);
                    }
                  }}
                >
                  <div className={classes.consultGroupHeader}>
                    <div className={classes.circle}></div>
                    <span>{getFormattedDate(combinedData, 'title')}</span>
                  </div>
                  <MedicalCard
                    deleteReport={deleteReport}
                    name={combinedData.healthCheckName || combinedData.healthCheckType || '-'}
                    source={combinedData.healthCheckSummary || '-'}
                    type={'HealthCheck'}
                    id={`HealthCheck-${combinedData.id}`}
                    isActiveCard={activeData && activeData.id === combinedData.id}
                  />
                </div>
              ))}
          </div>
          {isSmallScreen && allCombinedData && allCombinedData.length === 0 && (
            <div className={classes.noRecordFoundWrapper}>
              <img src={require('images/ic_records.svg')} />
              <p>
                You don’t have any records with us right now. Add a record to keep everything handy
                in one place!
              </p>
            </div>
          )}
        </Scrollbars>
        <div className={classes.addReportActions}>
          <AphButton
            color="primary"
            onClick={() => {
              window.location.href = clientRoutes.addRecords();
            }}
            fullWidth
          >
            Add Record
          </AphButton>
        </div>
      </div>
      <div
        className={`${classes.rightSection} ${
          isSmallScreen && !showMobileDetails ? '' : classes.mobileOverlay
        }`}
      >
        {allCombinedData && allCombinedData.length > 0 ? (
          <>
            <div className={classes.sectionHeader}>
              <div className={classes.headerBackArrow}>
                <AphButton
                  onClick={() => {
                    if (isSmallScreen) {
                      setShowMobileDetails(false);
                    }
                  }}
                >
                  <img src={require('images/ic_back.svg')} />
                </AphButton>
                <span>Test Results</span>
              </div>
            </div>
            <Scrollbars
              autoHide={true}
              autoHeight
              autoHeightMin={
                isMediumScreen
                  ? 'calc(100vh - 287px)'
                  : isSmallScreen
                  ? 'calc(100vh - 55px)'
                  : 'calc(100vh - 322px)'
              }
            >
              {((!isSmallScreen && activeData) ||
                (isSmallScreen && showMobileDetails && activeData)) && (
                <div className={classes.medicalRecordsDetails}>
                  <div className={classes.cbcDetails}>
                    <div className={classes.reportsDetails}>
                      <div className={classes.testName}>
                        {activeData.healthCheckType || activeData.healthCheckName || '-'}
                      </div>
                    </div>
                    <hr />
                    <div className={classes.reportsDetails}>
                      <label>Uploaded Date</label>
                      <p>
                        On{' '}
                        <span className={classes.checkDate}>
                          {getFormattedDate(activeData, 'checkUp')}
                        </span>
                      </p>
                    </div>
                  </div>
                  {activeData && activeData.fileUrl && activeData.fileUrl.length > 0 && (
                    <RenderImage
                      activeData={activeData}
                      type={
                        activeData.healthCheckFiles &&
                        activeData.healthCheckFiles.length &&
                        activeData.healthCheckFiles[0].fileName &&
                        activeData.healthCheckFiles[0].fileName.includes('pdf')
                          ? 'pdf'
                          : activeData.fileUrl.includes('pdf')
                          ? 'pdf'
                          : 'image'
                      }
                    />
                  )}
                </div>
              )}
            </Scrollbars>
            {activeData && activeData.fileUrl && activeData.fileUrl.length > 0 && (
              <a href={activeData.fileUrl}>
                <div className={classes.addReportActions}>
                  <AphButton color="primary" fullWidth>
                    DOWNLOAD HEALTH SUMMARY
                  </AphButton>
                </div>
              </a>
            )}
          </>
        ) : (
          <div className={classes.noRecordFoundWrapper}>
            <img src={require('images/ic_records.svg')} />
            <p>
              You don’t have any records with us right now. Add a record to keep everything handy in
              one place!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
