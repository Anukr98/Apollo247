import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  PhysicalPrescription,
  EPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { EPrescriptionCard } from '@aph/mobile-patients/src/components/ui/EPrescriptionCard';
import { PhysicalPrescriptionCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/PhysicalPrescriptionCard';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
export interface PrescriptionsProps {
  onPressUploadMore: () => void;
  screen?: string;
  style?: StyleProp<ViewStyle>;
  physicalPrescriptions: PhysicalPrescription[];
  ePrescriptions: EPrescription[];
}

export const Prescriptions: React.FC<PrescriptionsProps> = (props) => {
  const { removePrescriptionFromCart } = useServerCart();
  const { onPressUploadMore, screen, style, physicalPrescriptions, ePrescriptions } = props;

  const renderHeader = () => {
    return (
      <View style={styles.Header}>
        <Text style={styles.HeaderText}>UPLOADED PRESCRIPTION</Text>
      </View>
    );
  };
  const renderLabel = (label: string, rightText?: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.labelTextStyle}>{label}</Text>
        {rightText && <Text style={styles.labelTextStyle}>{rightText}</Text>}
      </View>
    );
  };
  const renderPrescriptionMessage = () => {
    return screen == 'summary' ? (
      <View style={styles.prescriptionMsgCard}>
        <Text style={styles.prescriptionMsg}>
          Items in your cart marked with 'Rx' need prescriptions
        </Text>
      </View>
    ) : null;
  };

  const PhysicalPrescription = (item: PhysicalPrescription, i: number, arrayLength: number) => {
    return (
      <PhysicalPrescriptionCard
        item={item}
        i={i}
        arrayLength={arrayLength}
        onRemove={() => {
          removePrescriptionFromCart(item?.prismPrescriptionFileId);
        }}
        showTick={true}
      />
    );
  };

  const renderPhysicalPrescriptions = () => {
    return (
      <View style={{ flex: 1 }}>
        {renderLabel(`Physical Prescription${physicalPrescriptions?.length == 1 ? '' : 's'}`)}
        <ScrollView>
          {physicalPrescriptions?.map((item, index, array) => {
            return PhysicalPrescription(item, index, array.length);
          })}
        </ScrollView>
      </View>
    );
  };

  const EPrescription = (item: EPrescription, i: number, arrayLength: number) => {
    return (
      <EPrescriptionCard
        style={{
          marginTop: i === 0 ? 15 : 4,
          marginBottom: arrayLength === i + 1 ? 16 : 4,
        }}
        medicines={item.medicines}
        actionType="removal"
        date={item.date}
        doctorName={item.doctorName}
        forPatient={item.forPatient}
        onRemove={() => {
          removePrescriptionFromCart(item?.prismPrescriptionFileId);
        }}
        showTick={true}
      />
    );
  };

  const renderEprescriptions = () => {
    return (
      <View style={{ flex: 1 }}>
        {renderLabel(`Prescription${ePrescriptions?.length == 1 ? '' : 's'} From Health Records`)}
        <ScrollView>
          {ePrescriptions?.map((item, index, array) => {
            return EPrescription(item, index, array.length);
          })}
        </ScrollView>
      </View>
    );
  };

  const renderUploadMore = () => {
    return (
      <TouchableOpacity onPress={onPressUploadMore}>
        <Text style={styles.upload}>UPLOAD MORE</Text>
      </TouchableOpacity>
    );
  };

  function showPresritionCard() {
    return physicalPrescriptions?.length > 0 || ePrescriptions?.length > 0;
  }

  return showPresritionCard() ? (
    <View style={[styles.container, style]}>
      {renderHeader()}
      <View style={styles.card}>
        {physicalPrescriptions.length > 0 && renderPhysicalPrescriptions()}
        {ePrescriptions.length > 0 && renderEprescriptions()}
        {/* {renderUploadMore()} */}
      </View>
    </View>
  ) : (
    <View>{renderPrescriptionMessage()}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
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
    marginTop: 15,
    marginHorizontal: 13,
    borderRadius: 10,
    marginBottom: 9,
    paddingVertical: 8,
    paddingHorizontal: 7,
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
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginHorizontal: 20,
  },
  labelTextStyle: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    padding: 16,
  },
});
