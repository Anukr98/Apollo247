import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CardInfo } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import cardValidator from '@aph/mobile-patients/node_modules/@juspay/simple-card-validator/dist/validator';
import {
  Card,
  CircleCheckIcon,
  CircleUncheckIcon,
  Check,
  UnCheck,
  CheckIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { paymentModeVersionCheck } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';
import { getBestOffer } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { OffersIcon } from '@aph/mobile-patients/src/components/ui/Icons';
export interface NewCardProps {
  onPressNewCardPayNow: (cardInfo: any, saveCard: any, bestOffer?: any) => void;
  cardTypes: any;
  isCardValid: boolean;
  setisCardValid: (value: boolean) => void;
  onPressNewCard: () => void;
  newCardSelected: boolean;
  offers: any;
  fetchOffers: (paymentInfo?: any) => void;
}

export const NewCard: React.FC<NewCardProps> = (props) => {
  const {
    onPressNewCardPayNow,
    cardTypes,
    isCardValid,
    setisCardValid,
    onPressNewCard,
    newCardSelected,
    offers,
    fetchOffers,
  } = props;
  const [cardNumber, setCardNumber] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [validity, setValidity] = useState<string>('');
  const [CVV, setCVV] = useState<string>('');
  const [cardbin, setCardbin] = useState<any>({});
  const [cardDetails, setCardDetails] = useState<any>({});
  const [saveCard, setSaveCard] = useState<boolean>(true);
  const cardInfo = {
    cardType: cardbin?.brand,
    cardNumber: cardNumber.replace(/\-/g, ''),
    ExpMonth: validity.slice(0, 2),
    ExpYear: validity.slice(3),
    CVV: CVV,
  };
  const [isCardSupported, setIsCardSupported] = useState<boolean>(true);
  const [outageStatus, setOutageStatus] = useState<string>('UP');
  const bestOffer = getBestOffer(offers, cardbin?.id);

  useEffect(() => {
    isCardValid && cardNumber?.replace(/\-/g, '')?.length >= 6
      ? checkIsCardSupported()
      : setIsCardSupported(true);
    (cardNumber?.replace(/\-/g, '')?.length == 6 || cardNumber?.replace(/\-/g, '')?.length == 12) &&
      getOffers();
  }, [cardbin]);

  const getOffers = () => {
    const paymentInfo = [
      {
        payment_method_type: 'CARD',
        payment_method: cardbin?.brand,
        payment_method_reference: cardbin?.id,
        card_alias: cardbin?.id,
        card_bin: cardbin?.id,
        card_type: cardbin?.type,
        bank_code: cardbin?.juspay_bank_code,
      },
    ];
    fetchOffers(paymentInfo);
  };

  const fetchCardInfo = async (text: any) => {
    const number = text.replace(/\-/g, '');
    if (number.length >= 6) {
      try {
        const response = await CardInfo(number.slice(0, 6));
        response?.data && setCardbin(response?.data);
        response?.data
          ? response?.data?.brand
            ? setisCardValid(true)
            : setisCardValid(false)
          : setisCardValid(false);
      } catch (e) {
        setisCardValid(false);
        setCardbin({});
      }
    } else if (number.length < 6) {
      setCardbin({});
      setisCardValid(true);
      setOutageStatus('UP');
    }
    if (text) {
      var card = cardValidator(text);
      setCardDetails(card.getCardDetails());
    }
  };

  const checkIsCardSupported = () => {
    const cardInfo =
      cardbin?.brand && cardTypes?.find((item: any) => item?.payment_method_code == cardbin?.brand);
    setOutageStatus(cardInfo?.outage_status);
    cardInfo && paymentModeVersionCheck(cardInfo?.minimum_supported_version)
      ? setIsCardSupported(true)
      : setIsCardSupported(false);
  };

  function updateCard(num: string) {
    const text = num
      .replace('.', '')
      .replace(' ', '')
      .replace(',', '');
    const newlength = text.length;
    const oldLength = cardNumber.length;
    if (
      (newlength == 4 || newlength == 9 || newlength == 14 || newlength == 19) &&
      oldLength < newlength &&
      newlength < getMaxLength()
    ) {
      setCardNumber(text + '-');
    } else {
      setCardNumber(text);
    }
    fetchCardInfo(text);
  }

  function updateValidity(text: string) {
    let val = text;
    const newlength = text.length;
    const oldLength = validity.length;
    if (val != '' && val[0] != '0' && val[0] != '1') {
      val = '0' + val + '/';
    } else if (val[0] == '1') {
      Number(val[1]) > 2 && (val = val[0] + '2');
    }
    oldLength < newlength && val.length == 2 && (val = val + '/');
    val.length > 2 && val.indexOf('/') == -1 && (val = val[0] + val[1] + '/' + val[2]);
    setValidity(val);
  }

  function isPayNowDisabled() {
    return (
      cardNumber.replace(/\-/g, '').length != (cardDetails?.max_length || 16) ||
      validity.length != 5 ||
      CVV.length < (cardDetails?.cvv_length || 3) ||
      name == '' ||
      !isCardValid ||
      !isCardSupported ||
      outageStatus == 'DOWN'
    );
  }

  const getMaxLength = () => {
    if (cardDetails?.max_length) {
      return cardDetails?.max_length > 16
        ? cardDetails?.max_length + 4
        : cardDetails?.max_length + 3;
    } else {
      return 19;
    }
  };

  const cardNumberInput = () => {
    const inputStyle = {
      ...styles.inputStyle,
      borderBottomColor: isCardValid && isCardSupported ? '#00B38E' : '#FF748E',
    };
    return (
      <View>
        <Text style={styles.cardNumberTxt}>Card number</Text>
        <TextInputComponent
          conatinerstyles={styles.conatinerstyles}
          inputStyle={inputStyle}
          value={cardNumber}
          onChangeText={(text) => updateCard(text)}
          keyboardType={'numeric'}
          maxLength={getMaxLength()}
          icon={renderCardIcon()}
        />
        {renderSubContainer()}
      </View>
    );
  };

  const renderCardIcon = () => {
    const cardInfo =
      cardbin?.brand && cardTypes?.find((item: any) => item?.payment_method_code == cardbin?.brand);
    return (
      <Image source={{ uri: cardInfo?.image_url }} resizeMode={'contain'} style={styles.cardIcon} />
    );
  };

  const renderSubContainer = () => {
    return !isCardValid ? (
      <Text style={styles.inValidText}>Invalid Card number</Text>
    ) : !isCardSupported ? (
      <Text style={styles.inValidText}>Card is not supported</Text>
    ) : !!bestOffer ? (
      renderOffer()
    ) : (
      <View style={{ height: 14 }}></View>
    );
  };

  const userNameInput = () => {
    return (
      <View style={{ marginTop: 6 }}>
        <Text style={styles.cardNumberTxt}>Full name</Text>
        <TextInputComponent
          conatinerstyles={styles.conatinerstyles}
          inputStyle={styles.inputStyle}
          value={name}
          onChangeText={(text) => setName(text)}
          keyboardType={'default'}
          maxLength={50}
        />
      </View>
    );
  };

  const getOfferDescription = () => {
    const orderBreakup = bestOffer?.order_breakup;
    return parseFloat(orderBreakup?.discount_amount) > 50
      ? `Get ₹${orderBreakup?.discount_amount} off with this card`
      : parseFloat(orderBreakup?.cashback_amount) > 50
      ? `Get ₹${orderBreakup?.cashback_amount} cashback with this card`
      : bestOffer?.offer_description?.description;
  };

  const renderOffer = () => {
    return (
      <View style={styles.offer}>
        <OffersIcon style={styles.offerIcon} />
        <Text style={styles.offerTitle}>{getOfferDescription()}</Text>
      </View>
    );
  };

  const validityInput = () => {
    return (
      <View style={{ marginTop: 20, flex: 0.45 }}>
        <Text style={styles.cardNumberTxt}>Valid through (MM/YY)</Text>
        <TextInputComponent
          conatinerstyles={styles.conatinerstyles}
          inputStyle={styles.inputStyle}
          value={validity}
          onChangeText={(text) => updateValidity(text)}
          keyboardType={'numeric'}
          maxLength={5}
        />
      </View>
    );
  };

  const cvvInput = () => {
    return (
      <View style={{ marginTop: 20, flex: 0.3 }}>
        <Text style={styles.cardNumberTxt}>CVV</Text>
        <TextInputComponent
          conatinerstyles={styles.conatinerstyles}
          inputStyle={styles.inputStyle}
          value={CVV}
          onChangeText={(text) => setCVV(text)}
          keyboardType={'numeric'}
          maxLength={cardDetails?.cvv_length?.[0] ? cardDetails.cvv_length[0] : 4}
          secureTextEntry={true}
        />
      </View>
    );
  };

  const saveCardOption = () => {
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}
        onPress={() => setSaveCard(!saveCard)}
      >
        {saveCard ? <CheckIcon style={styles.icon} /> : <UnCheck style={styles.icon} />}
        <Text style={styles.saveCardTxt}>Save this card for faster checkout</Text>
      </TouchableOpacity>
    );
  };

  const renderNewCard = () => {
    return (
      <View
        style={{
          backgroundColor: !newCardSelected || outageStatus == 'DOWN' ? '#fff' : '#F6FFFF',
          paddingHorizontal: 20,
        }}
      >
        <OutagePrompt outageStatus={outageStatus} msg={'Your card is'} />
        <TouchableOpacity style={styles.newCardCont} onPress={() => onPressNewCard()}>
          <View style={styles.cardSubCont}>
            <Card />
            <Text style={styles.newCard}>Pay with a New Card</Text>
          </View>
          {newCardSelected ? <CircleCheckIcon /> : <CircleUncheckIcon />}
        </TouchableOpacity>
        {newCardSelected && renderCardInput()}
      </View>
    );
  };

  const renderCardInput = () => {
    return (
      <View style={{ flex: 1, paddingBottom: 20 }}>
        {cardNumberInput()}
        {userNameInput()}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {validityInput()}
          {cvvInput()}
        </View>
        {saveCardOption()}
        {renderPayNow()}
      </View>
    );
  };

  const renderPayNow = () => {
    return (
      <View style={{ alignItems: 'flex-end' }}>
        <Button
          disabled={isPayNowDisabled()}
          title={
            !!bestOffer?.order_breakup?.final_order_amount
              ? `PAY  ₹${bestOffer?.order_breakup?.final_order_amount}`
              : 'PAY NOW'
          }
          titleTextStyle={styles.payNow}
          onPress={() => onPressNewCardPayNow(cardInfo, saveCard, bestOffer)}
          style={styles.buttonStyle}
        />
      </View>
    );
  };

  return <View style={styles.ChildComponent}>{renderNewCard()}</View>;
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    // paddingHorizontal: 20,
    // paddingBottom: 15,
  },
  cardNumberTxt: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#898989',
  },
  conatinerstyles: {
    paddingTop: 0,
  },
  inputStyle: {
    borderBottomWidth: 1,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#fff',
  },
  buttonStyle: {
    width: 150,
    paddingHorizontal: 18,
    marginTop: 16,
    borderRadius: 5,
  },
  inValidText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 14,
    color: '#FF748E',
  },
  cardIcon: {
    height: 27,
    width: 27,
    marginBottom: 2,
  },
  newCard: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 8,
  },
  newCardCont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  cardSubCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    height: 15,
    width: 15,
  },
  saveCardTxt: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    color: '#01475B',
    marginLeft: 8,
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerTitle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#34AA55',
    marginLeft: 4,
  },
  offerIcon: {
    height: 16,
    width: 16,
  },
});
