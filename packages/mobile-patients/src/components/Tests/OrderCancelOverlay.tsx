import { AphOverlay, AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    marginTop: 24,
  },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
});

export interface OrderCancelOverlayProps extends AphOverlayProps {
  options: [string, string][]; //[key, value][];
  onSubmit: (reason: string, comment?: string) => void;
}

export const OrderCancelOverlay: React.FC<OrderCancelOverlayProps> = (props) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [overlayDropdown, setOverlayDropdown] = useState(false);
  const { options, onSubmit, ...attributes } = props;
  const aphOverlayProps: AphOverlayProps = attributes;

  const optionsDropdown = overlayDropdown && (
    <Overlay
      onBackdropPress={() => setOverlayDropdown(false)}
      isVisible={overlayDropdown}
      overlayStyle={styles.dropdownOverlayStyle}
    >
      <DropDown
        cardContainer={{
          margin: 0,
        }}
        options={props.options.map(
          (item, i) =>
            ({
              onPress: () => {
                setSelectedReason(item[1]);
                setOverlayDropdown(false);
              },
              optionText: item[1],
            } as Option)
        )}
      />
    </Overlay>
  );

  const content = (
    <View style={{ paddingHorizontal: 16 }}>
      <Text
        style={[
          {
            marginBottom: 12,
            ...theme.viewStyles.text('M', 14, '#02475b'),
          },
        ]}
      >
        Why are you cancelling this order?
      </Text>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          setOverlayDropdown(true);
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[
              {
                flex: 0.9,
                ...theme.fonts.IBMPlexSansMedium(18),
                color: theme.colors.SHERPA_BLUE,
              },
              selectedReason ? {} : { opacity: 0.3 },
            ]}
            numberOfLines={1}
          >
            {selectedReason || 'Select reason for cancelling'}
          </Text>
          <View style={{ flex: 0.1 }}>
            <DropdownGreen style={{ alignSelf: 'flex-end' }} />
          </View>
        </View>
        <View
          style={{
            marginTop: 5,
            backgroundColor: '#00b38e',
            height: 2,
          }}
        />
      </TouchableOpacity>
      <TextInputComponent
        value={comment}
        onChangeText={(text) => {
          setComment(text);
        }}
        label={'Add Comments (Optional)'}
        placeholder={'Enter your comments here…'}
      />
    </View>
  );

  const bottomButton = (
    <Button
      style={{ margin: 16, marginTop: 32, width: 'auto' }}
      onPress={() => props.onSubmit(selectedReason, comment)}
      disabled={!!!selectedReason}
      title={'SUBMIT REQUEST'}
    />
  );

  return (
    <AphOverlay {...aphOverlayProps}>
      <View style={styles.containerStyle}>
        {optionsDropdown}
        {content}
        {bottomButton}
      </View>
    </AphOverlay>
  );
};
