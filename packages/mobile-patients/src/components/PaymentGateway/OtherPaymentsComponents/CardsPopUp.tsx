import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PayCash } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  OffersIcon,
  CircleCheckIcon,
  CircleUncheckIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { SavedCard } from '@aph/mobile-patients/src/components/PaymentGateway/Components/SavedCard';
import { getBestOffer } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { BlackArrowUp } from '@aph/mobile-patients/src/components/ui/Icons';

export interface CardsPopUpProps {
  savedCards: [];
  offers: any;
  amount: number;
  onPressSavedCardPayNow: (cardInfo: any, cvv: string, bestOffer?: any) => void;
  cardTypes: any;
  onPressNewCard: () => void;
}

export const CardsPopUp: React.FC<CardsPopUpProps> = (props) => {
  const { onPressSavedCardPayNow, savedCards, offers, amount, cardTypes, onPressNewCard } = props;
  const [selectedCardToken, setSelectedCardToken] = useState<string>('');

  const renderCard = (item: any) => {
    return (
      <SavedCard
        onPressSavedCardPayNow={onPressSavedCardPayNow}
        cardTypes={cardTypes}
        selectedCardToken={selectedCardToken}
        onPressSavedCard={(cardInfo) => setSelectedCardToken(cardInfo?.card_token)}
        cardInfo={item}
        bestOffer={item?.offers?.[0]}
        // skipBorder={true}
        amount={amount}
      />
    );
  };

  const renderSavedCards = () => {
    return !!savedCards?.length ? (
      <View style={styles.container}>{savedCards?.map((item: any) => renderCard(item))}</View>
    ) : null;
  };

  const renderNewCard = () => {
    return (
      <View>
        {!!savedCards?.length && <Text style={styles.header}>NEW DEBIT/CREDIT CARD</Text>}
        <TouchableOpacity style={styles.subCont} onPress={onPressNewCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
            <Image
              source={require('@aph/mobile-patients/src/components/ui/icons/CardIcon.webp')}
              style={styles.icon}
            />
            <Text style={styles.name}>Pay with a New Card</Text>
          </View>
          <BlackArrowUp style={{ width: 15, height: 7, transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
      </View>
    );
  };
  const renderChildComponent = () => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        {renderSavedCards()}
        {renderNewCard()}
      </View>
    );
  };
  return <View style={{ paddingTop: 12, paddingBottom: 24 }}>{renderChildComponent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    borderColor: '#D4D4D4',
    borderWidth: 1,
  },
  header: {
    marginTop: 24,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 16,
    color: '#01475B',
    marginBottom: 12,
  },
  icon: {
    height: 30,
    width: 30,
  },
  subCont: {
    borderRadius: 4,
    borderColor: '#D4D4D4',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFEFF',
    paddingHorizontal: 12,
  },
  name: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 8,
  },
});
