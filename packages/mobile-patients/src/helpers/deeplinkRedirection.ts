import { Platform } from 'react-native';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import {
  setBugFenderLog,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  InitiateAppsFlyer,
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

export const handleOpenURL = (
  event: any,
  navigation: NavigationScreenProp<NavigationRoute<object>, object>
) => {
  try {
    if (Platform.OS === 'ios') {
      // for ios universal links
      InitiateAppsFlyer(navigation);
    }
    let route;

    const a = event.indexOf('https://www.apollo247.com');
    if (a == 0) {
      handleDeeplinkFormatTwo(event);
    } else {
      route = event.replace('apollopatients://', '');
      const data = route.split('?');
      setBugFenderLog('DEEP_LINK_DATA', data);
      route = data[0];

      let linkId = '';
      let attributes = {
        media_source: 'not set',
      };
      try {
        if (data?.length >= 2) {
          linkId = data[1]?.split('&');
          const params = data[1]?.split('&');
          const utmParams = params?.map((item: any) => item.split('='));
          utmParams?.forEach(
            (item: any) => item?.length == 2 && (attributes?.[item?.[0]] = item?.[1])
          );
          if (linkId.length > 0) {
            linkId = linkId[0];
            setBugFenderLog('DEEP_LINK_SPECIALITY_ID', linkId);
          }
        }
      } catch (error) {}
      console.log(linkId, 'linkId');

      switch (route) {
        case 'consult':
        case 'Consult':
          console.log('Consult');
          // getData(navigation, 'Consult', data.length === 2 ? linkId : undefined);
          return {
            routeName: 'Consult',
            id: data.length === 2 ? linkId : undefined,
          };
          break;

        case 'medicine':
        case 'Medicine':
          console.log('Medicine');
          // getData(navigation, 'Medicine', data.length === 2 ? linkId : undefined);
          return {
            routeName: 'Medicine',
            id: data.length === 2 ? linkId : undefined,
          };
          break;

        case 'uploadprescription':
        case 'UploadPrescription':
          // getData(navigation, 'UploadPrescription', data.length === 2 ? linkId : undefined);
          return {
            routeName: 'UploadPrescription',
            id: data.length === 2 ? linkId : undefined,
          };
          break;

        case 'medicinerecommendedsection':
        case 'MedicineRecommendedSection':
          // getData(navigation, 'MedicineRecommendedSection');
          return {
            routeName: 'MedicineRecommendedSection',
          };
          break;

        case 'test':
        case 'Test':
          // getData(navigation, 'Test');
          return {
            routeName: 'Test',
          };
          break;

        case 'speciality':
        case 'Speciality':
          console.log('Speciality handleopen');
          if (data.length === 2) {
            // getData(navigation, 'Speciality', linkId);
            return {
              routeName: 'Speciality',
              id: linkId,
            };
          } else {
            // getData(navigation, 'DoctorSearch');
            return {
              routeName: 'Test',
            };
          }
          break;

        case 'doctor':
        case 'Doctor':
          console.log('Doctor handleopen');
          if (data.length === 2)
            // getData(navigation, 'Doctor', linkId, undefined, undefined, attributes?.media_source);
            return {
              routeName: 'Doctor',
              id: linkId,
              timeout: undefined,
              isCall: undefined,
              mediaSource: attributes?.media_source,
            };
          break;

        case 'doctorsearch':
        case 'DoctorSearch':
          console.log('DoctorSearch handleopen');
          // getData(navigation, 'DoctorSearch');
          return {
            routeName: 'DoctorSearch',
          };
          break;

        case 'medicinesearch':
        case 'MedicineSearch':
          console.log('MedicineSearch handleopen');
          // getData(navigation, 'MedicineSearch', data.length === 2 ? linkId : undefined);
          return {
            routeName: 'MedicineSearch',
            id: data.length === 2 ? linkId : undefined,
          };
          break;

        case 'medicinedetail':
        case 'MedicineDetail':
          console.log('MedicineDetail handleopen');
          // getData(navigation, 'MedicineDetail', data.length === 2 ? linkId : undefined);
          return {
            routeName: 'MedicineDetail',
            id: data.length === 2 ? linkId : undefined,
          };
          break;

        case 'medicinecart':
        case 'MedicineCart':
          console.log('MedicineCart handleopen');
          // getData(navigation, 'MedicineCart', data.length === 2 ? linkId : undefined);
          return {
            routeName: 'MedicineCart',
            id: data.length === 2 ? linkId : undefined,
          };
          break;

        case 'chatroom':
        case 'ChatRoom':
          if (data.length === 2) {
            // getAppointmentDataAndNavigate(navigation, linkId, false);
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
            // const params = linkId.split('+');
            // voipCallType.current = params[1];
            // callPermissions();
            // getAppointmentDataAndNavigate(navigation, params[0], true);
          }
          break;

        case 'doctorcallrejected':
        case 'DoctorCallRejected':
          {
            return {
              routeName: 'DoctorCallRejected',
              id: linkId,
            };
            // setLoading!(true);
            // const appointmentId = linkId?.split('+')?.[0];
            // const config: Pubnub.PubnubConfig = {
            //   origin: 'apollo.pubnubapi.com',
            //   subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
            //   publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
            //   ssl: true,
            //   restore: true,
            // };
            // const pubnub = new Pubnub(config);
            // pubnub.publish(
            //   {
            //     message: { message: '^^#PATIENT_REJECTED_CALL' },
            //     channel: appointmentId,
            //     storeInHistory: true,
            //     sendByPost: true,
            //   },
            //   (status, response) => {
            //     // setLoading!(false);
            //   }
            // );
          }
          break;

        case 'order':
        case 'Order':
          if (data.length === 2) {
            // getData(navigation, 'Order', linkId);
            return {
              routeName: 'Order',
              id: linkId,
            };
          }
          break;

        case 'myorders':
        case 'MyOrders':
          // getData(navigation, 'MyOrders');
          return {
            routeName: 'MyOrders',
          };
          break;

        case 'webview':
          if (data.length >= 1) {
            let url = data[1].replace('param=', '');
            // getData(navigation, 'webview', url);
            return {
              routeName: 'webview',
              id: url,
            };
          }
          break;

        case 'finddoctors':
        case 'FindDoctors':
          if (data.length === 2) {
            // getData(navigation, 'FindDoctors', linkId);
            return {
              routeName: 'FindDoctors',
              id: linkId,
            };
          }
          break;

        case 'healthrecordshome':
        case 'HealthRecordsHome':
          console.log('HealthRecordsHome handleopen');
          // getData(navigation, 'HealthRecordsHome');
          return {
            routeName: 'HealthRecordsHome',
          };
          break;

        case 'manageprofile':
        case 'ManageProfile':
          console.log('ManageProfile handleopen');
          // getData(navigation, 'ManageProfile');
          return {
            routeName: 'ManageProfile',
          };
          break;

        case 'oneapollomembership':
        case 'OneApolloMembership':
          // getData(navigation, 'OneApolloMembership');
          return {
            routeName: 'OneApolloMembership',
          };
          break;

        case 'testdetails':
        case 'TestDetails':
          // getData(navigation, 'TestDetails', data.length === 2 ? linkId : undefined);
          return {
            routeName: 'TestDetails',
            id: data.length === 2 ? linkId : undefined,
          };
          break;

        case 'consultdetails':
        case 'ConsultDetails':
          // getData(navigation, 'ConsultDetails', data.length === 2 ? linkId : undefined);
          return {
            routeName: 'ConsultDetails',
            id: data.length === 2 ? linkId : undefined,
          };
          break;

        case 'circlemembershipdetails':
        case 'CircleMembershipDetails':
          // getData(navigation, 'CircleMembershipDetails');
          return {
            routeName: 'CircleMembershipDetails',
          };
          break;

        case 'testlisting':
        case 'TestListing':
          // getData(navigation, 'TestListing', data?.length === 2 ? linkId : undefined);
          return {
            routeName: 'TestListing',
            id: data?.length === 2 ? linkId : undefined,
          };
          break;

        case 'testreport':
        case 'TestReport':
          // getData(navigation, 'TestReport', data?.length === 2 ? linkId : undefined);
          return {
            routeName: 'TestReport',
            id: data?.length === 2 ? linkId : undefined,
          };
          break;

        case 'mytestorders':
        case 'MyTestOrders':
          // getData(navigation, 'MyTestOrders');
          return {
            routeName: 'MyTestOrders',
          };
          break;

        default:
          // getData(navigation, 'ConsultRoom', undefined, true);
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
      console.log('route', route);
    }
  } catch (error) {}
};

const handleDeeplinkFormatTwo = (event: any) => {
  const url = event.replace('https://www.apollo247.com/', '');
  const data = url.split('/');
  const route = data[0];
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
    case 'medicines':
      // getData(navigation, 'Medicine');
      return {
        routeName: 'Medicine',
      };
      break;
    case 'prescription-review':
      // getData(navigation, 'UploadPrescription');
      return {
        routeName: 'UploadPrescription',
      };
      break;
    case 'specialties':
      // linkId == ''
      //   ? getData(navigation, 'DoctorSearch')
      //   : getData(navigation, 'SpecialityByName', linkId);
      if (linkId == '') {
        return { routeName: 'DoctorSearch' };
      } else {
        return {
          routeName: 'SpecialityByName',
          id: linkId,
        };
      }
      break;
    case 'doctors':
      // linkId == ''
      //   ? getData(navigation, 'DoctorSearch')
      //   : getData(navigation, 'DoctorByNameId', linkId);
      if (linkId == '') {
        return { routeName: 'DoctorSearch' };
      } else {
        return {
          routeName: 'DoctorByNameId',
          id: linkId,
        };
      }
      break;
    case 'medicine':
      // linkId == ''
      //   ? getData(navigation, 'Medicine')
      //   : getData(navigation, 'MedicineByName', linkId);
      if (linkId == '') {
        return { routeName: 'Medicine' };
      } else {
        return {
          routeName: 'MedicineByName',
          id: linkId,
        };
      }
      break;
    default:
      // getData(navigation, 'ConsultRoom', undefined, true);
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
      navigation.navigate('APPOINTMENTS');
      break;

    case 'Medicine':
      console.log('Medicine');
      navigation.navigate('MEDICINES');
      break;

    case 'UploadPrescription':
      navigation.navigate('MEDICINES', { showUploadPrescriptionPopup: true });
      break;

    case 'MedicineRecommendedSection':
      navigation.navigate('MEDICINES', { showRecommendedSection: true });
      break;

    case 'MedicineDetail':
      console.log('MedicineDetail');
      navigation.navigate(AppRoutes.ProductDetailPage, {
        sku: id,
        movedFrom: ProductPageViewedSource.DEEP_LINK,
      });
      break;

    case 'Test':
      console.log('Test');
      navigation.navigate('TESTS');
      break;

    case 'ConsultRoom':
      console.log('ConsultRoom');
      navigation.replace(AppRoutes.ConsultRoom);
      break;

    case 'Speciality':
      setBugFenderLog('APPS_FLYER_DEEP_LINK_COMPLETE', id);
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
        fromDeeplink: true,
        mediaSource: mediaSource,
      });
      break;

    case 'DoctorSearch':
      navigation.navigate(AppRoutes.DoctorSearch);
      break;

    case 'MedicineSearch':
      if (id) {
        const [itemId, name] = id.split(',');
        console.log(itemId, name);

        navigation.navigate(AppRoutes.MedicineListing, {
          category_id: itemId,
          title: `${name ? name : 'Products'}`.toUpperCase(),
          movedFrom: 'deeplink',
        });
      }
      break;

    case 'MedicineCart':
      console.log('MedicineCart handleopen');
      navigation.navigate(AppRoutes.MedicineCart, {
        movedFrom: 'splashscreen',
      });
      break;
    case 'ChatRoom':
      navigation.navigate(AppRoutes.ChatRoom, {
        id: id,
        callType: voipCallType ? voipCallType?.toUpperCase() : '',
        prescription: '',
        isCall: isCall,
        isVoipCall: voipAppointmentId?.current ? true : false,
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
      });
      break;

    case 'ConsultDetails':
      navigation.navigate(AppRoutes.ConsultDetails, {
        CaseSheet: id,
      });
      break;
    case 'DoctorCall':
      navigation.navigate(AppRoutes.ChatRoom, {
        id: id,
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
      navigation.navigate(AppRoutes.DoctorDetails, {
        doctorId: docId,
      });
      break;
    case 'MedicineByName':
      getMedicineSKU(navigation, id);
      break;
    case 'CircleMembershipDetails':
      if (isCircleMember) {
        navigation.navigate(AppRoutes.MembershipDetails, {
          membershipType: string.Circle.planName,
          isActive: true,
          comingFrom: 'Deeplink',
        });
      }
      break;

    case 'TestListing':
      navigation.navigate(AppRoutes.TestListing, {
        movedFrom: 'deeplink',
        widgetName: id,
      });
      break;

    case 'TestReport':
      console.log('TestReport');
      navigation.navigate(AppRoutes.HealthRecordDetails, {
        movedFrom: 'deeplink',
        id: id,
      });
      break;

    case 'MyTestOrders':
      navigation.navigate(AppRoutes.YourOrdersTest);
      break;

    default:
      break;
  }
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
  // setshowSpinner(true);
  try {
    const response = await client.query<getAllSpecialties>({
      query: GET_ALL_SPECIALTIES,
      fetchPolicy: 'no-cache',
    });
    const { data } = response;
    if (data?.getAllSpecialties && data?.getAllSpecialties.length) {
      const specialityId = getSpecialityId(specialityName, data?.getAllSpecialties);
      navigation.navigate(AppRoutes.DoctorSearchListing, {
        specialityId: specialityId,
      });
    }
  } catch (error) {
    CommonBugFender('DoctorSearch_fetchSpecialities', error);
    navigation.navigate(AppRoutes.ConsultRoom);
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
      ? navigation.navigate(AppRoutes.ProductDetailPage, {
          sku: data?.sku,
          movedFrom: ProductPageViewedSource.DEEP_LINK,
        })
      : navigation.navigate('MEDICINES');
  } catch (error) {
    CommonBugFender('getMedicineSku', error);
    navigation.navigate('MEDICINES');
  }
};
