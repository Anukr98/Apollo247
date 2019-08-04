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
import { Consult } from 'components/Consult';
import { Calendar } from 'components/Calendar';
import { ConsultRoom } from 'components/ConsultRoom';
import { ConsultTabs } from 'components/ConsultTabs';
import { AuthProvider } from 'components/AuthProvider';
import { useAuth } from 'hooks/authHooks';
import { aphTheme, AphThemeProvider } from '@aph/web-ui-components';

const App: React.FC = () => {
  const classes = useStyles();
  const { signInError, isSignedIn } = useAuth();
  useEffect(() => {
    if (signInError) window.alert('Error signing in :(');
  }, [signInError]);
  return isSignedIn ? (
    <div className={classes.app}>
      <AuthRouted exact path={clientRoutes.welcome()} render={() => <Redirect to="/profile" />} />
      <AuthRouted exact path={clientRoutes.patients()} component={PatientsList} />
      <AuthRouted exact path={clientRoutes.DoctorsProfile()} component={DoctorsProfile} />
      <AuthRouted exact path={clientRoutes.calendar()} component={Calendar} />
      <AuthRouted exact path={clientRoutes.consultRoom()} component={ConsultRoom} />
      <AuthRouted exact path={clientRoutes.ConsultTabs()} component={ConsultTabs} />
      <AuthRouted exact path={clientRoutes.consult()} component={Consult} />
    </div>
  ) : (
    <div className={classes.app}>
      <Route exact path={clientRoutes.welcome()} component={Welcome} />
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => {
  return {
    app: {
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(to bottom, #f5f8f9, #e6edef)',
      paddingBottom: 70,
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
