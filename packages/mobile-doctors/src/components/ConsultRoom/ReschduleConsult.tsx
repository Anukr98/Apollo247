import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Cancel, Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { INITIATE_RESCHDULE_APPONITMENT } from '@aph/mobile-doctors/src/graphql/profiles';
import { TRANSFER_INITIATED_TYPE } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  initiateRescheduleAppointment,
  initiateRescheduleAppointmentVariables,
} from '@aph/mobile-doctors/src/graphql/types/initiateRescheduleAppointment';
import { getLocalData } from '@aph/mobile-doctors/src/helpers/localStorage';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import Pubnub from 'pubnub';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';

const rescheduleconsult = '^^#rescheduleconsult';
const config: Pubnub.PubnubConfig = {
  subscribeKey: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
  publishKey: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
  ssl: true,
};
const pubnub = new Pubnub(config);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: theme.colors.INPUT_TEXT,
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
  },
  // inputView: {
  //   height: 80,
  //   borderRadius: 10,
  //   borderWidth: 2,
  //   borderColor: '#30c1a3',
  //   color: '#01475b',
  //   marginLeft: 20,
  //   marginRight: 20,
  //   marginBottom: 10,
  // },
  buttonView: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fed6a2',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },
  buttonViewfull: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fc9916',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.BUTTON_TEXT,
  },
  dropDownCardStyle: {
    marginTop: Platform.OS == 'android' ? -35 : -35,
    marginBottom: 26,
    paddingTop: 16,
    paddingBottom: 15,
    //position: Platform.OS == 'android' ? 'relative' : 'absolute',
    top: 0,
    zIndex: 2,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'flex-end',
    ...theme.viewStyles.whiteRoundedCornerCard,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    position: 'absolute',
  },
  commonView: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    marginBottom: 16,
  },
  commonText: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(16),
    marginLeft: 20,
    marginRight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  commonSubText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    opacity: 0.4,
    marginTop: 10,
    marginBottom: 9,
  },
});

