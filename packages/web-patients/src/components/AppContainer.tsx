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
import { MedicineCartLanding } from 'components/Cart/MedicineCartLanding';
import { TestsCartLanding } from 'components/Tests/Cart/TestsCartLanding';
import { MedicineLanding } from 'components/Medicine/MedicineLanding';
import { ViewAllBrands } from 'components/Medicine/ViewAllBrands';
import { SearchByBrand } from 'components/Medicine/SearchByBrand';
import { Appointments } from 'components/ConsultRoom/Appointments';
import { ChatRoom } from 'components/ChatRoom/ChatRoom';
import { PrescriptionsLanding } from 'components/Prescriptions/PrescriptionsLanding';
import { MyAccount } from 'components/MyAccount/MyAccount';
import { NotificationSettings } from 'components/Notifications/NotificationSettings';
import { MedicinesCartProvider } from 'components/MedicinesCartProvider';
import { PHRLanding } from 'components/HealthRecords/PHRLanding';
import { AddRecords } from 'components/HealthRecords/AddRecords';
import { OrdersLanding } from 'components/Orders/OrdersLanding';
import { StoragePoc } from 'components/StoragePoc';
// import { TrackJS } from 'trackjs';
import { SearchByMedicine } from 'components/Medicine/SearchByMedicine';
import { MedicineDetails } from 'components/Medicine/MedicineDetails';
import { AddressBook } from 'components/MyAccount/AddressBook';
import Scrollbars from 'react-custom-scrollbars';
import { LocationProvider } from 'components/LocationProvider';
import { SymptomsTracker } from 'components/SymptomsTracker/SymptomsTracker';
import { SymptomsTrackerSDK } from 'components/SymptomsTracker/SymptomsTrackerSDK';
import { TestsLanding } from 'components/Tests/TestsLanding';
import { TestDetails } from 'components/Tests/TestDetails';
import { SearchByTest } from 'components/Tests/SearchByTest';
import { OrderDetails } from 'components/Tests/OrderDetails';
import { DiagnosticsCartProvider } from './Tests/DiagnosticsCartProvider';
import { OrderSummary } from 'components/Tests/OrderSummary';
import { Helmet } from 'react-helmet';
import { TermsAndConditions } from 'components/TermsAndConditions';
import { Privacy } from 'components/Privacy';
import { Faq } from 'components/Faq';
import { SbiLandingPage } from 'components/Partners/SBI/SbiLandingPage';
import { ContactUs } from 'components/ContactUs';
import { CovidLanding } from 'components/Covid/CovidLanding';
import { CovidArticleDetails } from 'components/Covid/CovidArticleDetails';
import { AboutUs } from 'components/AboutUs';
import { Help } from 'components/Help/Help';
import { MyPayments } from 'components/MyAccount/MyPayments';
import { PayMedicine } from 'components/PayMedicine';


const useStyles = makeStyles((theme: Theme) => {
  return {
    app: {
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(to bottom, #f0f1ec, #dcdfce)',
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 72,
      },
      [theme.breakpoints.down(900)]: {
        paddingBottom: 55,
      },
    },
    helpIcon: {
      display: 'none',
    },
    noHeaders: {
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
      },
    },
  };
});

