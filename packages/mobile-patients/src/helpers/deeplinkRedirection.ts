import {
  NavigationScreenProp,
  NavigationRoute,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import {
  setBugFenderLog,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  postWebEngageEvent,
  readableParam,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
  ProductPageViewedSource,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { AppRoutes, getCurrentRoute } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useApolloClient } from 'react-apollo-hooks';
import { isUpperCase } from '@aph/mobile-patients/src/utils/commonUtils';
import { MutableRefObject } from 'react';
import {
  getAllSpecialties,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import { GET_ALL_SPECIALTIES } from '@aph/mobile-patients/src/graphql/profiles';
import { getMedicineSku } from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';

export const handleOpenURL = (event: any) => {
  try {
    let route;
    let data;
    let linkId = '';
    let attributes = {
      media_source: 'not set',
    };
    const apolloUrl = 'https://www.apollo247.com';
    const a = event.indexOf(apolloUrl);
    if (a == 0) {
      const url = event?.replace(`${apolloUrl}/`, '');
      data = url?.split('/');
      route = data?.[0];
    } else {
      route = event?.replace('apollopatients://', '');
      data = route?.split('?');
      setBugFenderLog('DEEP_LINK_DATA', data);
      route = data?.[0];
    }

    try {
      if (data?.length >= 2) {
        linkId = data?.[1]?.split('&');
        const params = data[1]?.split('&');
        const utmParams = params?.map((item: any) => item.split('='));
        utmParams?.forEach(
          (item: any) => item?.length == 2 && (attributes?.[item?.[0]] = item?.[1])
        );
        if (linkId?.length > 0) {
          linkId = linkId?.[0];
          setBugFenderLog('DEEP_LINK_SPECIALITY_ID', linkId);
        }
      }
    } catch (error) {}

    switch (route) {
      case 'consult':
      case 'Consult':
        return {
          routeName: 'Consult',
          id: data.length === 2 ? linkId : undefined,
        };
        break;

      case 'medicine':
      case 'Medicine':
        return {
          routeName: 'Medicine',
          id: data.length === 2 ? linkId : undefined,
        };
        break;

      case 'uploadprescription':
      case 'UploadPrescription':
        return {
          routeName: 'UploadPrescription',
          id: data.length === 2 ? linkId : undefined,
        };
        break;

      case 'medicinerecommendedsection':
      case 'MedicineRecommendedSection':
        return {
          routeName: 'MedicineRecommendedSection',
        };
        break;

      case 'test':
      case 'Test':
        return {
          routeName: 'Test',
        };
        break;

      case 'speciality':
      case 'Speciality':
        if (data.length === 2) {
          return {
            routeName: 'Speciality',
            id: linkId,
          };
        } else {
          return {
            routeName: 'DoctorSearch',
          };
        }
        break;

      case 'doctor':
      case 'Doctor':
        if (data.length === 2) {
          return {
            routeName: 'Doctor',
            id: linkId,
            timeout: undefined,
            isCall: undefined,
            mediaSource: attributes?.media_source,
          };
        } else {
          return {
            routeName: 'DoctorSearch',
          };
        }
        break;

      case 'doctorsearch':
      case 'DoctorSearch':
        return {
          routeName: 'DoctorSearch',
        };
        break;

      case 'medicinesearch':
      case 'MedicineSearch':
        return {
          routeName: 'MedicineSearch',
          id: data.length === 2 ? linkId : undefined,
        };
        break;

      case 'medicinedetail':
      case 'MedicineDetail':
        return {
          routeName: 'MedicineDetail',
          id: data.length === 2 ? linkId : undefined,
        };
        break;

      case 'medicinecart':
      case 'MedicineCart':
        return {
          routeName: 'MedicineCart',
          id: data.length === 2 ? linkId : undefined,
        };
        break;

      case 'chatroom':
      case 'ChatRoom':
        if (data.length === 2) {
          return {
            routeName: 'ChatRoom_AppointmentData',
            id: linkId,
            isCall: false,
          };
        }
        break;

      case 'doctorcall':
      case 'DoctorCall':
        if (data.length === 2 && getCurrentRoute() !== AppRoutes.ChatRoom) {
          return {
            routeName: 'DoctorCall_AppointmentData',
            id: linkId,
            isCall: false,
          };
        }
        break;

      case 'doctorcallrejected':
      case 'DoctorCallRejected':
        return {
          routeName: 'DoctorCallRejected',
          id: linkId,
        };
        break;

      case 'order':
      case 'Order':
        if (data.length === 2) {
          return {
            routeName: 'Order',
            id: linkId,
          };
        }
        break;

      case 'myorders':
      case 'MyOrders':
        return {
          routeName: 'MyOrders',
        };
        break;

      case 'webview':
        if (data.length >= 1) {
          let url = data[1].replace('param=', '');
          return {
            routeName: 'webview',
            id: url,
          };
        }
        break;

      case 'finddoctors':
      case 'FindDoctors':
        if (data.length === 2) {
          return {
            routeName: 'FindDoctors',
            id: linkId,
          };
        }
        break;

      case 'healthrecordshome':
      case 'HealthRecordsHome':
        return {
          routeName: 'HealthRecordsHome',
        };
        break;

      case 'manageprofile':
      case 'ManageProfile':
        return {
          routeName: 'ManageProfile',
        };
        break;

      case 'oneapollomembership':
      case 'OneApolloMembership':
        return {
          routeName: 'OneApolloMembership',
        };
        break;

      case 'testdetails':
      case 'TestDetails':
        return {
          routeName: 'TestDetails',
          id: data.length === 2 ? linkId : undefined,
        };
        break;

      case 'consultdetails':
      case 'ConsultDetails':
        return {
          routeName: 'ConsultDetails',
          id: data.length === 2 ? linkId : undefined,
        };
        break;

      case 'circlemembershipdetails':
      case 'CircleMembershipDetails':
        return {
          routeName: 'CircleMembershipDetails',
        };
        break;

      case 'testlisting':
      case 'TestListing':
        return {
          routeName: 'TestListing',
          id: data?.length === 2 ? linkId : undefined,
        };
        break;

      case 'testreport':
      case 'TestReport':
        return {
          routeName: 'TestReport',
          id: data?.length === 2 ? linkId : undefined,
        };
        break;

      case 'mytestorders':
      case 'MyTestOrders':
        return {
          routeName: 'MyTestOrders',
        };
        break;

      case 'prescription-review':
        return {
          routeName: 'UploadPrescription',
        };
        break;

      default:
        const eventAttributes: WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED] = {
          source: 'deeplink',
        };
        postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
        return {
          routeName: 'ConsultRoom',
          id: undefined,
          timeout: true,
        };
        break;
    }
  } catch (error) {}
};

export const pushTheView = (
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  routeName: string,
  id?: any,
  isCall?: boolean,
  isCircleMember?: boolean,
  mediaSource?: string,
  voipCallType?: string,
  voipAppointmentId?: MutableRefObject<string>
) => {
  setBugFenderLog('DEEP_LINK_PUSHVIEW', { routeName, id });
  switch (routeName) {
    case 'Consult':
      navigation.navigate('APPOINTMENTS', { movedFrom: 'deeplink' });
      break;
    case 'Medicine':
      navigation.navigate('MEDICINES', { comingFrom: 'deeplink' });
      break;
    case 'UploadPrescription':
      navigation.navigate('MEDICINES', {
        showUploadPrescriptionPopup: true,
        comingFrom: 'deeplink',
      });
      break;
    case 'MedicineRecommendedSection':
      navigation.navigate('MEDICINES', { showRecommendedSection: true, comingFrom: 'deeplink' });
      break;
    case 'MedicineDetail':
      navigateToView(navigation, AppRoutes.ProductDetailPage, {
        sku: id,
        movedFrom: ProductPageViewedSource.DEEP_LINK,
      });
      break;
    case 'Test':
      navigation.navigate('TESTS', { movedFrom: 'deeplink' });
      break;
    case 'ConsultRoom':
      navigation.replace(AppRoutes.ConsultRoom);
      break;
    case 'Speciality':
      setBugFenderLog('APPS_FLYER_DEEP_LINK_COMPLETE', id);
      const filtersData = id ? handleEncodedURI(id) : '';
      navigateToView(navigation, AppRoutes.DoctorSearchListing, {
        specialityId: filtersData[0] ? filtersData[0] : '',
        typeOfConsult: filtersData.length > 1 ? filtersData[1] : '',
        doctorType: filtersData.length > 2 ? filtersData[2] : '',
      });
      break;
    case 'FindDoctors':
      const cityBrandFilter = id ? handleEncodedURI(id) : '';
      navigateToView(navigation, AppRoutes.DoctorSearchListing, {
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
      navigateToView(navigation, AppRoutes.DoctorDetails, {
        doctorId: id,
        fromDeeplink: true,
        mediaSource: mediaSource,
      });
      break;
    case 'DoctorSearch':
      navigateToView(navigation, AppRoutes.DoctorSearch);
      break;
    case 'MedicineSearch':
      if (id) {
        const [itemId, name] = id.split(',');
        navigateToView(navigation, AppRoutes.MedicineListing, {
          category_id: itemId,
          title: `${name ? name : 'Products'}`.toUpperCase(),
          movedFrom: 'deeplink',
        });
      }
      break;
    case 'MedicineCart':
      navigateToView(navigation, AppRoutes.MedicineCart, {
        movedFrom: 'splashscreen',
      });
      break;
    case 'ChatRoom_AppointmentData':
    case 'DoctorCall_AppointmentData':
      navigateToView(navigation, AppRoutes.ChatRoom, {
        data: id,
        callType: voipCallType ? voipCallType?.toUpperCase() : '',
        prescription: '',
        isCall: isCall,
        isVoipCall: voipAppointmentId?.current ? true : false,
      });
      break;
    case 'Order':
      navigateToView(navigation, AppRoutes.OrderDetailsScene, {
        goToHomeOnBack: true,
        orderAutoId: isNaN(id) ? '' : id,
        billNumber: isNaN(id) ? id : '',
      });
      break;
    case 'MyOrders':
      navigateToView(navigation, AppRoutes.YourOrdersScene);
      break;
    case 'webview':
      navigateToView(navigation, AppRoutes.CommonWebView, { url: id });
      break;
    case 'HealthRecordsHome':
      navigation.navigate('HEALTH RECORDS', { movedFrom: 'deeplink' });
      break;
    case 'ManageProfile':
      navigateToView(navigation, AppRoutes.ManageProfile);
      break;
    case 'OneApolloMembership':
      navigateToView(navigation, AppRoutes.OneApolloMembership);
      break;
    case 'TestDetails':
      navigateToView(navigation, AppRoutes.TestDetails, {
        itemId: id,
        movedFrom: 'deeplink',
      });
      break;
    case 'ConsultDetails':
      navigateToView(navigation, AppRoutes.ConsultDetails, {
        CaseSheet: id,
      });
      break;
    case 'DoctorCall':
      navigateToView(navigation, AppRoutes.ChatRoom, {
        data: id,
        callType: voipCallType ? voipCallType?.toUpperCase() : '',
        prescription: '',
        isCall: true,
        isVoipCall: false,
      });
      break;
    case 'SpecialityByName':
      fetchSpecialities(navigation, id);
      break;
    case 'DoctorByNameId':
      const docId = id.slice(-36);
      navigateToView(navigation, AppRoutes.DoctorDetails, {
        doctorId: docId,
      });
      break;
    case 'MedicineByName':
      getMedicineSKU(navigation, id);
      break;
    case 'CircleMembershipDetails':
      if (isCircleMember) {
        navigateToView(navigation, AppRoutes.MembershipDetails, {
          membershipType: string.Circle.planName,
          isActive: true,
          comingFrom: 'Deeplink',
        });
      } else {
        navigation.replace(AppRoutes.ConsultRoom);
      }
      break;
    case 'TestListing':
      navigateToView(navigation, AppRoutes.TestListing, {
        movedFrom: 'deeplink',
        widgetName: id,
      });
      break;
    case 'TestReport':
      navigateToView(navigation, AppRoutes.HealthRecordDetails, {
        movedFrom: 'deeplink',
        id: id,
      });
      break;
    case 'MyTestOrders':
      navigateToView(navigation, AppRoutes.YourOrdersTest);
      break;
    default:
      const eventAttributes: WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED] = {
        source: 'deeplink',
      };
      postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
      navigation.replace(AppRoutes.ConsultRoom);
      break;
  }
};

const navigateToView = (
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  routeName: AppRoutes,
  routeParams?: any
) => {
  navigation.dispatch(
    StackActions.reset({
      index: 1,
      key: null,
      actions: [
        NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom }),
        NavigationActions.navigate({ routeName: routeName, params: routeParams || {} }),
      ],
    })
  );
};

