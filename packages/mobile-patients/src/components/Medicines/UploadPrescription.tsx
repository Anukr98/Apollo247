import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossYellow } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  EPrescription,
  EPrescriptionDisableOption,
  PhysicalPrescription,
} from '../ShoppingCartProvider';
import { BottomPopUp } from '../ui/BottomPopUp';
import { EPrescriptionCard } from '../ui/EPrescriptionCard';
import { Spinner } from '../ui/Spinner';
import { SelectEPrescriptionModal } from './SelectEPrescriptionModal';
import { Mutation } from 'react-apollo';
import { UPLOAD_FILE } from '../../graphql/profiles';
import { uploadFile, uploadFileVariables } from '../../graphql/types/uploadFile';

const styles = StyleSheet.create({
  prescriptionCardStyle: {
    paddingTop: 16,
    marginTop: 20,
    marginBottom: 16,
    ...theme.viewStyles.cardContainer,
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
  deliveryPinCodeContaner: {
    ...theme.viewStyles.cardContainer,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS == 'ios' ? 12 : 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f8f5',
  },
  pinCodeStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    flex: 0.9,
  },
  pinCodeTextInput: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    paddingBottom: 3,
    paddingLeft: Platform.OS === 'ios' ? 0 : -3,
    paddingTop: 0,
    width: Platform.OS === 'ios' ? 51 : 54,
  },
});

export interface UploadPrescriptionProps extends NavigationScreenProps {
  disabledOption: EPrescriptionDisableOption;
  phyPrescriptionsProp: PhysicalPrescription;
  ePrescriptionsProp: EPrescription;
}

export const UploadPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const disabledOption = props.navigation.getParam('disabledOption');
  const phyPrescriptionsProp = props.navigation.getParam('phyPrescriptionsProp') || [];
  const ePrescriptionsProp = props.navigation.getParam('ePrescriptionsProp') || [];

  const [PhysicalPrescriptions, setPhysicalPrescriptions] = useState<PhysicalPrescription[]>(
    phyPrescriptionsProp
  );
  const [EPrescriptions, setEPrescriptions] = useState<EPrescription[]>(ePrescriptionsProp);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const [pinCode, setPinCode] = useState<string>('');

  const isValidPinCode = (text: string): boolean => text == '' || /^([1-9][0-9]*)$/.test(text);

  const onPressSubmit = () => {
    setshowSpinner(true);
    setTimeout(() => {
      setshowSpinner(false);
      setBottompopup(true);
    }, 1000);
  };

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
              <Image
                style={{
                  height: 40,
                  width: 30,
                  borderRadius: 5,
                }}
                source={{ uri: `data:image/jpeg;base64,${item.base64}` }}
                // source={{ uri: item.path }}
              />
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

  const renderDeliveryPinCode = () => {
    return (
      <View style={styles.deliveryPinCodeContaner}>
        <Text numberOfLines={1} style={styles.pinCodeStyle}>
          Delivery Pincode
        </Text>
        <TextInput
          maxLength={6}
          value={pinCode}
          onChange={({ nativeEvent: { text } }) => isValidPinCode(text) && setPinCode(text)}
          underlineColorAndroid="transparent"
          style={styles.pinCodeTextInput}
          selectionColor={theme.colors.INPUT_BORDER_SUCCESS}
        />
      </View>
    );
  };

  const [bottompopup, setBottompopup] = useState<boolean>(false);
  const renderSuccessDialog = () => {
    return (
      (bottompopup && (
        <BottomPopUp
          style={{
            elevation: 20,
            zIndex: 10,
          }}
          title={'Hi:)'}
          description={`Your prescriptions have been submitted successfully. We will notify you when the items are in your cart.\n\n\nIf we need any clarificaitons, we will call you within 1 hour.`}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setBottompopup(false);
                props.navigation.goBack();
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )) ||
      null
    );
  };

  return (
    <View
      style={{
        ...theme.viewStyles.container,
        elevation: bottompopup ? 20 : 0,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={'UPLOAD PRESCRIPTION'}
          leftIcon="backArrow"
          container={{ ...theme.viewStyles.shadowStyle, zIndex: 1 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false} style={{ flex: 1 }}>
          {renderDeliveryPinCode()}
          {renderPhysicalPrescriptions()}
          {renderEPrescriptions()}
          <Text
            style={{
              ...fonts.IBMPlexSansBold(13),
              color: theme.colors.APP_YELLOW,
              lineHeight: 24,
              paddingBottom: 4,
              marginBottom: 20,
              paddingRight: 24,
              textAlign: 'right',
            }}
            onPress={() => setShowPopop(true)}
          >
            ADD MORE PRESCRIPTIONS
          </Text>
        </ScrollView>
      </SafeAreaView>
      <StickyBottomComponent style={{ position: 'relative' }} defaultBG>
        <Mutation<uploadFile, uploadFileVariables> mutation={UPLOAD_FILE}>
          {(mutate, { loading, data, error }) => (
            <Button
              title={'SUBMIT PRESCRIPTION'}
              onPress={onPressSubmit}
              style={{ marginHorizontal: 60, flex: 1 }}
            />
          )}
        </Mutation>
      </StickyBottomComponent>
      {showSpinner && <Spinner />}
      {renderSuccessDialog()}
      {renderPrescriptionModal()}
      <UploadPrescriprionPopup
        isVisible={ShowPopop}
        disabledOption={
          EPrescriptions.length == 0 && PhysicalPrescriptions.length == 0 ? 'NONE' : disabledOption
        }
        type="nonCartFlow"
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
