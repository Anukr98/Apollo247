import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, LinearProgress, CircularProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import { MedicalCard } from 'components/HealthRecords/MedicalCard';
import { ToplineReport } from 'components/HealthRecords/ToplineReport';
import { DetailedFindings } from 'components/HealthRecords/DetailedFindings';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useAllCurrentPatients } from 'hooks/authHooks';
import {
  // DELETE_PATIENT_MEDICAL_RECORD,
  GET_MEDICAL_PRISM_RECORD,
  GET_MEDICAL_RECORD,
  // GET_PAST_CONSULTS_PRESCRIPTIONS,
  // UPLOAD_DOCUMENT,
  // SAVE_PRESCRIPTION_MEDICINE_ORDER,
} from '../../graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getPatientMedicalRecords,
  getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords as MedicalRecordsType,
} from '../../graphql/types/getPatientMedicalRecords';
import {
  getPatientPrismMedicalRecords,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests as LabTestsType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks as HealthChecksType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations as HospitalizationsType,
} from '../../graphql/types/getPatientPrismMedicalRecords';
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
  };
});

export const MedicalRecords: React.FC = (props) => {
  const classes = useStyles({});
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:990px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [medicalRecords, setMedicalRecords] = useState<(MedicalRecordsType | null)[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [labTests, setLabTests] = useState<(LabTestsType | null)[] | null>(null);
  const [healthChecks, setHealthChecks] = useState<(HealthChecksType | null)[] | null>(null);
  const [hospitalizations, setHospitalizations] = useState<(HospitalizationsType | null)[] | null>(
    null
  );
  // const [filteredData, setFilteredData] = useState<any | null>(null);
  // const [filter, setFilter] = useState<string>('ALL');
  const [allCombinedData, setAllCombinedData] = useState<any | null>(null);
  const [activeData, setActiveData] = useState<any | null>(null);

  const fetchData = () => {
    client
      .query<getPatientMedicalRecords>({
        query: GET_MEDICAL_RECORD,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data && data.getPatientMedicalRecords && data.getPatientMedicalRecords.medicalRecords) {
          setMedicalRecords(data.getPatientMedicalRecords.medicalRecords);
        }
      })
      .catch((error) => {
        alert(error);
        setLoading(false);
      });
  };

  const fetchTestData = () => {
    client
      .query<getPatientPrismMedicalRecords>({
        query: GET_MEDICAL_PRISM_RECORD,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data && data.getPatientPrismMedicalRecords) {
          setLabTests(data.getPatientPrismMedicalRecords.labTests);
          setHealthChecks(data.getPatientPrismMedicalRecords.healthChecks);
          setHospitalizations(data.getPatientPrismMedicalRecords.hospitalizations);
        }
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const sortByDate = (array: { type: string; data: any }[]) => {
    return array.sort(({ data: data1 }, { data: data2 }) => {
      let date1 = new Date(
        data1.testDate || data1.labTestDate || data1.appointmentDate || data1.dateOfHospitalization
      );
      let date2 = new Date(
        data2.testDate || data2.labTestDate || data2.appointmentDate || data2.dateOfHospitalization
      );
      return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
    });
  };

  useEffect(() => {
    if (!medicalRecords) {
      setLoading(true);
      fetchData();
    }
    if (!labTests || !healthChecks || !hospitalizations) {
      fetchTestData();
    }
    if (medicalRecords && (labTests || healthChecks || hospitalizations)) {
      let mergeArray: { type: string; data: any }[] = [];
      medicalRecords.forEach((item) => {
        mergeArray.push({ type: 'medical', data: item });
      });
      labTests &&
        labTests.forEach((item) => {
          mergeArray.push({ type: 'lab', data: item });
        });
      healthChecks &&
        healthChecks.forEach((item) => {
          mergeArray.push({ type: 'health', data: item });
        });
      hospitalizations &&
        hospitalizations.forEach((item) => {
          mergeArray.push({ type: 'hospital', data: item });
        });
      const sortedData = sortByDate(mergeArray);
      setAllCombinedData(sortedData);
      setActiveData(sortedData[0]);
      // setFilteredData(sortedData);
      setLoading(false);
    }
  }, [medicalRecords, labTests, healthChecks, hospitalizations]);

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
    return <LinearProgress />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        {/* <div className={classes.topFilters}>
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
        </div> */}
        <Scrollbars
          autoHide={true}
          autoHeight
          autoHeightMax={
            isMediumScreen
              ? 'calc(100vh - 240px)'
              : isSmallScreen
              ? 'calc(100vh - 230px)'
              : 'calc(100vh - 320px)'
          }
        >
          <div className={classes.consultationsList}>
            {allCombinedData &&
              allCombinedData.length > 0 &&
              allCombinedData.map((combinedData: any) => (
                <div onClick={() => setActiveData(combinedData)}>
                  <div className={classes.consultGroupHeader}>
                    <div className={classes.circle}></div>
                    {/* <span>Today, 12 Aug 2019</span> */}
                    <span>{getFormattedDate(combinedData)}</span>
                  </div>
                  <MedicalCard
                    name={getName(combinedData)}
                    isActiveCard={activeData === combinedData}
                  />
                </div>
              ))}
          </div>
        </Scrollbars>
        <div className={classes.addReportActions}>
          <AphButton color="primary" fullWidth>
            Add a Report
          </AphButton>
        </div>
      </div>
      <div className={`${classes.rightSection} ${classes.mobileOverlay}`}>
        <div className={classes.sectionHeader}>
          <div className={classes.headerBackArrow}>
            <AphButton>
              <img src={require('images/ic_back.svg')} />
            </AphButton>
            <span>CBC Details</span>
          </div>
          {/* <div className={classes.headerActions}>
            <AphButton>View Consult</AphButton>
            <div className={classes.downloadIcon}>
              <img src={require('images/ic_download.svg')} alt="" />
            </div>
          </div> */}
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
          {activeData && (
            <div className={classes.medicalRecordsDetails}>
              <div className={classes.cbcDetails}>
                <div className={classes.reportsDetails}>
                  <label>Check-up Date</label>
                  {/* <p>03 May 2019</p> */}
                  <p>{getFormattedDate(activeData)}</p>
                </div>
                <div className={classes.reportsDetails}>
                  <label>Source</label>
                  {/* <p>Apollo Hospital, Jubilee Hills</p> */}
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
                activeData.data.healthCheckSummary) && <ToplineReport activeData={activeData} />}
              {((activeData.data.medicalRecordParameters &&
                activeData.data.medicalRecordParameters.length > 0) ||
                (activeData.data.labTestResultParameters &&
                  activeData.data.labTestResultParameters.length > 0)) && (
                <DetailedFindings activeData={activeData} />
              )}
              {/* {showSpinner ? <CircularProgress /> : <p>coming</p>} */}
              {activeData.data &&
                (activeData.data.prismFileIds ||
                  activeData.data.hospitalizationPrismFileIds ||
                  activeData.data.healthCheckPrismFileIds ||
                  activeData.data.testResultPrismFileIds) && (
                  <RenderImage activeData={activeData} />
                )}
            </div>
          )}
        </Scrollbars>
      </div>
    </div>
  );
};
