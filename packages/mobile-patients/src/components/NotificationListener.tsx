import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  EPrescription,
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_APPOINTMENT_DATA,
  GET_CALL_DETAILS,
  GET_MEDICINE_ORDER_DETAILS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAppointmentData as getAppointmentDataQuery,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import {
  getCallDetails,
  getCallDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/getCallDetails';
import {
  GetMedicineOrderDetails,
  GetMedicineOrderDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderDetails';
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  handleGraphQlError,
  g,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import firebase from 'react-native-firebase';
import { Notification, NotificationOpen } from 'react-native-firebase/notifications';
import InCallManager from 'react-native-incall-manager';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { FEEDBACKTYPE, DoctorType } from '../graphql/types/globalTypes';
import { FeedbackPopup } from './FeedbackPopup';
import { MedicalIcon } from './ui/Icons';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';
import { RemoteMessage } from 'react-native-firebase/messaging';
import KotlinBridge from '@aph/mobile-patients/src/KotlinBridge';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

const styles = StyleSheet.create({
  rescheduleTextStyles: {
    ...theme.viewStyles.yellowTextStyle,
    marginVertical: 10,
    textAlign: 'center',
  },
  rescheduletyles: {
    flex: 0.5,
    marginRight: 5,
    marginLeft: 8,
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
  },
});

type CustomNotificationType =
  | 'Reschedule_Appointment'
  | 'Cart_Ready'
  | 'call_started'
  | 'chat_room'
  | 'Order_Delivered' // for this we'll show feedback notification
  | 'Order_Out_For_Delivery'
  | 'Order_Placed'
  | 'Order_Confirmed'
  | 'Reminder_Appointment_15'
  | 'Reminder_Appointment_Casesheet_15'
  | 'Diagnostic_Order_Success'
  | 'Diagnostic_Order_Payment_Failed'
  | 'Registration_Success'
  | 'Patient_Cancel_Appointment'
  | 'Patient_Noshow_Reschedule_Appointment'
  | 'Appointment_Canceled'
  | 'PRESCRIPTION_READY';

export interface NotificationListenerProps extends NavigationScreenProps {}

export const NotificationListener: React.FC<NotificationListenerProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();

  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const { cartItems, setCartItems, ePrescriptions, setEPrescriptions } = useShoppingCart();
  const client = useApolloClient();
  const [medFeedback, setmedFeedback] = useState({
    visible: false,
    title: '',
    subtitle: '',
    transactionId: '',
  });

  const showMedOrderStatusAlert = (
    data:
      | {
          content: string;
          orderAutoId: string;
          orderId: string;
          firstName: string;
          statusDate: string;
        }
      | any,
    type?: CustomNotificationType
  ) => {
    aphConsole.log(`CustomNotificationType:: ${type}`);
    showAphAlert!({
      title: `Hi,`,
      description: data.content,
      CTAs: [
        {
          text: 'DISMISS',
          onPress: () => hideAphAlert!(),
          type: 'white-button',
        },
        {
          text: 'VIEW DETAILS',
          onPress: () => {
            hideAphAlert!();
            props.navigation.navigate(AppRoutes.OrderDetailsScene, {
              goToHomeOnBack: true,
              orderAutoId: data.orderAutoId,
            });
          },
        },
      ],
    });
  };

  const showTestOrderStatusAlert = (
    data:
      | {
          content: string;
          orderId: string;
          displayId: string;
          firstName: string;
          statusDate: string;
        }
      | any,
    type?: CustomNotificationType
  ) => {
    aphConsole.log(`CustomNotificationType:: ${type}`);
    showAphAlert!({
      title: ' ',
      description: data.content,
      CTAs: [
        {
          text: 'DISMISS',
          onPress: () => hideAphAlert!(),
          type: 'white-button',
        },
        {
          text: 'VIEW DETAILS',
          onPress: () => {
            hideAphAlert!();
            props.navigation.navigate(AppRoutes.TestOrderDetails, {
              goToHomeOnBack: true,
              orderId: data.orderId,
            });
          },
        },
      ],
    });
  };

  const showChatRoomAlert = (
    data: { content: string; appointmentId: string } | any,
    notificationType: CustomNotificationType,
    prescription: string
  ) => {
    const description = data.content;
    const appointmentId = data.appointmentId;
    showAphAlert!({
      title: ' ',
      description,
      CTAs: [
        {
          text: 'DISMISS',
          onPress: () => hideAphAlert!(),
          type: 'white-button',
        },
        {
          text: 'CONSULT ROOM',
          onPress: () => {
            hideAphAlert!();
            getAppointmentData(appointmentId, notificationType, '', prescription);
          },
          type: 'orange-button',
        },
      ],
    });
  };

  const showConsultDetailsRoomAlert = (
    data: { content: string; appointmentId: string; file_id: string } | any,
    notificationType: CustomNotificationType,
    prescription: string
  ) => {
    const description = data.content;
    const appointmentId = data.appointmentId;
    showAphAlert!({
      title: ' ',
      description,
      CTAs: [
        {
          text: 'DISMISS',
          onPress: () => hideAphAlert!(),
          type: 'white-button',
        },
        {
          text: 'VIEW NOW',
          onPress: () => {
            hideAphAlert!();
            getAppointmentData(appointmentId, notificationType, '', prescription, data.file_id);
          },
          type: 'orange-button',
        },
      ],
    });
  };

  const showContentAlert = (
    data:
      | { content: string; appointmentId: string /*patientName, doctorName, android_channel_id*/ }
      | any,
    notificationType: CustomNotificationType
  ) => {
    console.log('-- notificationType --', { notificationType });
    showAphAlert!({
      title: ' ',
      description: data.content,
    });
  };

  const processNotification = async (notification: Notification) => {
    const { title, body, data } = notification;
    const notificationType = data.type as CustomNotificationType;
    aphConsole.log({ notificationType, title, body, data });
    aphConsole.log('processNotification', notification);

    const currentScreenName = await AsyncStorage.getItem('setCurrentName');
    aphConsole.log('setCurrentName', currentScreenName);

    // const notificationArray = [];
    // let array: any = await AsyncStorage.getItem('allNotification');
    // // console.log('array', array);

    // const obj: any = {};
    // obj['data'] = notification.data;
    // obj['date'] = new Date();

    // if (array !== null) {
    //   array = JSON.parse(array);
    //   array.date = new Date();
    //   array.isRead = 'false';
    //   array.push(obj);

    //   if (array.length <= 10) {
    //     notificationArray.push(...array);
    //   } else {
    //     notificationArray.push(...array.slice(1));
    //   }
    // } else {
    //   notificationArray.push(obj);
    // }

    // console.log('notificationArray', notificationArray, notificationArray.length);

    // AsyncStorage.setItem('allNotification', JSON.stringify(notificationArray));
    // AsyncStorage.removeItem('allNotification');

    if (
      notificationType === 'chat_room' ||
      notificationType === 'call_started' ||
      notificationType === 'Appointment_Canceled' ||
      notificationType === 'Patient_Noshow_Reschedule_Appointment'
      // notificationType === 'Reschedule_Appointment'
    ) {
      if (currentScreenName === AppRoutes.ChatRoom) return;
    }

    if (notificationType === 'Reschedule_Appointment') {
      if (
        currentScreenName === AppRoutes.AppointmentDetails ||
        currentScreenName === AppRoutes.AppointmentOnlineDetails
      )
        return;
    }

    // if (notificationType === 'PRESCRIPTION_READY') {
    //   if (currentScreenName === AppRoutes.ConsultDetails) return;
    // }

    aphConsole.log('processNotification after return statement');

    switch (notificationType) {
      case 'Reschedule_Appointment':
        {
          aphConsole.log('Reschedule_Appointment');
          const userName = data.patientName;
          const doctorName = data.doctorName;

          showAphAlert!({
            title: `Hi ${userName},`,
            description: `Unfortunately ${doctorName} will not be able to make it for your appointment due to an emergency`,
            unDismissable: true,
            CTAs: [
              {
                text: 'CLAIM REFUND',
                onPress: () => {
                  hideAphAlert && hideAphAlert();
                },
                type: 'white-button',
              },
              {
                text: 'RESCHEDULE',
                onPress: () => {
                  console.log(
                    `data.appointmentId: ${data.appointmentId}, data.callType: ${data.callType}`
                  );
                  getAppointmentData(data.appointmentId, notificationType, '', '');
                },
                type: 'orange-button',
              },
            ],
          });
        }
        break;
      case 'Order_Delivered':
        {
          const orderAutoId: string = data.orderAutoId;
          const orderId: string = data.orderId;
          const title: string = `Medicines — #${orderAutoId}`;
          const subtitle: string = `Delivered On: ${moment(data.deliveredDate).format(
            'D MMM YYYY'
          )}`;
          setmedFeedback({ title, subtitle, transactionId: orderId, visible: true });
        }
        break;
      case 'Order_Out_For_Delivery':
        {
          showMedOrderStatusAlert(data, 'Order_Out_For_Delivery');
        }
        break;
      case 'Order_Placed':
        {
          showMedOrderStatusAlert(data, 'Order_Placed');
        }
        break;
      case 'Order_Confirmed':
        {
          showMedOrderStatusAlert(data, 'Order_Confirmed');
        }
        break;
      case 'Diagnostic_Order_Success':
        {
          return; // Not showing in app because PN overriding in-app notification
          // showTestOrderStatusAlert(data, 'Diagnostic_Order_Success');
        }
        break;
      case 'Diagnostic_Order_Payment_Failed':
        {
          showTestOrderStatusAlert(data, 'Diagnostic_Order_Payment_Failed');
        }
        break;

      case 'Registration_Success':
        {
          showContentAlert(data, 'Registration_Success');
        }
        break;
      case 'Patient_Noshow_Reschedule_Appointment':
        {
          showAphAlert!({
            title: ' ',
            description: data.content,
            CTAs: [
              {
                text: 'GO BACK',
                onPress: () => {
                  hideAphAlert && hideAphAlert();
                  props.navigation.dispatch(
                    StackActions.reset({
                      index: 0,
                      key: null,
                      actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
                    })
                  );
                },
                type: 'white-button',
              },
              {
                text: 'RESCHEDULE',
                onPress: () => {
                  console.log(
                    `data.appointmentId: ${data.appointmentId}, data.callType: ${data.callType}`
                  );
                  getAppointmentData(data.appointmentId, notificationType, '', '');
                },
                type: 'orange-button',
              },
            ],
          });
        }
        break;
      case 'Patient_Cancel_Appointment': {
        // showContentAlert(data, 'Patient_Cancel_Appointment');
        return; // Not showing in app because PN overriding in-app notification
      }

      case 'Cart_Ready':
        {
          // data.deliveredDate
          const orderId: number = parseInt(data.orderId || '0');
          console.log('Cart_Ready called');
          client
            .query<GetMedicineOrderDetails, GetMedicineOrderDetailsVariables>({
              query: GET_MEDICINE_ORDER_DETAILS,
              variables: {
                orderAutoId: orderId,
                patientId: currentPatient && currentPatient.id,
              },
              fetchPolicy: 'no-cache',
            })
            .then((data) => {
              const orderDetails = data.data.getMedicineOrderDetails.MedicineOrderDetails;
              const items = (orderDetails!.medicineOrderLineItems || [])
                .map((item) => ({
                  sku: item!.medicineSKU!,
                  qty: item!.quantity!,
                }))
                .filter((item) => item.sku);

              Promise.all(items.map((item) => getMedicineDetailsApi(item!.sku!)))
                .then((result) => {
                  const itemsToAdd = result
                    .map(({ data: { productdp } }, index) => {
                      const medicineDetails = (productdp && productdp[0]) || {};
                      if (!medicineDetails.is_in_stock) return null;
                      return {
                        id: medicineDetails!.sku!,
                        mou: medicineDetails.mou,
                        name: medicineDetails!.name,
                        price: medicineDetails!.price,
                        specialPrice: medicineDetails.special_price
                          ? typeof medicineDetails.special_price == 'string'
                            ? parseInt(medicineDetails.special_price)
                            : medicineDetails.special_price
                          : undefined,
                        quantity: items[index].qty || 1,
                        prescriptionRequired: medicineDetails.is_prescription_required == '1',
                        isMedicine: medicineDetails.type_id == 'Pharma',
                        thumbnail: medicineDetails.thumbnail || medicineDetails.image,
                      } as ShoppingCartItem;
                    })
                    .filter((item) => item) as ShoppingCartItem[];
                  const itemsToAddSkus = itemsToAdd.map((i) => i.id);
                  // :: CONFIRM HERE :: // Whether to replace cart or add to existing?
                  const itemsToAddInCart = [
                    ...itemsToAdd,
                    ...cartItems.filter((item) => !itemsToAddSkus.includes(item.id!)),
                  ];
                  setCartItems!(itemsToAddInCart);

                  // Adding prescriptions
                  if (orderDetails!.prescriptionImageUrl) {
                    const imageUrls = orderDetails!.prescriptionImageUrl
                      .split(',')
                      .map((item) => item.trim());

                    const ePresToAdd = imageUrls.map(
                      (item) =>
                        ({
                          id: item,
                          date: moment(orderDetails!.medicineOrdersStatus![0]!.statusDate).format(
                            'DD MMM YYYY'
                          ),
                          doctorName: '',
                          forPatient: (currentPatient && currentPatient.firstName) || '',
                          medicines: (orderDetails!.medicineOrderLineItems || [])
                            .map((item) => item!.medicineName)
                            .join(', '),
                          uploadedUrl: item,
                        } as EPrescription)
                    );
                    const ePresIds = ePresToAdd.map((i) => i!.uploadedUrl);
                    setEPrescriptions!([
                      ...ePrescriptions.filter((item) => !ePresIds.includes(item.uploadedUrl!)),
                      ...ePresToAdd,
                    ]);
                  }

                  showAphAlert!({
                    title: 'Hey there! :)',
                    description: 'Your medicines have been added to your cart.',
                  });
                })
                .catch((e) => {
                  CommonBugFender('NotificationListener_getMedicineDetailsApi', e);
                  showAphAlert!({
                    title: 'Uh oh.. :(',
                    description: 'Something went wrong.',
                  });
                });
            })
            .catch((e) => {
              CommonBugFender('NotificationListener_GET_MEDICINE_ORDER_DETAILS', e);
            });
        }
        break;

      case 'chat_room':
        {
          const doctorName = data.doctorName;
          const userName = data.patientName;
          const doctorType = data.doctorType;
          aphConsole.log('chat_room');
          showAphAlert!({
            title: `Hi ${userName} :)`,
            description: `Dr. ${
              doctorType == DoctorType.JUNIOR ? doctorName + '`s' + ' team doctor' : doctorName
            } is waiting to start your consultation. Please proceed to the Consult Room`,
            unDismissable: true,
            CTAs: [
              {
                text: 'CANCEL',
                type: 'white-button',
                onPress: () => {
                  hideAphAlert && hideAphAlert();
                },
              },
              {
                text: 'CONSULT ROOM',
                type: 'orange-button',
                onPress: () => {
                  console.log('data.appointmentId', data.appointmentId);
                  getAppointmentData(data.appointmentId, notificationType, '', '');
                },
              },
            ],
          });
        }
        break;

      case 'call_started':
        {
          console.log('call_started', data);

          const doctorName = data.doctorName;
          const userName = data.patientName;
          // setLoading;
          getCallStatus(
            data.appointmentCallId,
            data.appointmentId,
            notificationType,
            data.callType,
            doctorName,
            userName,
            data.doctorType
          );
        }
        break;

      case 'Reminder_Appointment_15': // 15 min, case sheet present
        {
          showChatRoomAlert(data, 'Reminder_Appointment_15', '');
        }
        break;
      case 'Reminder_Appointment_Casesheet_15': // 15 min, no case sheet
        {
          showChatRoomAlert(data, 'Reminder_Appointment_Casesheet_15', '');
        }
        break;

      case 'Appointment_Canceled': // 15 min, no case sheet
        {
          const doctorName = data.doctorName;
          const userName = data.patientName;
          const doctorType = data.doctorType;

          aphConsole.log('Appointment_Canceled');
          showAphAlert!({
            title: `Hi ${userName} :)`,
            description: `We are really sorry. Dr. ${
              doctorType == DoctorType.JUNIOR ? doctorName + '`s' + ' team doctor' : doctorName
            } will not be able to make it for this appointment. Any payment that you have made for this consultation would be refunded in 2-4 working days. We request you to please book appointment with any of our other Apollo certified Doctor`,
            unDismissable: true,
          });
        }
        break;

      case 'PRESCRIPTION_READY': // prescription is generated
        {
          showConsultDetailsRoomAlert(data, 'PRESCRIPTION_READY', 'true');
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    console.log('createNotificationListeners');
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    const notificationListener = firebase.notifications().onNotification((notification) => {
      aphConsole.log('notificationListener');
      const localNotification = new firebase.notifications.Notification()
        // .setSound('incallmanager_ringtone.mp3')
        .setNotificationId(notification.notificationId)
        .setTitle(notification.title)
        .setBody(notification.body)
        .setData(notification.data)
        .android.setChannelId('fcm_FirebaseNotifiction_default_channel') // e.g. the id you chose above
        .android.setSmallIcon('@mipmap/ic_launcher') // create this icon in Android Studio
        .android.setColor('#000000') // you can set a color here
        .android.setPriority(firebase.notifications.Android.Priority.Default);
      firebase
        .notifications()
        .displayNotification(localNotification)
        .catch((err) => console.error(err));

      processNotification(notification);
    });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    firebase
      .notifications()
      .getInitialNotification()
      .then(async (_notificationOpen: NotificationOpen) => {
        if (_notificationOpen) {
          aphConsole.log('_notificationOpen');
          const notification = _notificationOpen.notification;
          const lastNotification = await AsyncStorage.getItem('lastNotification');
          if (lastNotification !== notification.notificationId) {
            await AsyncStorage.setItem('lastNotification', notification.notificationId);
            // App was opened by a notification
            // Get the action triggered by the notification being opened
            // const action = _notificationOpen.action;
            processNotification(_notificationOpen.notification);

            try {
              aphConsole.log('notificationOpen', _notificationOpen.notification.notificationId);

              firebase
                .notifications()
                .removeDeliveredNotification(_notificationOpen.notification.notificationId);
            } catch (error) {
              CommonBugFender('NotificationListener_firebase_try', error);
              aphConsole.log('notificationOpen error', error);
            }
          }
        }
      })
      .catch((e) => {
        CommonBugFender('NotificationListener_firebase', e);
      });

    try {
      const channel = new firebase.notifications.Android.Channel(
        'fcm_FirebaseNotifiction_default_channel',
        'Apollo',
        firebase.notifications.Android.Importance.Default
      ).setDescription('Demo app description');
      // .setSound('incallmanager_ringtone.mp3');
      firebase.notifications().android.createChannel(channel);
    } catch (error) {
      CommonBugFender('NotificationListener_channel_try', error);
      aphConsole.log('error in notification channel', error);
    }

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    const onNotificationListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen: NotificationOpen) => {
        if (notificationOpen) {
          aphConsole.log('notificationOpen');

          const notification: Notification = notificationOpen.notification;
          processNotification(notification);
        }
      });

    const messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
      // Process your message as required
      if (Platform.OS === 'android') {
        try {
          // console.log('RemoteMessage', message, message._data);
          // if((message._data.af-uinstall-tracking === true) return;
          // if (message._data.source !== 'webengage') {
          KotlinBridge.cmNotification(JSON.stringify(message.data));
          // }
        } catch (error) {}
      }
    });

    return function cleanup() {
      console.log('didmount clean up');
      notificationListener();
      onNotificationListener();
      messageListener();
    };
  }, []);

  const getCallStatus = (
    appointmentCallId: string,
    appointmentId: string,
    notificationType: CustomNotificationType,
    callType: string,
    doctorName: string,
    userName: string,
    doctorType: string
  ) => {
    setLoading && setLoading(true);

    client
      .query<getCallDetails, getCallDetailsVariables>({
        query: GET_CALL_DETAILS,
        variables: {
          appointmentCallId: appointmentCallId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        console.log('data', data);
        try {
          const endTime = data.data.getCallDetails.appointmentCallDetails.endTime;
          console.log('call endTime', endTime);

          if (endTime) {
            try {
              InCallManager.stopRingtone();
              InCallManager.stop();

              console.log('call ended');
              hideAphAlert && hideAphAlert();
              setLoading && setLoading(false);

              // showAphAlert!({
              //   title: `Oops :(`,
              //   description: `You have missed the call from Dr. ${doctorName}`,
              //   unDismissable: true,
              //   children: (
              //     <View
              //       style={{
              //         flexDirection: 'row',
              //         marginHorizontal: 20,
              //         alignItems: 'flex-end',
              //         marginVertical: 18,
              //       }}
              //     >
              //       <TouchableOpacity
              //         style={styles.rescheduletyles}
              //         onPress={() => {
              //           hideAphAlert && hideAphAlert();
              //           setLoading && setLoading(false);
              //         }}
              //       >
              //         <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>
              //           {'OKAY'}
              //         </Text>
              //       </TouchableOpacity>
              //     </View>
              //   ),
              // });
            } catch (error) {}
          } else {
            try {
              setLoading && setLoading(false);
              console.log('call ongoing');
              InCallManager.startRingtone('_BUNDLE_');
              InCallManager.start({ media: 'audio' }); // audio/video, default: audio

              setTimeout(() => {
                InCallManager.stopRingtone();
                InCallManager.stop();
              }, 15000);

              showAphAlert!({
                title: `Hi ${userName} :)`,
                description: `Dr. ${
                  doctorType == DoctorType.JUNIOR ? doctorName + '`s' + ' team doctor' : doctorName
                } is waiting for your call response. Please proceed to the Consult Room`,
                unDismissable: true,
                CTAs: [
                  {
                    text: 'CANCEL',
                    type: 'white-button',
                    onPress: () => {
                      hideAphAlert && hideAphAlert();
                      InCallManager.stopRingtone();
                      InCallManager.stop();
                    },
                  },
                  {
                    text: 'CONSULT ROOM',
                    type: 'orange-button',
                    onPress: () => {
                      getAppointmentData(appointmentId, notificationType, callType, '');
                    },
                  },
                ],
              });
            } catch (error) {}
          }
        } catch (error) {
          CommonBugFender('NotificationListener_getCallStatus_try', error);
          setLoading && setLoading(false);
          hideAphAlert && hideAphAlert();
        }
      })
      .catch((e: any) => {
        CommonBugFender('NotificationListener_getCallStatus', e);
        setLoading && setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        console.log('getCallStatus error', error);
      });
  };

  const getAppointmentData = (
    appointmentId: string,
    notificationType: CustomNotificationType,
    callType: string,
    prescription: string,
    fileName?: string
  ) => {
    aphConsole.log('getAppointmentData', appointmentId, notificationType, callType);
    setLoading && setLoading(true);

    client
      .query<getAppointmentDataQuery, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId: appointmentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        try {
          hideAphAlert && hideAphAlert();
          setLoading && setLoading(false);

          console.log(
            'GetDoctorNextAvailableSlot',
            _data.data.getAppointmentData!.appointmentsHistory
          );
          const appointmentData = _data.data.getAppointmentData!.appointmentsHistory;
          if (appointmentData) {
            if (
              notificationType == 'Reschedule_Appointment' ||
              notificationType == 'Patient_Noshow_Reschedule_Appointment'
            ) {
              try {
                if (appointmentData[0]!.doctorInfo !== null) {
                  appointmentData[0]!.appointmentType === 'ONLINE'
                    ? props.navigation.navigate(AppRoutes.AppointmentOnlineDetails, {
                        data: appointmentData[0],
                        from: 'notification',
                      })
                    : props.navigation.navigate(AppRoutes.AppointmentDetails, {
                        data: appointmentData[0],
                        from: 'notification',
                      });
                }
              } catch (error) {}
            } else if (
              notificationType == 'call_started' ||
              notificationType == 'chat_room' ||
              notificationType == 'Reminder_Appointment_15' ||
              notificationType == 'Reminder_Appointment_Casesheet_15'
            ) {
              try {
                if (appointmentData[0]!.doctorInfo !== null) {
                  props.navigation.navigate(AppRoutes.ChatRoom, {
                    data: appointmentData[0],
                    callType: callType,
                    prescription: prescription,
                  });
                }
              } catch (error) {}
            } else if (notificationType == 'PRESCRIPTION_READY') {
              try {
                props.navigation.navigate(AppRoutes.ConsultDetails, {
                  CaseSheet: g(appointmentData[0], 'id'),
                  DoctorInfo: g(appointmentData[0], 'doctorInfo'),
                  PatientId: g(appointmentData[0], 'patientId'),
                  appointmentType: g(appointmentData[0], 'appointmentType'),
                  DisplayId: g(appointmentData[0], 'displayId'),
                  BlobName: fileName || '',
                });
              } catch (error) {}
            }
          }
        } catch (error) {
          CommonBugFender('NotificationListener_getAppointmentData_try', error);
          hideAphAlert && hideAphAlert();
          setLoading && setLoading(false);
        }
      })
      .catch((e) => {
        CommonBugFender('NotificationListener_getAppointmentData', e);
        console.log('Error occured while GetDoctorNextAvailableSlot', { e });
        setLoading && setLoading(false);
        // handleGraphQlError(e);
      });
  };

  const postRatingGivenWEGEvent = (rating: string, reason: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_FEEDBACK_GIVEN] = {
      'Patient UHID': g(currentPatient, 'id'),
      Rating: rating,
      'Rating Reason': reason,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_FEEDBACK_GIVEN, eventAttributes);
  };

  return (
    <>
      <FeedbackPopup
        title="We value your feedback! :)"
        description="How was your overall experience with the following medicine delivery —"
        info={{
          title: medFeedback.title,
          description: medFeedback.subtitle,
          imageComponent: <MedicalIcon />,
        }}
        transactionId={medFeedback.transactionId}
        type={FEEDBACKTYPE.PHARMACY}
        isVisible={medFeedback.visible}
        onComplete={(ratingStatus, ratingOption) => {
          postRatingGivenWEGEvent(ratingStatus!, ratingOption);
          setmedFeedback({ visible: false, title: '', subtitle: '', transactionId: '' });
          showAphAlert!({
            title: 'Thanks :)',
            description: 'Your feedback has been submitted. Thanks for your time.',
          });
        }}
      />
    </>
  );
};
