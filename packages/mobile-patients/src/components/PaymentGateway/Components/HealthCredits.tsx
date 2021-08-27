import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { UnCheckIcon, CheckIcon, OneApollo } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface HealthCreditsProps {
  credits: number;
  HCSelected: boolean;
  amount: number;
  burnHc: number;
  onPressHCoption: (selected: boolean) => void;
  onPressPlaceOrder: () => void;
}

export const HealthCredits: React.FC<HealthCreditsProps> = (props) => {
  const { credits, HCSelected, onPressHCoption, amount, burnHc, onPressPlaceOrder } = props;

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.heading}>{'APOLLO HEALTH CREDITS'}</Text>
      </View>
    );
  };

  const renderOneApollo = () => {
    return (
      <View style={styles.subcontainer}>
        <OneApollo style={{ height: 32, width: 42 }} />
        <Text style={styles.hcs}>Available Health Credits</Text>
      </View>
    );
  };

  const renderHcs = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ ...styles.hcs, marginRight: 8 }}>₹{credits}</Text>
        {HCSelected ? <CheckIcon /> : <UnCheckIcon />}
      </View>
    );
  };

  const renderPlaceorder = () => {
    return (
      <View style={styles.subcontainer2}>
        <Button
          title={'PLACE ORDER'}
          onPress={onPressPlaceOrder}
          titleTextStyle={styles.place}
          style={{ borderRadius: 5 }}
        />
      </View>
    );
  };

  const renderChildComponent = () => {
    return (
      <View>
        <TouchableOpacity
          style={styles.ChildComponent}
          onPress={() => onPressHCoption(!HCSelected)}
        >
          {renderOneApollo()}
          {renderHcs()}
        </TouchableOpacity>
        {amount == 0 && burnHc && renderPlaceorder()}
      </View>
    );
  };

  return (
    <View>
      {renderHeader()}
      {renderChildComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    flexDirection: 'row',
    paddingBottom: 10,
    marginTop: 20,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  heading: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#01475B',
  },
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  subcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hcs: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 20,
    marginLeft: 10,
    color: '#01475B',
  },
  place: {
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 10,
  },
  subcontainer2: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
});
