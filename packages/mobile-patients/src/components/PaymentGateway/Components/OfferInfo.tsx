import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, FlatList, Image, ScrollView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { SafeAreaView } from 'react-navigation';

export interface offerInfoProps {
  offer: any;
}

const windowHeight = Dimensions.get('window').height;

export const OfferInfo: React.FC<offerInfoProps> = (props) => {
  const { offer } = props;
  const { hideAphAlert } = useUIElements();

  let termsAndconditions = offer?.offer_description?.tnc;
  termsAndconditions = termsAndconditions?.split('- ');

  const renderTitle = () => {
    const imageUrl = `${AppConfig.Configuration.offerIconBaseUrl}${offer?.offer_description?.sponsored_by}.png`;
    return (
      <View style={{ flexDirection: 'row' }}>
        <Image style={styles.offerIcon} source={{ uri: imageUrl }} />
        <View>
          <Text style={styles.offerTitle}>{offer?.offer_description?.title}</Text>
          <Text style={styles.offerDescription}>{offer?.offer_description?.description}</Text>
        </View>
      </View>
    );
  };

  const renderItem = (item: any) => {
    return !!item ? (
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <Text style={{ color: '#01475B' }}>{'\u2022'}</Text>
        <Text style={styles.conditions}>{item?.trim()}</Text>
      </View>
    ) : null;
  };

  const renderTermsAndConditions = () => {
    return (
      <View>
        <Text style={styles.conditionsTitle}>Terms and Conditions</Text>
        <FlatList data={termsAndconditions} renderItem={(item: any) => renderItem(item?.item)} />
      </View>
    );
  };

  const renderOk = () => {
    return <Button style={styles.button} title={'OK, GOT IT'} onPress={() => hideAphAlert?.()} />;
  };

  const renderOfferInfo = () => {
    return (
      <View>
        {renderTitle()}
        {renderTermsAndConditions()}
        {renderOk()}
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView>{renderOfferInfo()}</ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: 0.8 * windowHeight,
  },
  offerTitle: {
    ...theme.fonts.IBMPlexSansBold(16),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 8,
  },
  offerIcon: {
    height: 32,
    width: 32,
  },
  offerDescription: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    marginTop: 6,
    marginLeft: 8,
  },
  conditionsTitle: {
    marginLeft: 4,
    marginTop: 32,
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 18,
    color: '#01475B',
    letterSpacing: 0.03,
  },
  conditions: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 6,
  },
  button: {
    marginTop: 24,
    marginBottom: 8,
  },
});
