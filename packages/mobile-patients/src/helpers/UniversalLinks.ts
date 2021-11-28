import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { AppRoutes } from '../components/NavigatorContainer';
import { isUpperCase } from '@aph/mobile-patients/src/utils/commonUtils';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';

const handleEncodedURI = (encodedString: string) => {
  const decodedString = decodeURIComponent(encodedString);
  const splittedString = decodedString.split('+');
  if (splittedString.length > 1) {
    return splittedString;
  } else {
    return encodedString.split('%20');
  }
};

export const handleUniversalLinks = (
  universalLinkData: any,
  navigation: NavigationScreenProp<NavigationRoute<object>, object>
) => {
  try {
    let route;

    route = universalLinkData.af_dp.replace('apollopatients://', '');

    const data = route.split('?');
    route = data[0];

    let linkId = '';

    try {
      if (data.length >= 2) {
        linkId = data[1].split('&');
        if (linkId.length > 0) {
          linkId = linkId[0];
        }
      }
    } catch (error) {}

    switch (route) {
      case 'Consult':
        pushTheView('Consult', navigation, data.length === 2 ? linkId : undefined);
        break;

      case 'Medicine':
        pushTheView('Medicine', navigation, data.length === 2 ? linkId : undefined);
        break;

      case 'UploadPrescription':
        pushTheView('UploadPrescription', navigation, data.length === 2 ? linkId : undefined);
        break;

      case 'MedicineRecommendedSection':
        pushTheView('MedicineRecommendedSection', navigation);
        break;

      case 'Test':
        pushTheView('Test', navigation);
        break;

      case 'Speciality':
        if (data.length === 2) pushTheView('Speciality', navigation, linkId);
        break;

      case 'Doctor':
        if (data.length === 2) pushTheView('Doctor', navigation, linkId);
        break;

      case 'DoctorSearch':
        pushTheView('DoctorSearch', navigation);
        break;

      case 'MedicineSearch':
        pushTheView('MedicineSearch', navigation, data.length === 2 ? linkId : undefined);
        break;

      case 'MedicineDetail':
        pushTheView('MedicineDetail', navigation, data.length === 2 ? linkId : undefined);
        break;

      case 'MedicineCart':
        pushTheView('MedicineCart', navigation, data.length === 2 ? linkId : undefined);
        break;

      case 'Order':
        if (data.length === 2) pushTheView('Order', navigation, linkId);
        break;

      case 'MyOrders':
        pushTheView('MyOrders', navigation);
        break;

      case 'webview':
        if (data.length === 2) {
          const url = data[1].replace('param=', '');
          pushTheView('webview', navigation, url);
        }
        break;
      case 'FindDoctors':
        if (data.length === 2) pushTheView('FindDoctors', navigation, linkId);
        break;

      case 'HealthRecordsHome':
        pushTheView('HealthRecordsHome', navigation);
        break;

      case 'ManageProfile':
        pushTheView('ManageProfile', navigation);
        break;

      case 'OneApolloMembership':
        pushTheView('OneApolloMembership', navigation);
        break;

      case 'TestDetails':
        pushTheView('TestDetails', navigation, data.length === 2 ? linkId : undefined);
        break;

      case 'ConsultDetails':
        pushTheView('ConsultDetails', navigation, data.length === 2 ? linkId : undefined);
        break;

      case 'vaccinebooking':
        pushTheView('VaccineBooking', navigation);

      case 'VaccineBooking':
        pushTheView('VaccineBooking', navigation, data.length === 2 ? linkId : undefined);

      case 'vaccinebookingdetail':
        pushTheView('VaccineBookingDetail', navigation, data.length === 2 ? linkId : undefined);

      case 'VaccineBookingDetail':
        pushTheView('VaccineBookingDetail', navigation, data.length === 2 ? linkId : undefined);

      case 'ConsultPackageList':
        pushTheView('ConsultPackageList', navigation);
        break;

      case 'ConsultPackage':
        pushTheView('ConsultPackage', navigation);
        break;

      case 'ConsultPackagePurchased':
        pushTheView('ConsultPackagePurchased', navigation);
        break;

      default:
        pushTheView('ConsultRoom', navigation, undefined);
        break;
    }
  } catch (error) {}
};

