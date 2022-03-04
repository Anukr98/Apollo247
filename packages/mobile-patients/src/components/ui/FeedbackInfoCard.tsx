import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8f5',
    padding: 12,
    borderRadius: 10,
  },
  titleStyle: {
    flexWrap: 'wrap',
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
  },
  descriptionStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    opacity: 0.6,
    flexWrap: 'wrap',
    letterSpacing: 0.04,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  ImageContainer: {
    width: 40,
    height: 40,
    marginRight: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.WHITE,
  },
});

export interface FeedbackInfoCardProps {
  title: string;
  description: string;
  photoUrl?: string;
  imageComponent?: Element;
  style?: StyleProp<ViewStyle>;
}

export const FeedbackInfoCard: React.FC<FeedbackInfoCardProps> = (props) => {
  const { title, description, photoUrl, imageComponent } = props;
  return (
    <TouchableOpacity activeOpacity={0.5} style={[styles.container, props.style]}>
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.ImageContainer}>
          {photoUrl ? (
            <Image
              style={styles.profileImage}
              source={{
                uri: photoUrl,
              }}
              resizeMode={'contain'}
            />
          ) : (
            imageComponent
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.titleStyle}>{title}</Text>
          <Text style={styles.descriptionStyle}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
