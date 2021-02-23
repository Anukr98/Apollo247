import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { PrescriptionOption } from '@aph/mobile-patients/src/components/MedicineCartPrescription';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import {
  UploadPrescriprionPopup,
  UploadPrescriprionPopupRefProps,
} from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import {
  EPrescription,
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { FileBig } from '@aph/mobile-patients/src/components/ui/Icons';
import { PrescriptionType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';

export interface Props {
  selectedOption: PrescriptionType | null;
  onSelectOption: (
    option: PrescriptionType,
    ePres?: EPrescription[],
    physPres?: PhysicalPrescription[]
  ) => void;
}

export const PrescriptionOptions: React.FC<Props> = ({ selectedOption, onSelectOption }) => {
  const [myPrescriptionsVisible, setMyPrescriptionsVisible] = useState<boolean>(false);
  const { prescriptionType, ePrescriptions, physicalPrescriptions } = useShoppingCart();
  const prescriptionPopupRef = useRef<UploadPrescriprionPopupRefProps | null>(null);

  const renderHavePrescription = () => {
    return (
      <PrescriptionOption
        title={'I have a Prescription'}
        subtitle={renderHavePrescriptionDetails()}
        onPress={() =>
          onSelectOption(PrescriptionType.UPLOADED, ePrescriptions, physicalPrescriptions)
        }
        checked={selectedOption === PrescriptionType.UPLOADED}
        leftIcon={<FileBig />}
      />
    );
  };

  const renderHavePrescriptionDetails = () => {
    const buttons = [
      {
        title: 'Camera',
        icon: <FileBig />,
        onPress: () => {
          prescriptionPopupRef.current?.onPressCamera();
        },
      },
      {
        title: 'Gallery',
        icon: <FileBig />,
        onPress: () => {
          prescriptionPopupRef.current?.onPressGallery();
        },
      },
      {
        title: 'Select from\nMy Prescriptions',
        icon: <FileBig />,
        onPress: () => setMyPrescriptionsVisible(true),
      },
    ];
    return (
      <>
        <Text style={styles.lightWeightBlue}>{'What is a valid prescription?'}</Text>
        <Text style={styles.blueMediumText}>{'Add Photos / PDF using:'}</Text>
        <View style={styles.buttonWrapper}>
          {buttons.map(({ title, onPress }) => (
            <TouchableOpacity onPress={onPress} style={styles.buttonContainer}>
              <View style={styles.roundButton} />
              <Text style={styles.buttonTitle}>{title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  };

  const renderSharePrescriptionLater = () => {
    return (
      <PrescriptionOption
        title={'Share Prescription later'}
        subtitle={
          <Text style={styles.lightWeightBlue}>
            {
              'Order now and share your prescription later via Whatsapp with our Pharmacist.\nNote: Order will be on hold until the Prescription is shared.'
            }
          </Text>
        }
        onPress={() => onSelectOption(PrescriptionType.LATER)}
        checked={selectedOption === PrescriptionType.LATER}
        leftIcon={<FileBig />}
      />
    );
  };

  const renderNoPrescription = () => {
    return (
      <PrescriptionOption
        title={'I don’t have a Prescription'}
        subtitle={renderNoPrescriptionDetails()}
        onPress={() => onSelectOption(PrescriptionType.CONSULT)}
        checked={selectedOption === PrescriptionType.CONSULT}
        leftIcon={<FileBig />}
      />
    );
  };

  const renderNoPrescriptionDetails = () => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.lightWeightBlueConsultation}>
          {
            'Get a consultation by our expert doctor within the next 30 minutes\n(Working hours: 8am to 8pm)'
          }
        </Text>
        <View style={styles.amountAndFreeText}>
          <Text style={styles.lightWeightBlueLineThrough}>{'₹399'}</Text>
          <Text style={styles.mediumGreen}>{' FREE '}</Text>
        </View>
      </View>
    );
  };

  const renderDivider = () => {
    return <Divider style={styles.divider} />;
  };

  const renderMyPrescriptions = () => {
    return myPrescriptionsVisible ? (
      <SelectEPrescriptionModal
        onSubmit={(selectedEPres) => {
          setMyPrescriptionsVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          onSelectOption(PrescriptionType.UPLOADED, selectedEPres, physicalPrescriptions);
        }}
        selectedEprescriptionIds={ePrescriptions.map((item) => item.id)}
        displayPrismRecords={true}
        isVisible={myPrescriptionsVisible}
      />
    ) : null;
  };

  const renderPrescriptions = () => {
    return (
      prescriptionType === PrescriptionType.UPLOADED && (
        <View style={styles.prescriptionView}>
          <Prescriptions hideHeader isPlainStyle />
        </View>
      )
    );
  };

  const renderPrescriptionPopup = () => {
    return (
      <UploadPrescriprionPopup
        ref={(ref) => (prescriptionPopupRef.current = ref)}
        type={'cartOrMedicineFlow'}
        isVisible={false}
        heading={''}
        optionTexts={{}}
        onClickClose={() => {}}
        onResponse={(selectedType, response) => {
          if (selectedType == 'CAMERA_AND_GALLERY') {
            onSelectOption(PrescriptionType.UPLOADED, ePrescriptions, [
              ...response,
              ...physicalPrescriptions,
            ]);
          }
        }}
      />
    );
  };

  return [
    renderHavePrescription(),
    renderPrescriptions(),
    renderDivider(),
    renderSharePrescriptionLater(),
    renderDivider(),
    renderNoPrescription(),
    renderMyPrescriptions(),
    renderPrescriptionPopup(),
  ];
};

const { text, card } = theme.viewStyles;
const styles = StyleSheet.create({
  divider: {
    marginHorizontal: 16,
  },
  lightWeightBlue: {
    ...text('R', 13, '#02475B'),
  },
  lightWeightBlueLineThrough: {
    ...text('R', 13, '#02475B'),
    textDecorationLine: 'line-through',
  },
  lightWeightBlueConsultation: {
    ...text('R', 13, '#02475B'),
    flex: 1,
    paddingRight: 8,
  },
  mediumGreen: {
    ...text('B', 13, '#00B38E'),
  },
  blueMediumText: {
    ...text('M', 13, '#02475B'),
    marginVertical: 12,
  },
  amountAndFreeText: {
    marginRight: -42,
    alignItems: 'center',
  },
  buttonWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  roundButton: {
    backgroundColor: '#01475B',
    height: 45,
    width: 45,
    borderRadius: 22.5,
  },
  buttonTitle: {
    ...text('M', 14, '#02475B'),
    textAlign: 'center',
    marginVertical: 10,
  },
  prescriptionView: {
    ...card(0, 0, 0, '#F7F8F5', 5),
    paddingHorizontal: 10,
    zIndex: 2,
  },
});
