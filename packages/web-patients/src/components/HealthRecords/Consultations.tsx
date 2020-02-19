import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, LinearProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import { DoctorConsultCard } from 'components/HealthRecords/DoctorConsultCard';
import { Symptoms } from 'components/HealthRecords/Symptoms';
import { Prescription } from 'components/HealthRecords/Prescription';
import { Diagnosis } from 'components/HealthRecords/Diagnosis';
import { GeneralAdvice } from 'components/HealthRecords/GeneralAdvice';
import { FollowUp } from 'components/HealthRecords/FollowUp';
import { PaymentInvoice } from 'components/HealthRecords/PaymentInvoice';
import { PrescriptionPreview } from 'components/HealthRecords/PrescriptionPreview';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { GET_PAST_CONSULTS_PRESCRIPTIONS } from '../../graphql/profiles';
import { getPatientPastConsultsAndPrescriptions } from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet as CaseSheetType } from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import ImageGallery from 'react-image-gallery';

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
    topFilters: {
      textAlign: 'right',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 1,
      marginLeft: 15,
      marginRight: 15,
      marginBottom: 10,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
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
          position: 'absolute',
          content: '""',
          left: -29,
          top: -24,
          width: 4,
          height: '200%',
          backgroundColor: theme.palette.common.white,
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
      display: 'block',
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
    menuItemActive: { background: 'red' },
  };
});

const storageClient = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

