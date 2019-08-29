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
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from 'graphql/types/EndAppointmentSession';
import { UpdateCaseSheet, UpdateCaseSheetVariables } from 'graphql/types/UpdateCaseSheet';

import { CREATE_APPOINTMENT_SESSION, GET_CASESHEET, UPDATE_CASESHEET } from 'graphql/profiles';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
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
    block: {
      display: 'block',
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
  const [error, setError] = useState<string>('');
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
  const [otherInstructions, setOtherInstructions] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions[] | null
  >(null);
  const [diagnosticPrescription, setDiagnosticPrescription] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[] | null
  >(null);
  const [medicinePrescription, setMedicinePrescription] = useState<
    GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[] | null
  >(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [consultType, setConsultType] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState<boolean[]>([]);
  const [followUpAfterInDays, setFollowUpAfterInDays] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState<string[]>([]);
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
          setError('');
          _data!.data!.getCaseSheet!.caseSheetDetails!.diagnosis !== null
            ? setDiagnosis((_data!.data!.getCaseSheet!.caseSheetDetails!
                .diagnosis as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis[])
            : setDiagnosis([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.symptoms
            ? setSymptoms((_data!.data!.getCaseSheet!.caseSheetDetails!
                .symptoms as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms[])
            : setSymptoms([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.otherInstructions
            ? setOtherInstructions((_data!.data!.getCaseSheet!.caseSheetDetails!
                .otherInstructions as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions[])
            : setOtherInstructions([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.diagnosticPrescription
            ? setDiagnosticPrescription((_data!.data!.getCaseSheet!.caseSheetDetails!
                .diagnosticPrescription as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription[])
            : setDiagnosticPrescription([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.medicinePrescription
            ? setMedicinePrescription((_data!.data!.getCaseSheet!.caseSheetDetails!
                .medicinePrescription as unknown) as GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription[])
            : setMedicinePrescription([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.notes
            ? setNotes((_data!.data!.getCaseSheet!.caseSheetDetails!.notes as unknown) as string)
            : setNotes('');
          _data!.data!.getCaseSheet!.caseSheetDetails!.consultType
            ? setConsultType(([
                _data!.data!.getCaseSheet!.caseSheetDetails!.consultType,
              ] as unknown) as string[])
            : setConsultType([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.followUp
            ? setFollowUp(([
                _data!.data!.getCaseSheet!.caseSheetDetails!.followUp,
              ] as unknown) as boolean[])
            : setFollowUp([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.followUpAfterInDays
            ? setFollowUpAfterInDays(([
                _data!.data!.getCaseSheet!.caseSheetDetails!.followUpAfterInDays,
              ] as unknown) as string[])
            : setFollowUpAfterInDays([]);
          _data!.data!.getCaseSheet!.caseSheetDetails!.followUpDate
            ? setFollowUpDate(([
                _data!.data!.getCaseSheet!.caseSheetDetails!.followUpDate,
              ] as unknown) as string[])
            : setFollowUpDate([]);
          if (
            _data.data &&
            _data.data.getCaseSheet &&
            _data.data.getCaseSheet.caseSheetDetails &&
            _data.data.getCaseSheet.caseSheetDetails.appointment &&
            _data.data.getCaseSheet.caseSheetDetails.appointment.appointmentDateTime
          ) {
            //setappointmentDateTime('2019-08-27T17:30:00.000Z');
            setappointmentDateTime(
              _data.data.getCaseSheet.caseSheetDetails.appointment.appointmentDateTime
            );
          }
        })
        .catch((e: any) => {
          setError('Error occured in getcasesheet api');
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
    console.log(
      JSON.stringify(symptoms),
      JSON.stringify(diagnosis),
      JSON.stringify(otherInstructions),
      JSON.stringify(diagnosticPrescription),
      JSON.stringify(medicinePrescription),
      notes,
      consultType[0],
      followUp[0],
      followUpAfterInDays[0],
      followUpDate[0]
    );
    client
      .mutate<UpdateCaseSheet, UpdateCaseSheetVariables>({
        mutation: UPDATE_CASESHEET,
        variables: {
          UpdateCaseSheetInput: {
            symptoms: JSON.stringify(symptoms),
            notes,
            diagnosis: JSON.stringify(diagnosis),
            diagnosticPrescription: JSON.stringify(diagnosticPrescription),
            followUp: followUp[0],
            followUpDate: followUpDate[0],
            followUpAfterInDays: followUpAfterInDays[0],
            otherInstructions: JSON.stringify(otherInstructions),
            //medicinePrescription: JSON.stringify(medicinePrescription),
            id: caseSheetId,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        console.log('_data', _data);
        setError('');
        alert('Casesheet updated successfully');
        //const result = _data.data!.updateCaseSheet;
      })
      .catch((e) => {
        setError('Error occured in Updatecasesheet api');
        console.log('Error occured while update casesheet', e);
      });
  };

  const endConsultAction = () => {
    //     client
    // .mutate<EndAppointmentSession, EndAppointmentSessionVariables>({
    // mutation: END_APPOINTMENT_SESSION,
    // variables: {
    // endAppointmentSessionInput: {
    // appointmentId: appointmentId,
    // status: STATUS.COMPLETED,
    // },
    // },
    // fetchPolicy: 'no-cache',
    // })
    // .then((_data) => {
    // console.log('_data', _data);
    // setShowButtons(false);
    // props.onStopConsult();
    // })
    // .catch((e) => {
    // console.log('Error occured while End casesheet', e);
    // const error = JSON.parse(JSON.stringify(e));
    // const errorMessage = error && error.message;
    // console.log('Error occured while End casesheet', errorMessage, error);
    // Alert.alert('Error', errorMessage);
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
        setError('');
      })
      .catch((e: any) => {
        setError('Error occured creating session');
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
            symptoms,
            setSymptoms,
            notes,
            setNotes,
            diagnosis,
            setDiagnosis,
            otherInstructions,
            setOtherInstructions,
            diagnosticPrescription,
            setDiagnosticPrescription,
            medicinePrescription,
            setMedicinePrescription,
            consultType,
            setConsultType,
            followUp,
            setFollowUp,
            followUpAfterInDays,
            setFollowUpAfterInDays,
            followUpDate,
            setFollowUpDate,
          }}
        >
          <div className={classes.container}>
            <CallPopover
              setStartConsultAction={(flag: boolean) => setStartConsultAction(flag)}
              createSessionAction={createSessionAction}
              saveCasesheetAction={saveCasesheetAction}
              endConsultAction={endConsultAction}
              appointmentId={appointmentId}
              appointmentDateTime={appointmentDateTime}
              doctorId={doctorId}
            />
            <div>
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
                <TabContainer>
                  <div className={tabValue !== 0 ? classes.none : classes.block}>
                    {casesheetInfo ? <CaseSheet /> : ''}
                  </div>
                </TabContainer>
                <TabContainer>
                  <div className={tabValue !== 1 ? classes.none : classes.block}>
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
                  </div>
                </TabContainer>
              </div>
            </div>
          </div>
        </CaseSheetContext.Provider>
      )}
    </div>
  );
};
