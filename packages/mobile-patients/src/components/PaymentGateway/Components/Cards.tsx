import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { NewCard } from '@aph/mobile-patients/src/components/PaymentGateway/Components/NewCard';
import { SavedCard } from '@aph/mobile-patients/src/components/PaymentGateway/Components/SavedCard';
export interface CardsProps {
  onPressPayNow: (cardInfo: any, saveCard: boolean) => void;
  cardTypes: any;
  isCardValid: boolean;
  setisCardValid: (value: boolean) => void;
  savedCards: [];
}

export const Cards: React.FC<CardsProps> = (props) => {
  const { onPressPayNow, cardTypes, isCardValid, setisCardValid, savedCards } = props;
  const [selectedCardToken, setSelectedCardToken] = useState<string>('');
  const [newCardSelected, setNewCardSelected] = useState<boolean>(false);

  const renderSavedCards = () => {
    return savedCards?.map((item: any) => (
      <SavedCard
        onPressSavedCardPayNow={onPressPayNow}
        cardTypes={cardTypes}
        selectedCardToken={selectedCardToken}
        onPressSavedCard={(cardInfo) => (
          setNewCardSelected(false), setSelectedCardToken(cardInfo?.cardToken)
        )}
        cardInfo={item}
      />
    ));
  };

  const renderNewCard = () => {
    return (
      <NewCard
        onPressNewCardPayNow={onPressPayNow}
        cardTypes={cardTypes}
        isCardValid={isCardValid}
        setisCardValid={setisCardValid}
        onPressNewCard={() => (setNewCardSelected(true), setSelectedCardToken(''))}
        newCardSelected={newCardSelected}
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
