import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import { createMuiTheme, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Welcome } from 'components/Welcome';
import { AuthRouted } from 'components/AuthRouted';
import { PatientsList } from 'components/PatientsList';
import { DoctorsProfile } from 'components/DoctorsProfile';
import { MyAccount } from 'components/profileDetails';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { PatientLogDetailsPage } from 'components/PatientLog/PatientLogDetailsPage';
import { Calendar } from 'components/Calendar';
import { PatientLog } from 'components/PatientLog/PatientLog';
import { ConsultTabs } from 'components/ConsultTabs';
import { AuthProvider } from 'components/AuthProvider';
import DateFnsUtils from '@date-io/date-fns';
import { useAuth } from 'hooks/authHooks';
import { aphTheme, AphThemeProvider } from '@aph/web-ui-components';
import { JuniorDoctor } from 'components/JuniorDoctors/JuniorDoctor';
import { PatientDetails } from 'components/JuniorDoctors/PatientDetails';
import { JDProfile } from 'components/JuniorDoctors/JDProfile';
import { JDConsultRoom } from 'components/JuniorDoctors/JDConsultRoom';
import { LoggedInUserType } from 'graphql/types/globalTypes';
import { JDAdminDashboard } from 'components/JDAdmin/JDAdminDashboard';
import { SecretaryDashboard } from 'components/SecretaryDashboard';

const App: React.FC = () => {
  const classes = useStyles();
  const { signInError, isSignedIn } = useAuth();
  useEffect(() => {
    if (signInError)
      window.alert(
        'Sorry, this application is invite only. Please reach out to us at admin@apollo247.com in case you wish to enroll.'
      );
  }, [signInError]);

  const currentUserType = useAuth().currentUserType;

  // TODO Why is this called patient?
  const isJuniorDoctor = useAuth() && currentUserType === LoggedInUserType.JUNIOR;
  const isJDAdmin = useAuth() && currentUserType === LoggedInUserType.JDADMIN;
  const isSecretary = useAuth() && currentUserType === LoggedInUserType.SECRETARY;
  return isSignedIn || isJDAdmin || isSecretary ? (
    // TODO This should all be inside of a <Switch>, why are we rendering multiple routes simultaneously?
    <div className={classes.app}>
      <AuthRouted
        exact
        path={clientRoutes.welcome()}
        render={() =>
          isJDAdmin ? (
            <Redirect to={clientRoutes.juniorDoctorAdmin()} />
          ) : isJuniorDoctor ? (
            <Redirect to={clientRoutes.juniorDoctor()} />
          ) : isSecretary ? (
            <Redirect to={clientRoutes.secretaryDashboard()} />
          ) : (
            <Redirect to={!(isSignedIn && isSignedIn.firebaseToken) ? '/profile' : '/Calendar'} />
          )
        }
      />
      <AuthRouted exact path={clientRoutes.patients()} component={PatientsList} />
      <AuthRouted exact path={clientRoutes.DoctorsProfile()} component={DoctorsProfile} />
      <AuthRouted exact path={clientRoutes.MyAccount()} component={MyAccount} />
      <AuthRouted exact path={clientRoutes.calendar()} component={Calendar} />
      <AuthRouted exact path={clientRoutes.PatientLog()} component={PatientLog} />
      <AuthRouted
        exact
        path={clientRoutes.PatientLogDetailsPage(':appointmentId', ':consultscount')}
        component={PatientLogDetailsPage}
      />
      <AuthRouted
        exact
        path={clientRoutes.ConsultTabs(':id', ':patientId', ':tabValue')}
        component={ConsultTabs}
      />
      <AuthRouted exact path={clientRoutes.juniorDoctor()} component={JuniorDoctor} />
      <AuthRouted exact path={clientRoutes.patientDetails()} component={PatientDetails} />
      <AuthRouted exact path={clientRoutes.juniorDoctorProfile()} component={JDProfile} />
      <AuthRouted exact path={clientRoutes.juniorDoctorAdmin()} component={JDAdminDashboard} />
      <AuthRouted exact path={clientRoutes.secretaryDashboard()} component={SecretaryDashboard} />
      <AuthRouted
        exact
        path={clientRoutes.JDConsultRoom({
          appointmentId: ':appointmentId',
          patientId: ':patientId',
          queueId: ':queueId',
          isActive: ':isActive',
        })}
        component={JDConsultRoom}
      />
    </div>
  ) : (
    // TODO why are there `AuthedRoute`s inside of the "is not signed in" section?
    <div className={classes.app}>
      <Route exact path={clientRoutes.welcome()} component={Welcome} />
      <AuthRouted exact path={clientRoutes.DoctorsProfile()} component={DoctorsProfile} />
      <AuthRouted exact path={clientRoutes.calendar()} component={Calendar} />
      <AuthRouted
        exact
        path={clientRoutes.PatientLogDetailsPage(':appointmentId', ':consultscount')}
        component={PatientLogDetailsPage}
      />
      <AuthRouted
        exact
        path={clientRoutes.ConsultTabs(':id', ':patientId', ':tabValue')}
        component={ConsultTabs}
      />
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => {
  return {
    app: {
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(to bottom, #f5f8f9, #e6edef)',
      paddingBottom: 0,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 20,
      },
    },
  };
});

const theme = createMuiTheme({ ...aphTheme });

const AppContainer: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AphThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <App />
          </MuiPickersUtilsProvider>
        </AphThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

let HotAppContainer = AppContainer;
if (process.env.NODE_ENV === 'local') {
  const rhlConfig = ({ hotHooks: true } as any) as Partial<Config>;
  setConfig(rhlConfig);
  HotAppContainer = hot(AppContainer);
}

export { HotAppContainer as AppContainer };
