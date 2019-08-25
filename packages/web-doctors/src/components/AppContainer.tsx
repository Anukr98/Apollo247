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
import { Calendar } from 'components/Calendar';
import { PatientLog } from 'components/PatientLog/PatientLog';
import { ConsultTabs } from 'components/ConsultTabs';
import { AuthProvider } from 'components/AuthProvider';
import { useAuth } from 'hooks/authHooks';
import { aphTheme, AphThemeProvider } from '@aph/web-ui-components';

const App: React.FC = () => {
  const classes = useStyles();
  const { signInError, isSignedIn } = useAuth();
  useEffect(() => {
    if (signInError)
      window.alert(
        'Sorry, this application is invite only. Please reach out to us at admin@apollo247.com in case you wish to enroll.'
      );
  }, [signInError]);
  return isSignedIn ? (
    <div className={classes.app}>
      <AuthRouted
        exact
        path={clientRoutes.welcome()}
        render={() => <Redirect to={isSignedIn.firebaseToken == '' ? '/profile' : '/Calendar'} />}
      />
      <AuthRouted exact path={clientRoutes.patients()} component={PatientsList} />
      <AuthRouted exact path={clientRoutes.DoctorsProfile()} component={DoctorsProfile} />
      <AuthRouted exact path={clientRoutes.MyAccount()} component={MyAccount} />
      <AuthRouted exact path={clientRoutes.calendar()} component={Calendar} />
      <AuthRouted exact path={clientRoutes.PatientLog()} component={PatientLog} />
      <AuthRouted
        exact
        path={clientRoutes.ConsultTabs(':id', ':patientId')}
        component={ConsultTabs}
      />
    </div>
  ) : (
    <div className={classes.app}>
      <Route exact path={clientRoutes.welcome()} component={Welcome} />
      <AuthRouted exact path={clientRoutes.DoctorsProfile()} component={DoctorsProfile} />
      <AuthRouted exact path={clientRoutes.calendar()} component={Calendar} />
      <AuthRouted
        exact
        path={clientRoutes.ConsultTabs(':id', ':patientId')}
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
      paddingBottom: 20,
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
          <App />
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