const pushTheView = (
  routeName: String,
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  id?: any
) => {
  switch (routeName) {
    case 'Consult':
      navigation.navigate('APPOINTMENTS');
      break;

    case 'Medicine':
      navigation.navigate('MEDICINES');
      break;

    case 'UploadPrescription':
      navigation.navigate('MEDICINES', { showUploadPrescriptionPopup: true });
      break;

    case 'MedicineRecommendedSection':
      navigation.navigate('MEDICINES', { showRecommendedSection: true });
      break;

    case 'MedicineDetail':
      navigation.navigate(AppRoutes.ProductDetailPage, {
        sku: id,
        movedFrom: ProductPageViewedSource.DEEP_LINK,
      });
      break;

    case 'Test':
      navigation.navigate('TESTS');
      break;

    case 'ConsultRoom':
      navigation.replace(AppRoutes.ConsultRoom);
      break;

    case 'Speciality':
      const filtersData = id ? handleEncodedURI(id) : '';
      navigation.navigate(AppRoutes.DoctorSearchListing, {
        specialityId: filtersData[0] ? filtersData[0] : '',
        typeOfConsult: filtersData.length > 1 ? filtersData[1] : '',
        doctorType: filtersData.length > 2 ? filtersData[2] : '',
      });
      break;

    case 'FindDoctors':
      const cityBrandFilter = id ? handleEncodedURI(id) : '';
      navigation.navigate(AppRoutes.DoctorSearchListing, {
        specialityId: cityBrandFilter[0] ? cityBrandFilter[0] : '',
        city:
          cityBrandFilter.length > 1 && !isUpperCase(cityBrandFilter[1])
            ? cityBrandFilter[1]
            : null,
        brand:
          cityBrandFilter.length > 2
            ? cityBrandFilter[2]
            : isUpperCase(cityBrandFilter[1])
            ? cityBrandFilter[1]
            : null,
      });
      break;

    case 'Doctor':
      navigation.navigate(AppRoutes.DoctorDetails, {
        doctorId: id,
      });
      break;

    case 'DoctorSearch':
      navigation.navigate(AppRoutes.DoctorSearch);
      break;

    case 'MedicineSearch':
      if (id) {
        const [itemId, name] = id.split(',');

        navigation.navigate(AppRoutes.MedicineListing, {
          category_id: itemId,
          title: `${name ? name : 'Products'}`.toUpperCase(),
          movedFrom: 'deeplink',
        });
      }
      break;

    case 'MedicineCart':
      navigation.navigate(AppRoutes.MedicineCart, {
        movedFrom: 'splashscreen',
      });
      break;

    case 'Order':
      navigation.navigate(AppRoutes.OrderDetailsScene, {
        goToHomeOnBack: true,
        orderAutoId: isNaN(id) ? '' : id,
        billNumber: isNaN(id) ? id : '',
      });
      break;

    case 'MyOrders':
      navigation.navigate(AppRoutes.YourOrdersScene);
      break;

    case 'webview':
      navigation.navigate(AppRoutes.CommonWebView, {
        url: id,
      });
      break;

    case 'HealthRecordsHome':
      navigation.navigate('HEALTH RECORDS');
      break;

    case 'ManageProfile':
      navigation.navigate(AppRoutes.ManageProfile);
      break;

    case 'OneApolloMembership':
      navigation.navigate(AppRoutes.OneApolloMembership);
      break;

    case 'TestDetails':
      navigation.navigate(AppRoutes.TestDetails, {
        itemId: id,
        comingFrom: 'deeplink',
      });
      break;

    case 'ConsultDetails':
      navigation.navigate(AppRoutes.ConsultDetails, {
        CaseSheet: id,
      });
      break;

    case 'VaccineBooking':
      navigation.navigate(AppRoutes.VaccineBookingScreen, {});
      break;

    case 'VaccineBookingDetail':
      navigation.navigate(AppRoutes.VaccineBookingConfirmationScreen, {
        bookingId: id,
        comingFrom: 'deeplink',
      });
      break;

    case 'ConsultPackageList':
      navigation.navigate(AppRoutes.ConsultPackageList, {
        comingFrom: 'deeplink',
      });
      break;

    case 'ConsultPackage':
      navigation.navigate(AppRoutes.ConsultPackageDetail, {
        comingFrom: 'deeplink',
      });
      break;

    case 'ConsultPackagePurchased':
      navigation.navigate(AppRoutes.ConsultPackagePostPurchase, {
        comingFrom: 'deeplink',
      });
      break;

    default:
      break;
  }
};