export interface ProfileProps
  extends NavigationScreenProps<{
    AppointmentId: string;

    // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  }> {
  // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const ReschduleConsult: React.FC<ProfileProps> = (props) => {
  const client = useApolloClient();
  const [selectreason, setSelectReason] = useState<string>('Select a reason');
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [oldDoctorId, setOldDoctorId] = useState<string>('');
  const isEnabled = selectreason != 'Select a reason';
  const sysmptonsList = [
    {
      id: '1',
      firstName: 'Fever ',
      secondName: '2days ',
      thirdName: 'Night',
      fourthName: 'High',
    },
    {
      id: '1',
      firstName: 'Cold ',
      secondName: '2days ',
      thirdName: 'Night',
      fourthName: 'High',
    },
  ];
  useEffect(() => {
    getLocalData()
      .then((data) => {
        console.log('data', data);
        setOldDoctorId((data.doctorDetails! || {}).id);
      })
      .catch(() => {});
    console.log('DoctirNAME', oldDoctorId);
  });
  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{
          height: 50,
          backgroundColor: '#ffffff',
        }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText={strings.consult_room.reschedule_consult.toUpperCase()}
        rightIcons={[
          {
            icon: <Cancel />,
            onPress: () => props.navigation.pop(),
          },
        ]}
      ></Header>
    );
  };
  const onPressDoctorSearchListItem = (text: string, id: string) => {
    setDropdownOpen(false);
    setSelectReason(text);
  };
  const renderDropdownCard = () => (
    <View style={{ marginTop: 2 }}>
      <View style={styles.dropDownCardStyle}>
        {sysmptonsList.map((_doctor, i, array) => {
          const drName = ` ${_doctor.firstName}`;

          return (
            <TouchableOpacity
              onPress={() => onPressDoctorSearchListItem(` ${_doctor.firstName}`, _doctor.id)}
              style={{ marginHorizontal: 16 }}
              key={i}
            >
              {formatSuggestionsText(drName, '')}
              {i < array.length - 1 ? (
                <View
                  style={{
                    marginTop: 8,
                    marginBottom: 7,
                    height: 1,
                    opacity: 0.1,
                  }}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const formatSuggestionsText = (text: string, searchKey: string) => {
    return (
      <Highlighter
        style={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansMedium(18),
        }}
        highlightStyle={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansBold(18),
        }}
        searchWords={[searchKey]}
        textToHighlight={text}
      />
    );
  };
  const renderReschduleDetails = () => {
    // do api call
    setIsLoading(true);
    client
      .mutate<initiateRescheduleAppointment, initiateRescheduleAppointmentVariables>({
        mutation: INITIATE_RESCHDULE_APPONITMENT,
        variables: {
          RescheduleAppointmentInput: {
            appointmentId: props.navigation.getParam('AppointmentId'),
            rescheduleReason: selectreason,
            rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
            rescheduleInitiatedId: oldDoctorId,
            rescheduledDateTime: '2019-09-09T09:00:00.000Z',
            autoSelectSlot: 0,
          },
        },
      })
      .then((_data) => {
        setIsLoading(false);
        console.log('data', _data);
        const reschduleObject = {
          appointmentId: props.navigation.getParam('AppointmentId'),
          transferDateTime: g(
            _data,
            'data',
            'initiateRescheduleAppointment',
            'rescheduleAppointment',
            'rescheduledDateTime'
          ),
          doctorId: oldDoctorId,
          reschduleCount: g(_data, 'data', 'initiateRescheduleAppointment', 'rescheduleCount'),
          reschduleId: g(
            _data,
            'data',
            'initiateRescheduleAppointment',
            'rescheduleAppointment',
            'id'
          ),
        };
        pubnub.publish(
          {
            message: {
              id: oldDoctorId,
              message: rescheduleconsult,
              transferInfo: reschduleObject,
            },
            channel: props.navigation.getParam('AppointmentId'), //chanel
            storeInHistory: true,
          },
          (status, response) => {}
        );
        props.navigation.push(AppRoutes.Appointments);
      })
      .catch((e) => {
        setIsLoading(false);
        console.log('Error occured while searching for Initiate reschdule apppointment', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log(
          'Error occured while searching for Initiate reschdule apppointment',
          errorMessage,
          error
        );
        Alert.alert(strings.common.error, errorMessage);
      });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.commonView}>{showHeaderView()}</View>
      <ScrollView bounces={false} style={styles.container}>
        <View style={styles.commonView}>
          <Text style={styles.commonText}>{strings.consult_room.why_do_you_reschudule}</Text>
          <View style={{ marginRight: 20, marginLeft: 20, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setDropdownOpen(!isDropdownOpen)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {selectreason == 'Select a reason' ? (
                  <Text style={styles.commonSubText}>{selectreason}</Text>
                ) : (
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansMedium(16),
                      color: '#02475b',
                      marginTop: 10,
                      marginBottom: 9,
                    }}
                  >
                    {selectreason}
                  </Text>
                )}
                <View style={{ alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                  {!isDropdownOpen ? <Down /> : <Up />}
                </View>
              </View>
            </TouchableOpacity>
            <View style={[styles.inputStyle]} />
          </View>
        </View>
        {isDropdownOpen ? <View style={{ top: 0 }}>{renderDropdownCard()}</View> : null}

        {isLoading ? <Loader flex1 /> : null}
        <View
          style={{
            zIndex: -1,
            // flex: 1,
            justifyContent: 'flex-end',
            marginBottom: 36,
            alignItems: 'flex-end',
            marginTop: 314,
          }}
        >
          <Button
            title={strings.consult_room.reschedule_consult.toUpperCase()}
            titleTextStyle={styles.titleTextStyle}
            style={selectreason != 'Select a reason' ? styles.buttonViewfull : styles.buttonView}
            onPress={() => renderReschduleDetails()}
            disabled={!isEnabled}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
