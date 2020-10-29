import { MedicineIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';

export interface Props {
  onPress: () => void;
  title: string;
  image?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const MedSearchSectionProductView: React.FC<Props> = ({
  onPress,
  title,
  image,
  containerStyle,
}) => {
  const renderImage = () => {
    return (
      <Image
        source={{ uri: image }}
        PlaceholderContent={<MedicineIcon />}
        style={styles.image}
        placeholderStyle={imagePlaceholderStyle}
      />
    );
  };

  const renderTitle = () => {
    return (
      <Text style={styles.title} numberOfLines={3}>
        {title}
      </Text>
    );
  };

  return (
    <TouchableOpacity style={[styles.container, containerStyle]} onPress={onPress}>
      {renderImage()}
      {renderTitle()}
    </TouchableOpacity>
  );
};

const size = 50;
const { text, imagePlaceholderStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: size,
  },
  image: {
    resizeMode: 'contain',
    height: size,
    width: size,
  },
  title: {
    ...text('L', 10, '#02475B'),
    paddingTop: 3,
    textAlign: 'center',
  },
});
