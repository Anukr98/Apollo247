import React from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface ProceedBarProps {}

export const ProceedBar: React.FC<ProceedBarProps> = (props) => {
  const { grandTotal } = useShoppingCart();

  const renderTotal = () => {
    return (
      <View>
        <Text style={styles.total}>₹{grandTotal.toFixed(2)}</Text>
        <Text style={styles.text}>Home Delivery</Text>
      </View>
    );
  };

  const renderButton = () => {
    return (
      <Button
        disabled={false}
        title={`ADD DELIVERY ADDRESS`}
        onPress={() => {}}
        titleTextStyle={{ fontSize: 13, lineHeight: 24, marginVertical: 8 }}
        style={{ flex: 1, marginLeft: 15, borderRadius: 5 }}
      />
    );
  };

  return (
    <StickyBottomComponent style={styles.container}>
      {renderTotal()}
      {renderButton()}
    </StickyBottomComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.WHITE,
    flexDirection: 'row',
    paddingHorizontal: 13,
  },
  total: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 24,
    color: '#01475B',
  },
  text: {
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 24,
    color: '#01475B',
  },
});
