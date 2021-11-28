import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Image, Text, Platform } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Specialist,
  VideoActiveIcon,
  UserPackage,
} from '@aph/mobile-patients/src/components/ui/Icons';
import moment from 'moment';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  CreateUserSubscription,
  CreateUserSubscriptionVariables,
} from '@aph/mobile-patients/src/graphql/types/CreateUserSubscription';
import {
  CREATE_USER_SUBSCRIPTION,
  CREATE_INTERNAL_ORDER,
  CREATE_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { postCleverTapEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  one_apollo_store_code,
  OrderVerticals,
  OrderCreate,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  initiateSDK,
  createHyperServiceObject,
  terminateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
interface PackageCheckoutProps extends NavigationScreenProps {
  packageDetailData: any;
  selectedPlanIndex: number;
  oneTapPatient: any;
}

export const PackageCheckout: React.FC<PackageCheckoutProps> = (props) => {
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert } = useUIElements();
  const { cusId, isfetchingId } = useGetJuspayId();
  const [hyperSdkInitialized, setHyperSdkInitialized] = useState<boolean>(false);
  const packageDetailData = props.navigation.getParam('packageDetailData');
  const selectedPlanIndex = props.navigation.getParam('selectedPlanIndex');
  const oneTapPatient = props.navigation.getParam('oneTapPatient');

  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;

  const { PlanName, PlanActualPrice, PlanFinalPrice, PlanCMSIdentifier } =
    packageDetailData?.Plandata[selectedPlanIndex] || {};

  const packageId = packageDetailData?.Packagedata?.PackageCMSIdentifier;
  const subPlanId = PlanCMSIdentifier;
  const amountToPay = PlanFinalPrice;

  useEffect(() => {
    !isfetchingId ? (cusId ? initiateHyperSDK(cusId) : initiateHyperSDK(currentPatient?.id)) : null;
  }, [isfetchingId]);

  const initiateHyperSDK = async (cusId: any) => {
    try {
      const merchantId = AppConfig.Configuration.merchantId;
      terminateSDK();
      createHyperServiceObject();
      initiateSDK(cusId, cusId, merchantId);
      setHyperSdkInitialized(true);
    } catch (error) {}
  };

  const createJusPayOrder = (paymentId: string) => {
    const orderInput = {
      payment_order_id: paymentId,
      health_credits_used: 0,
      cash_to_collect: 0,
      prepaid_amount: 0,
      store_code: storeCode,
      is_mobile_sdk: true,
      return_url: AppConfig.Configuration.baseUrl,
    };
    return client.mutate({
      mutation: CREATE_ORDER,
      variables: { order_input: orderInput },
      fetchPolicy: 'no-cache',
    });
  };

  const createUserSubscription = () => {
    const purchaseInput = {
      userSubscription: {
        mobile_number: currentPatient?.mobileNumber,
        plan_id: packageId,
        sub_plan_id: subPlanId,
        storeCode,
        FirstName: currentPatient?.firstName,
        LastName: currentPatient?.lastName,
        transaction_date_time: new Date().toISOString(),
      },
    };

    return client.mutate<CreateUserSubscription, CreateUserSubscriptionVariables>({
      mutation: CREATE_USER_SUBSCRIPTION,
      variables: purchaseInput,
      fetchPolicy: 'no-cache',
    });
  };

  const createOrderInternal = (subscriptionId: string) => {
    const orders: OrderVerticals = {
      subscription: [
        {
          order_id: subscriptionId,
          amount: amountToPay,
          patient_id: currentPatient?.id,
        },
      ],
    };

    const orderInput: OrderCreate = {
      orders: orders,
      total_amount: amountToPay,
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  const logPayAmountCleverTapEvent = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'New user': !currentPatient?.isConsulted,
      'Selling Source': 'direct',
      'Package Name': packageDetailData?.Packagedata?.PackageCMSIdentifier,
      'Plan Name': packageDetailData?.Plandata[selectedPlanIndex]?.PlanName,
      'Plan Price': packageDetailData?.Plandata[selectedPlanIndex]?.PlanActualPrice,
      'Plan Type': packageDetailData?.Plandata[selectedPlanIndex]?.PlanType,
    };

    postCleverTapEvent(CleverTapEventName.CONSULT_PACKAGE_PAY_BUTTON_CLICKED, eventAttributes);
  };

  const initiatePackagePurchase = async () => {
    try {
      setLoading?.(true);
      const response = await createUserSubscription();

      const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');

      const data = await createOrderInternal(subscriptionId!);
      const orderInfo = {
        orderId: subscriptionId,
        price: amountToPay,
      };
      if (data?.data?.createOrderInternal?.success) {
        if (amountToPay == 0) {
          const res = await createJusPayOrder(data?.data?.createOrderInternal?.payment_order_id!);

          setLoading!(false);
          if (res?.data?.createOrderV2?.payment_status == 'TXN_SUCCESS') {
            props.navigation.navigate(AppRoutes.PackagePaymentStatus, {});
          } else {
            renderErrorPopup();
          }
        } else {
          props.navigation.navigate(AppRoutes.PaymentMethods, {
            paymentId: data?.data?.createOrderInternal?.payment_order_id!,
            amount: amountToPay,
            orderDetails: orderInfo,
            businessLine: 'doctorPackage',
            customerId: cusId,
            oneTapPatient: oneTapPatient,
          });
          setLoading!(false);
        }
      } else {
        renderErrorPopup();
      }
    } catch (error) {
      renderErrorPopup();
    }
  };

  const renderErrorPopup = () => {
    setLoading?.(false);
    showAphAlert!({
      title: 'Uh oh! :(',
      description: string.genericError,
    });
  };
  const renderHeader = () => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.consultPackages.checkout}
        container={styles.headerContainer}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderPackagePrice = () => {
    return (
      <View style={styles.priceView}>
        <Text style={styles.priceTitle}>{PlanName}</Text>
        <View style={styles.horizontalView}>
          {PlanFinalPrice != PlanActualPrice ? (
            <Text style={styles.strikedPrice}>{string.common.Rs + PlanActualPrice}</Text>
          ) : null}

          <Text style={styles.packagePrice}> {string.common.Rs + PlanFinalPrice}</Text>
        </View>
      </View>
    );
  };

  const renderTotalPrice = () => {
    return (
      <View style={styles.priceView}>
        <Text style={styles.priceTitle}>{string.common.toPay}</Text>
        <Text style={styles.totalPrice}> {string.common.Rs + amountToPay}</Text>
      </View>
    );
  };

  const renderProceedButton = () => {
    return (
      <View style={styles.buttonView}>
        <Button
          disabled={amountToPay <= 0}
          title={string.consultPackages.payRs + PlanFinalPrice}
          onPress={() => {
            initiatePackagePurchase();
            logPayAmountCleverTapEvent();
          }}
        />
      </View>
    );
  };

  const renderPackageInfo = () => {
    return (
      <View>
        <View style={styles.infoView}>
          <Specialist style={styles.logo} />
          <Text style={styles.infoTitle}>{string.consultPackages.infoTitle}</Text>
        </View>
        <View style={styles.infoSubView}>
          <UserPackage style={styles.userLogo} />
          <Text style={styles.infoText}>{string.consultPackages.infoOne}</Text>
        </View>
        <View style={styles.infoSubView}>
          <VideoActiveIcon style={styles.videoLogo} />
          <Text style={styles.infoText}>{string.consultPackages.infoTwo}</Text>
        </View>
        <View style={styles.infoSubView}>
          <UserPackage style={styles.userLogo} />
          <Text style={styles.infoText}>{string.consultPackages.infoThree}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <View style={styles.container}>
        {renderHeader()}
        <Image
          style={styles.banner}
          source={{ uri: packageDetailData?.Packagedata?.PackageMobileBanner }}
        />
        <Text style={styles.chargesHeading}>{string.common.totalCharges}</Text>
        <View style={styles.separator} />
        <View style={styles.chargesContainer}>
          {renderPackagePrice()}
          <View style={styles.priceSeparator} />
          {renderTotalPrice()}
        </View>
        {renderPackageInfo()}
      </View>
      {renderProceedButton()}
      {!hyperSdkInitialized && <Spinner />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.CARD_BG,
  },
  headerContainer: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  banner: {
    height: 140,
    width: 320,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 18,
    borderRadius: 6,
  },
  chargesHeading: {
    ...theme.viewStyles.text('B', 13, theme.colors.SHERPA_BLUE, undefined, 17),
    paddingStart: 20,
    paddingBottom: 4,
  },
  separator: {
    height: 1,
    borderRadius: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginHorizontal: 20,
    opacity: 0.21,
  },
  chargesContainer: {
    marginVertical: 15,
    ...theme.viewStyles.card(16, 0),
    marginHorizontal: 20,
  },
  priceView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packagePrice: {
    ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, undefined, 24),
  },
  strikedPrice: {
    ...theme.viewStyles.text('M', 16, theme.colors.BORDER_BOTTOM_COLOR, undefined, 24),
    textDecorationLine: 'line-through',
  },
  totalPrice: {
    ...theme.viewStyles.text('B', 16, theme.colors.LIGHT_BLUE, undefined, 24),
  },
  priceTitle: {
    ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, undefined, 24),
    flex: 1,
  },
  horizontalView: {
    flexDirection: 'row',
  },
  priceSeparator: {
    height: 1,
    borderRadius: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginVertical: 14,
    opacity: 0.21,
  },
  logo: {
    width: 35,
    height: 40,
    marginEnd: 12,
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: 20,
    marginTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.DIM_BLUE_BORDER,
    marginEnd: 50,
    paddingBottom: 8,
  },
  infoTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, undefined, 18),
  },
  infoSubView: {
    marginTop: 16,
    marginHorizontal: 20,
    flexDirection: 'row',
  },
  videoLogo: {
    height: 18,
    width: 18,
    marginEnd: 12,
    opacity: 0.6,
  },
  infoText: {
    ...theme.viewStyles.text('M', 12, theme.colors.TEXT_LIGHT_BLUE, undefined, 16),
    width: '85%',
  },
  userLogo: {
    height: 13.5,
    width: 13.5,
    marginEnd: 12,
    opacity: 0.6,
  },
  buttonView: {
    paddingHorizontal: 36,
    paddingVertical: 20,
    backgroundColor: theme.colors.WHITE,
  },
});
