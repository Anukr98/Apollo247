import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Location, More } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

const styles = StyleSheet.create({
  imageView: {
    width: 80,
    marginLeft: 20,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  timeStyle: {
    paddingBottom: 20,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SKY_BLUE,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 3.5,
  },
  descriptionStyle: {
    paddingTop: 7.5,
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
  },
  labelViewStyle: {
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export interface AppointmentDetailsProps extends NavigationScreenProps {}

export const AppointmentDetails: React.FC<AppointmentDetailsProps> = (props) => {
  const data = props.navigation.state.params!.data;
  console.log(
    props.navigation.state.params!.data,
    data.doctorInfo.doctorHospital[0].facility.streetLine1
  );
  if (data.doctorInfo)
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            title="UPCOMING CLINIC VISIT"
            leftIcon="backArrow"
            rightComponent={
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <More />
              </TouchableOpacity>
            }
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <View
            style={{
              backgroundColor: theme.colors.CARD_BG,
              paddingTop: 20,
              paddingHorizontal: 20,
              ...theme.viewStyles.shadowStyle,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(12),
                    color: theme.colors.SEARCH_EDUCATION_COLOR,
                    paddingBottom: 4,
                  }}
                >
                  #{data.id}
                </Text>
                <View style={styles.separatorStyle} />
                <Text style={styles.doctorNameStyle}>Dr. {data.doctorInfo.firstName}</Text>
                <Text style={styles.timeStyle}></Text>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Location</Text>
                  <Location />
                </View>
                <View style={styles.separatorStyle} />
                <Text style={styles.descriptionStyle}>
                  {data.doctorInfo &&
                  data.doctorInfo.doctorHospital &&
                  data.doctorInfo.doctorHospital.length > 0 &&
                  data.doctorInfo.doctorHospital[0].facility
                    ? `${data.doctorInfo.doctorHospital[0].facility.streetLine1} ${data.doctorInfo.doctorHospital[0].facility.city}`
                    : ''}
                </Text>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Average Waiting Time</Text>
                </View>
                <View style={styles.separatorStyle} />
                <Text style={styles.descriptionStyle}>40 mins</Text>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Payment</Text>
                  <Text style={theme.viewStyles.yellowTextStyle}>INVOICE</Text>
                </View>
                <View style={styles.separatorStyle} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.descriptionStyle}>Advance Paid</Text>
                  <Text style={styles.descriptionStyle}>200</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.descriptionStyle}>Balance Remaining</Text>
                  <Text style={styles.descriptionStyle}>299</Text>
                </View>
              </View>
              <View style={styles.imageView}>
                {data.doctorInfo.photoUrl && (
                  <Image
                    source={{ uri: data.doctorInfo.photoUrl }}
                    style={{
                      width: 80,
                      height: 80,
                    }}
                  />
                )}
              </View>
            </View>
          </View>
          <StickyBottomComponent defaultBG>
            <Button
              title={'FILL CASE SHEET'}
              style={{ flex: 1, marginHorizontal: 40 }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.ChatRoom, {
                  data: data,
                });
              }}
            />
          </StickyBottomComponent>
        </SafeAreaView>
      </View>
    );
  return null;
};
