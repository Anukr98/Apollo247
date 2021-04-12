import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CardInfo } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import cardValidator from '@aph/mobile-patients/node_modules/@juspay/simple-card-validator/dist/validator';

export interface CardsProps {
  onPressPayNow: (cardInfo: any) => void;
  cardTypes: any;
  isCardValid: boolean;
  setisCardValid: (value: boolean) => void;
}

export const Cards: React.FC<CardsProps> = (props) => {
  const { onPressPayNow, cardTypes, isCardValid, setisCardValid } = props;
  const [cardNumber, setCardNumber] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [validity, setValidity] = useState<string>('');
  const [CVV, setCVV] = useState<string>('');
  const [cardbin, setCardbin] = useState<any>({});
  const [cardDetails, setCardDetails] = useState<any>({});

  const cardInfo = {
    cardType: cardbin?.brand,
    cardNumber: cardNumber.replace(/\-/g, ''),
    ExpMonth: validity.slice(0, 2),
    ExpYear: validity.slice(3),
    CVV: CVV,
  };

  const fetchCardInfo = async (text: any) => {
    const number = text.replace(/\-/g, '');
    if (number.length >= 6) {
      try {
        const response = await CardInfo(number.slice(0, 6));
        response && setCardbin(response?.data);
        response?.data?.brand == '' ? setisCardValid(false) : setisCardValid(true);
      } catch (e) {}
    } else if (number.length < 6) {
      setCardbin({});
      setisCardValid(true);
    }
    if (text) {
      var card = cardValidator(text);
      setCardDetails(card.getCardDetails());
    }
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
      oldLength < newlength
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
      !isCardValid
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
      borderBottomColor: isCardValid ? '#00B38E' : '#FF748E',
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
        {renderInvalidCardNumber()}
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

  const renderInvalidCardNumber = () => {
    return !isCardValid ? (
      <Text style={styles.inValidText}>Invalid Card number</Text>
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

  const renderCardInput = () => {
    return (
      <View style={{ flex: 1 }}>
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
      <View style={{ alignItems: 'flex-end' }}>
        <Button
          disabled={isPayNowDisabled()}
          title={'PAY NOW'}
          titleTextStyle={styles.payNow}
          onPress={() => onPressPayNow(cardInfo)}
          style={styles.buttonStyle}
        />
      </View>
    );
  };
  const renderChildComponent = () => {
    return (
      <View style={styles.ChildComponent}>
        {renderCardInput()}
        {renderPayNow()}
      </View>
    );
  };
  return (
    <CollapseView
      isDown={false}
      Heading={'CREDIT / DEBIT CARDS'}
      ChildComponent={renderChildComponent()}
    />
  );
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 24,
    color: '#fff',
  },
  buttonStyle: {
    width: 110,
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
});
