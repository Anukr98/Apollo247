import MyAvailabilityStyles from '@aph/mobile-doctors/src/components/Account/MyAvailability.styles';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { AddIconLabel } from '@aph/mobile-doctors/src/components/ui/AddIconLabel';
import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { HelpView } from '@aph/mobile-doctors/src/components/ui/HelpView';
import { BackArrow, RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
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
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = MyAvailabilityStyles;

export interface ProfileProps
  extends NavigationScreenProps<{
    ProfileData: GetDoctorDetails_getDoctorDetails;
  }> {
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

const fromatConsultationHours = (startTime: string, endTime: string /* input eg.: 15:15:30Z */) =>
  `${moment(startTime, 'HH:mm')
    .add(330, 'm')
    .format('hh:mm A')} - ${moment(endTime, 'HH:mm')
    .add(330, 'm')
    .format('hh:mm A')}`;

export const MyAvailability: React.FC<ProfileProps> = (props) => {
  const [blockedCalendar, setblockedCalendar] = useState<
    GetBlockedCalendar_getBlockedCalendar_blockedCalendar[]
  >([]);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [showHelpModel, setshowHelpModel] = useState(false);
  const profileData = props.navigation.getParam('ProfileData');
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
      });
  };

  const onAddBlockCalendar = (data: any) => {
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
        CommonBugFender('REMOVE_BLOCKED_CALENDAR_ITEM_Myavailability', err);
        console.log(err, 'err REMOVE_BLOCKED_CALENDAR_ITEM');
        setshowSpinner(false);
      });
  };

  const showHeaderView = () => {
    return (
      <Header
        containerStyle={styles.headerview}
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
  console.log('this is is ', profileData);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <View>{showHeaderView()}</View>
        <ScrollView bounces={false}>
          {profileData!.doctorType == 'STAR_APOLLO' || profileData!.doctorType == 'APOLLO' ? (
            <View>
              <Text style={styles.type}>{strings.account.consultation_type}</Text>
              <View style={styles.typeView}>
                <Text style={styles.consultDescText}>{strings.account.what_type_of_consult}</Text>
                <Text style={styles.commonType}>
                  {strings.common.physical}, {strings.common.online}
                </Text>
              </View>
              <Text style={styles.hours}>{strings.account.consult_hours}</Text>
              <View style={{ marginLeft: 20, marginRight: 20 }}>
                {profileData.consultHours!.map(
                  (i, idx) =>
                    i && (
                      <ConsultationHoursCard
                        days={i.weekDay}
                        timing={fromatConsultationHours(i.startTime, i.endTime)}
                        consultMode={i.consultMode}
                        key={idx}
                        type="fixed"
                        containerStyle={styles.card}
                      />
                    )
                )}
              </View>
            </View>
          ) : null}

          <View>
            <Text style={styles.block}>{strings.account.blocked_calendar}</Text>
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
          <HelpView />
        </ScrollView>
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {showHelpModel ? <NeedHelpCard onPress={() => setshowHelpModel(false)} /> : null}
    </View>
  );
};
