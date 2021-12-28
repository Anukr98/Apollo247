import React from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { CrossYellow, FileBig, GreenTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { saveCart_saveCart_data_prescriptionDetails } from '@aph/mobile-patients/src/graphql/types/saveCart';

export interface UploadedPrescriptionCardProps {
  i: number;
  arrayLength: number;
  item: saveCart_saveCart_data_prescriptionDetails;
  onRemove?: () => void;
  showTick?: boolean;
}

export const UploadedPrescriptionCard: React.FC<UploadedPrescriptionCardProps> = (props) => {
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
            <Image style={styles.image} source={{ uri: item?.prescriptionImageUrl }} />
          </View>
          <View style={{ flex: 1 }}>
            <TextInputComponent
              textInputprops={{ editable: false }}
              inputStyle={{
                marginTop: 3,
              }}
              value={item?.prismPrescriptionFileId || 'Prescription'}
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
