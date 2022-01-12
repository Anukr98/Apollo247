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
        <OneApollo style={{ height: 28, width: 35 }} />
        <View style={{ flexWrap: 'wrap' }}>
          <Text style={styles.hcs}>
            {HCSelected && amount != 0
              ? `₹${credits} Health Credits Applied !`
              : 'Available Health Credits'}
          </Text>
          {renderMsg()}
        </View>
      </View>
    );
  };

  const renderHcs = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {(!HCSelected || amount == 0) && (
          <Text style={{ ...styles.hcs, marginRight: 8 }}>₹{credits}</Text>
        )}
        {HCSelected ? <CheckIcon /> : <UnCheckIcon />}
      </View>
    );
  };

  const renderMsg = () => {
    return HCSelected && amount != 0 ? (
      <Text style={styles.hcMsg}>{`Now pay remaining ₹${amount} with other \npayment method`}</Text>
    ) : null;
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
          style={{
            ...styles.ChildComponent,
            backgroundColor: amount != 0 && HCSelected ? '#EBFFF8' : '#FAFEFF',
            borderColor: amount != 0 && HCSelected ? '#50B08F' : '#D4D4D4',
            paddingVertical: amount != 0 && HCSelected ? 12 : 15,
          }}
          onPress={() => onPressHCoption(!HCSelected)}
        >
          <View style={{ ...styles.subcontainer, justifyContent: 'space-between' }}>
            {renderOneApollo()}
            {renderHcs()}
          </View>
          {amount == 0 && burnHc && renderPlaceorder()}
        </TouchableOpacity>
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
    marginHorizontal: 16,
    paddingBottom: 12,
    marginTop: 24,
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 4,
  },
  ChildComponent: {
    flex: 1,
    backgroundColor: '#FAFEFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
  hcMsg: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    color: '#01475B',
    marginLeft: 10,
    marginTop: 4,
    alignItems: 'flex-start',
  },
  place: {
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 10,
  },
  subcontainer2: {
    marginTop: 15,
  },
});
