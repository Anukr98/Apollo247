import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Check,
  CheckUnselectedIcon,
  OneApollo,
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  MedicineCartItem,
  MEDICINE_ORDER_PAYMENT_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { SaveMedicineOrderVariables } from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrder';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Slider } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
  },
  cardTitleStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: theme.colors.LIGHT_BLUE,
  },
  separator: {
    backgroundColor: theme.colors.LIGHT_BLUE,
    height: 1,
    opacity: 0.1,
    marginBottom: 15,
    marginTop: 8,
  },
  verticalSeparator: {
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.1,
    height: '100%',
    width: 1,
    marginRight: 15,
    marginLeft: 16,
  },
  paymentModeRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentModeTextStyle: {
    flex: 1,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
    marginLeft: 16,
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  balanceAmountPayTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
  },
  balanceAmountViewStyle: {
    backgroundColor: '#f7f8f5',
    borderRadius: 5,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthCreditsRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableHealthCreditsView: {
    flex: 1,
    height: '100%',
  },
  healthCreditsTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
  },
  healthCreditsAmountTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
  },
  sliderStyle: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  sliderThumbStyle: {
    height: 20,
    width: 20,
    shadowColor: 'rgba(0, 179, 142, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderValueStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
  },
  sliderValuesViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export interface CheckoutSceneProps extends NavigationScreenProps {}

