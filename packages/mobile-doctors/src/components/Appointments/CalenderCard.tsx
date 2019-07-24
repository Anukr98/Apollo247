import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacityProps,
  View,
  ViewStyle,
  Image,
  ImageStyle,
  ImageSourcePropType,
} from 'react-native';
import { theme } from '../../theme/theme';
import { CapsuleView } from '@aph/mobile-doctors/src/components/ui/CapsuleView';
import { Audio, Video } from '@aph/mobile-doctors/src/components/ui/Icons';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    marginTop: 6,
    marginLeft: 8,
    width: 292,
    marginRight: 20,
    backgroundColor: '#f0f4f5',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.1)',
    borderRadius: 10,
  },
  imageView: {
    margin: 12,
    alignContent: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
  },
  doctorNameStyles: {
    paddingTop: 12,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
  },

  iconview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seperatorline: {
    flexDirection: 'row',
    marginTop: 1,
    borderBottomColor: '#02475b',
    borderBottomWidth: 1,
    marginRight: 16,
    opacity: 0.05,
  },
});

export interface CalenderCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  doctorname?: string;
  timing?: string;
  onPress?: TouchableOpacityProps['onPress'];
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  type?: 'audio' | 'video';
}

export const CalenderCard: React.FC<CalenderCardProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={styles.imageView}>
          <Image
            source={require('../../images/doctor/rahul.png')}
            style={{ height: 44, width: 44 }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.iconview}>
            <Text style={styles.doctorNameStyles}>{props.doctorname}</Text>
            <View style={{ marginTop: 12, marginRight: 15 }}>
              {props.type == 'video' ? <Video /> : <Audio />}
            </View>
          </View>
          <View style={styles.seperatorline}></View>
          <View style={{ marginTop: 5, marginBottom: 5, flexDirection: 'row' }}>
            <CapsuleView diseaseName="FEVER" />

            <CapsuleView diseaseName="COUGH & COLD" containerStyle={{ marginLeft: 6 }} />
          </View>
        </View>
      </View>
    </View>
  );
};
