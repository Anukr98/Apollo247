import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import React, { useEffect } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Welcome } from 'components/Welcome';
import { AuthProvider } from 'components/AuthProvider';
import { useAuth } from 'hooks/authHooks';
import { makeStyles } from '@material-ui/styles';
import { Theme, createMuiTheme } from '@material-ui/core';
import { AphThemeProvider, aphTheme } from '@aph/web-ui-components';
import { DoctorDetails } from 'components/DoctorDetails';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DoctorsLanding } from 'components/DoctorsLanding';
import { AuthRouted } from 'components/AuthRouted';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'dev';
      WEB_PATIENTS_PORT: string;
      API_GATEWAY_PORT: string;
      GOOGLE_APPLICATION_CREDENTIALS: string;
      FIREBASE_PROJECT_ID: string;
    }
  }
}

const useStyles = makeStyles((theme: Theme) => {
  return {
    app: {
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(to bottom, #f0f1ec, #dcdfce)',
      paddingBottom: 70,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 90,
      },
    },
  };
});

const App: React.FC = () => {
  const classes = useStyles();
  const { signInError } = useAuth();
  useEffect(() => {
    if (signInError) window.alert('Error signing in :(');
  }, [signInError]);
  return (
    <div className={classes.app}>
      <Route exact path={clientRoutes.welcome()} component={Welcome} />
      <AuthRouted exact path={clientRoutes.doctorDetails(':id')} component={DoctorDetails} />
      <AuthRouted exact path={clientRoutes.doctorsLanding()} component={DoctorsLanding} />
    </div>
  );
};

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

const rhlConfig = ({ hotHooks: true } as any) as Partial<Config>;
setConfig(rhlConfig);
const HotAppContainer = hot(AppContainer);

export { HotAppContainer as AppContainer };
