import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, LinearProgress, CircularProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import { MedicalCard } from 'components/HealthRecords/MedicalCard';
import { ToplineReport } from 'components/HealthRecords/ToplineReport';
import { DetailedFindings } from 'components/HealthRecords/DetailedFindings';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { useMutation } from 'react-apollo-hooks';
import { DELETE_PATIENT_MEDICAL_RECORD } from '../../graphql/profiles';
import moment from 'moment';
import { RenderImage } from 'components/HealthRecords/RenderImage';

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
        zIndex: 991,
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
      display: 'flex',
      '&:before': {
        display: 'none',
      },
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    reportsDetails: {
      paddingLeft: 25,
      paddingRight: 25,
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 5,
        paddingRight: 5,
      },
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
    headerBackArrow: {
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
  };
});

type MedicalRecordProps = {
  medicalRecords: any;
  allCombinedData: any;
  setMedicalRecords: (medicalRecords: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setActiveData: (activeData: any) => void;
  activeData: any;
};

export const MedicalRecords: React.FC<MedicalRecordProps> = (props) => {
  const classes = useStyles({});
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:990px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [showMobileDetails, setShowMobileDetails] = useState<boolean>(false);

  const {
    medicalRecords,
    allCombinedData,
    loading,
    setLoading,
    setMedicalRecords,
    activeData,
    setActiveData,
  } = props;

  const getFormattedDate = (combinedData: any) => {
    switch (combinedData.type) {
      case 'medical':
        return moment(combinedData.data.testDate).format('DD MMM YYYY');
      case 'lab':
        return moment(combinedData.data.labTestDate).format('DD MMM YYYY');
      case 'hospital':
        return moment(combinedData.data.dateOfHospitalization).format('DD MMM YYYY');
      case 'health':
        return moment(combinedData.data.appointmentDate).format('DD MMM YYYY');
      default:
        return '';
    }
  };

  const getName = (combinedData: any) => {
    switch (combinedData.type) {
      case 'medical':
        return (
          combinedData.data.testName ||
          combinedData.data.issuingDoctor ||
          combinedData.data.location
        );
      case 'lab':
        return combinedData.data.labTestName;
      case 'hospital':
        return combinedData.data.diagnosisNotes;
      case 'health':
        return combinedData.data.healthCheckName;
      default:
        return '';
    }
  };

  const getSource = () => {
    switch (activeData.type) {
      case 'medical':
        return !!activeData.data.sourceName ? activeData.data.sourceName : '-';
      case 'lab':
        return !!activeData.data.labTestSource ? activeData.data.labTestSource : '-';
      case 'hospital':
      case 'health':
        return !!activeData.data.source ? activeData.data.source : '-';
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

  const deleteReportMutation = useMutation(DELETE_PATIENT_MEDICAL_RECORD);

  const deleteReport = (id: string) => {
    deleteReportMutation({
      variables: { recordId: id },
      fetchPolicy: 'no-cache',
    })
      .then((_data) => {
        setLoading(true);
        const newRecords =
          medicalRecords && medicalRecords.filter((record: any) => record.id !== id);
        setMedicalRecords(newRecords);
      })
      .catch((e) => {
        console.log('Error occured while render Delete MedicalOrder', { e });
      });
  };

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
                    <span>{getFormattedDate(combinedData)}</span>
                  </div>
                  <MedicalCard
                    deleteReport={deleteReport}
                    name={getName(combinedData)}
                    id={combinedData.data.id}
                    isActiveCard={
                      activeData && activeData.data && activeData.data === combinedData.data
                    }
                    setLoading={setLoading}
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
                <span>REPORT Details</span>
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
                  : 'calc(100vh - 245px)'
              }
            >
              {((!isSmallScreen && activeData) ||
                (isSmallScreen && showMobileDetails && activeData)) && (
                <div className={classes.medicalRecordsDetails}>
                  <div className={classes.cbcDetails}>
                    <div className={classes.reportsDetails}>
                      <label>Check-up Date</label>
                      <p>{getFormattedDate(activeData)}</p>
                    </div>
                    <div className={classes.reportsDetails}>
                      <label>Source</label>
                      <p>{getSource()}</p>
                    </div>
                    <div className={classes.reportsDetails}>
                      <label>Referring Doctor</label>
                      <p>
                        {!!activeData.data.referringDoctor
                          ? activeData.data.referringDoctor
                          : !!activeData.data.signingDocName
                          ? activeData.data.signingDocName
                          : '-'}
                      </p>
                    </div>
                  </div>
                  {(activeData.data.observations ||
                    activeData.data.additionalNotes ||
                    activeData.data.healthCheckSummary) && (
                    <ToplineReport activeData={activeData} />
                  )}
                  {((activeData.data.medicalRecordParameters &&
                    activeData.data.medicalRecordParameters.length > 0) ||
                    (activeData.data.labTestResultParameters &&
                      activeData.data.labTestResultParameters.length > 0)) && (
                    <DetailedFindings activeData={activeData} />
                  )}
                  {activeData.data &&
                    ((activeData.data.prismFileIds && activeData.data.prismFileIds.length > 0) ||
                      (activeData.data.hospitalizationPrismFileIds &&
                        activeData.data.hospitalizationPrismFileIds.length > 0) ||
                      (activeData.data.healthCheckPrismFileIds &&
                        activeData.data.healthCheckPrismFileIds.length > 0) ||
                      (activeData.data.testResultPrismFileIds &&
                        activeData.data.testResultPrismFileIds.length > 0)) && (
                      <RenderImage activeData={activeData} />
                    )}
                </div>
              )}
            </Scrollbars>
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
