import React, { useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { useParams } from 'hooks/routerHooks';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { CallPopover } from 'components/CallPopover';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { ConsultRoom } from 'components/ConsultRoom';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from 'graphql/types/createAppointmentSession';
import { UpdateCaseSheet, UpdateCaseSheetVariables } from 'graphql/types/UpdateCaseSheet';

import { CREATE_APPOINTMENT_SESSION, GET_CASESHEET, UPDATE_CASESHEET } from 'graphql/profiles';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
} from 'graphql/types/GetCaseSheet';
import { REQUEST_ROLES } from 'graphql/types/globalTypes';
import { CaseSheet } from 'components/case-sheet/CaseSheet';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { useAuth } from 'hooks/authHooks';
import { CaseSheetContext } from 'context/CaseSheetContext';

const useStyles = makeStyles((theme: Theme) => {
  return {
    consultRoom: {
      paddingTop: 64,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 64,
      },
    },
    chatContainer: {
      minHeight: 'calc(100vh - 360px)',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      minHeight: 500,
    },
    tabsRoot: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 0,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    tabRoot: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeightMedium,
      textAlign: 'center',
      color: '#02475b',
      padding: '14px 10px',
      textTransform: 'none',
      width: '50%',
      opacity: 1,
      lineHeight: 'normal',
      [theme.breakpoints.down('xs')]: {
        width: '50%',
      },
    },
    tabSelected: {
      fontWeight: theme.typography.fontWeightBold,
      color: '#02475b',
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    DisplayNone: {
      display: 'none !important',
    },
    typography: {
      padding: theme.spacing(2),
    },
    pointerNone: {
      pointerEvents: 'none',
    },
    none: {
      display: 'none',
    },
  };
});

type Params = { id: string; patientId: string };

