import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity } from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AccountCircleDarkIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface TestReportScreenProps extends NavigationScreenProps {}

export const TestReportScreen: React.FC<TestReportScreenProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();

  const renderProfileImage = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => props.navigation.goBack()}>
        {currentPatient?.photoUrl?.match(
          /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/
        ) ? (
          <Image
            source={{ uri: currentPatient?.photoUrl }}
            style={{ height: 30, width: 30, borderRadius: 15, marginTop: 8 }}
          />
        ) : (
          <AccountCircleDarkIcon
            style={{
              height: 36,
              width: 36,
              borderRadius: 18,
              marginTop: 5,
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <Header
        title={'TEST REPORTS'}
        leftIcon={'backArrow'}
        rightComponent={renderProfileImage()}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => {
          props.navigation.goBack();
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>{renderHeader()}</SafeAreaView>
    </View>
  );
};
