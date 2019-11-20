import React, { useState, useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { PatientSignIn_patientSignIn_patients } from '@aph/mobile-patients/src/graphql/types/PatientSignIn';
import { colors } from '@aph/mobile-patients/src/theme/colors';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  viewName: {
    backgroundColor: theme.colors.WHITE,
    width: '100%',
    shadowColor: colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  hiTextStyle: {
    marginLeft: 20,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginTop: 5,
    marginHorizontal: 5,
  },
  descriptionTextStyle: {
    paddingHorizontal: 20,
    paddingTop: 12,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
    paddingBottom: 20,
    backgroundColor: colors.WHITE,
  },
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
  },
});

export interface UserIntroProps {
  style?: StyleProp<ViewStyle>;
  description?: string;
}

export const UserIntro: React.FC<UserIntroProps> = (props) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [userName, setuserName] = useState<string>('');

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    let userName =
      currentPatient && currentPatient.firstName ? currentPatient.firstName.split(' ')[0] : '';
    userName = userName.toLowerCase();
    setuserName(userName);

    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient, userName]);

  const Popup = () => (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        paddingVertical: 9,
        position: 'absolute',
        width: width,
        height: height,
        flex: 1,
        alignItems: 'flex-end',
        zIndex: 999,
        elevation: 5,
        // backgroundColor: 'red',
        backgroundColor: 'transparent',
      }}
      onPress={() => setShowMenu(false)}
    >
      <View
        style={{
          width: 160,
          borderRadius: 10,
          backgroundColor: 'white',
          marginRight: 56,
          shadowColor: '#808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 5,
          paddingTop: 8,
          paddingBottom: 16,
          ...Platform.select({
            android: {
              marginTop: 94,
            },
            ios: {
              marginTop: 134,
            },
          }),
        }}
      >
        {allCurrentPatients &&
          allCurrentPatients.map((profile: PatientSignIn_patientSignIn_patients, i: number) => (
            <View style={styles.textViewStyle} key={i}>
              <Text
                style={[
                  styles.textStyle,
                  profile.firstName &&
                  userName === profile.firstName.split(' ')[0].toLocaleLowerCase()
                    ? { color: theme.colors.APP_GREEN }
                    : null,
                ]}
                onPress={() => {
                  setShowMenu(false);
                }}
              >
                {profile.firstName
                  ? profile.firstName
                      .split(' ')[0]
                      .replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
                  : ''}
              </Text>
            </View>
          ))}
        {/* 
        <Text
          style={{
            paddingTop: 15,
            paddingBottom: 4,
            paddingRight: 16,
            textAlign: 'right',
            ...theme.viewStyles.yellowTextStyle,
          }}
        >
          ADD MEMBER
        </Text> */}
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <View style={[styles.viewName, props.style]}>
        {props.children}
        <View
          // activeOpacity={1}
          // onPress={() => setShowMenu(true)}
          style={{
            flexDirection: 'row',
            // marginTop: 18,
            alignItems: 'center',
            backgroundColor: colors.WHITE,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.hiTextStyle}>
              {string.home.hi} {userName}!
            </Text>
            {/* <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={styles.nameTextStyle}>{userName}!</Text>
                <DropdownGreen style={{ marginTop: 8 }} />
              </View>
              <View style={styles.seperatorStyle} />
            </View> */}
          </View>
        </View>
        <Text style={styles.descriptionTextStyle}>{props.description}</Text>
      </View>
      {showMenu && Popup()}
    </View>
  );
};
