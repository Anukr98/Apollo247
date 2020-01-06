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
  getAppointmentData,
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
import { aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { AsyncStorage, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import firebase from 'react-native-firebase';
import { Notification, NotificationOpen } from 'react-native-firebase/notifications';
import InCallManager from 'react-native-incall-manager';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { FEEDBACKTYPE } from '../graphql/types/globalTypes';
import { FeedbackPopup } from './FeedbackPopup';
import { MedicalIcon } from './ui/Icons';

const styles = StyleSheet.create({
  rescheduleTextStyles: {
    ...theme.viewStyles.yellowTextStyle,
    marginVertical: 10,
    textAlign: 'center',
  },
  claimStyles: {
    flex: 0.5,
    marginLeft: 5,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
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
  | 'Order_Delivered'
  | 'Order_Out_For_Delivery';

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

  const processNotification = async (notification: Notification) => {
    const { title, body, data } = notification;
    const notificationType = data.type as CustomNotificationType;
    aphConsole.log({ notificationType, title, body, data });
    aphConsole.log('processNotification', notification);

    const currentScreenName = await AsyncStorage.getItem('setCurrentName');
    aphConsole.log('setCurrentName', currentScreenName);

    if (notificationType === 'chat_room' || notificationType === 'call_started') {
      if (currentScreenName === AppRoutes.ChatRoom) return;
    }

    if (notificationType === 'Reschedule_Appointment') {
      if (
        currentScreenName === AppRoutes.AppointmentDetails ||
        currentScreenName === AppRoutes.AppointmentOnlineDetails
      )
        return;
    }

    aphConsole.log('processNotification after return statement');

    switch (notificationType) {
      case 'Reschedule_Appointment':
        {
          aphConsole.log('Reschedule_Appointment');
          let userName = data.patientName;
          let doctorName = data.doctorName;

          showAphAlert!({
            title: `Hi ${userName},`,
            description: `Unfortunately ${doctorName} will not be able to make it for your appointment due to an emergency`,
            unDismissable: true,
            children: (
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 20,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginVertical: 18,
                }}
              >
                <TouchableOpacity
                  style={styles.claimStyles}
                  onPress={() => {
                    hideAphAlert && hideAphAlert();
                  }}
                >
                  <Text style={styles.rescheduleTextStyles}>{'CLAIM REFUND'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescheduletyles}
                  onPress={() => {
                    console.log('data.appointmentId', data.appointmentId);
                    console.log('data.callType', data.callType);
                    getAppointmentData(data.appointmentId, notificationType, '');
                  }}
                >
                  <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>
                    {'RESCHEDULE'}
                  </Text>
                </TouchableOpacity>
              </View>
            ),
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
          const orderAutoId: string = data.orderAutoId;
          // data.orderId, data.deliveredDate
          showAphAlert!({
            title: 'Hi :(',
            description: `Your order #${orderAutoId} is out for delivery.`,
            CTAs: [
              {
                text: 'DISMISS',
                onPress: () => hideAphAlert!(),
              },
              {
                text: 'VIEW DETAILS',
                onPress: () => {
                  hideAphAlert!();
                  props.navigation.navigate(AppRoutes.OrderDetailsScene, {
                    goToHomeOnBack: true,
                    orderAutoId: orderAutoId,
                  });
                },
              },
            ],
          });
        }
        break;

      case 'Cart_Ready':
        {
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
                  showAphAlert!({
                    title: 'Uh oh.. :(',
                    description: 'Something went wrong.',
                  });
                });
            });
        }
        break;

      case 'chat_room':
        {
          let doctorName = data.doctorName;
          let userName = data.patientName;

          aphConsole.log('chat_room');
          showAphAlert!({
            title: `Hi ${userName} :)`,
            description: `Dr. ${doctorName} is waiting to start your consultation. Please proceed to the Consult Room`,
            unDismissable: true,
            children: (
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 20,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginVertical: 18,
                }}
              >
                <TouchableOpacity
                  style={styles.claimStyles}
                  onPress={() => {
                    hideAphAlert && hideAphAlert();
                  }}
                >
                  <Text style={styles.rescheduleTextStyles}>{'CANCEL'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescheduletyles}
                  onPress={() => {
                    console.log('data.appointmentId', data.appointmentId);
                    getAppointmentData(data.appointmentId, notificationType, '');
                  }}
                >
                  <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>
                    {'CONSULT ROOM'}
                  </Text>
                </TouchableOpacity>
              </View>
            ),
          });
        }
        break;

      case 'call_started':
        {
          InCallManager.startRingtone('_BUNDLE_');
          InCallManager.start({ media: 'audio' }); // audio/video, default: audio
          aphConsole.log('call_started');

          let doctorName = data.doctorName;
          let userName = data.patientName;
          setLoading;

          showAphAlert!({
            title: `Hi ${userName} :)`,
            description: `Dr. ${doctorName} is waiting for your call response. Please proceed to the Consult Room`,
            unDismissable: true,
            children: (
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 20,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginVertical: 18,
                }}
              >
                <TouchableOpacity
                  style={styles.claimStyles}
                  onPress={() => {
                    hideAphAlert && hideAphAlert();
                    InCallManager.stopRingtone();
                    InCallManager.stop();
                  }}
                >
                  <Text style={styles.rescheduleTextStyles}>{'CANCEL'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescheduletyles}
                  onPress={() => {
                    aphConsole.log('data.appointmentId', data.appointmentId);
                    aphConsole.log('data.callType', data.callType);
                    getCallStatus(
                      data.appointmentCallId,
                      data.appointmentId,
                      notificationType,
                      data.callType,
                      doctorName
                    );
                  }}
                >
                  <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>
                    {'CONSULT ROOM'}
                  </Text>
                </TouchableOpacity>
              </View>
            ),
          });
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
              aphConsole.log('notificationOpen error', error);
            }
          }
        }
      })
      .catch(() => {});

    try {
      const channel = new firebase.notifications.Android.Channel(
        'fcm_FirebaseNotifiction_default_channel',
        'Apollo',
        firebase.notifications.Android.Importance.Default
      )
        .setDescription('Demo app description')
        .setSound('incallmanager_ringtone.mp3');
      firebase.notifications().android.createChannel(channel);
    } catch (error) {
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

    return function cleanup() {
      aphConsole.log('didmount clean up');
      notificationListener();
      onNotificationListener();
    };
  }, []);

  const getCallStatus = (
    appointmentCallId: string,
    appointmentId: string,
    notificationType: string,
    callType: string,
    doctorName: string
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
            InCallManager.stopRingtone();
            InCallManager.stop();

            console.log('call ended');
            hideAphAlert && hideAphAlert();
            setLoading && setLoading(false);

            showAphAlert!({
              title: `Oops :(`,
              description: `You have missed the call from Dr. ${doctorName}`,
              unDismissable: true,
              children: (
                <View
                  style={{
                    flexDirection: 'row',
                    marginHorizontal: 20,
                    alignItems: 'flex-end',
                    marginVertical: 18,
                  }}
                >
                  <TouchableOpacity
                    style={styles.rescheduletyles}
                    onPress={() => {
                      hideAphAlert && hideAphAlert();
                      setLoading && setLoading(false);
                    }}
                  >
                    <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>{'OKAY'}</Text>
                  </TouchableOpacity>
                </View>
              ),
            });
          } else {
            setLoading && setLoading(false);
            console.log('call ongoing');
            getAppointmentData(appointmentId, notificationType, callType);
          }
        } catch (error) {
          setLoading && setLoading(false);
          hideAphAlert && hideAphAlert();
        }
      })
      .catch((e: any) => {
        setLoading && setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        console.log('getCallStatus error', error);
      });
  };

  const getAppointmentData = (
    appointmentId: string,
    notificationType: string,
    callType: string
  ) => {
    aphConsole.log('getAppointmentData', appointmentId, notificationType, callType);
    setLoading && setLoading(true);

    client
      .query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId: appointmentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data: any) => {
        try {
          hideAphAlert && hideAphAlert();
          setLoading && setLoading(false);

          console.log(
            'GetDoctorNextAvailableSlot',
            _data.data.getAppointmentData.appointmentsHistory
          );
          const appointmentData = _data.data.getAppointmentData.appointmentsHistory;
          if (appointmentData) {
            switch (notificationType) {
              case 'Reschedule_Appointment':
                {
                  appointmentData[0].appointmentType === 'ONLINE'
                    ? props.navigation.navigate(AppRoutes.AppointmentOnlineDetails, {
                        data: appointmentData[0],
                        from: 'notification',
                      })
                    : props.navigation.navigate(AppRoutes.AppointmentDetails, {
                        data: appointmentData[0],
                        from: 'notification',
                      });
                }
                break;

              case 'call_started':
                {
                  props.navigation.navigate(AppRoutes.ChatRoom, {
                    data: appointmentData[0],
                    callType: callType,
                  });
                }
                break;

              case 'chat_room':
                {
                  props.navigation.navigate(AppRoutes.ChatRoom, {
                    data: appointmentData[0],
                    callType: callType,
                  });
                }
                break;

              default:
                break;
            }
          }
        } catch (error) {
          hideAphAlert && hideAphAlert();
          setLoading && setLoading(false);
        }
      })
      .catch((e: any) => {
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while GetDoctorNextAvailableSlot', error);
        setLoading && setLoading(false);
      });
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
        onComplete={() => {
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
