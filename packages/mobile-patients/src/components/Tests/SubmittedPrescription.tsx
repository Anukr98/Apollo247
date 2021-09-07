import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, ScrollView, Text } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useApolloClient } from 'react-apollo-hooks';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { ExpectCall } from '@aph/mobile-patients/src/components/Medicines/Components/ExpectCall';
import _ from 'lodash';
import {
  useShoppingCart,
  PhysicalPrescription,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  nameFormater,
  formatAddressBookAddress,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { RxPrescriptionCallIc, PrescriptionCallIcon } from '../ui/Icons';

export interface SubmittedPrescriptionProps extends NavigationScreenProps {
  showHeader?: boolean;
}

export const SubmittedPrescription: React.FC<SubmittedPrescriptionProps> = (props) => {
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const phyPrescriptionsProp = props.navigation.getParam('phyPrescriptionsProp') || [];
  const ePrescriptionsProp = props.navigation.getParam('ePrescriptionsProp') || [];
  const [PhysicalPrescriptionsProps, setPhysicalPrescriptionsProps] = useState<
    PhysicalPrescription[]
  >(phyPrescriptionsProp);
  const [EPrescriptionsProps, setEPrescriptionsProps] = useState<EPrescription[]>(
    ePrescriptionsProp
  );
  console.log('object :>> ', phyPrescriptionsProp, ePrescriptionsProp);
  useEffect(() => {
    setLoading?.(false);
  }, []);
  const renderExpectCall = () => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
          flexDirection: 'row',
          padding: 10,
          alignContent: 'center',
        }}
      >
        <PrescriptionCallIcon />
        <Text
          style={{
            width: '85%',
            ...theme.viewStyles.text('SB', 10, theme.colors.SHERPA_BLUE, 1, 20),
            paddingHorizontal: 5,
          }}
        >
          Expect a call in the next 2 hours from an Apollo agent to assist you in placing an order
        </Text>
      </View>
    );
  };

  const client = useApolloClient();
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {props?.showHeader == false ? null : (
          <Header
            leftIcon="backArrow"
            title={'SUBMIT PRESCRIPTION'}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
        )}

        <ScrollView
          bounces={false}
          scrollEventThrottle={1}
        >
          <View style={{ padding: 10,}}>
            <Text style={styles.textStyle}>{nameFormater('Physical Prescriptions', 'upper')}</Text>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 10,
                shadowColor: theme.colors.SHADOW_GRAY,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 4,
                marginVertical: 10,
              }}
            >
              {ePrescriptionsProp.map((item: any) => {
                return <Text style={styles.leftText}>{item?.title}</Text>;
              })}
            </View>
            <Text style={styles.textStyle}>PRESCRIPTION FROM HEALTH RECORDS</Text>
          </View>
          <View
            style={{
              flex: 1,
            }}
          >
            {renderExpectCall()}
          </View>
        </ScrollView>
      </SafeAreaView>
      {loading && !props?.showHeader ? null : loading && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
  prescriptionCardStyle: {
    paddingTop: 7,
    marginTop: 5,
    marginBottom: 7,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    backgroundColor: theme.colors.CARD_BG,
  },
  labelView: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
  },
  leftText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  starText: {
    color: theme.colors.RED,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  textStyle: {
    ...theme.viewStyles.text('SB', 13, theme.colors.SHERPA_BLUE, 1),
  },
  subtitleStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  textContainerStyle: {
    padding: 20,
    borderRadius: 10,
    borderBottomColor: 'black',
    marginTop: -20,
    marginBottom: 20,
  },
  userCommentTextBoxStyle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    borderWidth: 1,
    padding: 10,
    borderBottomWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(2,71,91, 0.3)',
    backgroundColor: theme.colors.WHITE,
    flexWrap: 'wrap',
  },
});
