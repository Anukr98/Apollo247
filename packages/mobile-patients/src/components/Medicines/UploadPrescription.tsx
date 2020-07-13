import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  EPrescription,
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { EPrescriptionCard } from '@aph/mobile-patients/src/components/ui/EPrescriptionCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossYellow, FileBig, GreenTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  g,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { RadioSelectionItem } from './RadioSelectionItem';

const styles = StyleSheet.create({
  prescriptionCardStyle: {
    paddingTop: 16,
    marginTop: 20,
    marginBottom: 16,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    backgroundColor: theme.colors.CARD_BG,
  },
  labelView: {
    marginHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
  },
  leftText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
});

export interface UploadPrescriptionProps
  extends NavigationScreenProps<{
    phyPrescriptionsProp: PhysicalPrescription[];
    ePrescriptionsProp: EPrescription[];
  }> {}

export const UploadPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const phyPrescriptionsProp = props.navigation.getParam('phyPrescriptionsProp') || [];
  const ePrescriptionsProp = props.navigation.getParam('ePrescriptionsProp') || [];
  const [PhysicalPrescriptions, setPhysicalPrescriptions] = useState<PhysicalPrescription[]>(
    phyPrescriptionsProp
  );
  const [EPrescriptions, setEPrescriptions] = useState<EPrescription[]>(ePrescriptionsProp);
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const { setLoading, loading, showAphAlert } = useUIElements();
  const {
    setPhysicalPrescriptions: setPhysicalPrescription,
    setEPrescriptions: setEPrescription
  } = useShoppingCart();
  const [prescriptionOption, setPrescriptionOption] = useState<string>('specified');
  const [durationDays, setDurationDays] = useState<string>('30');
  const medicineDetailOptions = [
    {
      id: 'search',
      title: 'Search and add medicine(s)',
    },
    {
      id: 'Need all medicine and for duration as per prescription',
      title: 'All medicines from prescription',
    },
    {
      id: 'Call me for details',
      title: 'Call me for details',
    },
  ];
  const [selectedMedicineOption, setSelectedMedicineOption] = useState<string>('');

  const onSubmitOrder = async () => {
    CommonLogEvent(
      AppRoutes.UploadPrescription,
      'Graph ql call for save prescription medicine order'
    );
    setLoading!(true);

    try {
      if (selectedMedicineOption === 'search') {
        if (EPrescriptions.length > 0) setEPrescription && setEPrescription([...EPrescriptions]);
        if (PhysicalPrescriptions.length > 0) setPhysicalPrescription && setPhysicalPrescription([...PhysicalPrescriptions]);
        props.navigation.navigate(AppRoutes.SearchMedicineScene, { showButton: true });
      } else {
        const days = durationDays ? parseInt(durationDays) : null;
        props.navigation.push(AppRoutes.YourCartUploadPrescriptions, {
          prescriptionOptionSelected: prescriptionOption === 'duration' ? `All medicines as per prescription for ${days} days` : selectedMedicineOption,
          // durationDays: prescriptionOption === 'duration' ? `Need all medicine as per prescription for ${durationDays} days` : null,
          durationDays: prescriptionOption === 'duration' ? days : null,
          physicalPrescription: PhysicalPrescriptions,
          ePrescription: EPrescriptions
        });
      }

      setLoading!(false);
    } catch (error) {
      setLoading!(false);
      CommonBugFender('UploadPrescription_onPressSubmit_try', error);
      renderErrorAlert('Error occurred while uploading physical prescription(s).');
    }
  };

  const renderErrorAlert = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: desc,
      unDismissable: true,
    });

  const renderLabel = (label: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.leftText}>{label}</Text>
      </View>
    );
  };

  const renderPhysicalPrescriptionRow = (
    item: PhysicalPrescription,
    i: number,
    arrayLength: number
  ) => {
    return (
      <View key={i} style={{}}>
        <TouchableOpacity activeOpacity={1} key={i}>
          <View
            style={{
              ...theme.viewStyles.cardViewStyle,
              shadowRadius: 4,
              height: 56,
              marginHorizontal: 20,
              backgroundColor: theme.colors.WHITE,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: i === 0 ? 16 : 4,
              marginBottom: arrayLength === i + 1 ? 16 : 4,
            }}
            key={i}
          >
            <View
              style={{
                paddingLeft: 8,
                paddingRight: 16,
                width: 54,
              }}
            >
              {item.fileType == 'pdf' ? (
                <FileBig
                  style={{
                    height: 45,
                    width: 30,
                    borderRadius: 5,
                  }}
                />
              ) : (
                <Image
                  style={{
                    height: 40,
                    width: 30,
                    borderRadius: 5,
                  }}
                  source={{ uri: `data:image/jpeg;base64,${item.base64}` }}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <TextInputComponent
                textInputprops={{ editable: false }}
                inputStyle={{
                  marginTop: 3,
                }}
                value={item.title}
              />
            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                width: 40,
                paddingHorizontal: 8,
              }}
              onPress={() => {
                CommonLogEvent(AppRoutes.UploadPrescription, 'Physical prescription filter');
                const filteredPres = PhysicalPrescriptions.filter(
                  (_item) => _item.title != item.title
                );
                setPhysicalPrescriptions([...filteredPres]);
              }}
            >
              <CrossYellow />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPhysicalPrescriptions = () => {
    if (PhysicalPrescriptions.length > 0) {
      return (
        <View style={styles.prescriptionCardStyle}>
          <View>{renderLabel('Physical Prescriptions')}</View>
          {PhysicalPrescriptions.map((item, index, array) => {
            return renderPhysicalPrescriptionRow(item, index, array.length);
          })}
        </View>
      );
    }
  };

  const renderEPrescriptionRow = (item: EPrescription, i: number, arrayLength: number) => {
    return (
      <EPrescriptionCard
        style={{
          marginTop: i === 0 ? 20 : 4,
          marginBottom: arrayLength === i + 1 ? 16 : 4,
        }}
        medicines={item.medicines}
        actionType="removal"
        date={item.date}
        doctorName={item.doctorName}
        forPatient={item.forPatient}
        onRemove={() => {
          setEPrescriptions(EPrescriptions.filter((_item) => _item.id != item.id));
        }}
      />
    );
  };

  const renderEPrescriptions = () => {
    if (EPrescriptions.length > 0) {
      return (
        <View style={[styles.prescriptionCardStyle]}>
          <View>{renderLabel('Prescriptions From Health Records')}</View>
          {EPrescriptions.map((item, index, array) => {
            return renderEPrescriptionRow(item, index, array.length);
          })}
        </View>
      );
    }
  };

  const renderPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        displayPrismRecords={true}
        navigation={props.navigation}
        // showConsultPrescriptionsOnly={true} // not showing e-prescriptions for non-cart flow
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          setEPrescriptions([...selectedEPres]);
        }}
        isVisible={isSelectPrescriptionVisible}
        selectedEprescriptionIds={EPrescriptions.map((item) => item.id)}
      />
    );
  };

  const renderMedicineDetailOptions = () => {
    return (
      <View style={styles.prescriptionCardStyle}>
        <View>{renderLabel('Specify Your Medicine Details')}</View>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            shadowRadius: 4,
            marginHorizontal: 20,
            backgroundColor: theme.colors.WHITE,
            alignItems: 'center',
            margin: 16,
          }}
        >
          {medicineDetailOptions.map((item, index, array) => {
            return (
              <RadioSelectionItem
                key={item.id}
                title={item.title}
                isSelected={selectedMedicineOption == item.id}
                onPress={() => {
                  setSelectedMedicineOption(item.id);
                  const optionSelected =
                    item.id === 'search'
                      ? 'Search and add'
                      : item.id === 'Need all medicine and for duration as per prescription'
                      ? 'All Medicine'
                      : 'Call me for details';
                  const eventAttribute: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_OPTION_SELECTED] = {
                    OptionSelected: optionSelected,
                  };
                  postWebEngageEvent(
                    WebEngageEventName.UPLOAD_PRESCRIPTION_OPTION_SELECTED,
                    eventAttribute
                  );
                }}
                containerStyle={{
                  ...theme.fonts.IBMPlexSansMedium(16),
                  paddingTop: index + 1 === 1 ? 16 : 10,
                  paddingBottom: index + 1 === array.length ? 16 : 10,
                  padding: 10,
                }}
                hideSeparator={
                  index + 1 === array.length ||
                  (selectedMedicineOption == item.id && selectedMedicineOption == 'Need all medicine and for duration as per prescription')
                }
                textStyle={{
                  ...theme.fonts.IBMPlexSansMedium(16),
                }}
                radioSubBody={selectedMedicineOption == item.id ? getRadioButtonAction() : <></>}
              />
            );
          })}
        </View>
      </View>
    );
  };

  const getRadioButtonAction = () => {
    if (selectedMedicineOption === 'Call me for details') {
      return (
        <View
          style={{
            backgroundColor: theme.colors.CARD_BG,
            padding: 16,
            margin: 0,
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
          }}
        >
          <Text
            style={{
              color: theme.colors.LIGHT_BLUE,
              ...theme.fonts.IBMPlexSansMedium(13),
              textAlign: 'center',
            }}
          >
            Our pharmacist will call you within 2 hours to confirm medicines (8 AM to 8 PM).
          </Text>
        </View>
      );
    } else if (selectedMedicineOption === 'Need all medicine and for duration as per prescription') {
      const isDurationDaysSelected = prescriptionOption === 'duration';
      return (
        <View
          style={{
            backgroundColor: theme.colors.WHITE,
            margin: 0,
            width: '100%',
          }}
        >
          <TouchableOpacity
            style={[
              {
                display: 'flex',
                flexDirection: 'row',
                padding: 10,
              },
              !isDurationDaysSelected
                ? {
                    backgroundColor: theme.colors.CARD_BG,
                    shadowColor: theme.colors.SHADOW_GRAY,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 4,
                  }
                : {},
            ]}
            onPress={() => {
              setPrescriptionOption('specified');
            }}
          >
            <Text
              style={{
                color: isDurationDaysSelected ? theme.colors.LIGHT_BLUE : theme.colors.APP_GREEN,
                ...theme.fonts.IBMPlexSansMedium(13),
                marginLeft: 35,
                marginRight: 25,
              }}
            >
              Duration as specified in prescription
            </Text>
            {!isDurationDaysSelected && (
              <GreenTickIcon
                style={{
                  resizeMode: 'contain',
                }}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              {
                padding: 10,
                paddingLeft: 45,
              },
              isDurationDaysSelected
                ? {
                    backgroundColor: theme.colors.CARD_BG,
                    shadowColor: theme.colors.SHADOW_GRAY,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 4,
                  }
                : {},
            ]}
            onPress={() => setPrescriptionOption('duration')}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <Text
                style={{
                  color: isDurationDaysSelected ? theme.colors.APP_GREEN : theme.colors.LIGHT_BLUE,
                  ...theme.fonts.IBMPlexSansMedium(13),
                }}
              >
                Duration -
              </Text>
              <TextInputComponent
                conatinerstyles={{
                  width: 30,
                  marginLeft: 10,
                  marginRight: 10,
                  marginTop: -5,
                  paddingTop: 0,
                }}
                inputStyle={{
                  color: isDurationDaysSelected ? theme.colors.APP_GREEN : theme.colors.LIGHT_BLUE,
                  opacity: 0.5,
                  ...theme.fonts.IBMPlexSansMedium(13),
                  textAlign: 'center',
                  borderBottomWidth: 1,
                  paddingBottom: 0,
                }}
                keyboardType={'numeric'}
                value={durationDays}
                onChangeText={(value) => setDurationDays(value)}
                onFocus={() => setPrescriptionOption('duration')}
              />
              <Text
                style={{
                  color: isDurationDaysSelected ? theme.colors.APP_GREEN : theme.colors.LIGHT_BLUE,
                  ...theme.fonts.IBMPlexSansMedium(13),
                }}
              >
                Days
              </Text>
              {isDurationDaysSelected && (
                <GreenTickIcon
                  style={{
                    resizeMode: 'contain',
                    marginLeft: 50,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
          <View
            style={{
              height: 1,
              opacity: 0.1,
              backgroundColor: theme.colors.LIGHT_BLUE,
            }}
          />
        </View>
      );
    }
  };

  const disableSubmitButton = () => {
    const isPrescriptions = !(PhysicalPrescriptions.length || EPrescriptions.length);
    const durationDaysInput = (selectedMedicineOption && selectedMedicineOption === 'Need all medicine and for duration as per prescription' &&
      prescriptionOption === 'duration' && durationDays === '') ? true : false;
    return isPrescriptions || !selectedMedicineOption || durationDaysInput || loading;
  };

  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={'SUBMIT PRESCRIPTION'}
          leftIcon="backArrow"
          container={{ ...theme.viewStyles.shadowStyle, zIndex: 1 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false} style={{ flex: 1 }}>
          {renderPhysicalPrescriptions()}
          {renderEPrescriptions()}
          <Text
            style={{
              ...fonts.IBMPlexSansBold(13),
              color: theme.colors.APP_YELLOW,
              lineHeight: (PhysicalPrescriptions.length === 0 && EPrescriptions.length === 0) ? 44 : 24,
              paddingRight: 24,
              textAlign: 'right',
            }}
            onPress={() => setShowPopop(true)}
          >
            ADD MORE PRESCRIPTIONS
          </Text>
          {renderMedicineDetailOptions()}
        </ScrollView>
      </SafeAreaView>

      <StickyBottomComponent style={{ position: 'relative' }} defaultBG>
        <Button
          disabled={disableSubmitButton()}
          title={'SUBMIT'}
          onPress={onSubmitOrder}
          style={{ marginHorizontal: 60, flex: 1 }}
        />
      </StickyBottomComponent>
      {renderPrescriptionModal()}
      <UploadPrescriprionPopup
        isVisible={ShowPopop}
        // disabledOption={
        //   EPrescriptions.length == 0 && PhysicalPrescriptions.length == 0
        //     ? 'NONE'
        //     : EPrescriptions.length > 0
        //     ? 'CAMERA_AND_GALLERY'
        //     : 'E-PRESCRIPTION'
        // }
        type="nonCartFlow"
        heading={'Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
          prescription: 'SELECT FROM\nE-PRESCRIPTION',
        }}
        onClickClose={() => setShowPopop(false)}
        onResponse={(selectedType, response) => {
          setShowPopop(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            setPhysicalPrescriptions([...PhysicalPrescriptions, ...response]);
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    </View>
  );
};
