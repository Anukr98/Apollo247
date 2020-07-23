import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { Header } from 'components/Header';
import { Consultations } from 'components/HealthRecords/Consultations';
import { MedicalRecords } from 'components/HealthRecords/MedicalRecords';
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

export const PHRLanding: React.FC<LandingProps> = (props) => {
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
  const [prescriptions, setPrescriptions] = useState<(PrescriptionsType | null)[] | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const { isSigningIn } = useAuth();
  const [allCombinedData, setAllCombinedData] = useState<any | null>();
  const [activeMedicalData, setActiveMedicalData] = useState<any | null>(null);
  const [medicalError, setMedicalError] = useState<boolean>(false);
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  useEffect(() => {
    if (
      (props && props.location && props.location.state === 'medical') ||
      window.location.href.includes('active=medical')
    ) {
      setTabValue(1);
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
            setLabResults(prismMedicalRecords.labResults.response || []);
          }
          if (prismMedicalRecords.prescriptions && prismMedicalRecords.prescriptions.response) {
            setPrescriptions(prismMedicalRecords.prescriptions.response);
          }
        } else {
          setLabResults([]);
          setPrescriptions([]);
        }
        setMedicalError(false);
      })
      .catch((error) => {
        console.log(error);
        setMedicalError(true);
        setMedicalLoading(false);
      });
  };

  const sortByDate = (array: { type: string; data: any }[], type: string) => {
    if (type === 'medRecords') {
      return array.sort(({ data: data1 }, { data: data2 }) => {
        let date1 = moment(data1.date)
          .toDate()
          .getTime();
        let date2 = moment(data2.date)
          .toDate()
          .getTime();
        return date1 > date2 ? -1 : date1 < date2 ? 1 : data2.id - data1.id;
      });
    } else {
      return array.sort((a: any, b: any) => {
        let date1 = moment(a.bookingDate || a.date || a.quoteDateTime)
          .toDate()
          .getTime();
        let date2 = moment(b.bookingDate || b.date || b.quoteDateTime)
          .toDate()
          .getTime();
        return date1 > date2 ? -1 : date1 < date2 ? 1 : a.id - b.id;
      });
    }
  };

  useEffect(() => {
    if (!isSigningIn && !labResults && !prescriptions) {
      setMedicalLoading(true);
      fetchPrismData();
    }
  }, [labResults, prescriptions, isSigningIn]);

  useEffect(() => {
    if (labResults) {
      let mergeArray: { type: string; data: any }[] = [];
      labResults &&
        labResults.forEach((item: LabResultsType) => {
          mergeArray.push({ type: 'lab', data: item });
        });
      const sortedData = sortByDate(mergeArray, 'medRecords');
      if (!isSmallScreen && sortedData && sortedData.length) {
        setActiveMedicalData(sortedData[0]);
      }
      setAllCombinedData(sortedData);
      setMedicalLoading(false);
    }
  }, [labResults]);

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
      const sortedData = sortByDate(consultsAndMedOrders, 'consults');
      setAllConsultsData(sortedData);
    }
  }, [consultsData, medicalRecords, prescriptions]);

  const deleteReportMutation = useMutation(DELETE_PATIENT_MEDICAL_RECORD);

  const deleteReport = (id: string, type: string) => {
    setMedicalLoading(true);
    deleteReportMutation({
      variables: { recordId: id },
      fetchPolicy: 'no-cache',
    })
      .then((_data) => {
        if (type === 'lab') {
          const newRecords = labResults && labResults.filter((record: any) => record.id !== id);
          setLabResults(newRecords);
        } else if (type === 'prescription') {
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
                    label={`Consults & Rx — ${allConsultsData ? allConsultsData.length : 0}`}
                  />
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label={`Medical Records — ${allCombinedData ? allCombinedData.length : 0}`}
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
                      allCombinedData={allCombinedData}
                      activeData={activeMedicalData}
                      setActiveData={setActiveMedicalData}
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

// previous code

// const consultsAndMedOrders: { [key: string]: any } = {};

// const medOrders = _data.data.getPatientPastConsultsAndPrescriptions!.medicineOrders || [];
// const consultsAndMedOrders: { [key: string]: any } = {};

// consults.forEach((c) => {
//   consultsAndMedOrders[c!.bookingDate] = {
//     ...consultsAndMedOrders[c!.bookingDate],
//     ...c,
//   };
// });

// medOrders.forEach((c) => {
//   consultsAndMedOrders[c!.quoteDateTime] = {
//     ...consultsAndMedOrders[c!.quoteDateTime],
//     ...c,
//   };
// });
// const array = Object.keys(consultsAndMedOrders)
//   .map((i) => consultsAndMedOrders[i])
//   .sort(
//     (a: any, b: any) =>
//       moment(b.bookingDate || b.quoteDateTime)
//         .toDate()
//         .getTime() -
//       moment(a.bookingDate || a.quoteDateTime)
//         .toDate()
//         .getTime()
//   )
//   .filter(
//     (i) =>
//       (!i.patientId && (i.prescriptionImageUrl || i.prismPrescriptionFileId)) ||
//       i.patientId
//   );
// setConsultsData(array);
// setAllConsultsData(array);

// const fetchData = () => {
//   client
//     .query<getPatientMedicalRecords>({
//       query: GET_MEDICAL_RECORD,
//       variables: {
//         patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
//       },
//       fetchPolicy: 'no-cache',
//     })
//     .then(({ data }) => {
//       if (data && data.getPatientMedicalRecords && data.getPatientMedicalRecords.medicalRecords) {
//         setMedicalRecords(data.getPatientMedicalRecords.medicalRecords);
//       } else {
//         setMedicalRecords([]);
//       }
//       setMedicalRecordError(false);
//     })
//     .catch((error) => {
//       setIsAlertOpen(true);
//       setAlertMessage(error);
//       setMedicalRecordError(true);
//       setMedicalLoading(false);
//     });
// };

// useEffect(() => {
//   if (!isSigningIn) {
//     if (!medicalRecords) {
//       setMedicalLoading(true);
//       fetchData();
//     }
//     if (!labTests && !healthChecks && !hospitalizations) {
//       fetchTestData();
//     }
//   }
//   if (labTests || healthChecks || hospitalizations) {
//     let mergeArray: { type: string; data: any }[] = [];
//     // medicalRecords.forEach((item) => {
//     //   mergeArray.push({ type: 'medical', data: item });
//     // });
//     labTests &&
//       labTests.forEach((item) => {
//         mergeArray.push({ type: 'lab', data: item });
//       });
//     healthChecks &&
//       healthChecks.forEach((item) => {
//         mergeArray.push({ type: 'health', data: item });
//       });
//     hospitalizations &&
//       hospitalizations.forEach((item) => {
//         mergeArray.push({ type: 'hospital', data: item });
//       });
//     const sortedData = sortByDate(mergeArray);
//     if (!isSmallScreen && sortedData && sortedData.length) {
//       setActiveMedicalData(sortedData[0]);
//     }
//     setAllCombinedData(sortedData);
//     setMedicalLoading(false);
//   }
// }, [medicalRecords, labTests, healthChecks, hospitalizations, isSigningIn]);
