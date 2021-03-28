import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { fetchPaymentOptions } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';

const { width, height } = Dimensions.get('window');

type paymentOptions = {
  name: string;
  paymentMode: string;
  enabled: boolean;
  seq: number;
  imageUrl: string;
};

type bankOptions = {
  name: string;
  paymentMode: string;
  bankCode: string;
  seq: number;
  enabled: boolean;
  imageUrl: string;
};

interface PaymentOptionsProps extends NavigationScreenProps {
  from?: string;
  selectedPlan?: any;
  comingFrom?: string;
  screenName?: string;
}
export const PaymentOptions: React.FC<PaymentOptionsProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { from, selectedPlan, comingFrom, screenName } = props;
  const { setLoading, showAphAlert } = useUIElements();
  const [paymentOptions, setpaymentOptions] = useState<paymentOptions[]>([]);

  useEffect(() => {
    setLoading && setLoading(true);
    fetchPaymentOptions()
      .then((res: any) => {
        let options: paymentOptions[] = [];
        res?.data?.forEach((item: any) => {
          if (item?.enabled && item?.paymentMode != 'NB') {
            options.push(item);
          } else if (item && item.enabled && item.paymentMode == 'NB') {
            let bankList: bankOptions[] = [];
            let bankOptions: bankOptions[] = item.banksList;
            bankOptions.forEach((item) => {
              if (item.enabled) {
                item.paymentMode = 'NB';
                bankList.push(item);
              }
            });
            if (bankList.length > 0) {
              bankList.sort((a, b) => {
                return a.seq - b.seq;
              });
            } else {
              delete item.banksList;
              options.push(item);
            }
          }
        });
        options.sort((a, b) => {
          return a.seq - b.seq;
        });
        setpaymentOptions(options);
        setLoading && setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingPaymentOptions', error);
        setLoading && setLoading(false);
        renderErrorPopup(string.common.tryAgainLater);
      });
  }, []);

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const firePaymentOptionSelected = (item: any) => {
    const CircleEventAttributes: WebEngageEvents[WebEngageEventName.NON_CIRCLE_PAYMENT_MODE_SELECTED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Circle Member': 'No',
      type: item?.name,
    };
    postWebEngageEvent(WebEngageEventName.NON_CIRCLE_PAYMENT_MODE_SELECTED, CircleEventAttributes);
  };

  const initiatePayment = (item: paymentOptions) => {
    props.navigation.navigate(AppRoutes.SubscriptionPaymentGateway, {
      paymentTypeID: item?.paymentMode,
      from: from,
      selectedPlan: selectedPlan,
      forCircle: true,
      screenName: screenName,
    });
  };

  const renderPaymentOptions = () => {
    return (
      <View>
        <View style={styles.paymentContainer}>
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) }}>
            PAY VIA
          </Text>
        </View>
        <View style={styles.seperator} />
        <FlatList
          data={paymentOptions}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                comingFrom == 'circlePlanPurchase' ? firePaymentOptionSelected(item) : null;
                initiatePayment(item);
              }}
              style={styles.paymentModeCard}
            >
              <View style={styles.imageView}>
                <Image source={{ uri: item.imageUrl }} style={styles.icon} />
              </View>
              <View style={styles.titleView}>
                <Text style={styles.title}> {item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.name}
        />
      </View>
    );
  };
  return <View>{renderPaymentOptions()}</View>;
};

const styles = StyleSheet.create({
  paymentModeCard: {
    flex: 1,
    flexDirection: 'row',
    width: 0.9 * width,
    height: 0.08 * height,
    borderRadius: 9,
    backgroundColor: theme.colors.WHITE,
    margin: 0.05 * width,
    marginTop: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  paymentContainer: {
    width: 0.9 * width,
    margin: 0.05 * width,
    marginTop: 0,
    marginBottom: 0,
  },
  seperator: {
    width: 0.9 * width,
    height: 1,
    backgroundColor: 'rgba(2, 71, 91, 0.2)',
    margin: 0.05 * width,
    marginTop: 0.01 * width,
    marginBottom: 0.03 * width,
  },
  imageView: {
    flex: 0.16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
  titleView: {
    flex: 0.84,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    ...theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 20),
  },
});
