import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NotificationBellIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useAppCommonData } from '../AppCommonDataProvider';
import { handleOpenURL, pushTheView } from '@aph/mobile-patients/src/helpers/deeplinkRedirection';

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
    ...theme.fonts.IBMPlexSansBold(13),
    paddingLeft: 20,
  },
});

export interface NotificationScreenProps extends NavigationScreenProps {}
export const NotificationScreen: React.FC<NotificationScreenProps> = (props) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loader, setLoader] = useState(true);

  const { setNotificationCount, allNotifications } = useAppCommonData();

  useEffect(() => {
    async function fetchData() {
      setLoader(true);
      const array: any = await AsyncStorage.getItem('selectedRow');
      const arraySelected = JSON.parse(array || 'null');
      if (arraySelected !== null) {
        setSelected([...arraySelected]);
      }
      const allStoredNotification: any = await AsyncStorage.getItem('allNotification');
      const arrayNotification = JSON.parse(allStoredNotification || 'null');
      if (arrayNotification !== null) {
        setMessages([...arrayNotification]);
      } else {
        setMessages([...allNotifications]);
      }
      setLoader(false);
    }
    fetchData();
  }, [allNotifications]);

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
    const val = JSON.parse(item.notificatio_details.push_notification_content || 'null');
    const event = val.cta;
    if (event) {
      const CTAName = ctaNamesMethod(event);

      const actionLink = decodeURIComponent(event.actionLink);

      let routing = actionLink.replace('apollopatients://', '');
      routing = routing.replace('w://p/open_url_in_browser/', '');
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
                handleOpenURL(event.actionLink);
              }}
            >
              <View style={styles.viewRowStyle}>
                <NotificationBellIcon style={styles.iconStyle} />

                <View>
                  <Text style={styles.titleStyle}>{val.title}</Text>
                  <Text style={styles.textStyle}>{val.message}</Text>

                  <Text style={styles.dateStyle}>{dateCalculate(item.event_time)}</Text>
                </View>
              </View>
              <View style={styles.btnViewStyle}>
                {renderNotificationType(CTAName, event.actionLink, index)}
              </View>
              <View style={styles.separatorStyles} />
            </TouchableOpacity>
          </View>
        );
      }
    }
  };

  const ctaNamesMethod = (event: any) => {
    let route;

    const actionLink = decodeURIComponent(event.actionLink);

    route = actionLink.replace('apollopatients://', '');
    route = route.replace('w://p/open_url_in_browser/', '');
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

  const renderNotificationType = (CTAName: any, actionLink: string, index: number) => {
    return (
      <Text
        onPress={() => {
          updateSelectedView(index);
          const data = handleOpenURL(actionLink);
          const { routeName, id, isCall, timeout, mediaSource } = data;
          pushTheView(
            props.navigation,
            routeName,
            id ? id : undefined,
            isCall,
            undefined,
            mediaSource
          );
        }}
        style={styles.btnStyle}
      >
        {`GO TO ${CTAName}`}
      </Text>
    );
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
          onPressLeftIcon={onPressBack}
        />
        <ScrollView bounces={false}>{renderNotificationView()}</ScrollView>
      </SafeAreaView>
    </View>
  );
};
