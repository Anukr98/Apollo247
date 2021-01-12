import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CardInfo } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
export interface CardsProps {
  onPressPayNow: (cardInfo: any) => void;
}

export const Cards: React.FC<CardsProps> = (props) => {
  const { onPressPayNow } = props;
  const [cardNumber, setCardNumber] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [validity, setValidity] = useState<string>('');
  const [CVV, setCVV] = useState<string>('');
  const [cardbin, setCardbin] = useState<any>({});
  const [isValid, setisValid] = useState<boolean>(true);
  const cardInfo = {
    cardType: cardbin?.brand,
    cardNumber: cardNumber.replace(/\-/g, ''),
    ExpMonth: validity.slice(0, 2),
    ExpYear: validity.slice(3),
    CVV: CVV,
  };

  useEffect(() => {
    // fetchCardInfo();
  }, [cardNumber]);

  const fetchCardInfo = async (text: any) => {
    const oldNumber = cardNumber.replace(/\-/g, '');
    const number = text.replace(/\-/g, '');
    if (number.length == 6) {
      const response = await CardInfo(number.slice(0, 6));
      response && setCardbin(response?.data);
      response?.data?.brand == '' && setisValid(false);
    } else if (number.length < 6) {
      setisValid(true);
    }
  };

  function updateCard(num: string) {
    const text = num
      .replace('.', '')
      .replace(' ', '')
      .replace(',', '');
    const newlength = text.length;
    const oldLength = cardNumber.length;
    fetchCardInfo(text);
    if ((newlength == 4 || newlength == 9 || newlength == 14) && oldLength < newlength) {
      setCardNumber(text + '-');
    } else {
      setCardNumber(text);
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
  }

  function isPayNowDisabled() {
    return (
      cardNumber.replace(/\-/g, '').length != 16 ||
      validity.length != 5 ||
      CVV.length < 3 ||
      name == '' ||
      !isValid
    );
  }

  const InputComponent = (
    value: string,
    setValue: any,
    keyboardType: any,
    maxLength: number,
    inputStyle?: any
  ) => {
    return (
      <TextInputComponent
        conatinerstyles={styles.conatinerstyles}
        inputStyle={inputStyle ? inputStyle : styles.inputStyle}
        value={value}
        onChangeText={(text) => setValue(text)}
        secureTextEntry={value == CVV ? true : false}
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    );
  };
  const cardNumberInput = () => {
    const inputStyle = { ...styles.inputStyle, borderBottomColor: isValid ? '#00B38E' : '#FF748E' };
    return (
      <View>
        <Text style={styles.cardNumberTxt}>Card number</Text>
        {InputComponent(cardNumber, updateCard, 'numeric', 19, inputStyle)}
        {renderInvalidCardNumber()}
      </View>
    );
  };

  const renderInvalidCardNumber = () => {
    return !isValid ? (
      <Text style={styles.inValidText}>Invalid Card number</Text>
    ) : (
      <View style={{ height: 14 }}></View>
    );
  };

  const userNameInput = () => {
    return (
      <View style={{ marginTop: 6 }}>
        <Text style={styles.cardNumberTxt}>Full name</Text>
        {InputComponent(name, setName, 'default', 50)}
      </View>
    );
  };

  const validityInput = () => {
    return (
      <View style={{ marginTop: 20, flex: 0.45 }}>
        <Text style={styles.cardNumberTxt}>Valid through (MM/YY)</Text>
        {InputComponent(validity, updateValidity, 'numeric', 5)}
      </View>
    );
  };

  const cvvInput = () => {
    return (
      <View style={{ marginTop: 20, flex: 0.3 }}>
        <Text style={styles.cardNumberTxt}>CVV</Text>
        {InputComponent(CVV, setCVV, 'number-pad', 4, true)}
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
  return <CollapseView Heading={'CREDIT / DEBIT CARDS'} ChildComponent={renderChildComponent()} />;
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
    ...theme.fonts.IBMPlexSansBold(13),
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
});
