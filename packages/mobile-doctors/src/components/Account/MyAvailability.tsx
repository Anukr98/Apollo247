import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { AddIconLabel } from '@aph/mobile-doctors/src/components/ui/AddIconLabel';
import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, RoundChatIcon, RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import {
  GET_BLOCKED_CALENDAR,
  REMOVE_BLOCKED_CALENDAR_ITEM,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetBlockedCalendar,
  GetBlockedCalendarVariables,
  GetBlockedCalendar_getBlockedCalendar_blockedCalendar,
} from '@aph/mobile-doctors/src/graphql/types/GetBlockedCalendar';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { format } from 'date-fns';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7', //theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  consultDescText: {
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    color: theme.colors.darkBlueColor(0.5),
    marginTop: 16,
    marginHorizontal: 20,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    //marginTop: 20,
  },
  //
  cardContainerStyle: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    marginTop: 16,
    padding: 16,
    paddingTop: 12,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consultationTiming: {
    ...theme.fonts.IBMPlexSansMedium(20),
    color: theme.colors.darkBlueColor(),
    letterSpacing: 0.09,
  },
  fixedSlotText: {
    ...theme.viewStyles.text('M', 14, theme.colors.APP_GREEN, 1, undefined, 0.06),
  },
  daysText: {
    ...theme.viewStyles.text('S', 12, theme.colors.LIGHT_BLUE, 1, undefined, 0.05),
    marginBottom: 6,
  },
});

