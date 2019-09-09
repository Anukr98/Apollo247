import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Download,
  FileBig,
  MedicineRxIcon,
  PrescriptionThumbnail,
  ShareGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  imageView: {
    ...theme.viewStyles.cardViewStyle,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    backgroundColor: theme.colors.WHITE,
  },
  doctorNameStyle: {
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  timeStyle: {
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.04,
    lineHeight: 20,
  },
  doctorDetailsStyle: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  labelStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  descriptionStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  labelTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingTop: 8,
    paddingBottom: 3,
  },
  valuesTextStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingBottom: 16,
  },
});

export interface RecordDetailsProps extends NavigationScreenProps {}

export const MedicineConsultDetails: React.FC<RecordDetailsProps> = (props) => {
  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
  console.log(data, 'data');
  const me = props.navigation.state.params ? props.navigation.state.params.medicineDate : {};
  console.log(me, 'me');
  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="RECORD DETAILS"
          leftIcon="backArrow"
          rightComponent={
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity activeOpacity={1} style={{ marginRight: 20 }} onPress={() => {}}>
                <ShareGreen />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <Download />
              </TouchableOpacity>
            </View>
          }
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <View style={{ backgroundColor: '#f7f8f5' }}>
          <View style={{ marginLeft: 20, marginBottom: 8, marginTop: 17 }}>
            <MedicineRxIcon />
          </View>
          <View style={{ marginLeft: 20 }}>
            <Text
              style={{ ...theme.fonts.IBMPlexSansSemiBold(23), color: '#02475b', marginBottom: 4 }}
            >
              {data.medicineName}
            </Text>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(14),
                color: '#0087ba',
                letterSpacing: 0.04,
                marginBottom: 20,
              }}
            >
              {me}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
