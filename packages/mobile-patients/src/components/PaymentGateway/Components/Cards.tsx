import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { NewCard } from '@aph/mobile-patients/src/components/PaymentGateway/Components/NewCard';
import { SavedCard } from '@aph/mobile-patients/src/components/PaymentGateway/Components/SavedCard';
import { getBestOffer } from '@aph/mobile-patients/src/helpers/helperFunctions';
export interface CardsProps {
  onPressNewCardPayNow: (cardInfo: any, saveCard: boolean) => void;
  onPressSavedCardPayNow: (cardInfo: any, cvv: string, bestOffer?: any) => void;
  cardTypes: any;
  isCardValid: boolean;
  setisCardValid: (value: boolean) => void;
  savedCards: [];
  offers: any;
  fetchOffers: (paymentInfo?: any) => void;
}

export const Cards: React.FC<CardsProps> = (props) => {
  const {
    onPressNewCardPayNow,
    onPressSavedCardPayNow,
    cardTypes,
    isCardValid,
    setisCardValid,
    savedCards,
    offers,
    fetchOffers,
  } = props;
  const [selectedCardToken, setSelectedCardToken] = useState<string>('');
  const [newCardSelected, setNewCardSelected] = useState<boolean>(false);

  const renderCard = (item: any) => {
    const bestOffer = getBestOffer(offers, item?.card_fingerprint);
    return (
      <SavedCard
        onPressSavedCardPayNow={onPressSavedCardPayNow}
        cardTypes={cardTypes}
        selectedCardToken={selectedCardToken}
        onPressSavedCard={(cardInfo) => (
          setNewCardSelected(false), setSelectedCardToken(cardInfo?.card_token)
        )}
        cardInfo={item}
        bestOffer={bestOffer}
      />
    );
  };
  const renderSavedCards = () => {
    return savedCards?.map((item: any) => renderCard(item));
  };

  const renderNewCard = () => {
    return (
      <NewCard
        onPressNewCardPayNow={onPressNewCardPayNow}
        cardTypes={cardTypes}
        isCardValid={isCardValid}
        setisCardValid={setisCardValid}
        onPressNewCard={() => (setNewCardSelected(true), setSelectedCardToken(''))}
        newCardSelected={newCardSelected}
        offers={offers}
        fetchOffers={fetchOffers}
      />
    );
  };

  const renderChildComponent = () => {
    return (
      <View>
        {renderSavedCards()}
        {renderNewCard()}
      </View>
    );
  };

  return (
    <CollapseView
      isDown={true}
      Heading={'CREDIT / DEBIT CARDS'}
      ChildComponent={renderChildComponent()}
    />
  );
};

const styles = StyleSheet.create({});