export const Consultations: React.FC = (props) => {
  const classes = useStyles({});
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:990px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [consultsData, setConsultsData] = useState<any[] | null>(null);
  const [allConsultsData, setAllConsultsData] = useState<any[] | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [activeConsult, setActiveConsult] = useState<any | null>(null);

  const fetchPastData = () => {
    setLoading(true);
    if (currentPatient) {
      client
        .query<getPatientPastConsultsAndPrescriptions>({
          query: GET_PAST_CONSULTS_PRESCRIPTIONS,
          fetchPolicy: 'no-cache',
          variables: {
            consultsAndOrdersInput: {
              patient: currentPatient.id ? currentPatient.id : '',
              filter: [],
            },
          },
        })
        .then((_data) => {
          const consults = _data.data.getPatientPastConsultsAndPrescriptions!.consults || [];
          const medOrders = _data.data.getPatientPastConsultsAndPrescriptions!.medicineOrders || [];
          const consultsAndMedOrders: { [key: string]: any } = {};

          consults.forEach((c) => {
            consultsAndMedOrders[c!.bookingDate] = {
              ...consultsAndMedOrders[c!.bookingDate],
              ...c,
            };
          });

          medOrders.forEach((c) => {
            consultsAndMedOrders[c!.quoteDateTime] = {
              ...consultsAndMedOrders[c!.quoteDateTime],
              ...c,
            };
          });
          const array = Object.keys(consultsAndMedOrders)
            .map((i) => consultsAndMedOrders[i])
            .sort(
              (a: any, b: any) =>
                moment(b.bookingDate || b.quoteDateTime)
                  .toDate()
                  .getTime() -
                moment(a.bookingDate || a.quoteDateTime)
                  .toDate()
                  .getTime()
            )
            .filter(
              (i) =>
                (!i.patientId && (i.prescriptionImageUrl || i.prismPrescriptionFileId)) ||
                i.patientId
            );
          setError(false);
          setLoading(false);
          setConsultsData(array);
          setAllConsultsData(array);
          setActiveConsult(array[0]);
        })
        .catch((e) => {
          const error = JSON.parse(JSON.stringify(e));
          setError(true);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (!consultsData) {
      fetchPastData();
    }
  }, [consultsData, currentPatient]);

  useEffect(() => {
    if (allConsultsData) {
      let filteredConsults = allConsultsData;
      if (filter === 'ONLINE' || filter === 'PHYSICAL') {
        filteredConsults = allConsultsData.filter((consult) => {
          if (consult && consult.patientId) {
            return consult.appointmentType === filter;
          }
        });
      }
      setConsultsData(filteredConsults);
      setActiveConsult(filteredConsults ? filteredConsults[0] : null);
    }
  }, [filter, allConsultsData]);

  if (loading) {
    return <LinearProgress />;
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
  const currentPath = window.location.pathname;

  const downloadPrescription = () => {
    const filterCaseSheet =
      activeConsult &&
      activeConsult.caseSheet &&
      activeConsult.caseSheet.find(
        (caseSheet: CaseSheetType | null) => caseSheet && caseSheet.doctorType !== 'JUNIOR'
      );
    const a = document.createElement('a');
    if (filterCaseSheet && filterCaseSheet.blobName) {
      a.href = storageClient.getBlobUrl(filterCaseSheet.blobName);
    } else {
      a.href = activeConsult && activeConsult.prescriptionImageUrl;
    }
    a.click();
  };

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <div className={classes.topFilters}>
          <AphButton
            className={filter === 'ALL' ? classes.buttonActive : ''}
            onClick={() => setFilter('ALL')}
          >
            All Consults
          </AphButton>
          <AphButton
            className={filter === 'ONLINE' ? classes.buttonActive : ''}
            onClick={() => setFilter('ONLINE')}
          >
            Online
          </AphButton>
          <AphButton
            className={filter === 'PHYSICAL' ? classes.buttonActive : ''}
            onClick={() => setFilter('PHYSICAL')}
          >
            Physical
          </AphButton>
        </div>
        <Scrollbars
          autoHide={true}
          autoHeight
          autoHeightMax={
            isMediumScreen
              ? 'calc(100vh - 364px)'
              : isSmallScreen
              ? 'calc(100vh - 230px)'
              : 'calc(100vh - 320px)'
          }
        >
          <div className={classes.consultationsList}>
            {consultsData &&
              consultsData.length > 0 &&
              consultsData.map(
                (consult) =>
                  consult && (
                    <div onClick={() => setActiveConsult(consult)}>
                      <div className={classes.consultGroupHeader}>
                        <div className={classes.circle}></div>
                        {consult.patientId
                          ? showDate(consult.appointmentDateTime)
                          : showDate(consult.quoteDateTime)}
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
        </Scrollbars>
        <div className={classes.addReportActions}>
          <Link to={clientRoutes.addRecords()} className={classes.addReport}>
            Add a Report
          </Link>
        </div>
      </div>
      <div className={`${classes.rightSection} ${classes.mobileOverlay}`}>
        <div className={classes.sectionHeader}>
          <div className={classes.headerBackArrow}>
            <AphButton>
              <img src={require('images/ic_back.svg')} />
            </AphButton>
            <span>Prescription Details</span>
          </div>
          <div className={classes.headerActions}>
            <AphButton>View Consult</AphButton>
            <div className={classes.downloadIcon} onClick={() => downloadPrescription()}>
              <img src={require('images/ic_download.svg')} alt="" />
            </div>
          </div>
        </div>
        <Scrollbars
          autoHide={true}
          autoHeight
          autoHeightMax={
            isMediumScreen
              ? 'calc(100vh - 287px)'
              : isSmallScreen
              ? 'calc(100vh - 96px)'
              : 'calc(100vh - 245px)'
          }
        >
          <div className={classes.consultationDetails}>
            {activeConsult && activeConsult.patientId ? (
              <>
                <Symptoms caseSheetList={activeConsult.caseSheet} />
                <Prescription caseSheetList={activeConsult.caseSheet} />
                <Diagnosis caseSheetList={activeConsult.caseSheet} />
                <GeneralAdvice caseSheetList={activeConsult.caseSheet} />
                <FollowUp caseSheetList={activeConsult.caseSheet} />
                {/* <PaymentInvoice />
                <PrescriptionPreview /> */}
              </>
            ) : (
              activeConsult && <img src={activeConsult.prescriptionImageUrl} />
            )}
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};