export const CheckoutScene: React.FC<CheckoutSceneProps> = (props) => {
  const [isOneApolloPayment, setOneApolloPayment] = useState(false);
  const [oneApolloCredits, setOneApolloCredits] = useState(0);
  const [isCashOnDelivery, setCashOnDelivery] = useState(false);

  const {
    deliveryAddressId,
    storeId,
    grandTotal,
    deliveryCharges,
    cartItems,
    deliveryType,
  } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();
  const MAX_SLIDER_VALUE = grandTotal;
  const client = useApolloClient();

  const placeOrder = async () => {
    const payment: SaveMedicineOrderVariables['MedicineCartInput']['payment'] = {};
    if (!isCashOnDelivery) {
      payment.paymentType = MEDICINE_ORDER_PAYMENT_TYPE.ONLINE;
      payment.amountPaid = grandTotal;
      payment.paymentDateTime = new Date().toString();
      payment.paymentStatus = 'PAID';
      payment.paymentRefId = (Math.random() * 100).toString().replace('.', '');
    } else {
      payment.paymentType = MEDICINE_ORDER_PAYMENT_TYPE.COD;
    }
    const order: SaveMedicineOrderVariables = {
      MedicineCartInput: {
        quoteId: null,
        patientId: (currentPatient && currentPatient.id) || '',
        shopId: storeId || null,
        patinetAddressId: deliveryAddressId || null,
        payment: payment,
        medicineDeliveryType: deliveryType!,
        devliveryCharges: deliveryCharges,
        estimatedAmount: grandTotal,
        items: cartItems.map(
          (item) =>
            ({
              medicineSKU: item.id,
              price: item.price,
              medicineName: item.name,
              quantity: item.quantity,
              mrp: item.price,
              // isPrescriptionNeeded: item.prescriptionRequired,
              prescriptionImageUrl: null,
              mou: parseInt(item.mou),
              isMedicine: null,
            } as MedicineCartItem)
        ),
      },
    };
    /*
    client
      .query<SaveMedicineOrder, SaveMedicineOrderVariables>({
        query: SAVE_MEDICINE_ORDER,
        variables: order,
      })
      .then(({ data: { SaveMedicineOrder } }) => {
        console.log({ SaveMedicineOrder });
      })
      .catch((error) => {
        console.log('Error occured', { error });
      });
    */
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'CHECKOUT'}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderHeadingAndCard = (
    title: string,
    view: Element,
    cardStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <View style={{ margin: 20 }}>
        <Text style={styles.cardTitleStyle}>{title}</Text>
        <View style={styles.separator} />
        <View style={[styles.cardStyle, cardStyle]}>{view}</View>
      </View>
    );
  };

  const renderOneApollo = (
    <View style={styles.healthCreditsRowStyle}>
      <TouchableOpacity
        style={{ marginRight: 16 }}
        onPress={() => setOneApolloPayment(!isOneApolloPayment)}
      >
        {isOneApolloPayment ? <Check /> : <CheckUnselectedIcon />}
      </TouchableOpacity>
      <OneApollo />
    </View>
  );

  const renderAvailableHealthCredits = (
    <View style={[styles.healthCreditsRowStyle, styles.availableHealthCreditsView]}>
      <View style={styles.verticalSeparator} />
      <View style={{ flex: 1 }}>
        <Text style={styles.healthCreditsTextStyle}>{'Available Health Credits'}</Text>
        <Text style={styles.healthCreditsAmountTextStyle}>{'2000'}</Text>
      </View>
    </View>
  );

  const renderOneApolloAndHealthCreditsCard = () => {
    const oneApolloCheckBoxAndCredits = (
      <View style={[styles.healthCreditsRowStyle, { paddingHorizontal: 16 }]}>
        {renderOneApollo}
        {renderAvailableHealthCredits}
      </View>
    );

    const balanceAmountToPay = (
      <View style={[styles.balanceAmountViewStyle, { marginHorizontal: 16 }]}>
        <Text style={styles.balanceAmountPayTextStyle}>{'Balance amount to pay'}</Text>
        <Text style={[styles.balanceAmountPayTextStyle, theme.fonts.IBMPlexSansSemiBold(14)]}>
          {`Rs. ${
            MAX_SLIDER_VALUE - oneApolloCredits > -1 ? MAX_SLIDER_VALUE - oneApolloCredits : 0
          }`}
        </Text>
      </View>
    );

    const slider = (
      <Slider
        value={oneApolloCredits}
        thumbStyle={styles.sliderThumbStyle}
        maximumValue={MAX_SLIDER_VALUE}
        step={1}
        onValueChange={(val) => setOneApolloCredits(val)}
        thumbTintColor={'#00b38e'}
        minimumTrackTintColor={'rgba(0, 135, 186, 1)'}
        maximumTrackTintColor={'rgba(0, 135, 186, 0.1)'}
      />
    );

    const sliderValues = (
      <View style={styles.sliderValuesViewStyle}>
        <Text style={[styles.sliderValueStyle, oneApolloCredits == 0 ? { opacity: 1 } : {}]}>
          {'0'}
        </Text>
        {!!(oneApolloCredits > 0 && oneApolloCredits < MAX_SLIDER_VALUE) && (
          <Text style={[styles.sliderValueStyle, { opacity: 1 }]}>
            {oneApolloCredits ? oneApolloCredits : null}
          </Text>
        )}
        <Text
          style={[
            styles.sliderValueStyle,
            oneApolloCredits == MAX_SLIDER_VALUE ? { opacity: 1 } : {},
          ]}
        >
          {MAX_SLIDER_VALUE}
        </Text>
      </View>
    );

    const healthCreditsSliderAndValues = (
      <View style={styles.sliderStyle}>
        {slider}
        {sliderValues}
      </View>
    );

    const content = (
      <View>
        {oneApolloCheckBoxAndCredits}
        {isOneApolloPayment ? (
          <>
            {healthCreditsSliderAndValues}
            <View style={[styles.separator, { marginTop: 3.5 }]} />
            {balanceAmountToPay}
          </>
        ) : null}
      </View>
    );

    return renderHeadingAndCard(
      'Would you like to use Apollo Health Credits for this payment?',
      content,
      { paddingHorizontal: 0 }
    );
  };

  const renderPaymentModesCard = () => {
    const payUsingPaytmOption = (
      <View style={[styles.paymentModeRowStyle, { marginBottom: 16 }]}>
        <TouchableOpacity onPress={() => setCashOnDelivery(!isCashOnDelivery)}>
          {isCashOnDelivery ? <RadioButtonUnselectedIcon /> : <RadioButtonIcon />}
        </TouchableOpacity>
        <Text style={styles.paymentModeTextStyle}>Pay Using paytm</Text>
      </View>
    );

    const cashOnDeliveryOption = (
      <View style={[styles.paymentModeRowStyle]}>
        <TouchableOpacity onPress={() => setCashOnDelivery(!isCashOnDelivery)}>
          {!isCashOnDelivery ? <RadioButtonUnselectedIcon /> : <RadioButtonIcon />}
        </TouchableOpacity>
        <Text style={styles.paymentModeTextStyle}>Cash On Delivery</Text>
      </View>
    );

    const content = (
      <View>
        {payUsingPaytmOption}
        {cashOnDeliveryOption}
      </View>
    );

    return (
      <View
        style={isOneApolloPayment && !(MAX_SLIDER_VALUE - oneApolloCredits) ? { opacity: 0.3 } : {}}
        pointerEvents={
          isOneApolloPayment && !(MAX_SLIDER_VALUE - oneApolloCredits) ? 'none' : 'auto'
        }
      >
        {renderHeadingAndCard(
          isOneApolloPayment
            ? 'How would you prefer to pay the balace amount ?'
            : 'Pick a payment mode',
          content
        )}
      </View>
    );
  };

  const renderPayButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '66.66%' }}
          title={`PAY — RS. ${grandTotal}`}
          onPress={() => {
            placeOrder();
          }}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderHeader()}
      {/* {renderOneApolloAndHealthCreditsCard()} */}
      {renderPaymentModesCard()}
      {renderPayButton()}
    </SafeAreaView>
  );
};
