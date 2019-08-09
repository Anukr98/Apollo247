import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/ui/RadioSelectionItem';

const styles = StyleSheet.create({
  bottonButtonContainer: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
    width: '66%',
    position: 'absolute',
    bottom: 0,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginBottom: 8,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginBottom: 16,
  },
  inputValidationStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: theme.colors.INPUT_FAILURE_TEXT,
    paddingTop: 8,
    letterSpacing: 0.04,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    padding: 16,
  },
});

const addressList = [
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
];
export interface StorePickupSceneProps extends NavigationScreenProps {}

export const StorePickupScene: React.FC<StorePickupSceneProps> = (props) => {
  const [pinCode, setPinCode] = useState<string>('');
  const [isSelected, setSelected] = useState<boolean>(false);
  const [isValidPin, setValidPin] = useState<boolean>(true);

  const renderBottomButton = () => {
    return (
      <View style={styles.bottonButtonContainer}>
        <Button disabled={!(pinCode.length == 6)} title="DONE" style={{ flex: 1 }} />
      </View>
    );
  };

  const renderInputWithValidation = () => {
    return (
      <View style={{ paddingBottom: 24 }}>
        <TextInputComponent
          value={pinCode}
          onChangeText={(text) => setPinCode(text)}
          textInputprops={{
            ...(!isValidPin ? { selectionColor: '#e50000' } : {}),
            maxLength: 6,
            autoFocus: true,
          }}
          inputStyle={[styles.inputStyle, !isValidPin ? { borderBottomColor: '#e50000' } : {}]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter pin code'}
          autoCorrect={false}
        />
        {!isValidPin ? (
          <Text style={styles.inputValidationStyle}>{'Invalid Coupon Code'}</Text>
        ) : null}
      </View>
    );
  };

  const renderCardTitle = () => {
    return (
      <>
        <Text style={styles.heading}>{'Stores In This Region'}</Text>
        <View style={styles.separator} />
      </>
    );
  };

  const renderRadioButtonList = () => {
    return addressList.map((address, i) => (
      <RadioSelectionItem
        title={address}
        isSelected={isSelected}
        onPress={(isSelected) => setSelected(isSelected)}
        key={i}
      />
    ));
  };

  const renderCouponCard = () => {
    return (
      <View style={styles.cardStyle}>
        {renderInputWithValidation()}
        {renderCardTitle()}
        {renderRadioButtonList()}
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header leftIcon="backArrow" title={'STORE PICK UP'} container={{ borderBottomWidth: 0 }} />
      <ScrollView bounces={false}>{renderCouponCard()}</ScrollView>
      {renderBottomButton()}
    </SafeAreaView>
  );
};
