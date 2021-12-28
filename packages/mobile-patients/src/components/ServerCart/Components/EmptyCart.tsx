import React from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { EmptyCartIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface EmptyCartProps {
  onPressAddMedicines: () => void;
}

export const EmptyCart: React.FC<EmptyCartProps> = (props) => {
  const { onPressAddMedicines } = props;

  const renderCartImage = () => {
    return <EmptyCartIcon />;
  };

  const renderMessage = () => {
    return <Text style={styles.msg}>YOUR CART IS EMPTY</Text>;
  };

  const renderButton = () => {
    return (
      <View>
        <Button
          title={'ADD MEDICINES AND HEALTH ITEMS'}
          onPress={onPressAddMedicines}
          titleTextStyle={styles.titleStyle}
          style={styles.buttonStyle}
        />
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {renderCartImage()}
      {renderMessage()}
      {renderButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 170,
    alignItems: 'center',
  },
  msg: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 18,
    color: '#01475B',
    marginTop: 20,
  },
  titleStyle: {
    fontSize: 13,
    lineHeight: 24,
    marginVertical: 8,
    marginHorizontal: 13,
  },
  buttonStyle: {
    width: undefined,
    marginTop: 27,
    borderRadius: 5,
  },
});
