import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';

export interface PaymentMethodProps {}

export const PaymentMethod: React.FC<PaymentMethodProps> = (props) => {
  const renderHeader = () => {
    return (
      <View style={styles.Header}>
        <Text style={styles.HeaderText}>PAYMENT OPTION</Text>
      </View>
    );
  };

  const renderCODOption = () => {
    return (
      <View style={styles.container}>
        <RadioSelectionItem
          key={'cod'}
          title={'Cash On Delivery'}
          isSelected={true}
          onPress={() => {}}
          hideSeparator={true}
          textStyle={{ ...theme.fonts.IBMPlexSansMedium(16), marginTop: 2 }}
        />
      </View>
    );
  };

  return (
    <View style={{ marginTop: 20 }}>
      {renderHeader()}
      {renderCODOption()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 15,
    padding: 15,
  },
  Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginHorizontal: 20,
  },
  HeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
});
