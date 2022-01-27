import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SavedCard } from '@aph/mobile-patients/src/components/PaymentGateway/Components/SavedCard';
import { getBestOffer } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AddNewCard, BlackArrowUp } from '@aph/mobile-patients/src/components/ui/Icons';
export interface CardsProps {
  onPressNewCard: () => void;
  onPressSavedCardPayNow: (cardInfo: any, cvv: string, bestOffer?: any) => void;
  cardTypes: any;
  savedCards: [];
  offers: any;
  amount: number;
}

export const Cards: React.FC<CardsProps> = (props) => {
  const { onPressNewCard, onPressSavedCardPayNow, cardTypes, savedCards, offers, amount } = props;
  const [selectedCardToken, setSelectedCardToken] = useState<string>('');

  const renderCard = (item: any) => {
    const bestOffer = getBestOffer(offers, item?.card_fingerprint);
    return (
      <SavedCard
        onPressSavedCardPayNow={onPressSavedCardPayNow}
        cardTypes={cardTypes}
        selectedCardToken={selectedCardToken}
        onPressSavedCard={(cardInfo) =>
          selectedCardToken == cardInfo?.card_token
            ? setSelectedCardToken('')
            : setSelectedCardToken(cardInfo?.card_token)
        }
        cardInfo={item}
        bestOffer={item?.offers?.[0]}
        amount={amount}
      />
    );
  };
  const renderSavedCards = () => {
    return savedCards?.map((item: any) => renderCard(item));
  };

  const renderNewCard = () => {
    return (
      <TouchableOpacity
        style={styles.newCardCont}
        onPress={() => {
          onPressNewCard();
          setSelectedCardToken('');
        }}
      >
        <View style={styles.cardSubCont}>
          <AddNewCard style={{ width: 30, height: 24 }} />
          <Text style={styles.newCard}>Pay with a New Card</Text>
        </View>
        {<BlackArrowUp style={{ width: 15, height: 7, transform: [{ rotate: '90deg' }] }} />}
      </TouchableOpacity>
    );
  };

  const renderChildComponent = () => {
    return (
      <View style={styles.ChildComponent}>
        {renderSavedCards()}
        {renderNewCard()}
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.heading}>CREDIT/DEBIT CARDS</Text>
      </View>
    );
  };

  return (
    <View>
      {renderHeader()}
      {renderChildComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#FAFEFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
  },
  header: {
    marginHorizontal: 16,
    paddingBottom: 8,
    marginTop: 16,
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
  },
  newCard: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 13,
  },
  newCardCont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 17,
    paddingBottom: 21,
    marginHorizontal: 12,
  },
  cardSubCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
