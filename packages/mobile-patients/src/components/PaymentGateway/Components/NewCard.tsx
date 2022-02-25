import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Platform, TextInput } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CardInfo } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import cardValidator from '@aph/mobile-patients/node_modules/@juspay/simple-card-validator/dist/validator';
import {
  AddNewCard,
  CircleCheckIcon,
  BlackArrowUp,
  CvvIcon,
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
  offers: any;
  fetchOffers: (paymentInfo?: any) => void;
  amount: number;
}

export const NewCard: React.FC<NewCardProps> = (props) => {
  const {
    onPressNewCardPayNow,
    cardTypes,
    isCardValid,
    setisCardValid,
    offers,
    fetchOffers,
    amount,
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
    name: name,
  };
  const [isCardSupported, setIsCardSupported] = useState<boolean>(true);
  const [outageStatus, setOutageStatus] = useState<string>('UP');
  const [focussed, setFocussed] = useState<string>('');
  const nameRef = useRef<any>(null);
  const cvvRef = useRef<any>(null);
  const expiryRef = useRef<any>(null);
  const bestOffer = getBestOffer(offers, cardbin?.id);
  let ExpYear = validity.slice(3);
  const isExpired = ExpYear?.length == 2 && Number(ExpYear) < new Date().getFullYear() % 100;
  useEffect(() => {
    isCardValid && cardNumber?.replace(/\-/g, '')?.length >= 6
      ? checkIsCardSupported()
      : setIsCardSupported(true);
    (cardNumber?.replace(/\-/g, '')?.length == 6 ||
      cardNumber?.replace(/\-/g, '')?.length == 12 ||
      cardNumber?.replace(/\-/g, '')?.length >= 14) &&
      getOffers();
  }, [cardbin]);

  const getOutageStatus = () => {
    const cardType = cardTypes?.find((item: any) => item?.payment_method_code == cardbin?.brand);
    const outageStatus = cardType?.outage_list?.find(
      (item: any) => item?.bank_code == cardbin?.juspay_bank_code
    );
    return outageStatus?.outage_status;
  };

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
    if (newlength == getMaxLength()) {
      nameRef.current.focus();
    }
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
    if (val.length == 5) {
      cvvRef.current.focus();
    }
  }

  function isPayNowDisabled() {
    return (
      cardNumber.replace(/\-/g, '').length != (cardDetails?.max_length || 16) ||
      validity.length != 5 ||
      CVV.length < (cardDetails?.cvv_length || 3) ||
      name == '' ||
      !isCardValid ||
      !isCardSupported ||
      getOutageStatus() == 'DOWN' ||
      isExpired
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
    const conatinerstyles = {
      ...styles.conatinerstyles,
      borderColor:
        isCardValid && isCardSupported ? (focussed == 'number' ? '#00B38E' : '#D8D8D8') : '#BF2600',
      borderWidth: focussed == 'number' ? 2 : 1,
    };
    return (
      <View>
        <TextInputComponent
          conatinerstyles={conatinerstyles}
          autoFocus={true}
          inputStyle={styles.inputStyle}
          value={cardNumber}
          onChangeText={(text) => updateCard(text)}
          keyboardType={'numeric'}
          maxLength={getMaxLength()}
          icon={renderCardIcon()}
          placeholder={'Card Number'}
          onFocus={() => setFocussed('number')}
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
    ) : !!getOutageStatus() ? (
      <View style={{ height: 14 }}>
        <OutagePrompt outageStatus={getOutageStatus()} />
      </View>
    ) : !!bestOffer ? (
      renderOffer()
    ) : (
      <View style={{ height: 14 }}></View>
    );
  };

  const userNameInput = () => {
    return (
      <View
        style={{
          marginTop: 10,
          borderRadius: 4,
          borderColor: focussed == 'name' ? '#00B38E' : '#D8D8D8',
          borderWidth: focussed == 'name' ? 2 : 1,
        }}
      >
        <TextInput
          ref={(ref: any) => (nameRef.current = ref)}
          style={styles.containerStyle2}
          value={name}
          onChangeText={(text) => setName(text)}
          keyboardType={'default'}
          maxLength={50}
          placeholder={'Name on Card'}
          onFocus={() => setFocussed('name')}
          placeholderTextColor={theme.colors.placeholderTextColor}
          onSubmitEditing={() => expiryRef.current.focus()}
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

  const renderExpired = () => {
    return <Text style={styles.inValidText}>Card Expired</Text>;
  };
  const validityInput = () => {
    return (
      <View
        style={{
          ...styles.constainerStyle3,
          flex: 0.5,
          borderColor: isExpired ? '#BF2600' : focussed == 'expiry' ? '#00B38E' : '#D8D8D8',
          borderWidth: isExpired || focussed == 'expiry' ? 2 : 1,
        }}
      >
        <TextInput
          ref={(ref: any) => (expiryRef.current = ref)}
          style={{ ...styles.containerStyle2, height: 35 }}
          value={validity}
          onChangeText={(text) => updateValidity(text)}
          keyboardType={'numeric'}
          maxLength={5}
          placeholder={'Exp Date (MM/YY)'}
          onFocus={() => setFocussed('expiry')}
        />
        <View style={{ height: 16 }}>{isExpired && renderExpired()}</View>
      </View>
    );
  };

  const cvvInput = () => {
    return (
      <View
        style={{
          ...styles.constainerStyle3,
          borderColor: focussed == 'cvv' ? '#00B38E' : '#D8D8D8',
          borderWidth: focussed == 'cvv' ? 2 : 1,
        }}
      >
        <TextInput
          ref={(ref: any) => (cvvRef.current = ref)}
          style={{ ...styles.containerStyle2, height: 35, flex: 0.6 }}
          value={CVV}
          onChangeText={(text) => setCVV(text)}
          keyboardType={'numeric'}
          maxLength={cardDetails?.cvv_length?.[0] ? cardDetails.cvv_length[0] : 4}
          secureTextEntry={true}
          placeholder="CVV"
          onFocus={() => setFocussed('cvv')}
          placeholderTextColor={theme.colors.placeholderTextColor}
        />
        {renderCVVIcon()}
      </View>
    );
  };

  const renderCVVIcon = () => {
    return <CvvIcon style={{ height: 24, width: 38, marginRight: 8 }} />;
  };

  const saveCardOption = () => {
    return (
      <TouchableOpacity style={styles.saveCard} onPress={() => setSaveCard(!saveCard)}>
        {saveCard ? <CheckIcon style={styles.icon} /> : <UnCheck style={styles.icon} />}
        <Text style={styles.saveCardTxt}>Save this card for faster checkout</Text>
      </TouchableOpacity>
    );
  };

  const renderNewCard = () => {
    return (
      <View>
        {renderCardInput()}
        {saveCardOption()}
        {renderPayNow()}
      </View>
    );
  };

  const renderCardInput = () => {
    return (
      <View style={styles.ChildComponent}>
        {cardNumberInput()}
        {userNameInput()}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {validityInput()}
          {cvvInput()}
        </View>
      </View>
    );
  };

  const renderPayNow = () => {
    return (
      <View style={{ marginHorizontal: 16, paddingBottom: 16 }}>
        <Button
          disabled={isPayNowDisabled()}
          title={
            isCardValid && !getOutageStatus() && !!bestOffer?.order_breakup?.final_order_amount
              ? `SUBMIT AND PAY  ₹${bestOffer?.order_breakup?.final_order_amount}`
              : `SUBMIT AND PAY ₹${amount}`
          }
          titleTextStyle={styles.payNow}
          onPress={() => onPressNewCardPayNow(cardInfo, saveCard, bestOffer)}
          style={styles.buttonStyle}
        />
      </View>
    );
  };

  return <View style={{}}>{renderNewCard()}</View>;
};

const styles = StyleSheet.create({
  ChildComponent: {
    borderColor: '#D4D4D4',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#E2F6FB',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cardNumberTxt: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#898989',
  },
  conatinerstyles: {
    height: 40,
    paddingBottom: 0,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingTop: 0,
  },
  containerStyle2: {
    height: 40,
    paddingBottom: 0,
    backgroundColor: '#fff',
    paddingTop: 0,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingLeft: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  constainerStyle3: {
    marginTop: 24,
    flex: 0.45,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  inputStyle: {
    borderBottomWidth: 0,
    ...theme.fonts.IBMPlexSansMedium(14),
    alignItems: 'center',
    paddingLeft: 20,
  },
  saveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#fff',
  },
  buttonStyle: {
    paddingHorizontal: 18,
    marginTop: 16,
    borderRadius: 5,
  },
  inValidText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 14,
    color: '#BF2600',
  },
  cardIcon: {
    height: 27,
    width: 27,
    marginRight: 8,
    marginBottom: 5,
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
    marginTop: 2,
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
