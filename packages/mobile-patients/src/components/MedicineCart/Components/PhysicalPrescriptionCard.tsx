import React, { useState } from 'react';
import { StyleSheet, Text, Image, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  useShoppingCart,
  PhysicalPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  CrossYellow,
  FileBig,
  Check,
  UnCheck,
  GreenTickIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

export interface PhysicalPrescriptionCardProps {
  i: number;
  arrayLength: number;
  item: PhysicalPrescription;
  onRemove?: () => void;
  showTick?: boolean;
}

export const PhysicalPrescriptionCard: React.FC<PhysicalPrescriptionCardProps> = (props) => {
  const { arrayLength, i, item, onRemove, showTick } = props;
  return (
    <View key={i} style={{}}>
      <TouchableOpacity activeOpacity={1} key={i} onPress={() => {}}>
        <View
          style={{
            ...styles.card,
            marginTop: i === 0 ? 16 : 4,
            marginBottom: arrayLength === i + 1 ? 16 : 4,
          }}
          key={i}
        >
          <View style={styles.imageCont}>
            {item.fileType == 'pdf' ? (
              <FileBig style={styles.image} />
            ) : (
              <Image
                style={styles.image}
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
          {showTick && (
            <GreenTickIcon
              style={{
                width: 20,
                paddingHorizontal: 8,
              }}
            />
          )}
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: 40,
              paddingHorizontal: 8,
            }}
            onPress={onRemove}
          >
            {!showTick && <CrossYellow />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    shadowRadius: 4,
    height: 56,
    marginHorizontal: 10,
    backgroundColor: theme.colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageCont: {
    paddingLeft: 8,
    paddingRight: 16,
    width: 54,
  },
  image: {
    height: 30,
    width: 30,
    borderRadius: 5,
  },
});
