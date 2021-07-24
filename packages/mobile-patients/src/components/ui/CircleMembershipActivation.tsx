import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Overlay } from 'react-native-elements';
const { width } = Dimensions.get('window');
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  EllipseCircle,
  CrossPopup,
  CircleLogoBig,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CREATE_USER_SUBSCRIPTION,
  CREATE_INTERNAL_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  one_apollo_store_code,
  PaymentStatus,
  OrderCreate,
  OrderVerticals,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CreateUserSubscription,
  CreateUserSubscriptionVariables,
} from '@aph/mobile-patients/src/graphql/types/CreateUserSubscription';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import moment from 'moment';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationScreenProps } from 'react-navigation';
import { Spinner } from './Spinner';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';
import { fireCirclePurchaseEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import {
  initiateSDK,
  createHyperServiceObject,
  terminateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { isSDKInitialised } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
interface props extends NavigationScreenProps {
  visible: boolean;
  closeModal: ((planActivated?: boolean) => void) | null;
  defaultCirclePlan?: any;
  healthCredits?: number;
  circlePaymentDone?: boolean;
  circlePlanValidity?: string;
  from: string;
  source?: 'Pharma' | 'Product Detail' | 'Pharma Cart' | 'Diagnostic' | 'Consult';
}
export const CircleMembershipActivation: React.FC<props> = (props) => {
  const {
    visible,
    closeModal,
    defaultCirclePlan,
    healthCredits,
    circlePaymentDone,
    circlePlanValidity,
    from,
    source,
  } = props;
  const planActivated = useRef<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [planValidity, setPlanValidity] = useState<string>(circlePlanValidity || '');
  const { circleSubscriptionId } = useShoppingCart();
  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const defaultPlanSellingPrice = defaultCirclePlan?.currentSellingPrice;
  planActivated.current = circlePaymentDone ? true : planActivated.current;
  const CircleEventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_OTHER_PAYMENT_OPTION_CLICKED_POPUP] = {
    'Patient UHID': currentPatient?.uhid,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
    'Circle Member': circleSubscriptionId ? 'Yes' : 'No',
  };
  const { cusId, isfetchingId } = useGetJuspayId();
  const [hyperSdkInitialized, setHyperSdkInitialized] = useState<boolean>(false);

  useEffect(() => {
    !isfetchingId ? (cusId ? initiateHyperSDK(cusId) : initiateHyperSDK(currentPatient?.id)) : null;
  }, [isfetchingId]);

  const initiateHyperSDK = async (cusId: any) => {
    try {
      const merchantId = AppConfig.Configuration.merchantId;
      terminateSDK();
      setTimeout(() => createHyperServiceObject(), 1000);
      setTimeout(() => (initiateSDK(cusId, cusId, merchantId), setHyperSdkInitialized(true)), 1200);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const fireCircleOtherPaymentEvent = () => {
    source == 'Diagnostic' &&
      postWebEngageEvent(
        WebEngageEventName.DIAGNOSTIC_OTHER_PAYMENT_OPTION_CLICKED_POPUP,
        CircleEventAttributes
      );
  };

  const createOrderInternal = (subscriptionId: string) => {
    const orders: OrderVerticals = {
      subscription: [
        {
          order_id: subscriptionId,
          amount: Number(defaultCirclePlan?.currentSellingPrice),
          patient_id: currentPatient?.id,
        },
      ],
    };
    const orderInput: OrderCreate = {
      orders: orders,
      total_amount: Number(defaultCirclePlan?.currentSellingPrice),
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  const initiateCirclePurchase = async () => {
    try {
      setLoading(true);
      const purchaseInput = {
        userSubscription: {
          mobile_number: currentPatient?.mobileNumber,
          plan_id: planId,
          sub_plan_id: defaultCirclePlan?.subPlanId,
          storeCode,
          FirstName: currentPatient?.firstName,
          LastName: currentPatient?.lastName,
          payment_reference: {
            amount_paid: Number(defaultCirclePlan?.currentSellingPrice),
            payment_status: PaymentStatus.PENDING,
            purchase_via_HC: false,
            HC_used: 0,
          },
          transaction_date_time: new Date().toISOString(),
        },
      };
      const response = await client.mutate<CreateUserSubscription, CreateUserSubscriptionVariables>(
        {
          mutation: CREATE_USER_SUBSCRIPTION,
          variables: purchaseInput,
          fetchPolicy: 'no-cache',
        }
      );
      const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');
      const data = await createOrderInternal(subscriptionId);
      const orderInfo = {
        orderId: subscriptionId,
        circleParams: {
          circleActivated: true,
          circlePlanValidity: g(response, 'data', 'CreateUserSubscription', 'response', 'end_date'),
        },
      };
      setLoading(false);
      if (data?.data?.createOrderInternal?.success) {
        props.navigation.navigate(AppRoutes.PaymentMethods, {
          paymentId: data?.data?.createOrderInternal?.payment_order_id!,
          amount: Number(defaultCirclePlan?.currentSellingPrice),
          orderDetails: orderInfo,
          businessLine: 'subscription',
          customerId: cusId,
        });
      }
      fireCircleOtherPaymentEvent();
      closeModal && closeModal();
    } catch (error) {
      CommonBugFender('Circle_Purchase_Initiation_Failed', error);
    }
  };

  const renderCloseIcon = () => {
    return (
      <View style={styles.closeIcon}>
        <TouchableOpacity
          onPress={() => {
            closeModal && closeModal(planActivated.current);
          }}
        >
          <CrossPopup style={styles.crossIconStyle} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAskingBeforeUpgradation = () => {
    return (
      <View>
        {from === string.banner_context.MEMBERSHIP_DETAILS ? (
          <View>
            <Text style={styles.bigTitle}>Payment Failed!</Text>
            <Text style={styles.description}>
              Error While Upgrading your circle membership. Please try again or
            </Text>
            <Text style={styles.btnText}>{string.circleDoctors.useAnotherPaymentMethod}</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.bigTitle}>{string.circleDoctors.greatChoice}</Text>
            <Text style={styles.description}>
              {defaultPlanSellingPrice
                ? string.circleDoctors.upgradingWithHealthCredits.replace(
                    '{credits}',
                    `${defaultPlanSellingPrice}`
                  )
                : string.circleDoctors.upgradingWithHealthCreditsDesc}
            </Text>
            <Button
              title={string.circleDoctors.goAhead}
              titleTextStyle={styles.btnTitle}
              style={styles.goAheadBtn}
              onPress={() => {
                onPurchasePlan();
              }}
            />
            <TouchableOpacity
              onPress={() => {
                // props.navigation.navigate(AppRoutes.CircleSubscription, { from: from });
                initiateCirclePurchase();
              }}
            >
              <Text style={styles.btnText}>{string.circleDoctors.useAnotherPaymentMethod}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderMembershipActivated = () => {
    return (
      <View>
        <Text style={styles.title}>{string.circleDoctors.membershipActivated}</Text>
        {moment(planValidity).isValid() ? (
          <Text style={styles.description}>
            Valid till:{' '}
            <Text style={styles.mediumText}>
              {moment(planValidity.endDate).format('DD MMMM YYYY')}
            </Text>
          </Text>
        ) : null}
        {healthCredits && !circlePaymentDone ? (
          <Text style={[styles.description, { marginTop: 0 }]}>
            {string.circleDoctors.healthCreditsRemaining}:{' '}
            <Text style={styles.mediumText}>{healthCredits - defaultPlanSellingPrice}</Text>
          </Text>
        ) : null}
        <TouchableOpacity
          onPress={() => {
            closeModal && closeModal(true);
            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: Circle.planName,
              comingFrom: 'Circle Membership Activation Know More CTA',
            });
          }}
        >
          <Text style={styles.btnText}>{string.common.knowMore}</Text>
        </TouchableOpacity>
        <Button
          title={string.circleDoctors.returnToHomepage}
          titleTextStyle={styles.btnTitle}
          style={styles.homepageBtn}
          onPress={() => {
            closeModal && closeModal(true);
          }}
        />
      </View>
    );
  };

  const onPurchasePlan = async () => {
    setLoading && setLoading(true);
    try {
      const res = await client.mutate<CreateUserSubscription, CreateUserSubscriptionVariables>({
        mutation: CREATE_USER_SUBSCRIPTION,
        variables: {
          userSubscription: {
            mobile_number: currentPatient?.mobileNumber,
            plan_id: planId,
            sub_plan_id: defaultCirclePlan?.subPlanId,
            storeCode,
            FirstName: currentPatient?.firstName,
            LastName: currentPatient?.lastName,
            payment_reference: {
              amount_paid: 0,
              payment_status: PaymentStatus.TXN_SUCCESS,
              purchase_via_HC: true,
              HC_used: defaultPlanSellingPrice,
            },
            transaction_date_time: new Date().toISOString(),
          },
        },
        fetchPolicy: 'no-cache',
      });
      setLoading && setLoading(false);
      if (res?.data?.CreateUserSubscription?.success) {
        fireCirclePurchaseEvent(
          currentPatient,
          res?.data?.CreateUserSubscription?.response?.end_date
        );
        planActivated.current = true;
        setPlanValidity(res?.data?.CreateUserSubscription?.response?.end_date);
      } else {
        Alert.alert('Apollo', `${res?.data?.CreateUserSubscription?.message}`);
      }
    } catch (error) {
      setLoading && setLoading(false);
      CommonBugFender('ConsultRoom_createUserCircleSubscription', error);
    }
  };
  return (
    <Overlay
      isVisible={visible}
      windowBackgroundColor={'rgba(0, 0, 0, 0.31)'}
      overlayStyle={styles.overlayStyle}
      onRequestClose={() => closeModal && closeModal()}
    >
      <View>
        {(loading || !hyperSdkInitialized) && <Spinner />}
        {!loading && renderCloseIcon()}
        <View style={styles.container}>
          <View style={styles.leftCircle} />
          <EllipseCircle style={styles.ellipse} />
          <View style={styles.rightCircle} />
          <CircleLogoBig style={styles.circleLogo} />
          {!planActivated.current ? renderAskingBeforeUpgradation() : renderMembershipActivated()}
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlayStyle: {
    borderRadius: 10,
    width: width - 36,
    height: 'auto',
    padding: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    flex: 1,
    justifyContent: 'center',
  },
  leftCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.APP_YELLOW,
    marginLeft: 17,
    marginTop: 9,
  },
  rightCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.APP_YELLOW,
    marginLeft: 'auto',
    marginRight: 10,
    marginTop: 10,
  },
  ellipse: {
    width: 65,
    height: 65,
    position: 'absolute',
    right: 32,
    top: -9,
  },
  closeIcon: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
    position: 'absolute',
    top: -45,
  },
  crossIconStyle: {
    width: 28,
    height: 28,
  },
  circleLogo: {
    width: 155,
    height: 120,
    alignSelf: 'center',
    marginTop: -20,
  },
  bigTitle: {
    ...theme.viewStyles.text('SB', 23, theme.colors.APP_YELLOW),
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE),
    textAlign: 'center',
    marginHorizontal: 24,
  },
  goAheadBtn: {
    marginTop: 25,
    width: 110,
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    alignSelf: 'center',
    height: 32,
    borderRadius: 6,
  },
  btnTitle: {
    ...theme.viewStyles.text('SB', 11, theme.colors.WHITE),
  },
  btnText: {
    marginTop: 12,
    ...theme.viewStyles.text('SB', 11, theme.colors.APP_YELLOW),
    textAlign: 'center',
  },
  title: {
    ...theme.viewStyles.text('M', 18, theme.colors.APP_YELLOW),
    textAlign: 'center',
  },
  mediumText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE),
    textAlign: 'center',
  },
  homepageBtn: {
    marginTop: 15,
    width: 170,
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    alignSelf: 'center',
    height: 32,
    borderRadius: 6,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingBottom: 30,
  },
});
