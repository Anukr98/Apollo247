import {
  NavigationScreenProp,
  NavigationRoute,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import { setBugFenderLog } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { postCleverTapEvent, postWebEngageEvent, navigateToScreenWithEmptyStack, } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
  ProductPageViewedSource,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { AppRoutes, getCurrentRoute } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { isUpperCase } from '@aph/mobile-patients/src/utils/commonUtils';
import { MutableRefObject } from 'react';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CleverTapEventName, CleverTapEvents } from './CleverTapEvents';
import remoteConfig from '@react-native-firebase/remote-config';

export const handleOpenURL = (event: any) => {
  try {
    let route;
    let data;
    let linkId = '';
    let attributes = {
      media_source: 'not set',
    };
    const apolloUrl = 'https://www.apollo247.com';
    const apolloPharmacyUrl = 'https://www.apollopharmacy.in';
    const a = event.indexOf(apolloUrl);
    const b = event.indexOf(apolloPharmacyUrl);
    if (a == 0) {
      const url = event?.replace(`${apolloUrl}/`, '');
      data = url?.split('/');
      route = data?.[0];
    } else if (b == 0) {
      const url = event?.replace(`${apolloPharmacyUrl}/`, '');
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
        linkId = data?.[1]?.split('?');

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
    } catch (error) { }
    const routeNameParam = route?.split('?');

    route = routeNameParam ? routeNameParam?.[0]?.toLowerCase() : '';
    const paramData = getParamData(linkId)?.[0];
    linkId = paramData ? paramData : linkId;

    switch (route) {
      case 'appointments':
      case 'consult':
      case 'consults':
        return {
          routeName: 'Consult',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'otc':
      case 'medicine':
        if (b === 0) {
          // apollopharmacy.in url
          const redirectToMedicineDetail = data.length >= 2;
          return {
            routeName: redirectToMedicineDetail ? 'MedicineDetail' : 'Medicine',
            id: redirectToMedicineDetail ? linkId : undefined,
          };
        } else {
          // apollopatients:// url
          return {
            routeName: 'Medicine',
          };
        }
        break;

      case 'uploadprescription':
        return {
          routeName: 'UploadPrescription',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'medicinerecommendedsection':
      case 'MedicineRecommendedSection':
        return {
          routeName: 'MedicineRecommendedSection',
        };
        break;

      case 'test':
      case 'tests':
      case 'lab-tests':
        if (a === 0) {
          // www.apollo247.com as url
          const redirectTestDetails = data.length >= 2;
          return {
            routeName: redirectTestDetails ? 'TestDetails' : 'Test',
            id: redirectTestDetails ? linkId : undefined,
          };
        } else {
          // apollopatients:
          return {
            routeName: 'Test',
          };
        }
        break;

      case 'specialties':
      case 'speciality':
        if (linkId) {
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

      case 'doctors':
      case 'doctor':
        if (linkId) {
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
        return {
          routeName: 'DoctorSearch',
        };
        break;

      case 'search-medicines':
        return {
          routeName: 'MedicineSearchText',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'shop-by-health-conditions':
      case 'shop-by-category':
      case 'shop-by-brand':
      case 'explore-popular-products':
        if (linkId) {
          return {
            routeName: 'MedicineCategory',
            id: linkId,
          };
        } else {
          return {
            routeName: 'Medicine',
          };
        }
        break;

      case 'medicinesearch':
        return {
          routeName: 'MedicineSearch',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'medicinedetail':
        return {
          routeName: 'MedicineDetail',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'medicines-cart':
      case 'medicinecart':
        return {
          routeName: 'MedicineCart',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'chatroom':
        if (data.length === 2) {
          return {
            routeName: 'ChatRoom',
            id: linkId,
            isCall: false,
            data: data,
          };
        }
        break;

      case 'doctorcall':
        if (data.length === 2 && getCurrentRoute() !== AppRoutes.ChatRoom) {
          return {
            routeName: 'DoctorCall',
            id: linkId,
            isCall: false,
            data: data,
          };
        }
        break;

      case 'doctorcallrejected':
        return {
          routeName: 'DoctorCallRejected',
          id: linkId,
        };
        break;

      case 'order':
        if (linkId) {
          return {
            routeName: 'Order',
            id: linkId,
          };
        }
        break;

      case 'myorders':
        return {
          routeName: 'MyOrders',
        };
        break;

      case 'webview':
        if (data.length >= 1) {
          let url = data[1].replace('param=', '');
          // attach url parameters to url
          if (data?.[2]) {
            url += `?${data?.[2]}`;
          }
          return {
            routeName: 'webview',
            id: url,
          };
        }
        break;

      case 'finddoctors':
        if (linkId) {
          return {
            routeName: 'FindDoctors',
            id: linkId,
          };
        }
        break;

      case 'healthrecordshome':
        return {
          routeName: 'HealthRecordsHome',
        };
        break;

      case 'manageprofile':
        return {
          routeName: 'ManageProfile',
        };
        break;

      case 'oneapollomembership':
        return {
          routeName: 'OneApolloMembership',
        };
        break;

      case 'testdetails':
        return {
          routeName: 'TestDetails',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'consultdetails':
        return {
          routeName: 'ConsultDetails',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'circle-membership':
      case 'circlemembershipdetails':
      case 'circle':
        return {
          routeName: 'CircleMembershipDetails',
        };
        break;

      case 'my-membership':
        return {
          routeName: 'MyMembership',
        };
        break;

      case 'corporatemembership':
        return {
          routeName: 'corporatemembership',
        };
        break;

      case 'vaccinelisting':
        return {
          routeName: 'vaccinelisting',
        };
        break;

      case 'consultpackagelist':
        return {
          routeName: 'consultpackagelist',
        };
        break;

      case 'consultpackage':
        return {
          routeName: 'consultpackage',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'testlisting':
        return {
          routeName: 'TestListing',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'testreport':
        return {
          routeName: 'TestReport',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'mytestorders':
        return {
          routeName: 'MyTestOrders',
        };
        break;

      case 'prescription-review':
        return {
          routeName: 'UploadPrescription',
        };
        break;

      case 'prohealth':
        if (data.length >= 2) {
          return {
            routeName: 'prohealth',
            id: linkId,
            isCall: false,
            data: data,
          };
        } else {
          return {
            routeName: 'prohealth',
          };
        }
        break;

      case 'mobilehelp':
        return {
          routeName: 'mobilehelp',
        };
        break;
      case 'tests-cart':
      case 'testscart':
        return {
          routeName: 'TestsCart',
          id: linkId ? linkId : undefined,
        };
        break;
      case 'testordersummary':
      case 'test-order-summary':
        return {
          routeName: 'TestOrderSummary',
          id: linkId ? linkId : undefined
        }
        break;

      case 'testordersummary':
      case 'test-order-summary':
        return {
          routeName: 'TestOrderSummary',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'testordersummary':
      case 'test-order-summary':
        return {
          routeName: 'TestOrderSummary',
          id: linkId ? linkId : undefined,
        };
        break;

      case 'testordersummary':
      case 'test-order-summary':
        return {
          routeName: 'TestOrderSummary',
          id: linkId ? linkId : undefined,
        };
        break;
      case 'payment':
        return {
          routeName: 'PaymentMethods',
          id: linkId ? linkId : undefined,
        };
        break;
      case 'refernearn':
        return {
          routeName: 'ShareReferLink',
        };
        break;

      default:
        if (b === 0) {
          return {
            routeName: 'Medicine',
          };
        } else {
          const eventAttributes: WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED] = {
            source: 'deeplink',
          };
          postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
          return {
            routeName: 'ConsultRoom',
            id: undefined,
            timeout: true,
          };
        }
        break;
    }
  } catch (error) {
    return {
      routeName: 'ConsultRoom',
    };
  }
};

export const pushTheView = (
  navigation: NavigationScreenProp<NavigationRoute<object>, object>,
  routeName: string,
  id?: any,
  isCall?: boolean,
  isCircleMember?: boolean,
  isCircleMembershipExpired?: boolean,
  mediaSource?: string,
  voipCallType?: string,
  voipAppointmentId?: MutableRefObject<string>,
  isCorporateSubscribed?: boolean,
  vaccinationCmsIdentifier?: string,
  vaccinationSubscriptionId?: string,
  params?: any,
  movedFromBrandPages?: boolean,
) => {
  setBugFenderLog('DEEP_LINK_PUSHVIEW', { routeName, id });
  switch (routeName) {
    case 'Consult':
      navigation.navigate('APPOINTMENTS', { movedFrom: 'deeplink' });
      break;
    case 'Medicine':
      const eventAttribute: CleverTapEvents[CleverTapEventName.PHARMACY_HOME_PAGE_VIEWED] = {
        'Nav src': 'deeplink',
      };
      setTimeout(
        () => postCleverTapEvent(CleverTapEventName.PHARMACY_HOME_PAGE_VIEWED, eventAttribute),
        500
      );
      navigation.navigate('MEDICINES', { comingFrom: 'deeplink' });
      break;
    case 'UploadPrescription':
      navigateToView(navigation, AppRoutes.UploadPrescriptionView);
      break;
    case 'MedicineRecommendedSection':
      navigation.navigate('MEDICINES', { showRecommendedSection: true, comingFrom: 'deeplink' });
      break;
    case 'MedicineDetail':
      const isUrlKey = id.indexOf('-') !== -1;
      if (movedFromBrandPages && movedFromBrandPages === true) {
        navigation.navigate(AppRoutes.ProductDetailPage, {
          sku: isUrlKey ? null : id,
          urlKey: isUrlKey ? id : null,
          movedFrom: ProductPageViewedSource.BRAND_PAGES
        });
      } else {
        navigateToView(navigation, AppRoutes.ProductDetailPage, {
          sku: isUrlKey ? null : id,
          urlKey: isUrlKey ? id : null,
          movedFrom: ProductPageViewedSource.DEEP_LINK,
        });
      }
      break;
    case 'Test':
      navigation.navigate('TESTS', { movedFrom: 'deeplink' });
      break;
    case 'ConsultRoom':
      movedFromBrandPages ? navigation.goBack() :
        navigation.replace(AppRoutes.ConsultRoom);
      break;
    case 'Speciality':
      setBugFenderLog('APPS_FLYER_DEEP_LINK_COMPLETE', id);
      let filtersData = id ? getParamData(id) : '';

      navigateToView(navigation, AppRoutes.DoctorSearchListing, {
        specialityId: filtersData[0] ? filtersData[0] : '',
        typeOfConsult: filtersData.length > 1 ? filtersData[1] : '',
        doctorType: filtersData.length > 2 ? filtersData[2] : '',
      });
      break;
    case 'FindDoctors':
      const cityBrandFilter = id ? handleEncodedURI(id) : '';
      navigateToView(navigation, AppRoutes.DoctorSearchListing, {
        specialityId: cityBrandFilter?.[0] ? cityBrandFilter?.[0] : '',
        city:
          cityBrandFilter?.length > 1 && !isUpperCase(cityBrandFilter?.[1])
            ? cityBrandFilter?.[1]
            : null,
        brand: cityBrandFilter?.length > 2 ? cityBrandFilter?.[2] : null,
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

    case 'MedicineSearchText':
      if (movedFromBrandPages && movedFromBrandPages === true) {
        navigation.navigate(AppRoutes.MedicineListing, { searchText: id, movedFrom: 'brandPages' });
      } else {
        navigateToView(navigation, AppRoutes.MedicineListing, { searchText: id });
      }
      break;
    case 'MedicineCategory':
      if (movedFromBrandPages && movedFromBrandPages === true) {
        navigation.navigate(AppRoutes.MedicineListing, { categoryName: id, movedFrom: 'brandPages' });
      } else {
        navigateToView(navigation, AppRoutes.MedicineListing, { categoryName: id });
      }
      break;
    case 'MedicineSearch':
      if (id && !id.includes('=')) {
        const [itemId, name] = id.split(',');
        navigateToView(navigation, AppRoutes.MedicineListing, {
          category_id: itemId,
          title: `${name ? name : 'Products'}`.toUpperCase(),
          movedFrom: 'deeplink',
        });
      } else {
        navigateToView(navigation, AppRoutes.MedicineSearch);
      }
      break;
    case 'MedicineCart':
      navigateToView(navigation, AppRoutes.ServerCart, {
        movedFrom: 'splashscreen',
      });
      break;
    case 'ChatRoom':
    case 'DoctorCall':
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
      const isItemId = id.indexOf('-') !== -1;
      navigateToView(navigation, AppRoutes.TestDetails, {
        itemId: isItemId ? null : id,
        itemName: isItemId ? id : null,
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
    case 'DoctorByNameId':
      const docId = id.slice(-36);
      navigateToView(navigation, AppRoutes.DoctorDetails, {
        doctorId: docId,
      });
      break;
    case 'CircleMembershipDetails':
      if (isCircleMember || isCircleMembershipExpired) {
        navigateToView(navigation, AppRoutes.MembershipDetails, {
          membershipType: string.Circle.planName,
          isActive: true,
          comingFrom: 'Deeplink',
        });
      } else {
        navigateToView(navigation, AppRoutes.CommonWebView, {
          url: AppConfig.Configuration.CIRCLE_LANDING_URL,
          source: 'Consult',
          circleEventSource: 'DeepLink Redirection',
        });
      }
      break;
    case 'MyMembership':
      navigateToView(navigation, AppRoutes.MyMembership);
      break;
    case 'corporatemembership':
      if (isCorporateSubscribed) {
        navigateToView(navigation, AppRoutes.MembershipDetails, {
          membershipType: '',
          isActive: true,
          comingFrom: 'Deeplink',
          isCorporatePlan: true,
        });
      } else {
        navigation.replace(AppRoutes.ConsultRoom);
      }
      break;
    case 'vaccinelisting':
      navigateToView(navigation, AppRoutes.BookedVaccineScreen, {
        cmsIdentifier: vaccinationCmsIdentifier || '',
        subscriptionId: vaccinationSubscriptionId || '',
        isVaccineSubscription: !!vaccinationCmsIdentifier,
        isCorporateSubscription: !!isCorporateSubscribed,
        comingFrom: 'deeplink',
      });
      break;

    case 'consultpackagelist':
      navigateToView(navigation, AppRoutes.ConsultPackageList, {
        comingFrom: 'deeplink',
      });
      break;

    case 'consultpackage':
      let paramsObtained = id ? getParamData(id) : '';

      navigateToView(navigation, AppRoutes.ConsultPackageDetail, {
        comingFrom: 'deeplink',
        planId: paramsObtained?.[0],
      });
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
    case 'prohealth':
      navigateToView(navigation, AppRoutes.ProHealthWebView, {
        covidUrl: id,
        goBackCallback: () => webViewGoBack(navigation),
        movedFrom: 'deeplink',
      });
      break;
    case 'mobilehelp':
      navigateToView(navigation, AppRoutes.MobileHelp);
      break;
    case 'TestOrderSummary':
      navigateToView(navigation, AppRoutes.TestOrderDetails, {
        orderId: id,
        goToHomeOnBack: true,
        setOrders: null,
        selectedOrder: null,
        refundStatusArr: [],
        comingFrom: 'deeplink',
        showOrderSummaryTab: true,
        disableTrackOrder: true,
      });
      break;
    case 'TestsCart':
      navigateToView(navigation, AppRoutes.AddPatients);
      break;
    case 'PaymentMethods':
      navigateToScreenWithEmptyStack(navigation, AppRoutes.PaymentMethods, params);
      break;
    case 'TestOrderSummary':
      navigateToView(navigation, AppRoutes.TestOrderDetails, {
        orderId: id,
        goToHomeOnBack: true,
        setOrders: null,
        selectedOrder: null,
        refundStatusArr: [],
        comingFrom: 'deeplink',
        showOrderSummaryTab: true,
        disableTrackOrder: true,

      })
      break;
    case 'ShareReferLink':
      firebaseRemoteConfigForReferrer().then((res) => {
        if (res) {
          navigateToView(navigation, AppRoutes.ShareReferLink)
        }
        else {
          const eventAttributes: WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED] = {
            source: 'deeplink',
          };
          postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
          navigation.replace(AppRoutes.ConsultRoom);
        }
      })
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


const firebaseRemoteConfigForReferrer = async () => {
  try {
    const bannerConfig = await remoteConfig().getValue('Referrer_Banner');
    return bannerConfig.asBoolean();
  } catch (e) { }
};

const webViewGoBack = (navigation: NavigationScreenProp<NavigationRoute<object>, object>) => {
  navigation.dispatch(
    StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: AppRoutes.ConsultRoom,
        }),
      ],
    })
  );
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

const getParamData = (paramString: string) => {
  const paramArray = paramString.split('&');
  return paramArray;
};
