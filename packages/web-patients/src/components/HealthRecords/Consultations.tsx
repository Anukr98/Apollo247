import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import { DoctorConsultCard } from 'components/HealthRecords/DoctorConsultCard';
import { Symptoms } from 'components/HealthRecords/Symptoms';
import { Prescription } from 'components/HealthRecords/Prescription';
import { Diagnosis } from 'components/HealthRecords/Diagnosis';
import { PrescribedTests } from 'components/HealthRecords/PrescribedTests';
import { GeneralAdvice } from 'components/HealthRecords/GeneralAdvice';
import { FollowUp } from 'components/HealthRecords/FollowUp';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet as CaseSheetType } from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { ToplineReport } from 'components/HealthRecords/ToplineReport';
import { HEALTH_RECORDS_NO_DATA_FOUND, HEALTH_RECORDS_NOTE } from 'helpers/commonHelpers';

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
      paddingLeft: 5,
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
        padding: '0 15px',
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
    consultationDetails: {
      paddingLeft: 20,
      paddingRight: 15,
      paddingTop: 10,
      [theme.breakpoints.down('xs')]: {
        padding: 20,
        paddingBottom: 10,
      },
    },
    prescriptionImage: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: 12,
      padding: 40,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        padding: 20,
      },
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
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
    addReport: {
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#fcb716',
      width: '100%',
      textAlign: 'center',
      color: '#fff',
      padding: '9px 13px',
      textTransform: 'uppercase',
      fontSize: 13,
      fontWeight: 'bold',
      display: 'none',
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
    medicalRecordsDetails: {
      paddingLeft: 20,
      paddingRight: 15,
      paddingTop: 10,
      [theme.breakpoints.down('xs')]: {
        padding: 20,
        paddingBottom: 10,
      },
    },
    cbcDetails: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: 12,
      padding: '14px 14px 14px 18px',
      display: 'flex',
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
      paddingLeft: 5,
      paddingRight: 5,
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
        wordBreak: 'break-word',
      },
    },
    noteText: {
      fontSize: 12,
      padding: 10,
      color: '#0087ba',
    },
  };
});

const storageClient = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

type ConsultationProps = {
  loading: boolean;
  error: boolean;
  consultsData: any;
  allConsultsData: any;
};

