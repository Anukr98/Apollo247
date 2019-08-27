import { setConfig, Config } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
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
import { PatientsList } from 'components/PatientsList';
import { CartPoc } from 'components/CartPoc';
import { CartLanding } from 'components/Cart/CartLanding';
import { MedicineLanding } from 'components/Medicine/MedicineLanding';
import { ConsultRoom } from 'components/ConsultRoom/ConsultRoom';
import { ChatRoom } from 'components/ChatRoom/ChatRoom';
import { PrescriptionsLanding } from 'components/Prescriptions/PrescriptionsLanding';
import { MyAccount } from 'components/MyAccount/MyAccount';
import { NotificationSettings } from 'components/Notifications/NotificationSettings';
import { MedicinesCartProvider } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    app: {
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(to bottom, #f0f1ec, #dcdfce)',
      paddingBottom: 20,
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
      <Switch>
        <Route exact path={clientRoutes.welcome()} component={Welcome} />
        <Route exact path={clientRoutes.patients()} component={PatientsList} />
        <Route exact path={clientRoutes.cartPoc()} component={CartPoc} />
        <AuthRouted exact path={clientRoutes.cartLanding()} component={CartLanding} />
        <AuthRouted exact path={clientRoutes.doctorDetails(':id')} component={DoctorDetails} />
        <AuthRouted exact path={clientRoutes.doctorsLanding()} component={DoctorsLanding} />
        <AuthRouted exact path={clientRoutes.testsAndMedicine()} component={MedicineLanding} />
        <AuthRouted
          exact
          path={clientRoutes.prescriptionsLanding()}
          component={PrescriptionsLanding}
        />
        <AuthRouted exact path={clientRoutes.consultRoom()} component={ConsultRoom} />
        <AuthRouted
          exact
          path={clientRoutes.chatRoom(':appointmentId', ':doctorId')}
          component={ChatRoom}
        />
        <AuthRouted exact path={clientRoutes.myAccount()} component={MyAccount} />
        <AuthRouted
          exact
          path={clientRoutes.notificationSettings()}
          component={NotificationSettings}
        />
      </Switch>
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
            <MedicinesCartProvider>
              <App />
            </MedicinesCartProvider>
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