const App: React.FC = () => {
  const classes = useStyles({});
  const { signInError, isSignedIn } = useAuth();
  const currentPath = window.location.pathname;
  const pageName = window.location.pathname;

  useEffect(() => {
    if (signInError) window.alert('Error signing in :(');
  }, [signInError]);

  return (
    <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh'}>
      <div className={`${classes.app}`}>
        <Helmet>
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.PLACE_API_KEY}&libraries=places`}
          ></script>
        </Helmet>
        <Switch>
          <Route exact path={clientRoutes.welcome()} component={Welcome} />
          <Route exact path={clientRoutes.aboutUs()} component={AboutUs} />
          <Route exact path={clientRoutes.covidLanding()} component={CovidLanding} />
          <Route exact path={clientRoutes.covidDetails()} component={CovidArticleDetails} />
          <Route exact path={clientRoutes.patients()} component={PatientsList} />
          <Route exact path={clientRoutes.cartPoc()} component={CartPoc} />
          <Route exact path={clientRoutes.storagePoc()} component={StoragePoc} />
          <Route exact path={clientRoutes.termsConditions()} component={TermsAndConditions} />
          <Route exact path={clientRoutes.privacy()} component={Privacy} />
          <Route exact path={clientRoutes.FAQ()} component={Faq} />
          <Route exact path={clientRoutes.contactUs()} component={ContactUs} />
          <Route exact path={clientRoutes.partnerSBI()} component={SbiLandingPage} />
          <AuthRouted exact path={clientRoutes.testsCart()} component={TestsCartLanding} />
          <Route exact path={clientRoutes.doctorDetails(':id')} component={DoctorDetails} />
          <Route exact path={clientRoutes.doctorsLanding()} component={DoctorsLanding} />
          <Route exact path={clientRoutes.medicines()} component={MedicineLanding} />
          <Route exact path={clientRoutes.medicinesLandingViewCart()} component={MedicineLanding} />
          <Route exact path={clientRoutes.payMedicine()} component={PayMedicine} />
          <AuthRouted
            exact
            path={clientRoutes.medicinesCartInfo(':orderAutoId', ':orderStatus')}
            component={MedicineLanding}
          />
          <Route exact path={clientRoutes.medicinesCart()} component={MedicineCartLanding} />
          <Route exact path={clientRoutes.medicineAllBrands()} component={ViewAllBrands} />
          <Route exact path={clientRoutes.medicineDetails(':sku')} component={MedicineDetails} />
          <Route
            exact
            path={clientRoutes.medicinesCartFailed(':orderAutoId', ':orderStatus')}
            component={MedicineCartLanding}
          />
          <Route
            exact
            path={clientRoutes.searchByMedicine(':searchMedicineType', ':searchText')}
            component={SearchByMedicine}
          />
          <Route exact path={clientRoutes.medicineSearchByBrand(':id')} component={SearchByBrand} />
          <AuthRouted
            exact
            path={clientRoutes.prescriptionsLanding()}
            component={PrescriptionsLanding}
          />
          <AuthRouted exact path={clientRoutes.appointments()} component={Appointments} />
          <AuthRouted exact path={clientRoutes.appointmentSuccess()} component={Appointments} />
          <AuthRouted
            exact
            path={clientRoutes.chatRoom(':appointmentId', ':doctorId')}
            component={ChatRoom}
          />
          <AuthRouted exact path={clientRoutes.myAccount()} component={MyAccount} />
          <AuthRouted exact path={clientRoutes.addressBook()} component={AddressBook} />
          <AuthRouted exact path={clientRoutes.needHelp()} component={Help} />
          <AuthRouted exact path={clientRoutes.myPayments()} component={MyPayments} />
          <AuthRouted
            exact
            path={clientRoutes.notificationSettings()}
            component={NotificationSettings}
          />
          <AuthRouted exact path={clientRoutes.healthRecords()} component={PHRLanding} />
          <AuthRouted exact path={clientRoutes.addRecords()} component={AddRecords} />
          <AuthRouted exact path={clientRoutes.yourOrders()} component={OrdersLanding} />
          <Route exact path={clientRoutes.symptomsTrackerFor()} component={SymptomsTracker} />
          <Route exact path={clientRoutes.symptomsTracker()} component={SymptomsTrackerSDK} />
          <AuthRouted exact path={clientRoutes.tests()} component={TestsLanding} />
          <AuthRouted
            exact
            path={clientRoutes.testDetails(':searchTestType', ':itemName', ':itemId')}
            component={TestDetails}
          />
          <AuthRouted
            exact
            path={clientRoutes.searchByTest(':searchType', ':searchTestText')}
            component={SearchByTest}
          />
          <AuthRouted exact path={clientRoutes.testOrders()} component={OrderDetails} />
          <AuthRouted exact path={clientRoutes.orderSummary(':id')} component={OrderSummary} />{' '}
        </Switch>
      </div>
    </Scrollbars>
  );
};

const theme = createMuiTheme({ ...aphTheme });

const AppContainer: React.FC = () => {
  // TrackJS.install({
  //   token: 'b85489445e5f4b48a0ffe851082f8e37',
  //   application: process.env.NODE_ENV, // for more configuration options, see https://docs.trackjs.com
  // });

  return (
    <BrowserRouter>
      <AuthProvider>
        <AphThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <MedicinesCartProvider>
              <DiagnosticsCartProvider>
                <LocationProvider>
                  <App />
                </LocationProvider>
              </DiagnosticsCartProvider>
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
