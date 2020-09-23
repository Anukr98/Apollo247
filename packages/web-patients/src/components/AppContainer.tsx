import { aphTheme, AphThemeProvider } from '@aph/web-ui-components';
import DateFnsUtils from '@date-io/date-fns';
import loadable from '@loadable/component';
import { createMuiTheme, Theme } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/styles';
import { AuthProvider } from 'components/AuthProvider';
import { AuthRouted } from 'components/AuthRouted';
import { LocationProvider } from 'components/LocationProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { useAuth } from 'hooks/authHooks';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Config, setConfig } from 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { DiagnosticsCartProvider } from './Tests/DiagnosticsCartProvider';
import { MedicinesCartProvider } from 'components/MedicinesCartProvider';

const Welcome = loadable(() => import('components/Welcome'));

const NotificationSettings = loadable(
  () => import('components/Notifications/NotificationSettings')
);
const SbiLandingPage = loadable(() => import('components/Partners/SBI/SbiLandingPage'));
const PatientsList = loadable(() => import('components/PatientsList'));
const PrescriptionReview = loadable(() => import('components/PrescriptionReview'));
const Privacy = loadable(() => import('components/Privacy'));
const TermsAndConditions = loadable(() => import('components/TermsAndConditions'));
const SymptomsTrackerSDK = loadable(() => import('components/SymptomsTracker/SymptomsTrackerSDK'));
const ContactUs = loadable(() => import('components/ContactUs'));
const AboutUs = loadable(() => import('components/AboutUs'));
const Faq = loadable(() => import('components/Faq'));
const Help = loadable(() => import('components/Help/Help'));
const Loader = loadable(() => import('components/Loader'));
const ClinicCheckout = loadable(() => import('./Checkout/ClinicCheckout'));
const OnlineCheckout = loadable(() => import('components/Checkout/OnlineCheckout'));
const DoctorDetails = loadable(() => import('components/DoctorDetails'));
const MedicineLanding = loadable(() => import('components/Medicine/MedicineLanding'));
const SymptomsTracker = loadable(() => import('components/SymptomsTracker/SymptomsTracker'));
const CovidLanding = loadable(() => import('components/Covid/CovidLanding'));
const KavachLanding = loadable(() => import('components/Covid/KavachLanding'));
const CovidArticleDetails = loadable(() => import('components/Covid/CovidArticleDetails'));
const covidProtocolLanding = loadable(() => import('components/Covid/CovidProtocolLanding'));
const SpecialityListing = loadable(() => import('components/SpecialityListing'));
const DoctorsLanding = loadable(() => import('components/DoctorsLanding'));
// import { Sitemap } from 'components/Sitemap';
const SpecialtyDetails = loadable(() => import('components/Doctors/SpecialtyDetails'));
const Appointments = loadable(() => import('components/Consult/V2/Appointments'));
const ChatRoom = loadable(() => import('components/Consult/V2/ChatRoom/ChatRoom'));
const Prescription = loadable(() => import('components/Consult/V2/Prescription'));
const OrdersLanding = loadable(() => import('components/Orders/OrdersLanding'));
const PayMedicine = loadable(() => import('components/PayMedicine'));
const AddHealthRecords = loadable(() => import('components/HealthRecords/AddHealthRecords'));
const PHRLanding = loadable(() => import('components/HealthRecords/PHRLanding'));
const MedicinePrescriptions = loadable(() => import('./Prescriptions/MedicinePrescriptions'));
const PrescriptionsLanding = loadable(() => import('./Prescriptions/PrescriptionsLanding'));
const MedicineDetails = loadable(() => import('components/Medicine/MedicineDetails'));
const SearchByBrand = loadable(() => import('components/Medicine/SearchByBrand'));
const SearchByMedicine = loadable(() => import('components/Medicine/SearchByMedicine'));
const ViewAllBrands = loadable(() => import('components/Medicine/ViewAllBrands'));
const MedicineSearch = loadable(() => import('components/Medicine/MedicineSearch'));
const TestsCartLanding = loadable(() => import('components/Tests/Cart/TestsCartLanding'));
const MedicineCartLanding = loadable(() => import('components/Cart/MedicineCartLanding'));
const OrderDetails = loadable(() => import('components/Tests/OrderDetails'));
const OrderSummary = loadable(() => import('components/Tests/OrderSummary'));
const SearchByTest = loadable(() => import('components/Tests/SearchByTest'));
const TestDetails = loadable(() => import('components/Tests/TestDetails'));
const TestsLanding = loadable(() => import('components/Tests/TestsLanding'));
const AddressBook = loadable(() => import('components/MyAccount/AddressBook'));
const MyAccount = loadable(() => import('components/MyAccount/MyAccount'));
const MyPayments = loadable(() => import('components/MyAccount/MyPayments'));

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

  useEffect(() => {
    if (signInError) console.log('Error signing in :(');
  }, [signInError]);

  return (
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
        <Route exact path={clientRoutes.kavachLanding()} component={KavachLanding} />
        <Route exact path={clientRoutes.covidDetails()} component={CovidArticleDetails} />
        <Route exact path={clientRoutes.patients()} component={PatientsList} />
        <Route exact path={clientRoutes.termsConditions()} component={TermsAndConditions} />
        <Route exact path={clientRoutes.privacy()} component={Privacy} />
        <Route exact path={clientRoutes.FAQ()} component={Faq} />
        <Route exact path={clientRoutes.contactUs()} component={ContactUs} />
        <Route exact path={clientRoutes.partnerSBI()} component={SbiLandingPage} />
        <AuthRouted exact path={clientRoutes.testsCart()} component={TestsCartLanding} />
        <Route exact path={clientRoutes.doctorDetails(':name', ':id')} component={DoctorDetails} />
        <Route
          exact
          path={clientRoutes.specialtyDoctorDetails(':specialty', ':name', ':id')}
          component={DoctorDetails}
        />
        <Route exact path={clientRoutes.doctorsLanding()} component={DoctorsLanding} />
        <Route exact path={clientRoutes.specialties(':specialty')} component={SpecialtyDetails} />
        <Route
          exact
          path={clientRoutes.citySpecialties(':city', ':specialty')}
          component={SpecialtyDetails}
        />
        <Route exact path={clientRoutes.medicines()} component={MedicineLanding} />
        <Route exact path={clientRoutes.medicineSearch()} component={MedicineSearch} />
        <Route exact path={clientRoutes.medicinesLandingViewCart()} component={MedicineLanding} />
        <AuthRouted exact path={clientRoutes.payMedicine(':payType')} component={PayMedicine} />
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
          path={clientRoutes.medicineCategoryDetails(':searchMedicineType', ':searchText', ':sku')}
          component={MedicineDetails}
        />
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
        <AuthRouted
          exact
          path={clientRoutes.addHealthRecords(':type')}
          component={AddHealthRecords}
        />
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
        <AuthRouted exact path={clientRoutes.orderSummary(':id')} component={OrderSummary} />
        <AuthRouted exact path={clientRoutes.payOnlineConsult()} component={OnlineCheckout} />
        <AuthRouted exact path={clientRoutes.payOnlineClinicConsult()} component={ClinicCheckout} />
        <Route exact path={clientRoutes.prescriptionReview()} component={PrescriptionReview} />
        <Route exact path={clientRoutes.specialityListing()} component={SpecialityListing} />
        <Route exact path={clientRoutes.medicinePrescription()} component={MedicinePrescriptions} />
        <Route exact path={clientRoutes.covidProtocol()} component={covidProtocolLanding} />
        <Route exact path={clientRoutes.prescription(':appointmentId')} component={Prescription} />
      </Switch>
    </div>
  );
};
// @ts-ignore
const theme = createMuiTheme({ ...aphTheme });

const AppContainer: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Loader />
        <AphThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <MedicinesCartProvider>
              <DiagnosticsCartProvider>
                <LocationProvider>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <App />
                  </React.Suspense>
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
