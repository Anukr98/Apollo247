import {
  Events,
  Helpers,
  PrescriptionOptions,
} from '@aph/mobile-patients/src/components/MedicineCartPrescription';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import {
  EPrescription,
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { PrescriptionType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';

export interface Props extends NavigationScreenProps {}

export const MedicineCartPrescription: React.FC<Props> = ({ navigation }) => {
  const scrollViewRef = useRef<ScrollView | null>(null);

  const {
    prescriptionType,
    setPrescriptionType,
    physicalPrescriptions,
    ePrescriptions,
    setPhysicalPrescriptions,
    setEPrescriptions,
    consultProfile,
    setConsultProfile,
    serverCartItems,
  } = useShoppingCart();
  const { setUserActionPayload } = useServerCart();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert } = useUIElements();

  useEffect(() => {
    setConsultProfile(null);
  }, []);

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainer}
        leftIcon={'backArrow'}
        title={'UPLOAD PRESCRIPTION'}
        onPressLeftIcon={() => navigation.goBack()}
      />
    );
  };

  const renderItemsNeedPrescription = () => {
    const reqItems = serverCartItems.filter(
      ({ isPrescriptionRequired }) => isPrescriptionRequired == '1'
    );
    const count = reqItems.length;
    const heading = `${count} ITEM${count > 1 ? 'S' : ''} IN CART NEED PRESCRIPTION`;
    const items = reqItems.map(({ name }) => (
      <View style={styles.itemContainer}>
        <View style={styles.point} />
        <Text style={styles.item}>{name}</Text>
      </View>
    ));

    return (
      <View style={styles.itemPrescriptionContainer}>
        <Text style={styles.header}>{heading}</Text>
        <Divider style={styles.divider} />
        {items}
      </View>
    );
  };

  const renderOptions = () => {
    return (
      <View style={[styles.prescriptionOptions]}>
        <PrescriptionOptions
          navigation={navigation}
          selectedOption={prescriptionType || PrescriptionType.UPLOADED}
          patientId={consultProfile?.id || null}
          onSelectPatient={(patient) => {
            setConsultProfile(patient || null);
          }}
          onSelectOption={(option, ePres, physPres) => {
            setPrescriptionType(option);
            setUserActionPayload({
              prescriptionType: option,
            });
            if (option === PrescriptionType.CONSULT) {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd?.();
              }, 100);
            }
            if (option === PrescriptionType.UPLOADED) {
              saveEPrescriptionsToServerCart(ePres);
              savePhysicalPrescriptionsToServerCart(physPres);
              setEPrescriptions?.(ePres || []);
              setPhysicalPrescriptions?.(physPres || []);
            } else {
              setEPrescriptions?.([]);
              setPhysicalPrescriptions?.([]);
            }
          }}
        />
      </View>
    );
  };

  const saveEPrescriptionsToServerCart = (ePrescriptions: EPrescription[]) => {
    try {
      ePrescriptions?.forEach((prescription: EPrescription) => {
        if (prescription?.prismPrescriptionFileId) {
          setUserActionPayload?.({
            prescriptionDetails: {
              prescriptionImageUrl: prescription?.uploadedUrl,
              prismPrescriptionFileId: 'prescription?.prismPrescriptionFileId',
              uhid: currentPatient?.uhid,
            },
          });
        }
      });
    } catch (error) {
      showAphAlert?.({
        title: 'Uh oh.. :(',
        description: 'Error occurred while uploading prescriptions.',
      });
    }
  };

  const savePhysicalPrescriptionsToServerCart = async (
    physicalPrescriptions: PhysicalPrescription[]
  ) => {
    try {
      // upload physical prescriptions and get prism file id
      const updatedPrescriptions = await Helpers.updatePrescriptionUrls(
        client,
        currentPatient?.id,
        physicalPrescriptions
      );
      updatedPrescriptions?.forEach((prescription: PhysicalPrescription) => {
        if (prescription?.prismPrescriptionFileId && prescription?.uploadedUrl) {
          setUserActionPayload?.({
            prescriptionDetails: {
              prescriptionImageUrl: prescription?.uploadedUrl,
              prismPrescriptionFileId: prescription?.prismPrescriptionFileId,
              uhid: currentPatient?.uhid,
            },
          });
        }
      });
    } catch (error) {
      showAphAlert?.({
        title: 'Uh oh.. :(',
        description: 'Error occurred while uploading prescriptions.',
      });
    }
  };

  const onPressContinue = async () => {
    try {
      navigation.navigate(AppRoutes.ReviewCart);
      postEvent(prescriptionType);
    } catch (error) {
      showAphAlert?.({
        title: 'Uh oh.. :(',
        description: 'Error occurred while uploading prescriptions.',
      });
    }
  };

  const renderContinueButton = () => {
    const isDisabled = prescriptionType
      ? (prescriptionType === PrescriptionType.UPLOADED &&
          physicalPrescriptions.length === 0 &&
          ePrescriptions.length === 0) ||
        (prescriptionType === PrescriptionType.CONSULT && !consultProfile?.id)
      : true;
    const title = [PrescriptionType.CONSULT, PrescriptionType.LATER].includes(prescriptionType!)
      ? 'CONTINUE WITHOUT PRESCRIPTION'
      : 'CONTINUE WITH PRESCRIPTION';
    return (
      <View style={styles.buttonView}>
        <Button onPress={onPressContinue} title={title} disabled={isDisabled} />
      </View>
    );
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      <ScrollView ref={(ref) => (scrollViewRef.current = ref)}>
        {renderItemsNeedPrescription()}
        {renderOptions()}
      </ScrollView>
      {renderContinueButton()}
    </SafeAreaView>
  );
};

const postEvent = (prescriptionType: PrescriptionType | null) => {
  Events.cartPrescriptionOptionSelectedProceedClicked({
    'Option selected':
      prescriptionType === PrescriptionType.UPLOADED
        ? 'Prescription Now'
        : prescriptionType === PrescriptionType.CONSULT
        ? 'Doctor Consult'
        : prescriptionType === PrescriptionType.LATER
        ? 'Prescription Later'
        : 'NA',
  });
};

const { text, card, container } = theme.viewStyles;
const styles = StyleSheet.create({
  headerContainer: {
    ...card(0, 0, 0, '#fff', 6),
    borderBottomWidth: 0,
    zIndex: 2,
  },
  itemPrescriptionContainer: {
    ...card(20, 0, 0, '#fff', 5),
    paddingBottom: 10,
    zIndex: 1,
  },
  prescriptionOptions: {
    ...card(0, 0, 0, '#fff', 4),
  },
  header: {
    ...text('B', 13, '#01475B'),
  },
  divider: {
    marginVertical: 4,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  point: {
    height: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: '#01475B',
  },
  item: {
    ...text('R', 12, '#02475B'),
    paddingLeft: 8,
  },
  buttonView: {
    ...card(0, 0, 0),
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
});
