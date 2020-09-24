import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { Header } from 'components/Header';
import { Consultations } from 'components/HealthRecords/Consultations';
import { MedicalRecords } from 'components/HealthRecords/MedicalRecords';
import { HealthCheck } from 'components/HealthRecords/HealthCheck';
import { Hospitalization } from 'components/HealthRecords/Hospitalization';
import { NavigationBottom } from 'components/NavigationBottom';
import { GET_PAST_CONSULTS_PRESCRIPTIONS } from '../../graphql/profiles';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults as ConsultsType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders as medicineOrdersType,
} from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import { GET_MEDICAL_PRISM_RECORD } from '../../graphql/profiles';
import {
  getPatientPrismMedicalRecords,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response as LabResultsType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response as PrescriptionsType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response as HealthCheckType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response as HospitalizationType,
} from '../../graphql/types/getPatientPrismMedicalRecords';
import { useAuth, useCurrentPatient } from 'hooks/authHooks';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useMutation } from 'react-apollo-hooks';
import { DELETE_PATIENT_MEDICAL_RECORD } from '../../graphql/profiles';
import { Alerts } from 'components/Alerts/Alerts';
import { MyProfile } from 'components/MyAccount/MyProfile';
import {
  phrConsultTabClickTracking,
  phrMedicalRecordsTabClickTracking,
} from '../../webEngageTracking';
import { BottomLinks } from 'components/BottomLinks';
import { MedicalRecordType } from '../../graphql/types/globalTypes';
import { isNumeric } from 'validator';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    healthRecordsPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 0,
      },
    },
    tabsRoot: {
      marginLeft: 20,
      marginRight: 20,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 0,
        marginRight: 0,
        backgroundColor: '#f7f8f5',
      },
    },
    tabRoot: {
      fontSize: 13,
      fontWeight: 600,
      textAlign: 'center',
      padding: '11px 32px',
      color: '#02475b',
      opacity: 1,
      textTransform: 'none',
      [theme.breakpoints.down('xs')]: {
        fontSize: 12,
        padding: 11,
      },
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 5,
    },
    rootTabContainer: {
      padding: 0,
    },
    myAccountPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    myAccountSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    leftSection: {
      width: 328,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 15,
      paddingTop: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingTop: 56,
        paddingRight: 0,
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

type LandingProps = {
  location: {
    state: string;
    search: string;
  };
};

const PHRLanding: React.FC<LandingProps> = (props) => {
  const classes = useStyles({});
  const [tabValue, setTabValue] = useState<number>(0);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [consultsLoading, setConsultsLoading] = useState<boolean>(false);
  const [consultError, setConsultError] = useState<boolean>(false);
  const [consultsData, setConsultsData] = useState<ConsultsType[] | null>();
  const [allConsultsData, setAllConsultsData] = useState<any[] | null>(null);

  const [medicalRecords, setMedicalRecords] = useState<(medicineOrdersType | null)[] | null>(null);
  const [medicalLoading, setMedicalLoading] = useState<boolean>(false);
  const [labResults, setLabResults] = useState<(LabResultsType | null)[] | null>(null);
  const [healthChecks, setHealthChecks] = useState<(HealthCheckType | null)[] | null>(null);
  const [hospitalizations, setHospitalization] = useState<(HospitalizationType | null)[] | null>(
    null
  );
  const [prescriptions, setPrescriptions] = useState<(PrescriptionsType | null)[] | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const { isSigningIn } = useAuth();
  const [activeMedicalData, setActiveMedicalData] = useState<any | null>(null);
  const [activeHealthCheckData, setActiveHealthCheckData] = useState<HealthCheckType | null>(null);
  const [
    activeHospitalizationData,
    setActiveHospitalizationData,
  ] = useState<HospitalizationType | null>(null);
  const [medicalError, setMedicalError] = useState<boolean>(false);
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  useEffect(() => {
    if (
      (props && props.location && props.location.state === 'medical') ||
      window.location.href.includes('active=medical')
    ) {
      setTabValue(1);
      window.history.pushState('', '', '');
    } else if (
      (props && props.location && props.location.state === 'healthCheck') ||
      window.location.href.includes('active=healthCheck')
    ) {
      setTabValue(2);
      window.history.pushState('', '', '');
    } else if (
      (props && props.location && props.location.state === 'hospitalization') ||
      window.location.href.includes('active=hospitalization')
    ) {
      setTabValue(3);
      window.history.pushState('', '', '');
    }
  }, [props]);

  const fetchPastConsultsData = () => {
    setConsultsLoading(true);
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
          setConsultError(false);
          setConsultsLoading(false);
          setConsultsData(consults);
          setMedicalRecords(medOrders);
        })
        .catch((e) => {
          const error = JSON.parse(JSON.stringify(e));
          setConsultError(true);
          setConsultsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (!consultsData) {
      fetchPastConsultsData();
    }
  }, [consultsData, currentPatient]);

  const sortByDateRecords = (array: any) => {
    return array.sort(
      (
        data1: HealthCheckType | HospitalizationType | LabResultsType,
        data2: HealthCheckType | HospitalizationType | LabResultsType
      ) => {
        const date1 = moment(data1.dateTime)
          .toDate()
          .getTime();
        const date2 = moment(data2.dateTime)
          .toDate()
          .getTime();
        return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
      }
    );
  };

  const fetchPrismData = () => {
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
          const prismMedicalRecords = data.getPatientPrismMedicalRecords;
          if (prismMedicalRecords.labResults && prismMedicalRecords.labResults.response) {
            const sortedData = sortByDateRecords(prismMedicalRecords.labResults.response);
            if (!isSmallScreen && sortedData && sortedData.length) {
              setActiveMedicalData(sortedData[0]);
            }
            setLabResults(sortedData as LabResultsType[]);
          }
          if (prismMedicalRecords.prescriptions && prismMedicalRecords.prescriptions.response) {
            setPrescriptions(prismMedicalRecords.prescriptions.response);
          }
          if (prismMedicalRecords.healthChecksNew && prismMedicalRecords.healthChecksNew.response) {
            const sortedData = sortByDateRecords(prismMedicalRecords.healthChecksNew.response);
            setHealthChecks(sortedData as HealthCheckType[]);
            if (!isSmallScreen && sortedData && sortedData.length) {
              setActiveHealthCheckData(sortedData[0]);
            }
          }
          if (
            prismMedicalRecords.hospitalizationsNew &&
            prismMedicalRecords.hospitalizationsNew.response
          ) {
            const sortedData = sortByDateRecords(prismMedicalRecords.hospitalizationsNew.response);
            setHospitalization(sortedData as HospitalizationType[]);
            if (!isSmallScreen && sortedData && sortedData.length) {
              setActiveHospitalizationData(sortedData[0]);
            }
          }
        } else {
          setLabResults([]);
          setPrescriptions([]);
          setHealthChecks([]);
          setHospitalization([]);
        }
        setMedicalError(false);
      })
      .catch((error) => {
        console.log(error);
        setMedicalError(true);
      })
      .finally(() => {
        setMedicalLoading(false);
      });
  };

  const sortByDate = (array: any[]) => {
    return array.sort((a: any, b: any) => {
      const date1 = moment(a.bookingDate || a.dateTime || a.quoteDateTime)
        .toDate()
        .getTime();
      const date2 = moment(b.bookingDate || b.dateTime || b.quoteDateTime)
        .toDate()
        .getTime();
      return date1 > date2 ? -1 : date1 < date2 ? 1 : isNaN(parseInt(b.id)) ? 0 : b.id - a.id;
    });
  };

  useEffect(() => {
    if (!isSigningIn && !labResults && !prescriptions && !healthChecks && !hospitalizations) {
      setMedicalLoading(true);
      fetchPrismData();
    }
  }, [labResults, prescriptions, healthChecks, hospitalizations, isSigningIn]);

  useEffect(() => {
    if (consultsData && prescriptions && medicalRecords) {
      const consultsAndMedOrders: any[] = [];
      consultsData.forEach((c) => {
        c.patientId && consultsAndMedOrders.push(c);
      });
      medicalRecords.forEach((c) => {
        (c.prescriptionImageUrl || c.prismPrescriptionFileId) && consultsAndMedOrders.push(c);
      });
      prescriptions.forEach((c) => {
        c.id && consultsAndMedOrders.push(c);
      });
      const sortedData = sortByDate(consultsAndMedOrders);
      setAllConsultsData(sortedData);
    }
  }, [consultsData, medicalRecords, prescriptions]);

  const deleteReportMutation = useMutation(DELETE_PATIENT_MEDICAL_RECORD);

  const deleteReport = (id: string, type: MedicalRecordType) => {
    setMedicalLoading(true);
    deleteReportMutation({
      variables: { recordId: id },
      fetchPolicy: 'no-cache',
    })
      .then((_data) => {
        if (type === MedicalRecordType.TEST_REPORT) {
          const newRecords = labResults && labResults.filter((record: any) => record.id !== id);
          setLabResults(newRecords);
        } else if (type === MedicalRecordType.PRESCRIPTION) {
          const newRecords =
            prescriptions && prescriptions.filter((record: any) => record.id !== id);
          setPrescriptions(newRecords);
        }
      })
      .catch((e) => {
        console.log('Error occured while render Delete MedicalOrder', { e });
      });
  };

  const patient = useCurrentPatient();
  const age = patient && patient.dateOfBirth ? moment().diff(patient.dateOfBirth, 'years') : null;

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.myAccountPage}>
          <div className={classes.myAccountSection}>
            <div className={classes.leftSection}>
              <MyProfile />
            </div>
            <div className={classes.rightSection}>
              <div className={classes.healthRecordsPage}>
                <Tabs
                  value={tabValue}
                  classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
                  onChange={(e, newValue) => {
                    setTabValue(newValue);
                    if (newValue) {
                      phrMedicalRecordsTabClickTracking({ ...patient, age });
                    } else {
                      phrConsultTabClickTracking({ ...patient, age });
                    }
                  }}
                >
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label={`Consults & Rx`}
                  />
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label={`Tests`}
                  />
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label={`Health Check`}
                  />
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label={`Hospitalization`}
                  />
                </Tabs>

                {tabValue === 0 && (
                  <TabContainer>
                    <Consultations
                      loading={consultsLoading}
                      error={consultError}
                      consultsData={consultsData}
                      allConsultsData={allConsultsData}
                    />
                  </TabContainer>
                )}
                {tabValue === 1 && (
                  <TabContainer>
                    <MedicalRecords
                      error={medicalError}
                      loading={medicalLoading}
                      allCombinedData={labResults}
                      activeData={activeMedicalData}
                      setActiveData={setActiveMedicalData}
                      deleteReport={deleteReport}
                      setLabResults={setLabResults}
                    />
                  </TabContainer>
                )}
                {tabValue === 2 && (
                  <TabContainer>
                    <HealthCheck
                      error={medicalError}
                      loading={medicalLoading}
                      allCombinedData={healthChecks}
                      activeData={activeHealthCheckData}
                      setActiveData={setActiveHealthCheckData}
                      deleteReport={deleteReport}
                    />
                  </TabContainer>
                )}
                {tabValue === 3 && (
                  <TabContainer>
                    <Hospitalization
                      error={medicalError}
                      loading={medicalLoading}
                      allCombinedData={hospitalizations}
                      activeData={activeHospitalizationData}
                      setActiveData={setActiveHospitalizationData}
                      deleteReport={deleteReport}
                    />
                  </TabContainer>
                )}
              </div>
            </div>
          </div>
        </div>
        <Alerts
          setAlertMessage={setAlertMessage}
          alertMessage={alertMessage}
          isAlertOpen={isAlertOpen}
          setIsAlertOpen={setIsAlertOpen}
        />
      </div>
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
      <NavigationBottom />
    </div>
  );
};
export default PHRLanding;
