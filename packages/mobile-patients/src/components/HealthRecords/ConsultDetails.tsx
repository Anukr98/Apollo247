import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ShareGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

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
});

export interface ConsultDetailsProps extends NavigationScreenProps {}

export const ConsultDetails: React.FC<ConsultDetailsProps> = (props) => {
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
            title="PRESCRIPTION"
            leftIcon="backArrow"
            rightComponent={
              <TouchableOpacity onPress={() => {}}>
                <ShareGreen />
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
                    color: '#658f9b',
                    paddingBottom: 4,
                  }}
                >
                  #{data.id}
                </Text>
                <View style={styles.separatorStyle} />
                <Text style={styles.doctorNameStyle}>Dr. {data.doctorInfo.firstName}</Text>
                <Text style={styles.timeStyle}></Text>
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
