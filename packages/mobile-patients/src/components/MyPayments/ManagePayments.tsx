import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, NativeEventEmitter, NativeModules } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
import { FETCH_SAVED_CARDS, DELETE_SAVED_CARD } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { SavedCard } from '@aph/mobile-patients/src/components/MyPayments/components/SavedCard';
import { LinkedWallet } from '@aph/mobile-patients/src/components/MyPayments/components/LinkedWallet';
import { useGetPaymentMethods } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useGetPaymentMethods';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { DeleteCardAlert } from '@aph/mobile-patients/src/components/MyPayments/components/DeleteCardAlert';
import {
  fetchWalletBalance,
  delinkWallet,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useGetClientAuthToken } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useGetClientAuthtoken';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

export interface ManagePaymentsProps extends NavigationScreenProps {}

export const ManagePayments: React.FC<ManagePaymentsProps> = (props) => {
  const client = useApolloClient();
  const { cusId, isfetchingId } = useGetJuspayId();
  const [savedCards, setSavedCards] = useState<any>([]);
  const { cardTypes } = useGetPaymentMethods();
  const [showDeletePopup, setshowDeletePopup] = useState<boolean>(false);
  const [cardInfo, setCardInfo] = useState<any>({});
  const [isLoading, setLoading] = useState<boolean>(true);
  const customerId = props.navigation.getParam('customerId');
  const clientAuthToken = !!customerId ? useGetClientAuthToken(customerId, 'pharma') : undefined;
  const { currentPatient } = useAllCurrentPatients();
  const [linkedWallets, setLinkedWallets] = useState<any>([]);
  const { HyperSdkReact } = NativeModules;

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.HyperSdkReact);
    const eventListener = eventEmitter.addListener('HyperEvent', (resp) => {
      handleEventListener(resp);
    });
    return () => eventListener.remove();
  }, []);

  useEffect(() => {
    !isfetchingId && fetchSavedCards();
  }, [isfetchingId]);

  useEffect(() => {
    !!clientAuthToken && fetchWalletBalance(currentPatient?.id, clientAuthToken);
  }, [clientAuthToken]);

  const handleEventListener = (resp: any) => {
    var data = JSON.parse(resp);
    var event: string = data.event || '';
    switch (event) {
      case 'process_result':
        var payload = data.payload || {};
        handleResponsePayload(payload);
        break;
      default:
    }
  };

  const handleResponsePayload = (payload: any) => {
    const action = payload?.payload?.action;
    switch (action) {
      case 'refreshWalletBalances':
        setLinkedWallets(payload?.payload?.list);
        break;
      case 'delinkWallet':
        setLoading(false);
        if (!payload?.error) {
          const wallets = linkedWallets?.filter(
            (item: any) => item?.wallet != payload?.payload?.wallet
          );
          setLinkedWallets(wallets);
        }
        break;
    }
  };

  const fetchCards = () => {
    return client.query({
      query: FETCH_SAVED_CARDS,
      variables: { customer_id: cusId },
      fetchPolicy: 'no-cache',
    });
  };

  const deleteCard = (cardToken: string) => {
    return client.query({
      query: DELETE_SAVED_CARD,
      variables: { cardToken: cardToken },
      fetchPolicy: 'no-cache',
    });
  };

  const fetchSavedCards = async () => {
    try {
      const res = await fetchCards();
      const { data } = res;
      setSavedCards(data?.getSavedCardList?.cards);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onPressDeleteCard = async () => {
    setshowDeletePopup(false);
    setLoading(true);
    try {
      const res = await deleteCard(cardInfo?.card_token);
      const { data } = res;
      if (data?.deleteCardFromLocker?.deleted) {
        const cards = savedCards?.filter(
          (item: any) => item?.card_token != data?.deleteCardFromLocker?.card_token
        );
        setSavedCards(cards);
        setCardInfo({});
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const onPressDelink = (walletId: string, walletName: string) => {
    setLoading(true);
    delinkWallet(currentPatient?.id, clientAuthToken, walletId, walletName);
  };

  const showDeleteCartAlert = () => {
    return (
      <DeleteCardAlert
        cardInfo={cardInfo}
        cardTypes={cardTypes}
        visible={showDeletePopup}
        onDismiss={() => setshowDeletePopup(false)}
        onConfirmDelete={() => onPressDeleteCard()}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'MANAGE PAYMENTS'}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderSavedCards = () => {
    return (
      <View style={{ marginTop: 20 }}>
        {savedCards?.map((item: any, index: number) => {
          const isLastCard = savedCards?.length - 1 == index ? true : false;
          return (
            <SavedCard
              cardTypes={cardTypes}
              cardInfo={item}
              isLastCard={isLastCard}
              onAlert={false}
              onPressDeleteCard={() => {
                setCardInfo(item);
                setshowDeletePopup(true);
              }}
            />
          );
        })}
      </View>
    );
  };

  const renderLinkedWallets = () => {
    return (
      <View style={{}}>
        {linkedWallets?.map((item: any, index: number) => {
          return item?.linked ? <LinkedWallet wallet={item} onPressDelink={onPressDelink} /> : null;
        })}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {renderSavedCards()}
        {renderLinkedWallets()}
        {showDeleteCartAlert()}
        {(isLoading || isfetchingId) && <Spinner />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    borderBottomWidth: 0,
  },
});
