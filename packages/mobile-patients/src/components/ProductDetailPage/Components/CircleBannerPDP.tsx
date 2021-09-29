import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { CarouselBanners } from '@aph/mobile-patients/src/components/ui/CarouselBanners';
import { getUserBannersList } from '@aph/mobile-patients/src/helpers/clientCalls';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import { GET_SUBSCRIPTIONS_OF_USER_BY_STATUS } from '@aph/mobile-patients/src/graphql/profiles';
import AsyncStorage from '@react-native-community/async-storage';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

export interface CircleBannerPDPProps {}

export const CircleBannerPDP: React.FC<CircleBannerPDPProps> = (props) => {
  const { bannerData, setBannerData } = useAppCommonData();
  const {
    setCircleSubscriptionId,
    setIsCircleSubscription,
    setCirclePlanValidity,
    setIsCircleExpired,
  } = useShoppingCart();
  const { setIsDiagnosticCircleSubscription } = useDiagnosticsCart();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();

  const getUserBanners = async () => {
    try {
      const res: any = await getUserBannersList(
        client,
        currentPatient,
        string.banner_context.PHARMACY_HOME
      );
      if (res) {
        setBannerData && setBannerData(res);
      }
    } catch (error) {
      setBannerData && setBannerData([]);
    }
  };

  const setNonCircleValues = () => {
    AsyncStorage.setItem('isCircleMember', 'no');
    AsyncStorage.removeItem('circleSubscriptionId');
    setCircleSubscriptionId?.('');
    setIsCircleSubscription?.(false);
    setIsDiagnosticCircleSubscription?.(false);
  };

  const getUserSubscriptionsByStatus = async () => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: g(currentPatient, 'mobileNumber'),
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;

      if (data) {
        if (data?.APOLLO?.[0]._id) {
          AsyncStorage.setItem('circleSubscriptionId', data?.APOLLO?.[0]._id);
          setCircleSubscriptionId?.(data?.APOLLO?.[0]._id);
          setIsCircleSubscription?.(true);
          setIsDiagnosticCircleSubscription?.(true);
          const planValidity = {
            startDate: data?.APOLLO?.[0]?.start_date,
            endDate: data?.APOLLO?.[0]?.end_date,
            plan_id: data?.APOLLO?.[0]?.plan_id,
            source_identifier: data?.APOLLO?.[0]?.source_meta_data?.source_identifier,
          };
          setCirclePlanValidity?.(planValidity);
          if (data?.APOLLO?.[0]?.status === 'disabled') {
            setIsCircleExpired?.(true);
            setNonCircleValues();
          } else {
            setIsCircleExpired?.(false);
          }
        } else {
          setCircleSubscriptionId?.('');
          setIsCircleSubscription?.(false);
          setIsDiagnosticCircleSubscription?.(false);
          setCirclePlanValidity?.(null);
        }
      }
    } catch (error) {
      CommonBugFender('CircleBannerPDP_GetSubscriptionsOfUserByStatus', error);
    }
  };

  const renderCarouselBanners = () => {
    return (
      <View>
        <CarouselBanners
          navigation={props.navigation}
          planActivationCallback={() => {
            getUserBanners();
            getUserSubscriptionsByStatus();
          }}
          from={string.banner_context.PHARMACY_HOME}
          source={'Pharma'}
          circleEventSource={'Medicine Home page banners'}
          successCallback={() => {}}
        />
      </View>
    );
  };

  return <View>{!!bannerData?.length ? renderCarouselBanners() : null}</View>;
};

const styles = StyleSheet.create({});
