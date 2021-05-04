import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { PrescriptionOption } from '@aph/mobile-patients/src/components/MedicineCartPrescription';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import {
  UploadPrescriprionPopup,
  UploadPrescriprionPopupRefProps,
} from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  EPrescription,
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  CameraIc,
  FreeShippingIcon,
  GalleryIc,
  RxIc,
  RxPrescriptionCallIc,
  RxPrescriptionIc,
  RxPrescriptionLaterIc,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { PrescriptionType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, ButtonProps, Divider } from 'react-native-elements';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';

export interface Props {
  selectedOption: PrescriptionType | null;
  patientId: string | null;
  onSelectOption: (
    option: PrescriptionType,
    ePres?: EPrescription[],
    physPres?: PhysicalPrescription[]
  ) => void;
  onSelectPatient: (patient: GetCurrentPatients_getCurrentPatients_patients | null) => void;
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
}

export const PrescriptionOptions: React.FC<Props> = ({
  selectedOption,
  patientId,
  onSelectOption,
  onSelectPatient,
  navigation,
}) => {
  const [myPrescriptionsVisible, setMyPrescriptionsVisible] = useState<boolean>(false);
  const { ePrescriptions, physicalPrescriptions } = useShoppingCart();
  const prescriptionPopupRef = useRef<UploadPrescriprionPopupRefProps | null>(null);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const cartPrescriptionOptions = AppConfig.Configuration.CART_PRESCRIPTION_OPTIONS;

  const renderHavePrescription = (title: string) => {
    return (
      <PrescriptionOption
        title={title}
        subtitle={renderHavePrescriptionDetails()}
        onPress={() => {
          onSelectPatient(null);
          onSelectOption(PrescriptionType.UPLOADED, ePrescriptions, physicalPrescriptions);
        }}
        checked={selectedOption === PrescriptionType.UPLOADED || ePrescriptions?.length}
        leftIcon={<RxPrescriptionIc resizeMode={'contain'} />}
      />
    );
  };

  const renderHavePrescriptionDetails = () => {
    const buttons = [
      {
        title: 'Camera',
        icon: <CameraIc />,
        onPress: () => {
          prescriptionPopupRef.current?.onPressCamera();
        },
      },
      {
        title: 'Gallery',
        icon: <GalleryIc />,
        onPress: () => {
          prescriptionPopupRef.current?.onPressGallery();
        },
      },
      {
        title: 'Select from\nMy Prescriptions',
        icon: <RxIc />,
        onPress: () => setMyPrescriptionsVisible(true),
      },
    ];
    return (
      <>
        <Text style={styles.blueMediumText}>{'Add Photos / PDF using:'}</Text>
        <View style={styles.buttonWrapper}>
          {buttons.map(({ title, icon, onPress }) => (
            <TouchableOpacity onPress={onPress} style={styles.buttonContainer}>
              {icon}
              <Text style={styles.buttonTitle}>{title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  };

  const renderSharePrescriptionLater = (title: string) => {
    const orderNow =
      'Order now and share your prescription later via WhatsApp with our Pharmacist.';
    const note = 'Note: ';
    const orderHold = 'Order will be on hold until the Prescription is shared.';
    return (
      <PrescriptionOption
        title={title}
        subtitle={
          <View>
            <Text style={styles.lightWeightBlue}>{orderNow}</Text>
            <Text>
              <Text style={styles.boldBlue}>{note}</Text>
              <Text style={styles.lightWeightBlue}>{orderHold}</Text>
            </Text>
          </View>
        }
        onPress={() => {
          onSelectPatient(null);
          onSelectOption(PrescriptionType.LATER);
        }}
        checked={selectedOption === PrescriptionType.LATER}
        leftIcon={
          <RxPrescriptionLaterIc resizeMode={'contain'} style={styles.rxPrescriptionLaterIc} />
        }
      />
    );
  };

  const renderNoPrescription = (title: string) => {
    return (
      <PrescriptionOption
        title={title}
        subtitle={renderNoPrescriptionDetails()}
        onPress={() => onSelectOption(PrescriptionType.CONSULT)}
        checked={selectedOption === PrescriptionType.CONSULT}
        leftIcon={<RxPrescriptionCallIc resizeMode={'contain'} />}
      />
    );
  };

  const renderNoPrescriptionDetails = () => {
    return (
      <>
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
        {selectedOption === PrescriptionType.CONSULT && [
          <Text style={styles.consultationFor}>{'This consultation is for:'}</Text>,
          <Divider />,
          renderProfiles(),
          <View style={styles.consultAttentionView}>
            <FreeShippingIcon style={styles.freeShippingIcon} />
            <Text style={styles.lightWeightBlue}>
              {
                'Please make sure the consult is for the right person else consult can get cancelled.'
              }
            </Text>
          </View>,
        ]}
      </>
    );
  };

  const renderProfiles = () => {
    const allPatients =
      (allCurrentPatients as GetCurrentPatients_getCurrentPatients_patients[]) || [];
    const profiles: ButtonProps[] = allPatients.map((patient) => {
      const isAddNewMember = patient?.firstName?.toLowerCase() === '+add member';
      const isSelectedProfile = patient?.id === patientId;
      const onPress = () => {
        if (isAddNewMember) {
          navigation.navigate(AppRoutes.EditProfile, {
            isEdit: false,
            mobileNumber: currentPatient?.mobileNumber,
          });
        } else {
          onSelectPatient(patient);
        }
      };
      return {
        onPress,
        title: isAddNewMember ? '+Add Member' : patient?.firstName!,
        containerStyle: styles.profileBtnContainer,
        buttonStyle: isSelectedProfile ? styles.profileBtnSelected : styles.profileBtn,
        titleStyle: isSelectedProfile ? styles.profileBtnTitleSelected : styles.profileBtnTitle,
        type: isAddNewMember ? 'outline' : 'clear',
      };
    });

    return (
      <View style={styles.profileWrapper}>
        {profiles.map((props) => (
          <Button {...props} />
        ))}
      </View>
    );
  };

  const renderDivider = () => {
    return <Divider style={styles.divider} />;
  };

  const renderMyPrescriptionModal = () => {
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

  const renderAddedPrescriptions = () => {
    return (
      selectedOption === PrescriptionType.UPLOADED && (
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
        isActionSheetOutOfOverlay={true}
        heading={''}
        optionTexts={{}}
        onClickClose={() => {}}
        onResponse={(selectedType, response) => {
          if (selectedType == 'CAMERA_AND_GALLERY') {
            onSelectPatient(null);
            onSelectOption(PrescriptionType.UPLOADED, ePrescriptions, [
              ...response,
              ...physicalPrescriptions,
            ]);
          }
        }}
      />
    );
  };

  const renderCartPrescriptionOptions = () => {
    return cartPrescriptionOptions
      .filter(({ visible }) => visible)
      .map(({ id, title }, index, array) => {
        const options =
          id === 'havePrescription'
            ? [renderHavePrescription(title), renderAddedPrescriptions()]
            : id === 'sharePrescriptionLater'
            ? [renderSharePrescriptionLater(title)]
            : id === 'noPrescriptionDoConsult'
            ? [renderNoPrescription(title)]
            : null;
        return [options, index > 0 && index < array.length && renderDivider()];
      });
  };

  return (
    <>
      {renderCartPrescriptionOptions()}
      {renderMyPrescriptionModal()}
      {renderPrescriptionPopup()}
    </>
  );
};

const { text, card } = theme.viewStyles;
const styles = StyleSheet.create({
  divider: {
    marginHorizontal: 16,
  },
  boldBlue: {
    ...text('SB', 13, '#02475B'),
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
  consultationFor: {
    ...text('M', 14, '#01475B'),
    marginBottom: 8,
    marginTop: 18,
  },
  rxPrescriptionLaterIc: {
    height: 20,
    width: 20,
  },
  profileWrapper: { marginVertical: 10, flexDirection: 'row', flexWrap: 'wrap' },
  profileBtnContainer: { margin: 5, marginLeft: 0, marginRight: 10 },
  profileBtn: { ...card(8, 0, 5, '#FFF'), borderColor: '#01475B' },
  profileBtnTitle: { ...text('M', 14, '#01475B') },
  profileBtnSelected: { ...card(8, 0, 5, '#01475B'), borderColor: '#01475B' },
  profileBtnTitleSelected: { ...text('M', 14, '#FFF') },
  consultAttentionView: { flexDirection: 'row' },
  freeShippingIcon: { width: 15, height: 15, marginTop: 3, marginRight: 3, marginLeft: -3 },
});
