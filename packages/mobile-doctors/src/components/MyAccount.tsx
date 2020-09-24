import { MyAccountStyles } from '@aph/mobile-doctors/src/components/MyAccount.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  BackArrow,
  ChekGray,
  Dropdown,
  InfoGreen,
  RoundIcon,
  Up,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { MaterialMenu, OptionsObject } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { Switch } from '@aph/mobile-doctors/src/components/ui/Switch';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import {
  SET_APPOINTMENT_REMINDER_IVR,
  UPDATE_CHAT_DAYS,
} from '@aph/mobile-doctors/src/graphql/profiles';
import { ConsultMode } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  setAppointmentReminderIvr,
  setAppointmentReminderIvrVariables,
} from '@aph/mobile-doctors/src/graphql/types/setAppointmentReminderIvr';
import {
  updateDoctorChatDays,
  updateDoctorChatDaysVariables,
} from '@aph/mobile-doctors/src/graphql/types/updateDoctorChatDays';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = MyAccountStyles;

export interface MyAccountProps extends NavigationScreenProps {}

export const MyAccount: React.FC<MyAccountProps> = (props) => {
  const { doctorDetails, getDoctorDetailsApi } = useAuth();
  const client = useApolloClient();
  const { setLoading, showAphAlert } = useUIElements();
  const appointmentTypeArray = [
    { key: ConsultMode.ONLINE, value: 'Online' },
    { key: ConsultMode.PHYSICAL, value: 'In-person' },
    { key: ConsultMode.BOTH, value: 'Both' },
  ];
  const timeOptionArray: OptionsObject[] = [
    { key: '1', value: '10' },
    { key: '2', value: '20' },
    { key: '3', value: '30' },
  ];
  const daysOptionArray: OptionsObject[] = Array(31)
    .fill(0)
    .map((_, i) => {
      return { key: i, value: i < 10 ? (i == 0 ? '0' : '0' + i.toString()) : i.toString() };
    });

  const [ivrChanged, setIVRChanged] = useState<boolean>(false);
  const [notificationChanged, setNotificationChanged] = useState<boolean>(false);
  const [followupChanged, setFollowupChanged] = useState<boolean>(false);
  const [showHelpModel, setshowHelpModel] = useState<boolean>(false);
  const [showSavedTime, setShowSavedTime] = useState<boolean>(false);
  const [expandFollowUp, setExpandFollowUp] = useState<boolean>(false);
  const [ivrSwitch, setIvrSwitch] = useState<boolean>(false);
  const [appointmentType, setAppointmentType] = useState<ConsultMode>(ConsultMode.BOTH);
  const [onlineAppointmentTime, setOnlineAppointmentTime] = useState<OptionsObject>(
    timeOptionArray[0]
  );
  const [inpersonAppointmentTime, setInPersonAppointmentTime] = useState<OptionsObject>(
    timeOptionArray[0]
  );
  const [followUpDays, setFollowUpDays] = useState<OptionsObject>(daysOptionArray[7]);

  const editedData = {
    ivrEnabled: ivrSwitch,
    typeOfAppointment: appointmentType,
    onlineRemainderTime:
      appointmentType !== ConsultMode.PHYSICAL ? onlineAppointmentTime.value : null,
    inpersonRemainderTime:
      appointmentType !== ConsultMode.ONLINE ? inpersonAppointmentTime.value : null,
    followUpDays: followUpDays.key,
  };

  useEffect(() => {
    AsyncStorage.getItem('settingsData').then((data) => {
      if (data) {
        const savedData = JSON.parse(data);
        setIVRChanged(
          savedData.ivrEnabled !== editedData.ivrEnabled ||
            (ivrSwitch && savedData.typeOfAppointment !== editedData.typeOfAppointment) ||
            (ivrSwitch &&
              appointmentType !== ConsultMode.PHYSICAL &&
              savedData.onlineRemainderTime !== editedData.onlineRemainderTime) ||
            (ivrSwitch &&
              appointmentType !== ConsultMode.ONLINE &&
              savedData.inpersonRemainderTime !== editedData.inpersonRemainderTime)
        );
        setFollowupChanged(savedData.followUpDays !== editedData.followUpDays);
      } else {
        AsyncStorage.setItem('settingsData', JSON.stringify(editedData));
      }
    });
  }, [appointmentType, followUpDays, inpersonAppointmentTime, ivrSwitch, onlineAppointmentTime]);

  const getOpionObject = (data: OptionsObject[], searchValue: string, isKey: boolean) => {
    return data.find((item) => (isKey ? item.key === searchValue : item.value === searchValue));
  };

  useEffect(() => {
    if (doctorDetails) {
      const chatDays = g(doctorDetails, 'chatDays');
      const ivrDetails = {
        ivrEnabled: g(doctorDetails, 'isIvrSet') || false,
        typeOfAppointment: g(doctorDetails, 'ivrConsultType') || ConsultMode.BOTH,
        onlineRemainderTime:
          (g(doctorDetails, 'ivrConsultType') || ConsultMode.BOTH) !== ConsultMode.PHYSICAL
            ? (g(doctorDetails, 'ivrCallTimeOnline') || 10).toString()
            : null,
        inpersonRemainderTime:
          (g(doctorDetails, 'ivrConsultType') || ConsultMode.BOTH) !== ConsultMode.ONLINE
            ? (g(doctorDetails, 'ivrCallTimePhysical') || 10).toString()
            : null,
      };
      AsyncStorage.setItem(
        'settingsData',
        JSON.stringify({
          ...ivrDetails,
          followUpDays: chatDays,
        })
      );
      if (chatDays !== null && chatDays !== undefined) {
        setFollowUpDays(daysOptionArray[chatDays]);
      }
      setIvrSwitch(ivrDetails.ivrEnabled);
      setAppointmentType(ivrDetails.typeOfAppointment);
      setOnlineAppointmentTime(
        getOpionObject(timeOptionArray, ivrDetails.onlineRemainderTime || '10', false) ||
          timeOptionArray[0]
      );
      setInPersonAppointmentTime(
        getOpionObject(timeOptionArray, ivrDetails.inpersonRemainderTime || '10', false) ||
          timeOptionArray[0]
      );
    }
  }, [doctorDetails]);

  const renderNeedHelpModal = () => {
    return showHelpModel ? <NeedHelpCard onPress={() => setshowHelpModel(false)} /> : null;
  };

  const renderHeader = () => {
    return (
      <Header
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText={string.account.settings.toUpperCase()}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => setshowHelpModel(true),
          },
        ]}
      />
    );
  };

  const renderivr = () => {
    return (
      <View style={styles.ivrCardContainer}>
        <Text style={styles.cardTextStyle}>{string.settings.ivrHeading}</Text>
        <Text style={ivrSwitch ? styles.yesTextStyle : styles.noTextStyle}>
          {ivrSwitch ? string.settings.yes : string.settings.no}
        </Text>
        <Switch
          value={ivrSwitch}
          onChange={(value) => {
            setIvrSwitch(value);
          }}
          pathColor={{ left: '#979797', right: theme.colors.APP_YELLOW }}
        />
      </View>
    );
  };

  const circleOption = (selected: boolean) => {
    return (
      <View style={styles.outerCircleStyle}>
        {selected ? <View style={styles.innerCircleStyle} /> : null}
      </View>
    );
  };

  const renderivrOption = () => {
    return (
      <View style={styles.ivrDetailsContainer}>
        <Text style={styles.ivrSubHeadingStyle}>{string.settings.ivrOptionSelect}</Text>
        <View style={{ flexDirection: 'row' }}>
          {appointmentTypeArray.map((appointmentitem, index) => {
            const isSelected = appointmentType == appointmentitem.key;
            return (
              <View style={styles.ivrOptionsContainer} key={index}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setAppointmentType(appointmentitem.key)}
                >
                  <View style={styles.ivrOptionsItemContainer}>
                    {circleOption(isSelected)}
                    <Text style={isSelected ? styles.ivrSelectedText : styles.ivrDeselectedText}>
                      {appointmentitem.value}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        {appointmentType !== ConsultMode.PHYSICAL ? (
          <View style={styles.timingMainContainer}>
            <Text style={styles.ivrSubHeadingStyle}>{string.settings.ivrOnlineHeading}</Text>
            <View style={styles.dropContainer}>
              <MaterialMenu
                options={timeOptionArray}
                selectedText={onlineAppointmentTime.key}
                onPress={(selectedOption) => {
                  setOnlineAppointmentTime(selectedOption);
                }}
                menuContainerStyle={styles.materialMenuMenuContainerStyle}
                itemContainer={styles.materialMenuItemContainer}
                itemTextStyle={styles.materialMenuItemTextStyle}
                selectedTextStyle={styles.materialMenuSelectedTextStyle}
                bottomPadding={styles.materialMenuBottomPadding}
              >
                <View style={styles.materialMenuViewContainer}>
                  <View style={styles.materialMenuViewSubContainer}>
                    <Text style={styles.materialMenuDisplayText}>
                      {onlineAppointmentTime.value}
                    </Text>
                    <View style={styles.materialMenuTextContainer}>
                      <Text style={styles.materialMenuDisplaySubText}>
                        {string.settings.inMins}
                      </Text>
                      <Dropdown />
                    </View>
                  </View>
                </View>
              </MaterialMenu>
            </View>
          </View>
        ) : null}
        {appointmentType !== ConsultMode.ONLINE ? (
          <View style={styles.timingMainContainer}>
            <Text style={styles.ivrSubHeadingStyle}>{string.settings.ivrInPersonHeading}</Text>
            <View style={styles.dropContainer}>
              <MaterialMenu
                options={timeOptionArray}
                selectedText={inpersonAppointmentTime.key}
                onPress={(selectedOption) => {
                  setInPersonAppointmentTime(selectedOption);
                }}
                menuContainerStyle={styles.materialMenuMenuContainerStyle}
                itemContainer={styles.materialMenuItemContainer}
                itemTextStyle={styles.materialMenuItemTextStyle}
                selectedTextStyle={styles.materialMenuSelectedTextStyle}
                bottomPadding={styles.materialMenuBottomPadding}
              >
                <View style={styles.materialMenuViewContainer}>
                  <View style={styles.materialMenuViewSubContainer}>
                    <Text style={styles.materialMenuDisplayText}>
                      {inpersonAppointmentTime.value}
                    </Text>
                    <View style={styles.materialMenuTextContainer}>
                      <Text style={styles.materialMenuDisplaySubText}>
                        {string.settings.inMins}
                      </Text>
                      <Dropdown />
                    </View>
                  </View>
                </View>
              </MaterialMenu>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  const renderNotificationPreference = () => {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.cardTextStyle}>{string.settings.notificationHeader}</Text>
        <Up style={styles.cardNextIcon} />
      </View>
    );
  };

  const renderFollowupSettings = () => {
    return (
      <View style={[styles.cardContainer, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <TouchableOpacity
          onPress={() => {
            setExpandFollowUp(!expandFollowUp);
          }}
          activeOpacity={1}
          style={{ width: '100%' }}
        >
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <View style={{ flex: 1 }}>
              <Text style={theme.viewStyles.text('M', 12, theme.colors.SHARP_BLUE, 1, 18, 0.02)}>
                {string.settings.followupHeader}
              </Text>
              {!expandFollowUp ? (
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 10, theme.colors.APP_GREEN),
                    marginTop: 6,
                  }}
                >
                  {'Default value set at  '}
                  <Text style={theme.viewStyles.text('B', 14, theme.colors.APP_GREEN)}>
                    {followUpDays.key > 0
                      ? `${followUpDays.key} day${followUpDays.key === 1 ? '' : 's'}`
                      : `No Chat Follow-up`}
                  </Text>
                </Text>
              ) : null}
            </View>
            <Up style={expandFollowUp ? styles.cardNextUpIcon : styles.cardNextIcon} />
          </View>
        </TouchableOpacity>
        {expandFollowUp ? (
          <View style={{ marginTop: 16 }}>
            <Text style={theme.viewStyles.text('R', 10, '#c9c5c5')}>Select the number of days</Text>
            <View style={{ width: '40%', marginTop: 12 }}>
              <MaterialMenu
                options={daysOptionArray}
                selectedText={followUpDays.key}
                onPress={(selectedOption) => {
                  setFollowUpDays(selectedOption);
                }}
                menuContainerStyle={styles.materialMenuMenuContainerStyle}
                itemContainer={styles.materialMenuItemContainer}
                itemTextStyle={styles.materialMenuItemTextStyle}
                selectedTextStyle={styles.materialMenuSelectedTextStyle}
                bottomPadding={styles.materialMenuBottomPadding}
              >
                <View style={styles.materialMenuViewContainer}>
                  <View style={styles.materialMenuViewSubContainer}>
                    <Text style={styles.materialMenuDisplayText}>{followUpDays.value}</Text>
                    <View style={styles.materialMenuTextContainer2}>
                      <Text style={styles.materialMenuDisplaySubText2}>
                        {`day${followUpDays.key == 1 ? '' : 's'}`}
                      </Text>
                      <Dropdown />
                    </View>
                  </View>
                </View>
              </MaterialMenu>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
              <InfoGreen />
              <Text style={styles.followupInfoText}>{string.settings.followupInfo}</Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  const renderButton = () => {
    return (
      <View style={styles.buttonContainer}>
        {showSavedTime ? (
          <View style={styles.saveTextContainer}>
            <ChekGray />
            <Text style={styles.savedTextStyle}>
              {string.settings.saveText.replace(
                '{0}',
                moment().format('DD MMMM, YYYY [at] hh:mm A')
              )}
            </Text>
          </View>
        ) : null}
        {followupChanged || ivrChanged ? (
          <Button
            title={'SAVE CHANGES'}
            onPress={() => {
              saveSettings();
            }}
          />
        ) : null}
      </View>
    );
  };

  const saveSettings = () => {
    if (followupChanged) {
      setLoading && setLoading(true);
      client
        .mutate<updateDoctorChatDays, updateDoctorChatDaysVariables>({
          mutation: UPDATE_CHAT_DAYS,
          variables: {
            doctorId: g(doctorDetails, 'id') || '',
            chatDays: Number(followUpDays.key),
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          setLoading && setLoading(false);
          if (!g(data, 'updateDoctorChatDays', 'isError')) {
            getDoctorDetailsApi && getDoctorDetailsApi();
            AsyncStorage.setItem('settingsData', JSON.stringify(editedData));
            setFollowupChanged(false);
            setShowSavedTime(true);
            setTimeout(() => {
              setShowSavedTime(false);
            }, 5000);
          } else {
            showAphAlert &&
              showAphAlert({
                title: string.common.alert,
                description: string.alerts.something_went_wrong,
              });
          }
        })
        .catch((error) => {
          setLoading && setLoading(false);
          showAphAlert &&
            showAphAlert({
              title: string.common.alert,
              description: string.alerts.something_went_wrong,
            });
        });
    }
    if (ivrChanged) {
      setLoading && setLoading(true);
      client
        .mutate<setAppointmentReminderIvr, setAppointmentReminderIvrVariables>({
          mutation: SET_APPOINTMENT_REMINDER_IVR,
          variables: {
            doctorId: g(doctorDetails, 'id') || '',
            isIvrSet: ivrSwitch,
            ivrConsultType: ivrSwitch ? appointmentType : null,
            ivrCallTimeOnline:
              appointmentType !== ConsultMode.PHYSICAL && ivrSwitch
                ? Number(onlineAppointmentTime.value)
                : null,
            ivrCallTimePhysical:
              appointmentType !== ConsultMode.ONLINE && ivrSwitch
                ? Number(inpersonAppointmentTime.value)
                : null,
          },
        })
        .then(({ data }) => {
          setLoading && setLoading(false);
          if (!g(data, 'setAppointmentReminderIvr', 'isError')) {
            getDoctorDetailsApi && getDoctorDetailsApi();
            AsyncStorage.setItem('settingsData', JSON.stringify(editedData));
            setIVRChanged(false);
            setShowSavedTime(true);
            setTimeout(() => {
              setShowSavedTime(false);
            }, 5000);
          } else {
            showAphAlert &&
              showAphAlert({
                title: string.common.alert,
                description: string.alerts.something_went_wrong,
              });
          }
        })
        .catch((error) => {
          setLoading && setLoading(false);
          showAphAlert &&
            showAphAlert({
              title: string.common.alert,
              description: string.alerts.something_went_wrong,
            });
        });
    }
    if (notificationChanged) {
      //Do Notificaion change
    }
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeAreaStyle}>
        {renderHeader()}
        <ScrollView bounces={false}>
          <View style={styles.viewMainContainer}>
            {renderivr()}
            {ivrSwitch ? renderivrOption() : null}
            {/* APP-1947 */}
            {/* {renderNotificationPreference()} */}
            {renderFollowupSettings()}
          </View>
        </ScrollView>
        {renderButton()}
      </SafeAreaView>
      {renderNeedHelpModal()}
    </View>
  );
};
