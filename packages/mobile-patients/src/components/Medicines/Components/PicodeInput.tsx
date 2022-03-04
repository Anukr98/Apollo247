import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { BackArrow } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface PincodeInputProps {
  onPressApply: (pincode: string) => void;
  onPressBack: () => void;
}

export const PincodeInput: React.FC<PincodeInputProps> = (props) => {
  const { onPressApply, onPressBack } = props;
  const [pincode, setPincode] = useState<string>('');

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.5} onPress={onPressBack}>
          <BackArrow />
        </TouchableOpacity>
        <Text style={styles.headerText}>Enter a pincode</Text>
      </View>
    );
  };

  const renderInput = () => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <TextInputComponent
          maxLength={6}
          inputStyle={{
            borderColor: theme.colors.WHITE,
          }}
          keyboardType="numeric"
          conatinerstyles={styles.inputContainer}
          value={pincode}
          onChangeText={(text) => setPincode(text)}
          onSubmitEditing={(e) => onPressApply(e.nativeEvent.text)}
        />
      </View>
    );
  };

  const renderButton = () => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <Button
          title={'APPLY'}
          style={{ borderRadius: 5, marginVertical: 13 }}
          titleTextStyle={{ ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24, 0) }}
          onPress={() => onPressApply(pincode)}
        />
      </View>
    );
  };

  return (
    <View>
      {renderHeader()}
      {renderInput()}
      {renderButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2,71,91, 0.2)',
  },
  headerText: {
    ...theme.fonts.IBMPlexSansSemiBold(17),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 8,
  },
  inputContainer: {
    paddingHorizontal: 10,
    borderColor: theme.colors.BORDER_BOTTOM_COLOR,
    borderWidth: 0.5,
    marginTop: 13,
    borderRadius: 5,
  },
});
