import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NotificationBellIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { setBugFenderLog } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { notifcationsApi } from '../../helpers/apiCalls';
import { AppRoutes } from '../NavigatorContainer';
import { useAppCommonData } from '../AppCommonDataProvider';

const styles = StyleSheet.create({
  titleStyle: {
    color: '#02475b',
    lineHeight: 20,
    textAlign: 'left',
    marginLeft: 16,
    marginRight: 36,
    marginTop: 26,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  textStyle: {
    color: '#02475b',
    lineHeight: 20,
    textAlign: 'left',
    marginLeft: 16,
    marginRight: 36,
    marginTop: 10,
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
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loader, setLoader] = useState(true);

  const client = useApolloClient();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();

  const { setNotificationCount, allNotifications } = useAppCommonData();
  // let arrayNotification: any;

  useEffect(() => {
    async function fetchData() {
      setLoader(true);
      const array: any = await AsyncStorage.getItem('selectedRow');
      const arraySelected = JSON.parse(array);
      if (arraySelected !== null) {
        setSelected([...arraySelected]);
      }
      // console.log('arraySelected.......', arraySelected);

      const allStoredNotification: any = await AsyncStorage.getItem('allNotification');
      const arrayNotification = JSON.parse(allStoredNotification);
      if (arrayNotification !== null) {
        setMessages([...arrayNotification]);
      } else {
        console.log('isSelected.......', allNotifications);

        setMessages([...allNotifications]);
      }
      console.log('arrayNotification.......', arrayNotification);
      setLoader(false);
    }
    fetchData();
  }, [allNotifications]);

  // useEffect(() => {
  //   async function fetchData() {
  //     setLoading && setLoading(true);
  //     const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');

  //     const params = {
  //       phone: '91' + storedPhoneNumber,
  //       size: 10,
  //     };
  //     console.log('params', params);
  //     notifcationsApi(params)
  //       .then(async (repsonse: any) => {
  //         setLoading && setLoading(false);

  //         try {
  //           const arrayNotification = repsonse.data.data.map((el: any) => {
  //             const o = Object.assign({}, el);
  //             o.isActive = true;
  //             return o;
  //           });

  //           // console.log('arrayNotification.......', arrayNotification);

  //           const array = await AsyncStorage.getItem('selectedRow');
  //           setBugFenderLog('handleOpenURL_route', array);

  //           if (array !== null) {
  //             const arraySelected = JSON.parse(array);

  //             const result = arrayNotification.map((el: any, index: number) => {
  //               const o = Object.assign({});
  //               if (arraySelected.length > index) {
  //                 o.id = el._id;
  //                 o.isSelected =
  //                   arraySelected[index].id === el._id ? arraySelected[index].isSelected : false;
  //               } else {
  //                 o.id = el._id;
  //                 o.isSelected = false;
  //               }
  //               return o;
  //             });

  //             setSelected(result);
  //             AsyncStorage.setItem('selectedRow', JSON.stringify(result));
  //           } else {
  //             const result = arrayNotification.map((el: any) => {
  //               const o = Object.assign({});
  //               o.id = el._id;
  //               o.isSelected = false;
  //               return o;
  //             });
  //             setSelected(result);
  //             AsyncStorage.setItem('selectedRow', JSON.stringify(result));
  //           }

  //           setMessages(arrayNotification);
  //           setLoader(false);
  //         } catch (error) {
  //           setLoader(false);
  //         }
  //       })
  //       .catch((error: Error) => {
  //         setLoading && setLoading(false);
  //         setLoader(false);
  //         console.log('error', error);
  //       });
  //   }
  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       let array: any = await AsyncStorage.getItem('allNotification');
  //       array = JSON.parse(array);
  //       setMessages(array.reverse());
  //       // console.log('Notification Screen', array);
  //     } catch (error) {}
  //   }

  //   fetchData();
  // }, []);

  const onPressBack = () => {
    props.navigation.goBack();
  };

  // const showAlert = (description: string) => {
  //   try {
  //     showAphAlert!({
  //       title: 'Hi :)',
  //       description: description,
  //       unDismissable: true,
  //       CTAs: [
  //         {
  //           text: 'Okay',
  //           type: 'orange-button',
  //           onPress: () => {
  //             hideAphAlert && hideAphAlert();
  //           },
  //         },
  //       ],
  //     });
  //   } catch (error) {}
  // };

  // const checkAppointmentDetails = (
  //   appointmentId: string,
  //   notificationType: CustomNotificationType,
  //   callType: string,
  //   prescription: string,
  //   fileName?: string
  // ) => {
  //   getAppointmentDataDetails(client, appointmentId)
  //     .then(({ data }: any) => {
  //       setLoading && setLoading(false);

  //       try {
  //         console.log(data, 'data APIForUpdateAppointmentData');
  //         const appointmentData = data.data.getAppointmentData!.appointmentsHistory;
  //         if (appointmentData) {
  //           if (
  //             notificationType == 'call_started' ||
  //             notificationType == 'chat_room' ||
  //             notificationType == 'Reminder_Appointment_15'
  //           ) {
  //             try {
  //               if (appointmentData[0].status === STATUS.COMPLETED) {
  //                 showAlert('You have successfully completed your appointment');
  //               } else if (appointmentData[0]!.doctorInfo !== null) {
  //                 props.navigation.navigate(AppRoutes.ChatRoom, {
  //                   data: appointmentData[0],
  //                   callType: callType,
  //                   prescription: prescription,
  //                 });
  //               }
  //             } catch (error) {}
  //           } else if (
  //             // notificationType == 'Book_Appointment' ||
  //             notificationType == 'Reminder_Appointment_Casesheet_15'
  //           ) {
  //             try {
  //               if (appointmentData[0].status === STATUS.COMPLETED) {
  //                 showAlert('You have successfully completed your appointment');
  //               } else if (appointmentData[0].isJdQuestionsComplete) {
  //                 showAlert('You have successfully submitted your questions');
  //               } else {
  //                 if (appointmentData[0]!.doctorInfo !== null) {
  //                   props.navigation.navigate(AppRoutes.ChatRoom, {
  //                     data: appointmentData[0],
  //                     callType: callType,
  //                     prescription: prescription,
  //                   });
  //                 }
  //               }
  //             } catch (error) {}
  //           } else if (
  //             notificationType == 'Reschedule_Appointment' ||
  //             notificationType == 'Patient_Noshow_Reschedule_Appointment'
  //           ) {
  //             try {
  //               if (appointmentData[0].status === STATUS.COMPLETED) {
  //                 showAlert('You have successfully completed your appointment');
  //               } else {
  //                 if (appointmentData[0]!.doctorInfo !== null) {
  //                   appointmentData[0]!.appointmentType === 'ONLINE'
  //                     ? props.navigation.navigate(AppRoutes.AppointmentOnlineDetails, {
  //                         data: appointmentData[0],
  //                         from: 'notification',
  //                       })
  //                     : props.navigation.navigate(AppRoutes.AppointmentDetails, {
  //                         data: appointmentData[0],
  //                         from: 'notification',
  //                       });
  //                 }
  //               }
  //             } catch (error) {}
  //           } else if (notificationType == 'PRESCRIPTION_READY') {
  //             try {
  //               props.navigation.navigate(AppRoutes.ConsultDetails, {
  //                 CaseSheet: g(appointmentData[0], 'id'),
  //                 DoctorInfo: g(appointmentData[0], 'doctorInfo'),
  //                 PatientId: g(appointmentData[0], 'patientId'),
  //                 appointmentType: g(appointmentData[0], 'appointmentType'),
  //                 DisplayId: g(appointmentData[0], 'displayId'),
  //                 BlobName: fileName || '',
  //               });
  //             } catch (error) {}
  //           }
  //         }
  //       } catch (error) {}
  //     })
  //     .catch((e) => {
  //       setLoading && setLoading(false);
  //     });
  // };

  // const getCallStatus = (
  //   appointmentCallId: string,
  //   appointmentId: string,
  //   notificationType: CustomNotificationType,
  //   callType: string
  // ) => {
  //   getAppointmentCallStatus(client, appointmentCallId)
  //     .then((data: any) => {
  //       console.log('data', data);
  //       try {
  //         const endTime = data.data.getCallDetails.appointmentCallDetails.endTime;
  //         console.log('call endTime', endTime);

  //         if (endTime) {
  //           setLoading && setLoading(false);
  //           showAlert('Doctor has ended your Call');
  //         } else {
  //           try {
  //             checkAppointmentDetails(appointmentId, notificationType, callType, '');
  //           } catch (error) {}
  //         }
  //       } catch (error) {}
  //     })
  //     .catch((error: any) => {
  //       setLoading && setLoading(false);
  //     });
  // };

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

  const updateSelectedView = (index: number) => {
    const selectedOne = messages;
    selectedOne[index].isActive = false;
    setMessages([...selectedOne]);

    const selectedCount = messages.filter((item: any) => {
      return item.isActive === true;
    });
    setNotificationCount && setNotificationCount(selectedCount.length);

    AsyncStorage.setItem('allNotification', JSON.stringify(messages));
  };

  const renderRow = (item: any, index: number) => {
    const val = JSON.parse(item.notificatio_details.push_notification_content);
    return (
      <View
        style={{
          backgroundColor: item.isActive ? 'white' : 'transparent',
          flex: 1,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            updateSelectedView(index);
          }}
        >
          <View style={styles.viewRowStyle}>
            {/* {item.data.type.includes('Order') ? (
            <NotificationCartIcon style={styles.iconStyle} />
          ) : (
            <NotificationBellIcon style={styles.iconStyle} />
          )} */}
            <NotificationBellIcon style={styles.iconStyle} />

            <View>
              <Text style={styles.titleStyle}>{val.title}</Text>
              <Text style={styles.textStyle}>{val.message}</Text>

              <Text style={styles.dateStyle}>{dateCalculate(item.event_time)}</Text>
            </View>
          </View>
          <View style={styles.btnViewStyle}>{renderNotificationType(val.cta, index)}</View>
          <View style={styles.separatorStyles} />
        </TouchableOpacity>
      </View>
    );
  };

  const ctaNamesMethod = (event: any) => {
    let route;
    route = event.actionLink.replace('apollopatients://', '');
    const data = route.split('?');
    route = data[0];
    let CTAName;

    switch (route) {
      case 'Consult':
        CTAName = 'CONSULT';
        break;
      case 'Medicine':
        CTAName = 'MEDICINE';
        break;
      case 'Test':
        CTAName = 'TESTS';
        break;
      case 'Speciality':
        CTAName = 'SPECIALITY';
        break;
      case 'Doctor':
        CTAName = 'DOCTOR DETAILS';
        break;
      case 'DoctorSearch':
        CTAName = 'DOCTOR SEARCH';
        break;

      case 'MedicineSearch':
        CTAName = 'MEDICINE SEARCH';
        break;
      case 'MedicineDetail':
        CTAName = 'MEDICINE DETAILS';
        break;

      default:
        break;
    }
    return CTAName;
  };

  const renderNotificationType = (event: any, index: number) => {
    if (event) {
      const CTAName = ctaNamesMethod(event);

      let routing = event.actionLink.replace('apollopatients://', '');
      const data = routing.split('?');
      routing = data[0];

      if (
        routing === 'Consult' ||
        routing === 'Medicine' ||
        routing === 'Test' ||
        routing === 'Speciality' ||
        routing === 'Doctor' ||
        routing === 'DoctorSearch' ||
        routing === 'MedicineSearch' ||
        routing === 'MedicineDetail'
      ) {
        return (
          <Text
            onPress={() => {
              console.log(index, 'index');
              updateSelectedView(index);
              handleOpenURL(event.actionLink);
            }}
            style={styles.btnStyle}
          >
            {`GO TO ${CTAName}`}
          </Text>
        );
      }
    }
  };

  const handleOpenURL = (event: any) => {
    try {
      // console.log('event', event);
      let route;

      route = event.replace('apollopatients://', '');

      const data = route.split('?');
      route = data[0];

      // console.log(data, 'data');

      switch (route) {
        case 'Consult':
          console.log('Consult');
          pushTheView('Consult', data.length === 2 ? data[1] : undefined);
          break;
        case 'Medicine':
          console.log('Medicine');
          pushTheView('Medicine', data.length === 2 ? data[1] : undefined);
          break;
        case 'Test':
          console.log('Test');
          pushTheView('Test');
          break;
        case 'Speciality':
          console.log('Speciality handleopen');
          if (data.length === 2) pushTheView('Speciality', data[1]);
          break;
        case 'Doctor':
          console.log('Doctor handleopen');
          if (data.length === 2) pushTheView('Doctor', data[1]);
          break;
        case 'DoctorSearch':
          console.log('DoctorSearch handleopen');
          pushTheView('DoctorSearch');
          break;

        case 'MedicineSearch':
          console.log('MedicineSearch handleopen');
          pushTheView('MedicineSearch', data.length === 2 ? data[1] : undefined);
          break;
        case 'MedicineDetail':
          console.log('MedicineDetail handleopen');
          pushTheView('MedicineDetail', data.length === 2 ? data[1] : undefined);
          break;

        default:
          break;
      }
      // console.log('route', route);
    } catch (error) {}
  };

  const pushTheView = (routeName: String, id?: String) => {
    // console.log('pushTheView', routeName);

    switch (routeName) {
      case 'Consult':
        console.log('Consult');

        props.navigation.navigate('APPOINTMENTS');
        break;

      case 'Medicine':
        console.log('Medicine');
        props.navigation.navigate('MEDICINES');
        break;

      case 'MedicineDetail':
        console.log('MedicineDetail');
        props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
          sku: id,
        });
        break;

      case 'Test':
        console.log('Test');
        props.navigation.navigate('TESTS');
        break;

      case 'ConsultRoom':
        console.log('ConsultRoom');
        props.navigation.replace(AppRoutes.ConsultRoom);
        break;
      case 'Speciality':
        console.log('Speciality id', id);
        props.navigation.navigate(AppRoutes.DoctorSearchListing, {
          specialityId: id ? id : '',
        });

        break;

      case 'Doctor':
        props.navigation.navigate(AppRoutes.DoctorDetails, {
          doctorId: id,
        });
        break;

      case 'DoctorSearch':
        props.navigation.navigate(AppRoutes.DoctorSearch);
        break;

      case 'MedicineSearch':
        if (id) {
          const [itemId, name] = id.split(',');
          console.log(itemId, name);

          props.navigation.navigate(AppRoutes.SearchByBrand, {
            category_id: itemId,
            title: `${name ? name : 'Products'}`.toUpperCase(),
          });
        }
        break;

      default:
        break;
    }
  };

  // const renderNotificationType = (item: any) => {
  //   if (
  //     item.data.type === 'Reminder_Appointment_15' ||
  //     item.data.type === 'Reminder_Appointment_Casesheet_15' ||
  //     // item.data.type === 'Book_Appointment' ||
  //     item.data.type === 'call_started' ||
  //     item.data.type === 'Reschedule_Appointment' ||
  //     item.data.type === 'Patient_Noshow_Reschedule_Appointment' ||
  //     item.data.type === 'chat_room'
  //   ) {
  //     return (
  //       <Text
  //         onPress={() => {
  //           setLoading && setLoading(true);

  //           if (item.data.type === 'call_started') {
  //             getCallStatus(
  //               item.data.appointmentCallId,
  //               item.data.appointmentId,
  //               item.data.type,
  //               item.data.callType
  //             );
  //           } else {
  //             checkAppointmentDetails(item.data.appointmentId, item.data.type, '', '');
  //           }
  //         }}
  //         style={styles.btnStyle}
  //       >
  //         {item.data.type === 'Reschedule_Appointment' ||
  //         item.data.type === 'Patient_Noshow_Reschedule_Appointment'
  //           ? 'RESCHEDULE'
  //           : 'GO TO CONSULT ROOM'}
  //       </Text>
  //     );
  //   } else if (item.data.type === 'PRESCRIPTION_READY') {
  //     return (
  //       <Text
  //         onPress={() => {
  //           setLoading && setLoading(true);

  //           checkAppointmentDetails(
  //             item.data.appointmentId,
  //             item.data.type,
  //             '',
  //             'true',
  //             item.data.file_id
  //           );
  //         }}
  //         style={styles.btnStyle}
  //       >
  //         VIEW NOW
  //       </Text>
  //     );
  //   } else if (
  //     item.data.type === 'Order_Out_For_Delivery' ||
  //     item.data.type === 'Order_Placed' ||
  //     item.data.type === 'Order_Confirmed' ||
  //     item.data.type === 'Diagnostic_Order_Payment_Failed'
  //   ) {
  //     console.log('Order_Placed');
  //     return (
  //       <Text
  //         onPress={() => {
  //           if (item.data.type === 'Diagnostic_Order_Payment_Failed') {
  //             props.navigation.navigate(AppRoutes.TestOrderDetails, {
  //               goToHomeOnBack: true,
  //               orderId: item.data.orderId,
  //             });
  //           } else {
  //             props.navigation.navigate(AppRoutes.OrderDetailsScene, {
  //               goToHomeOnBack: true,
  //               orderAutoId: item.data.orderAutoId,
  //             });
  //           }
  //         }}
  //         style={styles.btnStyle}
  //       >
  //         VIEW DETAILS
  //       </Text>
  //     );
  //   }
  // };

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
          renderItem={({ item, index }) => renderRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ justifyContent: 'center', alignSelf: 'center', flex: 1, margin: 0 }}>
              <Text
                style={{
                  marginTop: 20,
                  color: '#fc9916',
                  textAlign: 'center',
                  ...theme.fonts.IBMPlexSansMedium(12),
                }}
              >
                {!loader && messages.length == 0 ? 'No notifications avaliable' : ''}
              </Text>
            </View>
          }
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
