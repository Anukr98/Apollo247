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
import { CREATE_APPOINTMENT_SESSION } from 'graphql/profiles';
import { REQUEST_ROLES } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    consultRoom: {
      paddingTop: 68,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 68,
      },
    },
    caseSheet: {
      minHeight: 'calc(100vh - 360px)',
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
  };
});
type Params = { id: string };
export const ConsultTabs: React.FC = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState<number>(1);
  const [startConsult, setStartConsult] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [appointmentDateTime, setappointmentDateTime] = useState<string>('');
  const [doctorId, setdoctorId] = useState<string>('');
  const [patientId, setpatientId] = useState<string>('');
  const [loaded, setLoaded] = useState<boolean>(false);
  const params = useParams<Params>();
  const paramId = params.id;
  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };
  const client = useApolloClient();
  useEffect(() => {
    if (appointmentId !== paramId && paramId !== '') {
      setAppointmentId(paramId);
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
          setLoaded(true);
          setsessionId(_data.data.createAppointmentSession.sessionId);
          settoken(_data.data.createAppointmentSession.appointmentToken);
          setappointmentDateTime(_data.data.createAppointmentSession.appointmentDateTime);
          setdoctorId(_data.data.createAppointmentSession.doctorId);
          setpatientId(_data.data.createAppointmentSession.patientId);
        })
        .catch((e: any) => {
          console.log('Error occured creating session', e);
        });
    }
    return () => {
      const cookieStr = `action=`;
      document.cookie = cookieStr + ';path=/;';
    };
  }, [paramId, appointmentId]);

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
        <div className={classes.container}>
          <CallPopover
            setStartConsultAction={(flag: boolean) => setStartConsultAction(flag)}
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
                  className={classes.pointerNone}
                />
                <Tab
                  classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                  label="Chat"
                />
              </Tabs>
            </div>
            {tabValue === 0 && (
              <TabContainer>
                <div className={classes.caseSheet}>Case sheet</div>
              </TabContainer>
            )}
            {tabValue === 1 && (
              <TabContainer>
                <div className={classes.chatContainer}>
                  <ConsultRoom
                    startConsult={startConsult}
                    sessionId={sessionId}
                    token={token}
                    appointmentId={appointmentId}
                    doctorId={doctorId}
                    patientId={patientId}
                  />
                </div>
              </TabContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
