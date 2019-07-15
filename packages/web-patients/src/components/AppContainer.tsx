import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import React, { useEffect } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Welcome } from 'components/Welcome';
import { PatientsList } from 'components/PatientsList';
import { AuthProvider } from 'components/AuthProvider';
import { useAuth } from 'hooks/authHooks';
import { makeStyles } from '@material-ui/styles';
import { Theme, createMuiTheme } from '@material-ui/core';
import { AphThemeProvider, aphTheme } from '@aph/web-ui-components';
import { DoctorDetails } from 'components/DoctorDetails';
import { DatePicker, MuiPickersUtilsProvider, MaterialUiPickersDate } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DoctorsListing } from './DoctorsListing';
import { DoctorsLanding } from './DoctorsLanding';

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
      <Route exact path={clientRoutes.patients()} component={PatientsList} />
      <Route exact path={clientRoutes.doctorDetails()} component={DoctorDetails} />
      <Route exact path={clientRoutes.doctorsLanding()} component={DoctorsLanding} />
      <Route exact path={clientRoutes.doctorsListing()} component={DoctorsListing} />
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
