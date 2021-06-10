import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CircleCheckIcon, CircleUncheckIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface SavedCardProps {
  onPressSavedCardPayNow: (cardInfo: any, saveCard: any) => void;
  cardTypes: any;
  selectedCardToken: string;
  onPressSavedCard: (cardInfo: any) => void;
  cardInfo: any;
}

export const SavedCard: React.FC<SavedCardProps> = (props) => {
  const {
    onPressSavedCardPayNow,
    cardTypes,
    selectedCardToken,
    cardInfo,
    onPressSavedCard,
  } = props;
  const cardSelected = cardInfo?.cardToken == selectedCardToken ? true : false;

  const renderCardIcon = () => {
    const image_url =
      cardInfo?.cardBrand &&
      cardTypes?.find((item: any) => item?.payment_method_code == cardInfo?.cardBrand)?.image_url;
    return <Image source={{ uri: image_url }} resizeMode={'contain'} style={styles.cardIcon} />;
  };

  const renderCardInfo = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{}}>
          <View style={{ flexDirection: 'row' }}>
            {renderCardIcon()}
            <Text style={styles.cardNo}>
              {cardInfo?.cardNumber?.slice(-7)?.toLowerCase()}
              {' • '}
              {cardInfo?.cardIssuer + cardInfo?.cardType}
            </Text>
          </View>
          <Text style={styles.name}>{cardInfo?.nameOnCard}</Text>
        </View>
        {cardSelected ? <CircleCheckIcon /> : <CircleUncheckIcon />}
      </View>
    );
  };

  const renderSavedCard = () => {
    return (
      <View style={{ ...styles.container, backgroundColor: !cardSelected ? '#fff' : '#F6FFFF' }}>
        <TouchableOpacity
          style={{ ...styles.subContainer, paddingBottom: !cardSelected ? 19 : 16 }}
          onPress={() => onPressSavedCard(cardInfo)}
        >
          {renderCardInfo()}
        </TouchableOpacity>
      </View>
    );
  };

  return renderSavedCard();
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 19,
    paddingHorizontal: 20,
  },
  subContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cardNo: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    letterSpacing: 1,
    marginLeft: 8,
  },
  name: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    letterSpacing: 1,
    color: '#01475B',
    marginTop: 4,
  },
  cardIcon: {
    // height: 35,
    width: 30,
  },
});
