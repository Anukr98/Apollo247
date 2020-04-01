import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { Header } from 'components/Header';
import { Consultations } from 'components/HealthRecords/Consultations';
import { MedicalRecords } from 'components/HealthRecords/MedicalRecords';
import { NavigationBottom } from 'components/NavigationBottom';
import { GET_PAST_CONSULTS_PRESCRIPTIONS } from '../../graphql/profiles';
import { getPatientPastConsultsAndPrescriptions } from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import { GET_MEDICAL_PRISM_RECORD, GET_MEDICAL_RECORD } from '../../graphql/profiles';
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
import { useAuth } from 'hooks/authHooks';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useMutation } from 'react-apollo-hooks';
import { DELETE_PATIENT_MEDICAL_RECORD } from '../../graphql/profiles';

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
      borderRadius: '0 0 10px 10px',
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
  const [consultsData, setConsultsData] = useState<any[] | null>();
  const [allConsultsData, setAllConsultsData] = useState<any[] | null>(null);

  const [medicalRecords, setMedicalRecords] = useState<(MedicalRecordsType | null)[] | null>(null);
  const [medicalLoading, setMedicalLoading] = useState<boolean>(false);
  const [labTests, setLabTests] = useState<(LabTestsType | null)[] | null>(null);
  const [healthChecks, setHealthChecks] = useState<(HealthChecksType | null)[] | null>(null);
  const [hospitalizations, setHospitalizations] = useState<(HospitalizationsType | null)[] | null>(
    null
  );
  const { isSigningIn } = useAuth();
  const [allCombinedData, setAllCombinedData] = useState<any | null>();
  const [activeMedicalData, setActiveMedicalData] = useState<any | null>(null);
  const [medicalError, setMedicalError] = useState<boolean>(false);
  const [medicalRecordError, setMedicalRecordError] = useState<boolean>(false);
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

  const fetchPastData = () => {
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
          setConsultError(false);
          setConsultsLoading(false);
          setConsultsData(array);
          setAllConsultsData(array);
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
      fetchPastData();
    }
  }, [consultsData, currentPatient]);

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
        } else {
          setMedicalRecords([]);
        }
        setMedicalRecordError(false);
      })
      .catch((error) => {
        alert(error);
        setMedicalRecordError(true);
        setMedicalLoading(false);
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
        } else {
          setLabTests([]);
          setHealthChecks([]);
          setHospitalizations([]);
        }
        setMedicalError(false);
      })
      .catch((error) => {
        console.log(error);
        setMedicalError(true);
        setMedicalLoading(false);
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

  const deleteReportMutation = useMutation(DELETE_PATIENT_MEDICAL_RECORD);

  const deleteReport = (id: string, type: string) => {
    setMedicalLoading(true);
    deleteReportMutation({
      variables: { recordId: id },
      fetchPolicy: 'no-cache',
    })
      .then((_data) => {
        if (type === 'medical') {
          const newRecords =
            medicalRecords && medicalRecords.filter((record: any) => record.id !== id);
          setMedicalRecords(newRecords);
        } else if (type === 'lab') {
          const newRecords = labTests && labTests.filter((record: any) => record.id !== id);
          setLabTests(newRecords);
        } else if (type === 'health') {
          const newRecords = healthChecks && healthChecks.filter((record: any) => record.id !== id);
          setHealthChecks(newRecords);
        } else if (type === 'hospital') {
          const newRecords =
            hospitalizations && hospitalizations.filter((record: any) => record.id !== id);
          setHospitalizations(newRecords);
        }
      })
      .catch((e) => {
        console.log('Error occured while render Delete MedicalOrder', { e });
      });
  };

  useEffect(() => {
    if (!isSigningIn) {
      if (!medicalRecords) {
        setMedicalLoading(true);
        fetchData();
      }
      if (!labTests && !healthChecks && !hospitalizations) {
        fetchTestData();
      }
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
      if (!isSmallScreen && sortedData && sortedData.length) {
        setActiveMedicalData(sortedData[0]);
      }
      setAllCombinedData(sortedData);
      setMedicalLoading(false);
    }
  }, [medicalRecords, labTests, healthChecks, hospitalizations, isSigningIn]);
  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.healthRecordsPage}>
          <Tabs
            value={tabValue}
            classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
            onChange={(e, newValue) => {
              setTabValue(newValue);
            }}
          >
            <Tab
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label={`Consults & Rx — ${consultsData ? consultsData.length : 0}`}
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
                setConsultsData={setConsultsData}
              />
            </TabContainer>
          )}
          {tabValue === 1 && (
            <TabContainer>
              <MedicalRecords
                error={medicalError || medicalRecordError}
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
      <NavigationBottom />
    </div>
  );
};
