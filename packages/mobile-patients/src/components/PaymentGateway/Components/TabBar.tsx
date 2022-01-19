import React from 'react';
import { StyleSheet, Dimensions, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface TabBarProps {
  onPressGoToHome: () => void;
  onPressGoToMyOrders: () => void;
  isConsult?: boolean;
}

export const TabBar: React.FC<TabBarProps> = (props) => {
  const { onPressGoToHome, onPressGoToMyOrders, isConsult } = props;

  const renderButtons = () => {
    return (
      <View style={styles.subCont}>
        <TouchableOpacity onPress={onPressGoToHome}>
          <Text style={styles.goToHome}>GO TO HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressGoToMyOrders}>
          <Text style={styles.goToOrders}>
            {!!isConsult ? 'GO TO CONSULT ROOM' : 'GO TO MY ORDERS'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  return <View style={styles.container}>{renderButtons()}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  subCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goToHome: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#FC9916',
  },
  goToOrders: {
    color: '#fff',
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    paddingHorizontal: 25,
    paddingVertical: 8,
    backgroundColor: '#FCB716',
    borderRadius: 4,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
});
