import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  EPrescription,
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_APPOINTMENT_DATA,
  GET_MEDICINE_ORDER_OMS_DETAILS_WITH_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAppointmentData as getAppointmentDataQuery,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  dataSavedUserID,
  aphConsole,
  g,
  postWebEngageEvent,
  overlyCallPermissions,
  getIsMedicine,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { StyleSheet, Platform, View, TouchableOpacity, Text } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { NavigationScreenProps } from 'react-navigation';
import { DoctorType, PrescriptionType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';
import KotlinBridge from '@aph/mobile-patients/src/KotlinBridge';
import { NotificationIconWhite } from './ui/Icons';
import { WebEngageEvents, WebEngageEventName } from '../helpers/webEngageEvents';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  getMedicineOrderOMSDetailsWithAddress,
  getMedicineOrderOMSDetailsWithAddressVariables,
} from '../graphql/types/getMedicineOrderOMSDetailsWithAddress';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

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
  buttonStyle: {
    height: 60,
    borderRadius: 10,
    backgroundColor: theme.colors.BUTTON_BG,
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    display: 'flex',
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
  | 'Order_ready_at_store'
  | 'Reminder_Appointment_15'
  | 'Reminder_Appointment_Casesheet_15'
  | 'Diagnostic_Order_Success'
  | 'Diagnostic_Order_Payment_Failed'
  | 'Registration_Success'
  | 'Patient_Cancel_Appointment'
  | 'Patient_Noshow_Reschedule_Appointment'
  | 'Appointment_Canceled'
  | 'PRESCRIPTION_READY'
  | 'doctor_Noshow_Reschedule_Appointment'
  | 'Appointment_Canceled_Refund'
  | 'Appointment_Payment_Pending_Failure'
  | 'Book_Appointment'
  | 'webview'
  | 'patient_chat_message';

export interface NotificationListenerProps extends NavigationScreenProps {}

export const NotificationListener: React.FC<NotificationListenerProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert, hideAphAlert, setLoading, setMedFeedback } = useUIElements();
  const client = useApolloClient();
  const { setDoctorJoinedChat } = useAppCommonData();
  const { setUserActionPayload } = useServerCart();

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
      description: data?.content,
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
              orderAutoId: data?.orderAutoId || data?.orderId,
            });
          },
        },
      ],
    });
  };

  const showOrderReadyAtStoreAlert = (
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
      title: `Hi, ${data.firstName}`,
      description:
        'Order status updated. Kindly alert the store 10 minutes before you are about to reach, so that we can keep the items ready!',
      children: (
        <View
          style={{
            marginHorizontal: 20,
            marginVertical: 25,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              hideAphAlert!();
              props.navigation.navigate(AppRoutes.OrderDetailsScene, {
                goToHomeOnBack: true,
                orderAutoId: data.orderAutoId,
              });
            }}
          >
            <NotificationIconWhite />
            <Text
              style={{
                marginTop: 4,
                textAlign: 'center',
                color: theme.colors.WHITE,
                ...theme.fonts.IBMPlexSansBold(14),
              }}
            >
              ALERT THE STORE
            </Text>
          </TouchableOpacity>
        </View>
      ),
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
    showAphAlert!({
      title: ' ',
      description: data.content,
    });
  };

  const showFollowupNotificationStatusAlert = (
    data: any,
    notificationType: CustomNotificationType
  ) => {
    showAphAlert!({
      title: `Hi ${currentPatient?.firstName || ''},`,
      description: `You have 1 new message from ${data?.doctorName || 'doctor'}`,
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
            getAppointmentData(data.appointmentId, notificationType, '', '');
          },
        },
      ],
    });
  };

  const processNotification = async (
    notification: FirebaseMessagingTypes.RemoteMessage,
    appOnForeground?: boolean
  ) => {
    const data = notification.data || {};
    const notificationType = data.type as CustomNotificationType;
    const currentScreenName = await AsyncStorage.getItem('setCurrentName');

    if (
      notificationType === 'chat_room' ||
      notificationType === 'call_started' ||
      notificationType === 'Appointment_Canceled' ||
      notificationType === 'doctor_Noshow_Reschedule_Appointment'
    ) {
      if (notificationType === 'chat_room' || notificationType === 'call_started') {
        if (data.doctorType === DoctorType.SENIOR) {
          setDoctorJoinedChat && setDoctorJoinedChat(true); // enabling join button in chat room if in case pubnub events not fired
        }
      }
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
                  try {
                    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_RESCHEDULE_CLAIM_REFUND] = {
                      'Patient Id': currentPatient.id,
                      'Appointment ID': data.appointmentId,
                      Type: data.type,
                    };
                    postWebEngageEvent(
                      WebEngageEventName.DOCTOR_RESCHEDULE_CLAIM_REFUND,
                      eventAttributes
                    );
                    props.navigation.popToTop();
                  } catch (error) {}

                  hideAphAlert && hideAphAlert();
                },
                type: 'white-button',
              },
              {
                text: 'RESCHEDULE',
                onPress: () => {
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
          setMedFeedback!({ title, subtitle, transactionId: orderId, visible: true });
        }
        break;
      case 'Order_Out_For_Delivery':
        {
          showMedOrderStatusAlert(data, 'Order_Out_For_Delivery');
        }
        break;
      case 'Order_Placed':
        {
          // showMedOrderStatusAlert(data, 'Order_Placed');
        }
        break;
      case 'Order_Confirmed':
        {
          showMedOrderStatusAlert(data, 'Order_Confirmed');
        }
        break;
      case 'Order_ready_at_store':
        {
          showOrderReadyAtStoreAlert(data, 'Order_ready_at_store');
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
                text: currentScreenName === AppRoutes.ChatRoom ? 'GO BACK' : 'CLAIM REFUND',
                onPress: () => {
                  hideAphAlert && hideAphAlert();
                  if (currentScreenName === AppRoutes.ChatRoom) {
                    navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
                  }
                },
                type: 'white-button',
              },
              {
                text: 'RESCHEDULE',
                onPress: () => {
                  getAppointmentData(data.appointmentId, notificationType, '', '');
                },
                type: 'orange-button',
              },
            ],
          });
        }
        break;
      case 'doctor_Noshow_Reschedule_Appointment':
        {
          showAphAlert!({
            title: ' ',
            description: data.content,
            CTAs: [
              {
                text: 'CLAIM REFUND',
                onPress: () => {
                  try {
                    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_RESCHEDULE_CLAIM_REFUND] = {
                      'Patient Id': currentPatient.id,
                      'Appointment ID': data.appointmentId,
                      Type: data.type,
                    };
                    postWebEngageEvent(
                      WebEngageEventName.DOCTOR_RESCHEDULE_CLAIM_REFUND,
                      eventAttributes
                    );
                    props.navigation.popToTop();
                  } catch (error) {}

                  hideAphAlert && hideAphAlert();
                },
                type: 'white-button',
              },
              {
                text: 'RESCHEDULE',
                onPress: () => {
                  getAppointmentData(data.appointmentId, notificationType, '', '');
                },
                type: 'orange-button',
              },
            ],
          });
        }
        break;
      case 'Patient_Cancel_Appointment':
        {
          const userId = await dataSavedUserID('selectedProfileId');

          const { plansPurchasedWith } = data;
          if (
            plansPurchasedWith &&
            (plansPurchasedWith === 'DOCTOR_PACKAGE' || plansPurchasedWith === 'ONE_TAP')
          ) {
            //We need not to show payment status for package related consults
            break;
          }

          const { appointmentId } = data;
          {
            showAphAlert!({
              title: ' ',
              description: data.content,
              unDismissable: true,
              CTAs: [
                {
                  text: 'DISMISS',
                  onPress: () => {
                    hideAphAlert && hideAphAlert();
                    navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
                  },
                  type: 'white-button',
                },
                {
                  text: 'CHECK STATUS',
                  onPress: () => {
                    props.navigation.navigate(AppRoutes.MyPaymentsScreen, {
                      patientId: userId,
                      fromNotification: true,
                      appointmentId: appointmentId,
                    });
                    hideAphAlert && hideAphAlert();
                  },
                  type: 'orange-button',
                },
              ],
            });
          }
        }
        break;
      case 'Appointment_Canceled_Refund':
        {
          const userId = await dataSavedUserID('selectedProfileId');
          const { appointmentId } = data;
          showAphAlert!({
            title: ' ',
            description: data.content,
            CTAs: [
              {
                text: 'DISMISS',
                onPress: () => {
                  hideAphAlert && hideAphAlert();
                  try {
                    if (
                      currentScreenName === AppRoutes.AppointmentDetails ||
                      currentScreenName === AppRoutes.AppointmentOnlineDetails
                    ) {
                      navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
                    }
                  } catch (error) {}
                },
                type: 'white-button',
              },
              {
                text: 'CHECK STATUS',
                onPress: () => {
                  props.navigation.navigate(AppRoutes.MyPaymentsScreen, {
                    patientId: userId,
                    fromNotification: true,
                    appointmentId: appointmentId,
                  });
                  hideAphAlert && hideAphAlert();
                },
                type: 'orange-button',
              },
            ],
          });
        }
        break;
      case 'Appointment_Payment_Pending_Failure':
        {
          const { doctorId, content } = data;
          showAphAlert!({
            title: ' ',
            description: content,
            CTAs: [
              {
                text: 'DISMISS',
                onPress: () => {
                  hideAphAlert && hideAphAlert();
                },
                type: 'white-button',
              },
              {
                text: 'BOOK AGAIN',
                onPress: () => {
                  props.navigation.navigate(AppRoutes.DoctorDetails, { doctorId: doctorId });
                  hideAphAlert && hideAphAlert();
                },
                type: 'orange-button',
              },
            ],
          });
        }
        break;
      case 'Cart_Ready':
        {
          const orderId: number = parseInt(data.orderId || '0');
          client
            .query<
              getMedicineOrderOMSDetailsWithAddress,
              getMedicineOrderOMSDetailsWithAddressVariables
            >({
              query: GET_MEDICINE_ORDER_OMS_DETAILS_WITH_ADDRESS,
              variables: {
                orderAutoId: orderId,
                patientId: currentPatient && currentPatient.id,
              },
              fetchPolicy: 'no-cache',
            })
            .then((data) => {
              const orderDetails =
                data.data.getMedicineOrderOMSDetailsWithAddress.medicineOrderDetails;
              const items = (orderDetails!.medicineOrderLineItems || [])
                .map((item) => ({
                  sku: item!.medicineSKU!,
                  qty: item!.quantity!,
                }))
                .filter((item) => item.sku);

              setUserActionPayload?.({
                medicineOrderCartLineItems: items,
              });

              Promise.all(items.map((item) => getMedicineDetailsApi(item!.sku!)))
                .then((result) => {
                  // Adding prescriptions
                  if (orderDetails!.prescriptionImageUrl) {
                    const imageUrls = orderDetails?.prescriptionImageUrl
                      .split(',')
                      .map((item) => item.trim());
                    const prismPrescriptionFileIds = orderDetails?.prismPrescriptionFileId
                      ?.split(',')
                      ?.map((item) => item.trim());

                    imageUrls?.forEach((url, index) => {
                      setUserActionPayload?.({
                        prescriptionDetails: {
                          prescriptionImageUrl: url,
                          prismPrescriptionFileId: prismPrescriptionFileIds?.[index],
                          uhid: currentPatient?.uhid,
                        },
                        prescriptionType: PrescriptionType.UPLOADED,
                      });
                    });
                    setUserActionPayload?.({
                      appointmentId: orderDetails?.appointmentId,
                    });
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
              CommonBugFender('NotificationListener_GET_MEDICINE_ORDER_OMS_DETAILS', e);
            });
        }
        break;

      case 'chat_room':
        {
          aphConsole.log('chat_room');
          getAppointmentData(data.appointmentId, notificationType, '', '');
        }
        break;
      case 'patient_chat_message':
        appOnForeground
          ? showFollowupNotificationStatusAlert(data, notificationType)
          : getAppointmentData(data.appointmentId, notificationType, '', '');
        break;

      case 'call_started':
        {
          getAppointmentData(data.appointmentId, notificationType, data.callType, '');
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
      case 'Book_Appointment':
        {
          const doctorName = data.doctorName;
          const userName = data.patientName;
          //overlyCallPermissions(userName, doctorName, showAphAlert, hideAphAlert, true);
        }
        break;
      case 'webview':
        if (data.url) {
          props.navigation.navigate(AppRoutes.CommonWebView, {
            url: data.url,
          });
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    const notificationListener = messaging().onMessage((notification) => {
      aphConsole.log('notificationListener');
      if (notification.data?.type !== 'chat_room' && notification.data?.type !== 'call_started') {
        processNotification(notification, true); // when app in foreground
      }
    });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    messaging()
      .getInitialNotification()
      .then(async (notification) => {
        if (notification) {
          const lastNotification = await AsyncStorage.getItem('lastNotification');
          if (lastNotification !== notification.messageId) {
            await AsyncStorage.setItem('lastNotification', notification.messageId || '');
            processNotification(notification);
          }
        }
      })
      .catch((e) => {
        CommonBugFender('NotificationListener_firebase', e);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    const onNotificationListener = messaging().onNotificationOpenedApp((notification) => {
      if (notification) {
        processNotification(notification);
      }
    });

    const messageListener = messaging().onMessage((message) => {
      if (Platform.OS === 'android') {
        try {
          KotlinBridge.cmNotification(JSON.stringify(message.data));
        } catch (error) {}
      }
    });

    return function cleanup() {
      notificationListener();
      onNotificationListener();
      messageListener();
    };
  }, []);

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
          const appointmentData = _data.data.getAppointmentData!.appointmentsHistory;
          if (appointmentData) {
            if (
              notificationType == 'Reschedule_Appointment' ||
              notificationType == 'Patient_Noshow_Reschedule_Appointment' ||
              notificationType == 'doctor_Noshow_Reschedule_Appointment'
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
              notificationType == 'Reminder_Appointment_Casesheet_15' ||
              notificationType == 'patient_chat_message'
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
        setLoading && setLoading(false);
      });
  };

  return null;
};