export const ConsultTabs: React.FC = () => {
  const classes = useStyles();
  const {
    currentPatient,
  }: { currentPatient: GetDoctorDetails_getDoctorDetails | null } = useAuth();
  const [tabValue, setTabValue] = useState<number>(0);
  const [startConsult, setStartConsult] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [appointmentDateTime, setappointmentDateTime] = useState<string>('');
  const [doctorId, setdoctorId] = useState<string>('');
  const [patientId, setpatientId] = useState<string>('');
  const [caseSheetId, setCaseSheetId] = useState<string>('');
  const [casesheetInfo, setCasesheetInfo] = useState<any>(null);
  const params = useParams<Params>();
  const paramId = params.id;
  const [loaded, setLoaded] = useState<boolean>(false);
  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };
  const client = useApolloClient();

  /* case sheet data*/
  const [symptoms, setSymptoms] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[] | null
  >(null);
  const [diagnosis, setDiagnosis] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[] | null
  >(null);
  /* case sheet data*/

  useEffect(() => {
    if (appointmentId !== paramId && paramId !== '' && currentPatient && currentPatient.id !== '') {
      setAppointmentId(paramId);
      setpatientId(params.patientId);
      setdoctorId(currentPatient.id);

      client
        .query<GetCaseSheet>({
          query: GET_CASESHEET,
          fetchPolicy: 'no-cache',
          variables: { appointmentId: paramId },
        })
        .then((_data) => {
          setCasesheetInfo(_data.data);
          setSymptoms((_data!.data!.getCaseSheet!.caseSheetDetails!
            .symptoms as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[]);
          setDiagnosis((_data!.data!.getCaseSheet!.caseSheetDetails!
            .diagnosis as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[]);
        })
        .catch((e: any) => {
          console.log('Error occured creating session', e);
        })
        .finally(() => {
          setLoaded(true);
        });
    }
    return () => {
      const cookieStr = `action=`;
      document.cookie = cookieStr + ';path=/;';
    };
  }, [paramId, appointmentId]);

  const saveCasesheetAction = () => {
    console.log(symptoms, diagnosis);
    // client
    //  .mutate<UpdateCaseSheet, UpdateCaseSheetVariables>({
    //   mutation:UPDATE_CASESHEET,
    //     variables: {
    //       UpdateCaseSheetInput: {
    //       symptoms:JSON.stringify(getSysmptonsList()),
    //       notes:value,
    //       diagnosis:JSON.stringify(getDiagonsisList()),
    //       diagnosticPrescription:JSON.stringify(getDiagnosticPrescriptionDataList()),
    //       followUp:switchValue,
    //       followUpDate:selectDate,
    //       followUpAfterInDays:sliderValue,
    //       otherInstructions:JSON.stringify(otherInstructionsData),
    //       medicinePrescription:JSON.stringify(getMedicineList()),
    //       id:caseSheetId,
    //     },
    //   },
    //   fetchPolicy:'no-cache',
    //  })
    // .then((_data) => {
    //   console.log('_data', _data);
    //   const result=_data.data!.updateCaseSheet;
    //  })
    // .catch((e) => {
    //   console.log('Error occured while update casesheet', e);
    // });
  };
  const createSessionAction = () => {
    client
      .mutate<CreateAppointmentSession, CreateAppointmentSessionVariables>({
        mutation: CREATE_APPOINTMENT_SESSION,
        variables: {
          createAppointmentSessionInput: {
            appointmentId: paramId,
            requestRole: REQUEST_ROLES.DOCTOR,
          },
        },
      })
      .then((_data: any) => {
        setsessionId(_data.data.createAppointmentSession.sessionId);
        settoken(_data.data.createAppointmentSession.appointmentToken);
        setappointmentDateTime(_data.data.createAppointmentSession.appointmentDateTime);
        setCaseSheetId(_data.data.createAppointmentSession.caseSheetId);
      })
      .catch((e: any) => {
        console.log('Error occured creating session', e);
      });
  };
  const setStartConsultAction = (flag: boolean) => {
    setStartConsult('');
    const cookieStr = `action=${flag ? 'videocall' : 'audiocall'}`;
    document.cookie = cookieStr + ';path=/;';
    setTimeout(() => {
      setStartConsult(flag ? 'videocall' : 'audiocall');
    }, 10);
  };
  // console.log(casesheetInfo);
  return (
    <div className={classes.consultRoom}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      {loaded && (
        <CaseSheetContext.Provider
          value={{
            loading: !loaded,
            caseSheetId: appointmentId,
            patientDetails: casesheetInfo!.getCaseSheet!.patientDetails,
            symptoms: casesheetInfo!.getCaseSheet!.caseSheetDetails!.symptoms,
            setSymptoms,
            notes: casesheetInfo!.getCaseSheet!.caseSheetDetails!.notes,
            diagnosis: casesheetInfo!.getCaseSheet!.caseSheetDetails!.diagnosis,
            setDiagnosis,
          }}
        >
          <div className={classes.container}>
            <CallPopover
              setStartConsultAction={(flag: boolean) => setStartConsultAction(flag)}
              createSessionAction={createSessionAction}
              saveCasesheetAction={saveCasesheetAction}
              appointmentId={appointmentId}
              appointmentDateTime={appointmentDateTime}
              doctorId={doctorId}
            />
            <div>
              <div>
                <Tabs
                  value={tabValue}
                  variant="fullWidth"
                  classes={{
                    root: classes.tabsRoot,
                    indicator: classes.tabsIndicator,
                  }}
                  onChange={(e, newValue) => {
                    setTabValue(newValue);
                  }}
                >
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Case Sheet"
                  />
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Chat"
                  />
                </Tabs>
              </div>
              {tabValue === 0 && (
                <TabContainer>
                  <CaseSheet />
                </TabContainer>
              )}
              {tabValue === 1 && (
                <TabContainer>
                  <div className={classes.chatContainer}>
                    <ConsultRoom
                      startConsult={startConsult}
                      sessionId={sessionId}
                      token={token}
                      appointmentId={paramId}
                      doctorId={doctorId}
                      patientId={patientId}
                    />
                  </div>
                </TabContainer>
              )}
            </div>
          </div>
        </CaseSheetContext.Provider>
      )}
    </div>
  );
};
