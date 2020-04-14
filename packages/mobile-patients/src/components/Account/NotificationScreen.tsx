import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  NotificationBellIcon,
  NotificationCartIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  getAppointmentCallStatus,
  getAppointmentDataDetails,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { STATUS } from '../../graphql/types/globalTypes';
import { AppRoutes } from '../NavigatorContainer';

const styles = StyleSheet.create({
  textStyle: {
    color: '#02475b',
    lineHeight: 20,
    textAlign: 'left',
    marginLeft: 16,
    marginRight: 32,
    marginTop: 26,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  dateStyle: {
    color: '#02475b',
    opacity: 0.4,
    textAlign: 'left',
    marginLeft: 16,
    marginRight: 32,
    marginTop: 4,
    ...theme.fonts.IBMPlexSansMedium(10),
  },
  viewRowStyle: {
    marginHorizontal: 20,
    flexDirection: 'row',
    marginTop: 0,
  },
  separatorStyles: {
    backgroundColor: '#02475b',
    opacity: 0.2,
    marginHorizontal: 20,
    marginTop: 8,
    height: 1,
  },
  iconStyle: {
    height: 44,
    width: 44,
    marginTop: 24,
    marginLeft: 4,
  },
  btnViewStyle: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  btnStyle: {
    color: '#fc9916',
    lineHeight: 24,
    paddingVertical: 8,
    paddingRight: 20,
    // marginTop: 26,
    ...theme.fonts.IBMPlexSansBold(13),
    paddingLeft: 20,
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
  | 'PRESCRIPTION_READY'
  | 'Book_Appointment';

export interface NotificationScreenProps extends NavigationScreenProps {}
export const NotificationScreen: React.FC<NotificationScreenProps> = (props) => {
  const [backPressCount, setbackPressCount] = useState<number>(0);
  const [messages, setMessages] = useState([]);

  const client = useApolloClient();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();

  useEffect(() => {
    async function fetchData() {
      try {
        let array: any = await AsyncStorage.getItem('allNotification');
        array = JSON.parse(array);
        setMessages(array.reverse());
        // console.log('Notification Screen', array);
      } catch (error) {}
    }

    fetchData();
  }, []);

  const onPressBack = () => {
    props.navigation.goBack();
  };

  const dateCalculate = (date: Date) => {
    let CalculatedDate;

    const Today: boolean = moment(date)
      .startOf('day')
      .isSame(moment(new Date()).startOf('day'));

    if (Today) {
      CalculatedDate = moment(date).format('[Today,] h:mm A');
    } else {
      CalculatedDate = moment(date).format('Do MMMM \nhh:mm A');
    }

    return CalculatedDate;
  };

  const showAlert = (description: string) => {
    try {
      showAphAlert!({
        title: 'Hi :)',
        description: description,
        unDismissable: true,
        CTAs: [
          {
            text: 'Okay',
            type: 'orange-button',
            onPress: () => {
              hideAphAlert && hideAphAlert();
            },
          },
        ],
      });
    } catch (error) {}
  };

  const checkAppointmentDetails = (
    appointmentId: string,
    notificationType: CustomNotificationType,
    callType: string,
    prescription: string,
    fileName?: string
  ) => {
    getAppointmentDataDetails(client, appointmentId)
      .then(({ data }: any) => {
        setLoading && setLoading(false);

        try {
          console.log(data, 'data APIForUpdateAppointmentData');
          const appointmentData = data.data.getAppointmentData!.appointmentsHistory;
          if (appointmentData) {
            if (
              notificationType == 'call_started' ||
              notificationType == 'chat_room' ||
              notificationType == 'Reminder_Appointment_15'
            ) {
              try {
                if (appointmentData[0].status === STATUS.COMPLETED) {
                  showAlert('You have successfully completed your appointment');
                } else if (appointmentData[0]!.doctorInfo !== null) {
                  props.navigation.navigate(AppRoutes.ChatRoom, {
                    data: appointmentData[0],
                    callType: callType,
                    prescription: prescription,
                  });
                }
              } catch (error) {}
            } else if (
              // notificationType == 'Book_Appointment' ||
              notificationType == 'Reminder_Appointment_Casesheet_15'
            ) {
              try {
                if (appointmentData[0].status === STATUS.COMPLETED) {
                  showAlert('You have successfully completed your appointment');
                } else if (appointmentData[0].isJdQuestionsComplete) {
                  showAlert('You have successfully submitted your questions');
                } else {
                  if (appointmentData[0]!.doctorInfo !== null) {
                    props.navigation.navigate(AppRoutes.ChatRoom, {
                      data: appointmentData[0],
                      callType: callType,
                      prescription: prescription,
                    });
                  }
                }
              } catch (error) {}
            } else if (
              notificationType == 'Reschedule_Appointment' ||
              notificationType == 'Patient_Noshow_Reschedule_Appointment'
            ) {
              try {
                if (appointmentData[0].status === STATUS.COMPLETED) {
                  showAlert('You have successfully completed your appointment');
                } else {
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
        } catch (error) {}
      })
      .catch((e) => {
        setLoading && setLoading(false);
      });
  };

  const getCallStatus = (
    appointmentCallId: string,
    appointmentId: string,
    notificationType: CustomNotificationType,
    callType: string
  ) => {
    getAppointmentCallStatus(client, appointmentCallId)
      .then((data: any) => {
        console.log('data', data);
        try {
          const endTime = data.data.getCallDetails.appointmentCallDetails.endTime;
          console.log('call endTime', endTime);

          if (endTime) {
            setLoading && setLoading(false);
            showAlert('Doctor has ended your Call');
          } else {
            try {
              checkAppointmentDetails(appointmentId, notificationType, callType, '');
            } catch (error) {}
          }
        } catch (error) {}
      })
      .catch((error: any) => {
        setLoading && setLoading(false);
      });
  };

  const renderRow = (item: any) => {
    return (
      <>
        <View style={styles.viewRowStyle}>
          {item.data.type.includes('Order') ? (
            <NotificationCartIcon style={styles.iconStyle} />
          ) : (
            <NotificationBellIcon style={styles.iconStyle} />
          )}
          <View>
            <Text style={styles.textStyle}>{item.data.content}</Text>
            <Text style={styles.dateStyle}>{dateCalculate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.btnViewStyle}>{renderNotificationType(item)}</View>
        <View style={styles.separatorStyles} />
      </>
    );
  };

  const renderNotificationType = (item: any) => {
    if (
      item.data.type === 'Reminder_Appointment_15' ||
      item.data.type === 'Reminder_Appointment_Casesheet_15' ||
      // item.data.type === 'Book_Appointment' ||
      item.data.type === 'call_started' ||
      item.data.type === 'Reschedule_Appointment' ||
      item.data.type === 'Patient_Noshow_Reschedule_Appointment' ||
      item.data.type === 'chat_room'
    ) {
      return (
        <Text
          onPress={() => {
            setLoading && setLoading(true);

            if (item.data.type === 'call_started') {
              getCallStatus(
                item.data.appointmentCallId,
                item.data.appointmentId,
                item.data.type,
                item.data.callType
              );
            } else {
              checkAppointmentDetails(item.data.appointmentId, item.data.type, '', '');
            }
          }}
          style={styles.btnStyle}
        >
          {item.data.type === 'Reschedule_Appointment' ||
          item.data.type === 'Patient_Noshow_Reschedule_Appointment'
            ? 'RESCHEDULE'
            : 'GO TO CONSULT ROOM'}
        </Text>
      );
    } else if (item.data.type === 'PRESCRIPTION_READY') {
      return (
        <Text
          onPress={() => {
            setLoading && setLoading(true);

            checkAppointmentDetails(
              item.data.appointmentId,
              item.data.type,
              '',
              'true',
              item.data.file_id
            );
          }}
          style={styles.btnStyle}
        >
          VIEW NOW
        </Text>
      );
    } else if (
      item.data.type === 'Order_Out_For_Delivery' ||
      item.data.type === 'Order_Placed' ||
      item.data.type === 'Order_Confirmed' ||
      item.data.type === 'Diagnostic_Order_Payment_Failed'
    ) {
      console.log('Order_Placed');
      return (
        <Text
          onPress={() => {
            if (item.data.type === 'Diagnostic_Order_Payment_Failed') {
              props.navigation.navigate(AppRoutes.TestOrderDetails, {
                goToHomeOnBack: true,
                orderId: item.data.orderId,
              });
            } else {
              props.navigation.navigate(AppRoutes.OrderDetailsScene, {
                goToHomeOnBack: true,
                orderAutoId: item.data.orderAutoId,
              });
            }
          }}
          style={styles.btnStyle}
        >
          VIEW DETAILS
        </Text>
      );
    }
  };

  const renderNotificationView = () => {
    return (
      <View>
        <FlatList
          style={{
            flex: 1,
          }}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          bounces={false}
          data={messages}
          onEndReachedThreshold={0.2}
          renderItem={({ item }) => renderRow(item)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          leftIcon="backArrow"
          title="NOTIFICATIONS"
          // rightComponent={
          //   <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          //     <More />
          //   </TouchableOpacity>
          // }
          onPressLeftIcon={onPressBack}
        />
        <ScrollView bounces={false}>{renderNotificationView()}</ScrollView>
      </SafeAreaView>
    </View>
  );
};
