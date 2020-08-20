import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { clearUserData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import React, { useState, useEffect } from 'react';
import { Alert, View, SafeAreaView, Text } from 'react-native';
import {
  NavigationActions,
  NavigationScreenProps,
  StackActions,
  ScrollView,
} from 'react-navigation';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  BackArrow,
  RoundIcon,
  Dropdown,
  Up,
  ChekGray,
  InfoGreen,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { useApolloClient } from 'react-apollo-hooks';
import AsyncStorage from '@react-native-community/async-storage';
import { DELETE_DOCTOR_DEVICE_TOKEN } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  deleteDoctorDeviceToken,
  deleteDoctorDeviceTokenVariables,
} from '@aph/mobile-doctors/src/graphql/types/deleteDoctorDeviceToken';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { Switch } from '@aph/mobile-doctors/src/components/ui/Switch';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MaterialMenu, OptionsObject } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';
import { MyAccountStyles } from '@aph/mobile-doctors/src/components/MyAccount.styles';
import { string } from '@aph/mobile-doctors/src/strings/string';
import moment from 'moment';

const styles = MyAccountStyles;

export interface MyAccountProps extends NavigationScreenProps {}

export const MyAccount: React.FC<MyAccountProps> = (props) => {
  const { clearFirebaseUser, doctorDetails } = useAuth();
  const client = useApolloClient();
  const { setLoading } = useUIElements();
  const appointmentTypeArray = [
    { key: 'O', value: 'Online' },
    { key: 'I', value: 'In-person' },
    { key: 'B', value: 'Both' },
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

  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [showHelpModel, setshowHelpModel] = useState<boolean>(false);
  const [showSavedTime, setShowSavedTime] = useState<boolean>(false);
  const [expandFollowUp, setExpandFollowUp] = useState<boolean>(false);
  const [ivrSwitch, setIvrSwitch] = useState<boolean>(false);
  const [appointmentType, setAppointmentType] = useState<'O' | 'I' | 'B'>('B');
  const [onlineAppointmentTime, setOnlineAppointmentTime] = useState<OptionsObject>(
    timeOptionArray[0]
  );
  const [inpersonAppointmentTime, setInPersonAppointmentTime] = useState<OptionsObject>(
    timeOptionArray[0]
  );
  const [followUpDays, setFollowUpDays] = useState<OptionsObject>(daysOptionArray[0]);
  const editedData = {
    ivrEnabled: ivrSwitch,
    typeOfAppointment: appointmentType,
    onlineRemainderTime: onlineAppointmentTime.value,
    inpersonRemainderTime: inpersonAppointmentTime.value,
    followUpDays: followUpDays.key,
  };
  useEffect(() => {
    AsyncStorage.getItem('settingsData').then((data) => {
      setIsEdited(data !== JSON.stringify(editedData));
    });
  }, [appointmentType, followUpDays, inpersonAppointmentTime, ivrSwitch, onlineAppointmentTime]);

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
          {appointmentTypeArray.map((appointmentitem) => {
            const isSelected = appointmentType == appointmentitem.key;
            return (
              <View style={styles.ivrOptionsContainer}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setAppointmentType(appointmentitem.key as 'O' | 'I' | 'B')}
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
        {appointmentType !== 'I' ? (
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
        {appointmentType !== 'O' ? (
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
                  <Text style={theme.viewStyles.text('B', 14, theme.colors.APP_GREEN)}>{`${
                    followUpDays.key
                  } day${followUpDays.key === 1 ? '' : 's'}`}</Text>
                </Text>
              ) : null}
            </View>
            <Up style={expandFollowUp ? styles.cardNextUpIcon : styles.cardNextIcon} />
          </View>
        </TouchableOpacity>
        {expandFollowUp ? (
          <View style={{ marginTop: 16 }}>
            <Text style={theme.viewStyles.text('R', 10, '#c9c5c5')}>Select the umber of days</Text>
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
              <Text
                style={{
                  ...theme.viewStyles.text('R', 10, '#979797', 1, 12, 1),
                  marginLeft: 10,
                  marginRight: 20,
                }}
              >
                This Value will be default for all patients, However you can change the follow-up
                chat day count on individual patient's Case-sheet.
              </Text>
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
        {isEdited ? (
          <Button
            title={'SAVE CHANGES'}
            onPress={() => {
              AsyncStorage.setItem('settingsData', JSON.stringify(editedData));
              setIsEdited(false);
              setShowSavedTime(true);
              setTimeout(() => {
                setShowSavedTime(false);
              }, 5000);
            }}
          />
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeAreaStyle}>
        {renderHeader()}
        <ScrollView bounces={false}>
          <View style={styles.viewMainContainer}>
            {renderivr()}
            {ivrSwitch ? renderivrOption() : null}
            {renderNotificationPreference()}
            {renderFollowupSettings()}
          </View>
        </ScrollView>
        {renderButton()}
      </SafeAreaView>
      {renderNeedHelpModal()}
    </View>
  );
};
