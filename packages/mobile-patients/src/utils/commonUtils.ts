import { Linking } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  CommonBugFender,
  setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

export const handleDeepLink = (navigationProps: any) => {
  try {
    Linking.addEventListener('url', (event) => {
      console.log('linkingEvent==>', event);
      handleOpenURL(navigationProps, event.url);
      setBugFenderLog('UTIL_handleDeepLink', JSON.stringify(event));
    });
    AsyncStorage.removeItem('location');
  } catch (error) {
    CommonBugFender('SplashScreen_Linking_URL_try', error);
  }
};

export const handleOpenURL = (navigationProps: any, event: any) => {
  try {
    console.log('linkinghandleOpenURL', event);
    let route;
    route = event.replace('apollopatients://', '');

    const data = route.split('?');
    route = data[0];
    setBugFenderLog('UTIL_handleOpenURL', data);
    // console.log(data, 'data');

    let linkId = '';

    try {
      if (data.length >= 2) {
        linkId = data[1].split('&');
        if (linkId.length > 0) {
          linkId = linkId[0];
        }
      }
    } catch (error) {}
    console.log(linkId, 'linkId');

    switch (route) {
      case 'Consult':
        console.log('Consult');
        pushTheView(navigationProps, 'Consult', data.length === 2 ? linkId : undefined);
        break;
      case 'Medicine':
        console.log('Medicine');
        pushTheView(navigationProps, 'Medicine', data.length === 2 ? linkId : undefined);
        break;
      case 'Test':
        console.log('Test');
        pushTheView(navigationProps, 'Test');
        break;
      case 'Speciality':
        console.log('Speciality handleopen');
        if (data.length === 2) pushTheView(navigationProps, 'Speciality', linkId);
        break;
      case 'Doctor':
        console.log('Doctor handleopen');
        if (data.length === 2) pushTheView(navigationProps, 'Doctor', linkId);
        break;
      case 'DoctorSearch':
        console.log('DoctorSearch handleopen');
        pushTheView(navigationProps, 'DoctorSearch');
        break;

      case 'MedicineSearch':
        console.log('MedicineSearch handleopen');
        pushTheView(navigationProps, 'MedicineSearch', data.length === 2 ? linkId : undefined);
        break;

      case 'MedicineDetail':
        console.log('MedicineDetail handleopen');
        pushTheView(navigationProps, 'MedicineDetail', data.length === 2 ? linkId : undefined);
        break;

      case 'MedicineCart':
        console.log('MedicineCart handleopen');
        pushTheView(navigationProps, 'MedicineCart', data.length === 2 ? linkId : undefined);
        break;

      default:
        pushTheView(navigationProps, 'ConsultRoom');
        break;
    }
    console.log('route', route);
  } catch (error) {}
};

export const pushTheView = (navigationProps: any, routeName: String, id?: String) => {
  console.log('pushTheView', routeName);
  setBugFenderLog('UTIL_pushTheView', { routeName, id });
  switch (routeName) {
    case 'Consult':
      // if (id) {
      //   props.navigation.navigate(AppRoutes.ConsultDetailsById, { id: id });
      // } else
      navigationProps.navigate('APPOINTMENTS');
      break;

    case 'Medicine':
      navigationProps.navigate('MEDICINES');
      break;

    case 'MedicineDetail':
      navigationProps.navigate(AppRoutes.MedicineDetailsScene, {
        sku: id,
      });
      break;

    case 'Test':
      navigationProps.navigate('TESTS');
      break;

    case 'ConsultRoom':
      navigationProps.replace(AppRoutes.ConsultRoom);
      break;

    case 'Speciality':
      navigationProps.navigate(AppRoutes.DoctorSearchListing, {
        specialityId: id ? id : '',
      });
      // navigationProps.replace(AppRoutes.DoctorSearchListing, {
      //   specialityId: id ? id : '',
      // });
      break;

    case 'Doctor':
      navigationProps.navigate(AppRoutes.DoctorDetails, {
        doctorId: id,
      });
      break;

    case 'DoctorSearch':
      navigationProps.navigate(AppRoutes.DoctorSearch);
      break;

    case 'MedicineSearch':
      if (id) {
        const [itemId, name] = id.split(',');

        navigationProps.navigate(AppRoutes.SearchByBrand, {
          category_id: itemId,
          title: `${name ? name : 'Products'}`.toUpperCase(),
        });
      }
      break;

    case 'MedicineCart':
      navigationProps.navigate(AppRoutes.YourCart, {
        movedFrom: 'splashscreen',
      });
      break;

    default:
      break;
  }
};

export const getValuesArray = (arr: any) => {
  const finalArr = arr.map((item: any) => item.name);
  return finalArr;
};
