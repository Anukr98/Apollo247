import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CircleCheckIcon,
  CircleUncheckIcon,
  Expired,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInput } from 'react-native-gesture-handler';
import { CvvPopUp } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CvvPopUp';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { OffersIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';
const { width } = Dimensions.get('window');

export interface SavedCardProps {
  onPressSavedCardPayNow: (cardInfo: any, saveCard: any, bestOffer?: any) => void;
  cardTypes: any;
  selectedCardToken: string;
  onPressSavedCard: (cardInfo: any) => void;
  cardInfo: any;
  bestOffer: any;
  amount: number;
  skipBorder?: boolean;
}

export const SavedCard: React.FC<SavedCardProps> = (props) => {
  const {
    onPressSavedCardPayNow,
    cardTypes,
    selectedCardToken,
    cardInfo,
    onPressSavedCard,
    bestOffer,
    amount,
    skipBorder,
  } = props;
  const cardSelected = cardInfo?.card_token == selectedCardToken ? true : false;
  const [cvv, setcvv] = useState<string>('');
  const { showAphAlert, hideAphAlert } = useUIElements();
  const isExpired = cardInfo?.expired;

  const showCVVPopUP = () => {
    showAphAlert?.({
      unDismissable: false,
      removeTopIcon: true,
      children: <CvvPopUp onPressOk={() => hideAphAlert?.()} />,
    });
  };

  const renderCardIcon = () => {
    const image_url =
      cardInfo?.card_brand &&
      cardTypes?.find((item: any) => item?.payment_method_code == cardInfo?.card_brand)?.image_url;
    return <Image source={{ uri: image_url }} resizeMode={'contain'} style={styles.cardIcon} />;
  };

  const renderCardNo = () => {
    return (
      <View>
        <Text style={styles.cardNo}>
          {cardInfo?.card_number?.slice(-7)}
          {' • '}
          {cardInfo?.card_issuer?.replace('Bank', ' ') + camelize(cardInfo?.card_type)}
          {' Card'}
        </Text>
        <Text style={styles.name}>{cardInfo?.name_on_card || 'User'}</Text>
      </View>
    );
  };

  function camelize(str: any) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word: any, index: any) {
        return index === 0 ? word.toUpperCase() : word.toLowerCase();
      })
      .replace(/\s+/g, '');
  }

  const renderCardInfo = () => {
    return (
      <View style={{ ...styles.cardInfo, opacity: isExpired ? 0.4 : 1 }}>
        <View>
          <View style={{ flexDirection: 'row' }}>
            {renderCardIcon()}
            {renderCardNo()}
          </View>
        </View>
        {cardSelected ? <CircleCheckIcon /> : <CircleUncheckIcon />}
      </View>
    );
  };

  const getOfferDescription = () => {
    return parseFloat(bestOffer?.discount_amount) >= 50
      ? `Get ₹${bestOffer?.discount_amount} off with this card`
      : parseFloat(bestOffer?.cashback_amount) >= 50
      ? `Get ₹${bestOffer?.cashback_amount} cashback with this card`
      : bestOffer?.description?.description;
  };

  const renderOffer = () => {
    return (
      <View style={styles.offer}>
        <OffersIcon style={styles.offerIcon} />
        <Text style={styles.offerTitle}>{getOfferDescription()}</Text>
      </View>
    );
  };

  const renderCvvInput = () => {
    return (
      <TextInput
        style={styles.cvvInput}
        secureTextEntry={true}
        autoFocus={true}
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
          title={
            !!bestOffer?.discount_amount
              ? `PAY  ₹${Number(amount - bestOffer?.discount_amount).toFixed(2)}`
              : `PAY  ₹${Number(amount).toFixed(2)}`
          }
          titleTextStyle={styles.payNow}
          onPress={() => onPressSavedCardPayNow(cardInfo, cvv, bestOffer)}
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

  const renderExpiredTag = () => {
    return (
      <View>
        <View style={styles.expiredCont}>
          <Expired />
          <Text style={styles.expiredMsg}>This Card is Expired </Text>
        </View>
      </View>
    );
  };

  const renderSavedCard = () => {
    const outageStatus = cardInfo?.outage;
    return (
      <View style={{ ...styles.container, backgroundColor: !cardSelected ? '#F6FFFF' : '#F6FFFF' }}>
        <TouchableOpacity
          style={{
            ...styles.subContainer,
            borderBottomWidth: skipBorder ? 0 : 1,
            opacity: outageStatus == 'DOWN' ? 0.5 : 1,
          }}
          onPress={() => onPressSavedCard(cardInfo)}
          disabled={isExpired || outageStatus == 'DOWN' ? true : false}
        >
          <View>{renderCardInfo()}</View>
          <OutagePrompt outageStatus={outageStatus} />
          {!!bestOffer && !outageStatus && renderOffer()}
          {isExpired && renderExpiredTag()}
          {cardSelected && (
            <>
              <View style={styles.subContainer2}>
                {renderCvvInput()}
                {renderPayNow()}
              </View>
              {/* {renderWhatscvv()} */}
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
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  subContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 12,
  },
  subContainer2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
    letterSpacing: 0.01,
    marginLeft: 12,
  },
  name: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    letterSpacing: 1,
    color: '#01475B',
    marginTop: 4,
    marginLeft: 12,
  },
  cardIcon: {
    width: 30,
    height: 30,
  },
  cvvInput: {
    borderWidth: 2,
    borderColor: '#00B38E',
    borderRadius: 4,
    height: 40,
    marginLeft: 41,
    width: 0.25 * width,
    backgroundColor: '#fff',
    paddingLeft: 12,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#fff',
  },
  buttonStyle: {
    width: 0.4 * width,
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
  cvvInputCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  expiredMsg: {
    color: '#E11C1C',
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    letterSpacing: 1,
    paddingVertical: 8,
    marginLeft: 3,
  },
  expiredCont: {
    marginTop: 8,
    marginLeft: 41,
    backgroundColor: '#FFEAEA',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
