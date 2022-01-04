import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  BackHandler,
  TouchableOpacity,
  Text,
  View,
  Platform,
  ToastAndroid,
  Clipboard,
  PermissionsAndroid,
  Alert,
  Linking,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PaymentStatus } from '@aph/mobile-patients/src/components/PaymentGateway/Components/PaymentStatus';
import { PaymentInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/PaymentInfo';
import { OrderInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OrderInfo';
import { useGetAppointmentInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useGetAppointmentInfo';
import { TabBar } from '@aph/mobile-patients/src/components/PaymentGateway/Components/TabBar';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  goToConsultRoom,
  apiCallEnums,
  getConsultInvoiceDownloadPath,
  g,
  checkPermissions,
  overlyCallPermissions,
  doRequestAndAccessLocationModified,
  clearStackAndNavigate,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  useAppCommonData,
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AppointmentInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/AppointmentInfo';
import { ConsultationSteps } from '@aph/mobile-patients/src/components/PaymentGateway/Components/ConsultationSteps';
import { LocationInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/LocationInfo';
import { MedicineNote } from '@aph/mobile-patients/src/components/PaymentGateway/Components/MedicineNote';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CONSULT_ORDER_INVOICE,
  GET_APPOINTMENT_DATA,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import RNFetchBlob from 'rn-fetch-blob';
import moment from 'moment';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { RenderPdf } from '@aph/mobile-patients/src/components/ui/RenderPdf';
import {
  autoCompletePlaceSearch,
  getPlaceInfoByPlaceId,
  getPlaceInfoByLatLng,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { LocationOn, Remove } from '@aph/mobile-patients/src/components/ui/Icons';
import { findAddrComponents } from '@aph/mobile-patients/src/utils/commonUtils';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { saveConsultationLocation } from '@aph/mobile-patients/src/helpers/clientCalls';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import {
  firePaymentOrderStatusEvent,
  fireConsultBookedEvent,
  fireCirclePlanActivatedEvent,
  fireCirclePurchaseEvent,
  firePurchaseEvent,
  firePaymentStatusEvent,
} from '@aph/mobile-patients/src/components/PaymentGateway/Events';
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import { NotificationPermissionAlert } from '@aph/mobile-patients/src/components/ui/NotificationPermissionAlert';

export interface PaymentStatusConsultProps extends NavigationScreenProps {}

export const PaymentStatusConsult: React.FC<PaymentStatusConsultProps> = (props) => {
  const paymentId = props.navigation.getParam('paymentId');
  const paymentStatus = props.navigation.getParam('paymentStatus');
  const amount = props.navigation.getParam('amount');
  const orderDetails = props.navigation.getParam('orderDetails');
  const defaultClevertapEventParams = props.navigation.getParam('defaultClevertapEventParams');
  const payload = props.navigation.getParam('payload');
  const { orderInfo, fetching, PaymentMethod, subscriptionInfo } = useGetAppointmentInfo(paymentId);
  const {
    setLocationDetails,
    locationDetails,
    locationForDiagnostics,
    apisToCall,
  } = useAppCommonData();
  const { orderId, doctorName } = orderDetails;
  const { circleSubscriptionId, circlePlanSelected } = useShoppingCart();
  const savings = 0;
  const client = useApolloClient();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [showLocations, setshowLocations] = useState<boolean>(false);
  const [showLocationPopup, setShowLocationPopup] = useState<boolean>(false);
  const [locationSearchList, setlocationSearchList] = useState<{ name: string; placeId: string }[]>(
    []
  );
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const { clearDiagnoticCartInfo } = useDiagnosticsCart();
  const fireLocationEvent = useRef<boolean>(false);
  const userChangedLocation = useRef<boolean>(false);
  const [notificationAlert, setNotificationAlert] = useState(false);

  const moveToHome = () => {
    // use apiCallsEnum values here in order to make that api call in home screen
    apisToCall.current = !!circleSubscriptionId
      ? [apiCallEnums.patientAppointments, apiCallEnums.patientAppointmentsCount]
      : [
          apiCallEnums.patientAppointments,
          apiCallEnums.patientAppointmentsCount,
          apiCallEnums.circleSavings,
          apiCallEnums.getAllBanners,
          apiCallEnums.getUserSubscriptions,
          apiCallEnums.getUserSubscriptionsV2,
        ];
    goToConsultRoom(props.navigation);
  };

  useEffect(() => {
    PermissionsCheck();
    requestPermission;
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    naviteToChatRoom();
    return true;
  };

  useEffect(() => {
    !fetching && fireEvents();
  }, [fetching]);

  const fireEvents = () => {
    firePaymentOrderStatusEvent('success', payload, defaultClevertapEventParams);
    fireConsultBookedEvent(orderInfo?.displayId, orderDetails, allCurrentPatients);
    firePurchaseEvent(orderDetails);
    const isPlanPurchased = orderInfo?.planPurchaseDetails?.planPurchased;
    if (isPlanPurchased) {
      clearCircleSubscriptionData();
      fireCirclePlanActivatedEvent(currentPatient, isPlanPurchased, circlePlanSelected);
      fireCirclePurchaseEvent(circlePlanSelected, paymentId);
    }
    firePaymentStatusEvent(paymentStatus, orderId);
  };

  const clearCircleSubscriptionData = () => {
    AsyncStorage.removeItem('circlePlanSelected');
  };

  const PermissionsCheck = () => {
    checkPermissions(['camera', 'microphone']).then((response: any) => {
      const { camera, microphone } = response;
      if (camera === 'authorized' && microphone === 'authorized') {
        !locationDetails && askLocationPermission();
      } else {
        overlyCallPermissions(
          currentPatient.firstName,
          doctorName,
          showAphAlert,
          hideAphAlert,
          true,
          () => {
            !locationDetails && askLocationPermission();
          },
          'Payment Confirmation Screen'
        );
      }
    });
  };

  const askLocationPermission = () => {
    showAphAlert!({
      unDismissable: false,
      title: 'Hi! :)',
      description:
        'It is important for us to know your location so that the doctor can prescribe medicines accordingly. Please allow us to detect your location or enter location manually.',
      CTAs: [
        {
          text: 'ENTER MANUALLY',
          onPress: () => {
            fireLocationEvent.current = true;
            hideAphAlert?.();
            setlocationSearchList([]);
            setShowLocationPopup(true);
          },
          type: 'white-button',
        },
        {
          text: 'ALLOW AUTO DETECT',
          onPress: () => {
            fireLocationEvent.current = true;
            hideAphAlert!();
            setLoading?.(true);
            doRequestAndAccessLocationModified()
              .then((response) => {
                setLoading?.(false);
                // locationWebEngageEvent(response, 'Auto Detect');
                response && setLocationDetails?.(response);
                saveLocationWithConsultation(response);
              })
              .catch((e: any) => {
                setLoading?.(false);
                e &&
                  typeof e == 'string' &&
                  !e.includes('denied') &&
                  showAphAlert!({
                    title: 'Uh oh! :(',
                    description: e,
                  });
              });
          },
        },
      ],
    });
  };

  const requestPermission = async () => {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        setNotificationAlert(true);
        await messaging().requestPermission();
      }
    } catch (error) {}
  };

  const naviteToChatRoom = async () => {
    setLoading?.(true);
    try {
      const res = await client.query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId: orderId,
        },
        fetchPolicy: 'no-cache',
      });
      setLoading?.(false);
      const appointmentData = res.data.getAppointmentData!.appointmentsHistory;
      if (appointmentData) {
        if (appointmentData?.[0]?.doctorInfo !== null) {
          clearStackAndNavigate(props.navigation, AppRoutes.ChatRoom, {
            data: appointmentData[0],
            callType: '',
            prescription: '',
            disableChat: false,
          });
        } else {
          moveToHome();
        }
      }
    } catch (error) {
      setLoading?.(false);
      props.navigation.navigate('APPOINTMENTS');
    }
  };

  const onPressCopy = () => {
    Clipboard.setString(paymentId);
    Platform.OS === 'android' && ToastAndroid.show('Copied', ToastAndroid.SHORT);
  };

  const downloadInvoice = () => {
    return client.query({
      query: CONSULT_ORDER_INVOICE,
      variables: {
        patientId: currentPatient.id,
        appointmentId: orderId,
      },
      fetchPolicy: 'no-cache',
    });
  };

  const viewInvoice = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (resuts) {
        const response = await downloadInvoice();
        const { data } = response;
        const { getOrderInvoice } = data;
        let fileName: string =
          'Apollo_Consult_Invoice' + moment().format('MMM_D_YYYY_HH_mm') + '.pdf';
        const downloadPath = getConsultInvoiceDownloadPath();
        RNFetchBlob.config({
          fileCache: true,
          path: downloadPath,
          addAndroidDownloads: {
            title: fileName,
            useDownloadManager: true,
            notification: true,
            path: downloadPath,
            mime: mimeType(downloadPath),
            description: 'File downloaded by download manager.',
          },
        })
          .fetch('GET', String(getOrderInvoice), {})
          .then((res) => {
            Platform.OS === 'android'
              ? Alert.alert('Download Complete')
              : Platform.OS === 'ios'
              ? RNFetchBlob.ios.previewDocument(res.path())
              : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
          })
          .catch((err) => {});
      }
    } catch (error) {}
  };

  const emailInvoice = async (email: any) => {
    try {
      const res = await client.query({
        query: CONSULT_ORDER_INVOICE,
        variables: {
          patientId: currentPatient.id,
          appointmentId: orderId,
          emailId: email,
        },
        fetchPolicy: 'no-cache',
      });
    } catch (error) {}
  };

  const onPressLocationChange = () => {
    fireLocationEvent.current = true;
    userChangedLocation.current = true;
    setlocationSearchList([]);
    setShowLocationPopup(true);
  };

  const autoSearchPlaces = async (searchText: string) => {
    try {
      const res = await autoCompletePlaceSearch(searchText);
      if (res?.data?.predictions) {
        const address = res.data.predictions?.map(
          (item: {
            place_id: string;
            structured_formatting: {
              main_text: string;
            };
          }) => {
            return { name: item?.structured_formatting?.main_text, placeId: item?.place_id };
          }
        );
        setlocationSearchList(address);
      }
    } catch (error) {}
  };

  const renderSearchManualLocation = () => {
    if (showLocationPopup) {
      return (
        <View style={styles.locationMainView}>
          <View style={styles.currentLocationView}>
            <View style={styles.locationSubView}>
              <Text style={styles.currentLocationText}>Current Location</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLocationPopup(false);
                  // locationWebEngageEvent(undefined, 'Manual entry');
                }}
              >
                <Remove />
              </TouchableOpacity>
            </View>
            <View style={styles.locationInput}>
              <View style={{ flex: 7 }}>
                <TextInputComponent
                  autoFocus={true}
                  onChangeText={(value) => {
                    // setLocationSearchText(value);
                    if (value.length > 2) {
                      autoSearchPlaces(value);
                      setshowLocations(true);
                    } else {
                      setshowLocations(false);
                    }
                  }}
                />
              </View>
              <View style={styles.locationIconView}>
                <LocationOn />
              </View>
            </View>
            {showLocations && (
              <View>
                {locationSearchList?.map((item, i) => (
                  <View key={i} style={styles.searchedLocationItem}>
                    <Text
                      style={styles.citiesText}
                      onPress={() => {
                        saveLocationDetails(item);
                        setShowLocationPopup(false);
                      }}
                    >
                      {item?.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      );
    }
  };

  const saveLocationDetails = (item: { name: string; placeId: string }) => {
    setLoading?.(true);
    getPlaceInfoByPlaceId(item.placeId)
      .then((response) => {
        const addrComponents = g(response, 'data', 'result', 'address_components') || [];
        const coordinates = g(response, 'data', 'result', 'geometry', 'location')! || {};

        const city =
          findAddrComponents('locality', addrComponents) ||
          findAddrComponents('administrative_area_level_2', addrComponents);
        if (city?.toLowerCase() != (locationForDiagnostics?.city || '')?.toLowerCase()) {
          clearDiagnoticCartInfo?.();
        }
        if (addrComponents?.length > 0) {
          const locationData: LocationData = {
            displayName: item?.name,
            latitude:
              typeof coordinates?.lat == 'string' ? Number(coordinates?.lat) : coordinates?.lat,
            longitude:
              typeof coordinates?.lng == 'string' ? Number(coordinates?.lng) : coordinates?.lng,
            area: [
              findAddrComponents('route', addrComponents),
              findAddrComponents('sublocality_level_2', addrComponents),
              findAddrComponents('sublocality_level_1', addrComponents),
            ]
              ?.filter((i) => i)
              ?.join(', '),
            city,
            state: findAddrComponents('administrative_area_level_1', addrComponents),
            country: findAddrComponents('country', addrComponents),
            pincode: findAddrComponents('postal_code', addrComponents),
            lastUpdated: new Date().getTime(),
          };

          setLocationDetails?.(locationData);

          getPlaceInfoByLatLng(coordinates.lat, coordinates.lng)
            .then((response) => {
              const addrComponents =
                g(response, 'data', 'results', '0' as any, 'address_components') || [];
              if (addrComponents.length > 0) {
                setLocationDetails?.({
                  ...locationData,
                  pincode: findAddrComponents('postal_code', addrComponents),
                  lastUpdated: new Date().getTime(),
                });
                const locationInput = {
                  ...locationData,
                  pincode: findAddrComponents('postal_code', addrComponents),
                  lastUpdated: new Date().getTime(),
                };
                saveLocationWithConsultation(locationInput);
                const locationAttribute = {
                  ...locationData,
                  pincode: findAddrComponents('postal_code', addrComponents),
                };
                // locationWebEngageEvent(locationAttribute, 'Manual entry');
              }
            })
            .catch((error) => {});
        }
      })
      .catch((error) => {});
  };

  const saveLocationWithConsultation = async (location: LocationData) => {
    setLoading?.(true);
    await saveConsultationLocation(client, orderId, location);
    setLoading?.(false);
  };

  const renderPaymentStatus = () => {
    return (
      <PaymentStatus
        status={paymentStatus}
        amount={amount}
        orderInfo={orderInfo}
        savings={savings}
        PaymentMethod={PaymentMethod}
      />
    );
  };

  const renderAppointmentInfo = () => {
    return (
      <AppointmentInfo
        paymentId={paymentId}
        displayId={orderInfo?.displayId}
        orderDetails={orderDetails}
        onPressCopy={onPressCopy}
        onPressViewInvoice={viewInvoice}
        onPressEmailInvoice={(email: any) => emailInvoice(email)}
      />
    );
  };

  const renderConsultaitonSteps = () => {
    return <ConsultationSteps showPdf={() => setShowPDF(true)} />;
  };

  const renderLocationInfo = () => {
    return <LocationInfo onPressChange={onPressLocationChange} />;
  };

  const renderMedicineNote = () => {
    return <MedicineNote />;
  };

  const renderTabBar = () => {
    return (
      <TabBar
        onPressGoToHome={moveToHome}
        onPressGoToMyOrders={naviteToChatRoom}
        isConsult={true}
      />
    );
  };

  const renderPdf = () => {
    return showPDF ? (
      <RenderPdf
        uri={'https://newassets-test.apollo247.com/files/Mobile_View_Infographic.pdf'}
        title={'Consultation guideline'}
        isPopup={true}
        setDisplayPdf={() => setShowPDF(false)}
        navigation={props.navigation}
      />
    ) : null;
  };

  const renderNotificationAlert = () => {
    return notificationAlert ? (
      <NotificationPermissionAlert
        onPressOutside={() => setNotificationAlert(false)}
        onButtonPress={() => {
          setNotificationAlert(false);
          Linking.openSettings();
        }}
      />
    ) : null;
  };

  return (
    <>
      {!fetching ? (
        <SafeAreaView style={styles.container}>
          <ScrollView>
            {renderPaymentStatus()}
            {renderAppointmentInfo()}
            {renderConsultaitonSteps()}
            {renderLocationInfo()}
            {renderMedicineNote()}
            {renderNotificationAlert()}
            {renderPdf()}
            {renderSearchManualLocation()}
          </ScrollView>
          {renderTabBar()}
        </SafeAreaView>
      ) : (
        <Spinner />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  locationMainView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 15,
    elevation: 15,
  },
  currentLocationText: {
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  currentLocationView: {
    ...theme.viewStyles.cardViewStyle,
    width: 235,
    padding: 16,
    marginTop: 40,
  },
  locationIconView: {
    marginLeft: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 10,
  },
  locationSubView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchedLocationItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    paddingVertical: 7,
  },
  citiesText: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  locationInput: {
    flexDirection: 'row',
    marginTop: 5,
  },
});
