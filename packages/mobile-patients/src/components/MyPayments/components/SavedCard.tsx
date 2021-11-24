import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DeleteBlack } from '@aph/mobile-patients/src/components/ui/Icons';

export interface SavedCardProps {
  cardTypes: any;
  cardInfo: any;
  isLastCard?: boolean;
  onAlert: boolean;
  onPressDeleteCard?: () => void;
}

export const SavedCard: React.FC<SavedCardProps> = (props) => {
  const { cardTypes, cardInfo, isLastCard, onPressDeleteCard, onAlert } = props;

  const renderCardIcon = () => {
    const image_url =
      cardInfo?.card_brand &&
      cardTypes?.find((item: any) => item?.payment_method_code == cardInfo?.card_brand)?.image_url;
    return <Image source={{ uri: image_url }} resizeMode={'contain'} style={styles.cardIcon} />;
  };

  const renderCardNo = () => {
    return (
      <Text style={styles.cardNo}>
        {cardInfo?.card_number?.slice(-7)}
        {' • '}
        {cardInfo?.card_issuer + cardInfo?.card_type}
        {' Card'}
      </Text>
    );
  };

  const renderCardInfo = () => {
    return (
      <View style={styles.cardInfo}>
        <View>
          <View style={{ flexDirection: 'row' }}>
            {renderCardIcon()}
            {renderCardNo()}
          </View>
          <Text style={styles.name}>{cardInfo?.name_on_card || 'User'}</Text>
        </View>
        {!onAlert && (
          <TouchableOpacity onPress={() => onPressDeleteCard?.()}>
            <DeleteBlack />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSavedCard = () => {
    return (
      <View style={{ ...styles.container, paddingHorizontal: onAlert ? 0 : 20 }}>
        <View style={{ ...styles.subContainer, borderBottomWidth: isLastCard ? 0 : 1 }}>
          {renderCardInfo()}
        </View>
      </View>
    );
  };

  return renderSavedCard();
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  subContainer: {
    paddingTop: 21,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNo: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 16,
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
    marginLeft: 41,
  },
  cardIcon: {
    width: 33,
  },
});