const handleEncodedURI = (encodedString: string) => {
  const decodedString = decodeURIComponent(encodedString);
  const splittedString = decodedString.split('+');
  if (splittedString.length > 1) {
    return splittedString;
  } else {
    return encodedString.split('%20');
  }
};

const fetchSpecialities = async (
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  specialityName: string
) => {
  const client = useApolloClient();
  try {
    const response = await client.query<getAllSpecialties>({
      query: GET_ALL_SPECIALTIES,
      fetchPolicy: 'no-cache',
    });
    const { data } = response;
    if (data?.getAllSpecialties && data?.getAllSpecialties.length) {
      const specialityId = getSpecialityId(specialityName, data?.getAllSpecialties);
      navigateToView(navigation, AppRoutes.DoctorSearchListing, {
        specialityId: specialityId,
      });
    }
  } catch (error) {
    CommonBugFender('DoctorSearch_fetchSpecialities', error);
    navigation.replace(AppRoutes.ConsultRoom);
  }
};

const getSpecialityId = (name: string, specialities: getAllSpecialties_getAllSpecialties[]) => {
  const specialityObject = specialities.filter((item) => name == readableParam(item?.name));
  return specialityObject[0].id ? specialityObject[0].id : '';
};

const getMedicineSKU = async (
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  skuKey: string
) => {
  try {
    const response = await getMedicineSku(skuKey);
    const { data } = response;
    data?.Message == 'Product available'
      ? navigateToView(navigation, AppRoutes.ProductDetailPage, {
          sku: data?.sku,
          movedFrom: ProductPageViewedSource.DEEP_LINK,
        })
      : navigation.navigate('MEDICINES', { comingFrom: 'deeplink' });
  } catch (error) {
    CommonBugFender('getMedicineSku', error);
    navigation.navigate('MEDICINES', { comingFrom: 'deeplink' });
  }
};
