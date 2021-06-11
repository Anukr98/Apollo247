import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CircleCheckIcon, CircleUncheckIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInput } from 'react-native-gesture-handler';
import { CvvPopUp } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CvvPopUp';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
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
  const [cvv, setcvv] = useState<string>('');
  const { showAphAlert, hideAphAlert } = useUIElements();

  const showCVVPopUP = () => {
    showAphAlert?.({
      unDismissable: false,
      removeTopIcon: true,
      children: <CvvPopUp onPressOk={() => hideAphAlert?.()} />,
    });
  };

  const renderCardIcon = () => {
    const image_url =
      cardInfo?.cardBrand &&
      cardTypes?.find((item: any) => item?.payment_method_code == cardInfo?.cardBrand)?.image_url;
    return <Image source={{ uri: image_url }} resizeMode={'contain'} style={styles.cardIcon} />;
  };
  console.log(cardTypes);

  const renderCardNo = () => {
    return (
      <Text style={styles.cardNo}>
        {cardInfo?.cardNumber?.slice(-7)}
        {' • '}
        {cardInfo?.cardIssuer + cardInfo?.cardType}
        {' Card'}
      </Text>
    );
  };

  const renderCardInfo = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <View style={{ flexDirection: 'row' }}>
            {renderCardIcon()}
            {renderCardNo()}
          </View>
          <Text style={styles.name}>{cardInfo?.nameOnCard || 'User'}</Text>
        </View>
        {cardSelected ? <CircleCheckIcon /> : <CircleUncheckIcon />}
      </View>
    );
  };

  const renderCvvInput = () => {
    return (
      <TextInput
        style={styles.cvvInput}
        secureTextEntry={true}
        keyboardType={'numeric'}
        placeholder={'CVV'}
        placeholderTextColor={'rgba(1,71,91,0.3)'}
        maxLength={4}
        onChangeText={(text) => setcvv(text)}
      />
    );
  };

  const renderPayNow = () => {
    return (
      <View style={{ alignItems: 'flex-end' }}>
        <Button
          disabled={cvv?.length < 3}
          title={'PAY NOW'}
          titleTextStyle={styles.payNow}
          onPress={() => onPressSavedCardPayNow(cardInfo, cvv)}
          style={styles.buttonStyle}
        />
      </View>
    );
  };

  const renderWhatscvv = () => {
    return (
      <TouchableOpacity onPress={() => showCVVPopUP()}>
        <Text style={styles.whatscvv}>What is CVV ?</Text>
      </TouchableOpacity>
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
          {cardSelected && (
            <>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}
              >
                {renderCvvInput()}
                {renderPayNow()}
              </View>
              {renderWhatscvv()}
            </>
          )}
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
  cvvInput: {
    borderWidth: 2,
    borderColor: '#00B38E',
    borderRadius: 4,
    height: 40,
    marginLeft: 41,
    width: 100,
    backgroundColor: '#fff',
    paddingLeft: 12,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 24,
    color: '#fff',
  },
  buttonStyle: {
    width: 100,
    // paddingHorizontal: 18,
    borderRadius: 5,
  },
  whatscvv: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 13,
    letterSpacing: 1,
    color: '#FCA317',
    marginLeft: 41,
    marginTop: 11,
  },
  cvvInputCont: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});