export const Consultations: React.FC<ConsultationProps> = (props) => {
  const classes = useStyles({});
  const { loading, error, allConsultsData } = props;
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:990px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [filter, setFilter] = useState<string>('ALL');
  const [activeConsult, setActiveConsult] = useState<any | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState<boolean>(false);
  const [filteredData, setFiltedData] = useState<any | null>(null);

  useEffect(() => {
    if (allConsultsData) {
      let filteredConsults = allConsultsData;
      if (filter === 'ONLINE' || filter === 'PHYSICAL') {
        filteredConsults =
          allConsultsData &&
          allConsultsData.filter((consult: any) => {
            if (filter === 'PHYSICAL') {
              return (
                consult.source === '247self' ||
                consult.source === 'self' ||
                (consult && consult.patientId && consult.appointmentType === filter)
              );
            } else {
              return consult && consult.patientId && consult.appointmentType === filter;
            }
          });
      }
      setFiltedData(filteredConsults);
      if (!isSmallScreen) {
        setActiveConsult(filteredConsults ? filteredConsults[0] : null);
      }
    }
  }, [filter, allConsultsData]);

  if (loading) {
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  }
  if (error) {
    return <div>Error occured while fetching Heath records...</div>;
  }

  const showDate = (date: string) => {
    return moment(new Date()).format('DD/MM/YYYY') ===
      moment(new Date(date)).format('DD/MM/YYYY') ? (
      <span>Today , {moment(new Date(date)).format('DD MMM YYYY')}</span>
    ) : (
      <span>{moment(new Date(date)).format('DD MMM YYYY')}</span>
    );
  };

  const downloadPrescription = () => {
    const filterCaseSheet =
      activeConsult &&
      activeConsult.caseSheet &&
      activeConsult.caseSheet.find(
        (caseSheet: CaseSheetType | null) => caseSheet && caseSheet.doctorType !== 'JUNIOR'
      );

    if (filterCaseSheet && filterCaseSheet.blobName) {
      const a = document.createElement('a');
      a.href = storageClient.getBlobUrl(filterCaseSheet.blobName);
      a.click();
    } else {
      const imageList = activeConsult.prescriptionImageUrl.split(',');
      const download = (imageList: string[]) => {
        const url = imageList.pop();
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', '');
        a.click();
        if (imageList.length === 0) {
          clearInterval(interval);
        }
      };
      const interval = setInterval(download, 300, imageList);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <div className={classes.noteText}>{HEALTH_RECORDS_NOTE}</div>
        <div className={classes.tabsWrapper}>
          <Link
            className={classes.addReportMobile}
            to={clientRoutes.addHealthRecords('prescription')}
          >
            <img src={require('images/ic_addfile.svg')} />
          </Link>
          <div className={classes.topFilters}>
            <AphButton
              className={filter === 'ALL' ? classes.buttonActive : ''}
              onClick={() => setFilter('ALL')}
              title={'View all consults'}
            >
              All Consults
            </AphButton>
            <AphButton
              className={filter === 'ONLINE' ? classes.buttonActive : ''}
              onClick={() => setFilter('ONLINE')}
              title={'View online consults'}
            >
              Online
            </AphButton>
            <AphButton
              className={filter === 'PHYSICAL' ? classes.buttonActive : ''}
              onClick={() => setFilter('PHYSICAL')}
              title={'View physical consults'}
            >
              Physical
            </AphButton>
          </div>
        </div>
        <Scrollbars
          autoHide={true}
          autoHeight
          autoHeightMin={
            isMediumScreen
              ? 'calc(100vh - 364px)'
              : isSmallScreen
              ? 'calc(100vh - 230px)'
              : 'calc(100vh - 280px)'
          }
        >
          <div className={classes.consultationsList}>
            {filteredData &&
              filteredData.length > 0 &&
              filteredData.map(
                (consult: any) =>
                  consult && (
                    <div
                      className={classes.consultGroup}
                      onClick={() => {
                        setActiveConsult(consult);
                        if (isSmallScreen) {
                          setShowMobileDetails(true);
                        }
                      }}
                    >
                      <div className={classes.consultGroupHeader}>
                        <div className={classes.circle}></div>
                        {consult.patientId
                          ? showDate(consult.appointmentDateTime)
                          : showDate(consult.quoteDateTime || consult.date)}
                      </div>
                      <DoctorConsultCard
                        consult={consult}
                        isActiveCard={activeConsult === consult}
                        downloadPrescription={downloadPrescription}
                      />
                    </div>
                  )
              )}
          </div>
          {isSmallScreen && filteredData && filteredData.length === 0 && (
            <div className={classes.noRecordFoundWrapper}>
              <img src={require('images/ic_records.svg')} />
              <p>{HEALTH_RECORDS_NO_DATA_FOUND}</p>
            </div>
          )}
        </Scrollbars>
        <div className={classes.addReportActions}>
          <AphButton
            color="primary"
            onClick={() => {
              window.location.href = clientRoutes.addHealthRecords('prescription');
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
        {filteredData && filteredData.length > 0 ? (
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
                <span>Prescription Details</span>
              </div>
              <div className={classes.headerActions}>
                {/* <AphButton>View Consult</AphButton>  */}
                {activeConsult && activeConsult.patientId && (
                  <div className={classes.downloadIcon} onClick={() => downloadPrescription()}>
                    <img src={require('images/ic_download.svg')} alt="" />
                  </div>
                )}
              </div>
            </div>
            <Scrollbars
              autoHide={true}
              autoHeight
              autoHeightMin={
                isMediumScreen
                  ? 'calc(100vh - 287px)'
                  : isSmallScreen
                  ? 'calc(100vh - 96px)'
                  : 'calc(100vh - 250px)'
              }
            >
              <div className={classes.consultationDetails}>
                {(!isSmallScreen && activeConsult && activeConsult.patientId) ||
                (isSmallScreen && showMobileDetails && activeConsult.patientId) ? (
                  <>
                    <Symptoms caseSheetList={activeConsult.caseSheet} />
                    <Prescription caseSheetList={activeConsult.caseSheet} />
                    <PrescribedTests caseSheetList={activeConsult.caseSheet} />
                    <Diagnosis caseSheetList={activeConsult.caseSheet} />
                    <GeneralAdvice caseSheetList={activeConsult.caseSheet} />
                    <FollowUp caseSheetList={activeConsult.caseSheet} />
                    {/* <PaymentInvoice />
                <PrescriptionPreview /> */}
                  </>
                ) : // when it is prescription
                activeConsult && activeConsult.prescriptionName ? (
                  <div className={classes.medicalRecordsDetails}>
                    <div className={classes.cbcDetails}>
                      <div className={classes.reportsDetails}>
                        <label>Check-up Date</label>
                        <p>{moment(activeConsult.date).format('DD MMM YYYY')}</p>
                      </div>
                      <div className={classes.reportsDetails}>
                        <label>Source</label>
                        <p>{activeConsult.prescriptionSource || '-'}</p>
                      </div>
                      <div className={classes.reportsDetails}>
                        <label>Referring Doctor</label>
                        <p>{activeConsult.prescribedBy ? `${activeConsult.prescribedBy}` : '-'}</p>
                      </div>
                    </div>
                    {(activeConsult.observations || activeConsult.additionalNotes) && (
                      <ToplineReport activeData={activeConsult} />
                    )}
                    {activeConsult &&
                      activeConsult.fileUrl &&
                      activeConsult.fileUrl.length > 0 &&
                      (activeConsult.fileUrl.includes('.pdf') ? (
                        <div className={classes.prescriptionImage}>
                          <a href={activeConsult.fileUrl}>Download File</a>
                        </div>
                      ) : (
                        <div className={classes.prescriptionImage}>
                          <img src={activeConsult.fileUrl} alt="Prescription Preview" />
                        </div>
                      ))}
                  </div>
                ) : (
                  // when it is med record
                  activeConsult &&
                  activeConsult.prescriptionImageUrl &&
                  (activeConsult.prescriptionImageUrl.includes('.pdf') ? (
                    <div className={classes.prescriptionImage}>
                      <a href={activeConsult.prescriptionImageUrl}>Download File</a>
                    </div>
                  ) : activeConsult.prescriptionImageUrl.includes(',') ? (
                    activeConsult.prescriptionImageUrl.split(',').map((imageUrl: any) => {
                      return (
                        <div className={classes.prescriptionImage}>
                          <img src={imageUrl} alt="Prescription Preview" />
                        </div>
                      );
                    })
                  ) : (
                    <div className={classes.prescriptionImage}>
                      <img src={activeConsult.prescriptionImageUrl} alt="Prescription Preview" />
                    </div>
                  ))
                )}
              </div>
            </Scrollbars>
          </>
        ) : (
          <div className={classes.noRecordFoundWrapper}>
            <img src={require('images/ic_records.svg')} />
            <p>{HEALTH_RECORDS_NO_DATA_FOUND}</p>
          </div>
        )}
      </div>
    </div>
  );
};
