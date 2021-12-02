import { BlueCross, WhiteCall } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { DiagnosticCallToOrderClicked } from '@aph/mobile-patients/src/components/Tests/Events';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { CALL_TO_ORDER_CTA_PAGE_ID } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getPageId } from '@aph/mobile-patients/src/helpers/helperFunctions';

interface CallToOrderViewProps {
  delaySeconds?: any;
  cartItems?: any;
  customMargin?: any;
  slideCallToOrder?: boolean;
  containerStyle?: any;
  cityId?: any;
  onPressSmallView?: () => void;
  onPressCross?: () => void;
  pageId?: string;
  sectionName?: string;
  itemId?: string;
  itemName?: string;
}
const { width, height } = Dimensions.get('window');
export const CallToOrderView: React.FC<CallToOrderViewProps> = (props) => {
  const {
    cartItems,
    containerStyle,
    slideCallToOrder,
    onPressSmallView,
    onPressCross,
    customMargin,
    cityId,
    pageId,
    sectionName,
    itemId,
    itemName,
  } = props;
  const { isDiagnosticLocationServiceable } = useAppCommonData();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const callToOrderDetails = AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER;
  const ctaDetailArray = callToOrderDetails?.ctaDetailsOnCityId;
  let ctaText = string.CallToOrder.callToOrderText;
  const ctaDetailMatched = isDiagnosticLocationServiceable
    ? ctaDetailArray?.filter((item: any) => {
        if (item?.ctaCityId == cityId) {
          return item;
        } else {
          [callToOrderDetails?.ctaDetailsDefault];
        }
      })
    : [callToOrderDetails?.ctaDetailsDefault];
  const phoneNumber = ctaDetailMatched?.[0]?.ctaPhoneNumber
    ? ctaDetailMatched?.[0]?.ctaPhoneNumber
    : callToOrderDetails?.ctaDetailsDefault?.ctaPhoneNumber;
  ctaText = ctaDetailMatched?.[0]?.ctaText
    ? ctaDetailMatched?.[0]?.ctaText
    : callToOrderDetails?.ctaDetailsDefault?.ctaText;
  const onPressCallToOrderCta = () => {
    postCleverTapEvent();
    Linking.openURL(`tel:${phoneNumber}`);
  };
  const [ctaDelaySeconds, setCtaDelaySeconds] = useState(ctaDetailMatched?.[0]?.ctaDelaySeconds);
  useEffect(() => {
    setTimeout(() => {
      setCtaDelaySeconds(0);
    }, ctaDetailMatched?.[0]?.ctaDelaySeconds * 1000);
  }, [ctaDelaySeconds]);

  const postCleverTapEvent = () => {
    const page = !!pageId ? pageId : CALL_TO_ORDER_CTA_PAGE_ID.HOME;
    DiagnosticCallToOrderClicked(
      getPageId(page),
      currentPatient,
      sectionName,
      itemId,
      itemName,
      cityId,
      isDiagnosticLocationServiceable
    );
  };

  return ctaDelaySeconds == 0 ? (
    <>
      <View style={[styles.container, containerStyle]}>
        {!slideCallToOrder ? (
          <TouchableOpacity
            style={[
              styles.fullView,
              {
                marginBottom: customMargin
                  ? customMargin
                  : !!cartItems && cartItems?.length > 0
                  ? 60
                  : 20,
              },
            ]}
            onPress={() => {
              onPressCallToOrderCta();
            }}
          >
            <View style={styles.whiteCallView}>
              <WhiteCall style={styles.whiteCallIcon} />
            </View>
            <Text
              style={[styles.callToOrderText, { paddingLeft: ctaText?.length < 15 ? 20 : 10 }]}
              ellipsizeMode={'tail'}
              numberOfLines={1}
            >
              {ctaText}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.smallView,
              {
                marginBottom: customMargin
                  ? customMargin
                  : !!cartItems && cartItems?.length > 0
                  ? 60
                  : 20,
              },
            ]}
            onPress={onPressSmallView}
          >
            <WhiteCall style={styles.whiteCallIcon} />
          </TouchableOpacity>
        )}
        <View style={styles.blueCrossView}>
          {!slideCallToOrder ? (
            <TouchableOpacity onPress={onPressCross}>
              <BlueCross style={styles.blueCrossIcon} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  },
  callToOrderText: {
    ...theme.viewStyles.text('SB', 14, theme.colors.WHITE, 1),
    paddingHorizontal: 10,
    width: 'auto',
    maxWidth: '90%',
  },
  fullView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.DARK_BLUE,
    height: 50,
    width: 'auto',
    maxWidth: width - 100,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  smallView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.DARK_BLUE,
    height: 50,
    width: 50,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  whiteCallIcon: {
    width: 20,
    height: 20,
    paddingHorizontal: 10,
  },
  whiteCallView: {
    width: '10%',
    padding: 10,
  },
  blueCrossView: { marginLeft: -10, marginTop: -10 },
  blueCrossIcon: { width: 20, height: 20 },
});
