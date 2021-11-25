import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Text, SafeAreaView, View, StyleSheet } from 'react-native';
import { useApolloClient } from 'react-apollo-hooks';
import { CANCELL_SUBSCRIPTION } from '@aph/mobile-patients/src/graphql/profiles';
import { NavigationScreenProps } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CancelSubscription,
  CancelSubscriptionVariables,
} from '../../graphql/types/CancelSubscription';
import { CancellationRequestedBy } from '@aph/mobile-patients/src/graphql/types/globalTypes';

const styles = StyleSheet.create({
  policyContentContainer: {
    marginTop: 30,
    marginHorizontal: 21,
  },
  mySpecialtyPackageContainer: {
    ...theme.viewStyles.cardViewStyle,
  },
  mySpecialtiesItemLeftCount: {
    ...theme.viewStyles.text('R', 12, theme.colors.APP_GREEN),
  },

  cancellationPolicy: {
    ...theme.viewStyles.text('SB', 15, theme.colors.SHERPA_BLUE),
    marginBottom: 10,
  },

  policyItem: {
    ...theme.viewStyles.text('R', 13, theme.colors.SHERPA_BLUE),
    opacity: 0.8,
    marginVertical: 10,
  },

  goBackButton: {
    flex: 2,
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  cancelSubscriptionButton: {
    flex: 4,
    marginLeft: 10,
  },
});
export interface ConsultPackageCancellationProps
  extends NavigationScreenProps<{
    subscriptionId?: string;
    onSubscriptionCancelled: () => void;
  }> {}

export const ConsultPackageCancellation: React.FC<ConsultPackageCancellationProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const subscriptionId = props.navigation.getParam('subscriptionId') || '';
  const onSubscriptionCancelled = props.navigation.getParam('onSubscriptionCancelled');

  const renderHeader = (props) => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.consultPackageList.cancelSubscription}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderPolicyContent = () => {
    return (
      <View style={styles.policyContentContainer}>
        <Text style={styles.cancellationPolicy}>
          {string.consultPackageList.cancellationPolicy}{' '}
        </Text>
        <Text style={styles.policyItem}>
          1.Cancellation of the plan is eligible from buying a package latest up to 3 days after
          booking the first consultation but no later than that.
        </Text>
        <Text style={styles.policyItem}>
          2. An amount equivalent to the doctor's consultation charge will be cut and the rest will
          be refunded back to your bank account/wallet.{' '}
        </Text>
        <Text style={styles.policyItem}>
          3. The refunded amount will reflect in your bank account/ wallet within 5-7 business days
        </Text>

        <View style={{ flexDirection: 'row', marginVertical: 30 }}>
          {/* Proceed to Pay */}
          <Button
            title="GO BACK"
            style={styles.goBackButton}
            titleTextStyle={{ color: theme.colors.APP_YELLOW }}
            onPress={() => {
              props.navigation.goBack();
            }}
          />
          <Button
            title={string.consultPackageList.cancelSubscription}
            style={styles.cancelSubscriptionButton}
            onPress={() => {
              cancelSubscription();
            }}
          />
        </View>
      </View>
    );
  };

  const cancelSubscription = () => {
    setLoading(true);

    client
      .mutate<CancelSubscription, CancelSubscriptionVariables>({
        mutation: CANCELL_SUBSCRIPTION,
        variables: {
          CancelSubscriptionInput: {
            subscription_id: subscriptionId,
            cancellation_reuqested_by: CancellationRequestedBy.CUSTOMER,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data: any) => {
        if (
          _data?.data?.CancelSubscription?.success == true &&
          _data?.data?.CancelSubscription?.response?.status === 'CANCELLED'
        ) {
          showAphAlert!({
            title: 'Hey!',
            description: 'Package cancelled successfully.',
            onPressOk: () => {
              onSubscriptionCancelled && onSubscriptionCancelled();
              props.navigation.goBack();
              hideAphAlert!();
            },
          });
        }
      })
      .catch((e) => {
        showAphAlert!({
          title: 'Uh oh! :(',
          description: "Couldn't cancel subscription. Please try again.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderHeader(props)}

      {loading ? <Spinner /> : null}

      {renderPolicyContent()}
    </SafeAreaView>
  );
};
