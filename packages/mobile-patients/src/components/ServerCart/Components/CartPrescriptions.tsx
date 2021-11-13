import {
  PhysicalPrescriptionCard,
  PhysicalPrescriptionCardProps,
} from '@aph/mobile-patients/src/components/MedicineCart/Components/PhysicalPrescriptionCard';
import { PrescriptionInfoView } from '@aph/mobile-patients/src/components/MedicineCart/Components/PrescriptionInfoView';
import { EPrescriptionCard } from '@aph/mobile-patients/src/components/ServerCart/Components/EPrescriptionCard';
import { UploadedPrescriptionCard } from '@aph/mobile-patients/src/components/ServerCart/Components/UploadedPrescriptionCard';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import {
  EPrescription,
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { PrescriptionType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { saveCart_saveCart_data_prescriptionDetails } from '@aph/mobile-patients/src/graphql/types/saveCart';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export interface CartPrescriptionsProps {
  onPressUploadMore?: () => void;
  myPresProps?: Partial<PhysicalPrescriptionCardProps>;
  hideHeader?: boolean;
  showSelectedOption?: boolean;
  isPlainStyle?: boolean;
  style?: StyleProp<ViewStyle>;
  actionType?: 'selection' | 'removal';
  isPrescriptionChangeDisabled?: boolean;
}

export const CartPrescriptions: React.FC<CartPrescriptionsProps> = (props) => {
  const {
    prescriptionType,
    consultProfile,

    cartPrescriptions,
  } = useShoppingCart();
  // console.log('cartPrescriptions >>>>> ', cartPrescriptions);
  const uploadedPrescriptions = cartPrescriptions?.filter((prescription) => !prescription?.meta);
  // console.log('uploadedPrescriptions >>>>> ', uploadedPrescriptions);
  const appointmentPrescriptions = cartPrescriptions?.filter(
    (prescription) => prescription?.appointmentId || prescription?.meta
  );
  // console.log('appointmentPrescriptions >>>>> ', appointmentPrescriptions);
  const { setUserActionPayload } = useServerCart();
  const {
    onPressUploadMore,
    // ePresProps,
    myPresProps,
    style,
    hideHeader,
    showSelectedOption,
    isPlainStyle,
    actionType,
    isPrescriptionChangeDisabled,
  } = props;
  const { currentPatient } = useAllCurrentPatients();

  const renderHeader = () => {
    return (
      !hideHeader && (
        <View style={styles.Header}>
          <Text style={styles.HeaderText}>UPLOAD PRESCRIPTION</Text>
        </View>
      )
    );
  };
  const renderLabel = (label: string, mediumFont?: boolean) => {
    return (
      <View style={styles.labelView}>
        <Text style={[styles.labelTextStyle, mediumFont && styles.mediumFontStyle]}>{label}</Text>
      </View>
    );
  };

  const PhysicalPrescription = (
    item: saveCart_saveCart_data_prescriptionDetails,
    i: number,
    arrayLength: number
  ) => {
    return (
      <UploadedPrescriptionCard
        item={item}
        i={i}
        arrayLength={arrayLength}
        onRemove={() => {
          // removePhysicalPrescription && removePhysicalPrescription(item.title);
          setUserActionPayload?.({
            prescriptionDetails: {
              prismPrescriptionFileId: item?.prismPrescriptionFileId,
              prescriptionImageUrl: '',
            },
          });
        }}
        {...myPresProps}
      />
    );
  };

  const renderPhysicalPrescriptions = () => {
    return (
      <View style={{ flex: 1 }}>
        {renderLabel(`Physical Prescription${uploadedPrescriptions.length == 1 ? '' : 's'}`, true)}
        <ScrollView>
          {uploadedPrescriptions.map((item, index, array) => {
            return PhysicalPrescription(item, index, array.length);
          })}
        </ScrollView>
      </View>
    );
  };

  const EPrescription = (
    item: saveCart_saveCart_data_prescriptionDetails,
    i: number,
    arrayLength: number
  ) => {
    return (
      <EPrescriptionCard
        style={{
          marginTop: i === 0 ? 15 : 4,
          marginBottom: arrayLength === i + 1 ? 16 : 4,
        }}
        medicines={item?.meta?.medicines}
        actionType={actionType || 'removal'}
        date={item?.meta?.date}
        doctorName={item?.meta?.doctorName}
        forPatient={item?.meta?.forPatient}
        onRemove={() => {
          setUserActionPayload({
            prescriptionDetails: {
              prismPrescriptionFileId: item?.prismPrescriptionFileId,
              prescriptionImageUrl: '',
            },
          });
        }}
        isSelected={true}
        isDisabled={!!isPrescriptionChangeDisabled}
        showTick={false}
      />
    );
  };

  const renderEprescriptions = () => {
    return (
      <View style={{ flex: 1 }}>
        {renderLabel(`My Prescription${appointmentPrescriptions.length == 1 ? '' : 's'}`, true)}
        <ScrollView>
          {appointmentPrescriptions.map((item, index, array) => {
            return EPrescription(item, index, array.length);
          })}
        </ScrollView>
      </View>
    );
  };

  const renderUploadMore = () => {
    return (
      !!onPressUploadMore && (
        <TouchableOpacity onPress={onPressUploadMore}>
          <Text style={styles.upload}>UPLOAD MORE</Text>
        </TouchableOpacity>
      )
    );
  };

  const renderPrescriptionInfo = () => {
    const isPrescriptionLater = prescriptionType === PrescriptionType.LATER;
    const name = consultProfile?.firstName || currentPatient?.firstName;
    const title = isPrescriptionLater
      ? 'Share Prescription Later Selected'
      : `Doctor Consult Option Selected for ${name}`;
    const description = isPrescriptionLater
      ? 'You have to share prescription later for order to be verified successfully.'
      : 'An Apollo doctor will call you soon as they are available!';
    const note = isPrescriptionLater
      ? 'Delivery TAT will be on hold till the prescription is submitted.'
      : 'Delivery TAT will be on hold till the consult is completed.';

    return prescriptionType && showSelectedOption ? (
      <PrescriptionInfoView
        onPressUpload={() => {
          onPressUploadMore?.();
        }}
        title={title}
        description={description}
        note={note}
      />
    ) : null;
  };

  function showPresritionCard() {
    return uploadedPrescriptions.length > 0 || appointmentPrescriptions.length > 0;
  }

  return showPresritionCard() ? (
    <View style={[styles.container, style]}>
      {renderHeader()}
      <View style={isPlainStyle ? null : styles.card}>
        {uploadedPrescriptions.length > 0 && renderPhysicalPrescriptions()}
        {appointmentPrescriptions.length > 0 && renderEprescriptions()}
        {renderUploadMore()}
      </View>
    </View>
  ) : (
    renderPrescriptionInfo()
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
    marginBottom: 15,
  },
  HeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  card: {
    ...theme.viewStyles.cardViewStyle,
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
  mediumFontStyle: {
    ...theme.fonts.IBMPlexSansMedium(13),
  },
});
