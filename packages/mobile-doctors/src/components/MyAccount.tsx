import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { clearUserData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React, { useState } from 'react';
import { Alert, View, SafeAreaView, Text } from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
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
  const tieOptionArray = [
    { key: '1', value: '10' },
    { key: '2', value: '20' },
    { key: '3', value: '30' },
  ];

  const [showHelpModel, setshowHelpModel] = useState(false);
  const [ivrSwitch, setIvrSwitch] = useState(false);
  const [appointmentType, setAppointmentType] = useState<'O' | 'I' | 'B'>('B');
  const [onlineAppointmentTime, setOnlineAppointmentTime] = useState<string>('');
  const [inpersonAppointmentTime, setInPersonAppointmentTime] = useState<string>('');

  const renderNeedHelpModal = () => {
    return showHelpModel ? <NeedHelpCard onPress={() => setshowHelpModel(false)} /> : null;
  };

  const renderHeader = () => {
    return (
      <Header
        containerStyle={{ height: 50 }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText={strings.account.settings.toUpperCase()}
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
      <View
        style={{
          flexDirection: 'row',
          borderRadius: 10,
          backgroundColor: theme.colors.WHITE,
          paddingHorizontal: 16,
          paddingVertical: 22,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text style={{ flex: 1 }}>Set-up an IVR as a reminder for appointment booking</Text>
        <Text style={{ marginRight: 10 }}>{ivrSwitch ? 'YES' : 'NO'}</Text>
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
      <View
        style={{
          height: 18,
          width: 18,
          borderRadius: 100,
          borderColor: theme.colors.APP_GREEN,
          borderWidth: 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {selected ? (
          <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 100,
              backgroundColor: theme.colors.APP_GREEN,
            }}
          />
        ) : null}
      </View>
    );
  };
  const renderivrOption = () => {
    return (
      <View>
        <Text>Select the type of appointment for</Text>
        <View>
          {appointmentTypeArray.map((appointmentitem) => {
            return (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setAppointmentType(appointmentitem.key as 'O' | 'I' | 'B')}
              >
                {circleOption(appointmentType == appointmentitem.key)}
                <Text>{appointmentitem.value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {appointmentType !== 'I' ? (
          <View>
            <Text>Select the time of call before online appointment.</Text>
          </View>
        ) : null}
        {appointmentType !== 'O' ? (
          <View>
            <Text>Select the time of call before in-person appointment. </Text>
          </View>
        ) : null}
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.WHITE }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}>
        {renderHeader()}
        <View
          style={{
            flex: 1,
            marginTop: 26,
            marginHorizontal: 20,
          }}
        >
          {renderivr()}
          {ivrSwitch ? renderivrOption() : null}
        </View>
      </SafeAreaView>
      {renderNeedHelpModal()}
    </View>
  );
};