export interface ProfileProps
  extends NavigationScreenProps<{
    ProfileData: GetDoctorDetails_getDoctorDetails;

    //navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  }> {
  //profileData: object;
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

const get12HrsFormat = (timeString: string /* 12:30 */) => {
  const hoursAndMinutes = timeString.split(':').map((i) => parseInt(i));
  return format(new Date(0, 0, 0, hoursAndMinutes[0], hoursAndMinutes[1]), 'h:mm a');
};

const fromatConsultationHours = (startTime: string, endTime: string /* input eg.: 15:15:30Z */) =>
  `${get12HrsFormat(startTime.replace('Z', ''))} - ${get12HrsFormat(endTime.replace('Z', ''))}`;

export const MyAvailability: React.FC<ProfileProps> = (props) => {
  const [blockedCalendar, setblockedCalendar] = useState<
    GetBlockedCalendar_getBlockedCalendar_blockedCalendar[]
  >([]);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [showHelpModel, setshowHelpModel] = useState(false);

  const profileData = props.navigation.getParam('ProfileData');
  console.log('p', profileData);
  const client = useApolloClient();

  useEffect(() => {
    fetchBlockedCalendar();
  }, []);

  const fetchBlockedCalendar = () => {
    client
      .query<GetBlockedCalendar, GetBlockedCalendarVariables>({
        query: GET_BLOCKED_CALENDAR,
        variables: {
          doctorId: profileData.id,
        },
        fetchPolicy: 'no-cache',
      })

      .then(({ data }) => {
        console.log('flitered array', data);
        if (data && data.getBlockedCalendar && data.getBlockedCalendar.blockedCalendar.length) {
          setblockedCalendar(data.getBlockedCalendar.blockedCalendar);
        }
      })
      .catch((e) => {
        CommonBugFender('GET_BLOCKED_CALENDAR_Myavailability', e);
        console.log('Error occured while searching for Doctors', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while searching for Doctors', errorMessage, error);
        // Alert.alert('Error', errorMessage);
      });
  };

  const onAddBlockCalendar = (data) => {
    setblockedCalendar(data);
  };

  const onClickUnblock = (id: number, index: number) => {
    setshowSpinner(true);
    client
      .mutate({
        mutation: REMOVE_BLOCKED_CALENDAR_ITEM,
        variables: {
          id: id,
          refetchQueries: [
            { query: GET_BLOCKED_CALENDAR, variables: { doctorId: profileData.id } },
          ],
          awaitRefetchQueries: true,
        },
      })
      .then((res) => {
        console.log(res, 'res REMOVE_BLOCKED_CALENDAR_ITEM');
        setshowSpinner(false);
        const data = JSON.parse(JSON.stringify(blockedCalendar));
        data.splice(index, 1);
        setblockedCalendar(data);
        index;
      })
      .catch((err) => {
        CommonBugFender('REMOVE_BLOCKED_CALENDAR_ITEM_Myavailability', e);
        console.log(err, 'err REMOVE_BLOCKED_CALENDAR_ITEM');
        setshowSpinner(false);
      });
  };

  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{
          height: 50,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowRadius: 10,
          shadowOpacity: 0.2,
          elevation: 5,
        }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText={strings.account.availability.toUpperCase()}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => setshowHelpModel(true),
          },
        ]}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>{showHeaderView()}</View>
        <ScrollView bounces={false}>
          {profileData!.doctorType == 'STAR_APOLLO' || profileData!.doctorType == 'APOLLO' ? (
            <View>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(16),
                  color: '#02475b',
                  marginBottom: 16,
                  marginLeft: 20,
                  marginTop: 20,
                }}
              >
                {strings.account.consultation_type}
              </Text>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  marginLeft: 20,
                  marginRight: 20,
                  marginBottom: 32,
                  shadowColor: '#000000',
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowRadius: 10,
                  shadowOpacity: 0.2,
                  elevation: 5,
                }}
              >
                <Text style={styles.consultDescText}>{strings.account.what_type_of_consult}</Text>
                <Text
                  style={{
                    marginLeft: 20,
                    marginTop: 8,
                    ...theme.fonts.IBMPlexSansMedium(16),
                    color: '#02475b',
                    marginBottom: 20,
                    textTransform: 'capitalize',
                  }}
                >
                  {strings.common.physical}, {strings.common.online}
                </Text>
              </View>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(16),
                  color: '#02475b',
                  marginLeft: 20,
                }}
              >
                {strings.account.consult_hours}
              </Text>
              <View style={{ marginLeft: 20, marginRight: 20 }}>
                {profileData!.consultHours!.map((i, idx) => (
                  <ConsultationHoursCard
                    days={i!.weekDay}
                    timing={fromatConsultationHours(i!.startTime, i!.endTime)}
                    isAvailableForOnlineConsultation={i!.consultMode.toLocaleLowerCase()}
                    //isAvailableForPhysicalConsultation={i!.consultType}
                    key={idx}
                    type="fixed"
                    containerStyle={{
                      shadowColor: '#000000',
                      shadowOffset: {
                        width: 0,
                        height: 5,
                      },
                      shadowRadius: 10,
                      shadowOpacity: 0.2,
                      elevation: 5,
                    }}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansSemiBold(16),
                color: '#02475b',
                marginLeft: 20,
                marginTop: 32,
              }}
            >
              {strings.account.blocked_calendar}
            </Text>
            {blockedCalendar.length ? (
              <View style={{ marginLeft: 20, marginRight: 20 }}>
                {blockedCalendar.map((item, index) => (
                  <View style={styles.cardContainerStyle}>
                    <Text style={styles.daysText}>
                      {moment(item.start)
                        .local()
                        .format('ddd, DD/MM/YYYY')}
                    </Text>
                    <View style={styles.rowSpaceBetween}>
                      <Text style={styles.consultationTiming}>
                        {moment(item.start)
                          .local()
                          .format('h:mm A')}{' '}
                        -{' '}
                        {moment(item.end)
                          .local()
                          .format('h:mm A')}
                      </Text>

                      <Text
                        style={styles.fixedSlotText}
                        onPress={() => onClickUnblock(item.id, index)}
                      >
                        {strings.account.unblock}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
            <AddIconLabel
              onPress={() => {
                props.navigation.navigate(AppRoutes.BlockHomePage, {
                  onAddBlockCalendar: onAddBlockCalendar,
                });
              }}
              label={strings.account.add_block_hours}
              style={{ marginTop: 32 }}
            />
          </View>

          <View style={{ margin: 20, flexDirection: 'row', marginBottom: 10 }}>
            <View style={{ marginTop: 4 }}>
              <RoundChatIcon />
            </View>

            <View style={{ marginLeft: 14 }}>
              <Text>
                <Text style={styles.descriptionview}>{strings.common.call}</Text>
                <Text
                  style={{
                    color: '#fc9916',
                    ...theme.fonts.IBMPlexSansSemiBold(16),
                    lineHeight: 22,
                  }}
                >
                  {' '}
                  {strings.common.toll_free_num}{' '}
                </Text>
                <Text style={styles.descriptionview}>{strings.account.to_make_changes}</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {showHelpModel ? <NeedHelpCard onPress={() => setshowHelpModel(false)} /> : null}
    </View>
  );
};
