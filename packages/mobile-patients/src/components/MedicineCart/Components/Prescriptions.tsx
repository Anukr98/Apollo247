import React, { useState } from 'react';
import { StyleSheet, Text, FlatList, View, ScrollView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  useShoppingCart,
  PhysicalPrescription,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { PrescriptionIcon, GreenTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
export interface PrescriptionsProps {}

export const Prescriptions: React.FC<PrescriptionsProps> = (props) => {
  const { physicalPrescriptions, ePrescriptions } = useShoppingCart();
  console.log(ePrescriptions);

  const renderHeader = () => {
    return (
      <View style={styles.Header}>
        <Text style={styles.HeaderText}>UPLOAD PRESCRIPTION</Text>
      </View>
    );
  };

  const renderPrescriptionMessage = () => {
    return (
      <View style={styles.prescriptionMsgCard}>
        <Text style={styles.prescriptionMsg}>
          Items in your cart marked with 'Rx' need prescriptions
        </Text>
      </View>
    );
  };

  const renderPhysicalPrescriptions = () => {
    return <View></View>;
  };

  const EPrescription = (item: EPrescription, i: number, arrayLength: number) => {
    return (
      <View style={styles.prescriptionCard}>
        <PrescriptionIcon />
        <View style={{ flex: 1 }}>
          <View style={styles.upperContainer}>
            <Text style={styles.doctorName}>{item.doctorName}</Text>
            <GreenTickIcon />
          </View>
          <View style={{ flexDirection: 'row', marginLeft: 20, marginTop: 4 }}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={{ ...styles.date, marginLeft: 20 }}>{item.forPatient}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEprescriptions = () => {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          {ePrescriptions.map((item, index, array) => {
            return EPrescription(item, index, array.length);
          })}
          <Text style={styles.upload}>UPLOAD MORE</Text>
        </ScrollView>
      </View>
    );
  };

  function showPresritionCard() {
    return physicalPrescriptions.length > 0 || ePrescriptions.length > 0;
  }

  return showPresritionCard() ? (
    <View>
      {renderHeader()}
      <View style={styles.card}>
        {renderPhysicalPrescriptions()}
        {renderEprescriptions()}
      </View>
    </View>
  ) : (
    <View>{renderPrescriptionMessage()}</View>
  );
};

const styles = StyleSheet.create({
  Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginTop: 20,
    marginHorizontal: 20,
  },
  HeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  prescriptionMsgCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 5,
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: '#F7F8F5',
  },
  prescriptionMsg: {
    marginLeft: 13,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: '#02475B',
    marginVertical: 6,
  },
  card: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 20,
    marginHorizontal: 13,
    borderRadius: 10,
    marginBottom: 9,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingTop: 16,
    paddingHorizontal: 7,
  },
  doctorName: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 21,
    color: '#02475B',
  },
  prescriptionCard: {
    backgroundColor: '#F7F8F5',
    flexDirection: 'row',
    borderRadius: 5,
    paddingTop: 16,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  upperContainer: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#rgba(2,71,91, 0.2)',
    paddingBottom: 6,
  },
  date: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    color: '#02475B',
    opacity: 0.6,
    flex: 0.5,
    borderRightWidth: 0.5,
    borderRightColor: '#rgba(2,71,91, 0.3)',
  },
  upload: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#FC9916',
    textAlign: 'right',
    marginTop: 12,
    marginBottom: 8,
    marginRight: 8,
  },
});
