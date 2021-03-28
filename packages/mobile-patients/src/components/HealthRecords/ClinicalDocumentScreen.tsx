import React from 'react';
import { SafeAreaView, View, Image, TouchableOpacity } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AccountCircleDarkIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface ClinicalDocumentScreenProps extends NavigationScreenProps {}

export const ClinicalDocumentScreen: React.FC<ClinicalDocumentScreenProps> = (props) => {
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
        title={'CLINICAL DOCUMENT'}
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
