import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, RoundChatIcon, RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';

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
  const profileData = props.navigation.getParam('ProfileData');
  console.log('p', profileData);

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
        headerText="AVAILIBILITY"
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => props.navigation.push(AppRoutes.NeedHelpAppointment),
          },
        ]}
      />
    );
  };

  return (
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
              Consultation Type
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
              <Text style={styles.consultDescText}>
                What type of consults will you be available for?
              </Text>
              <Text
                style={{
                  marginLeft: 20,
                  marginTop: 8,
                  ...theme.fonts.IBMPlexSansMedium(16),
                  color: '#02475b',
                  marginBottom: 20,
                }}
              >
                Physical, Online
              </Text>
            </View>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansSemiBold(16),
                color: '#02475b',
                // marginBottom: 16,
                marginLeft: 20,
                //marginTop: 20,
              }}
            >
              Consultation Hours
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

        <View style={{ margin: 20, flexDirection: 'row', marginBottom: 10 }}>
          <View style={{ marginTop: 4 }}>
            <RoundChatIcon />
          </View>

          <View style={{ marginLeft: 14 }}>
            <Text>
              <Text style={styles.descriptionview}>Call</Text>
              <Text
                style={{ color: '#fc9916', ...theme.fonts.IBMPlexSansSemiBold(16), lineHeight: 22 }}
              >
                {' '}
                1800 - 3455 - 3455{' '}
              </Text>
              <Text style={styles.descriptionview}>to make any changes</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
