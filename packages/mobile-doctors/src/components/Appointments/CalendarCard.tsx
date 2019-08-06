import { CapsuleView } from '@aph/mobile-doctors/src/components/ui/CapsuleView';
import { Audio, Video } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Appointments } from '@aph/mobile-doctors/src/helpers/commonTypes';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/theme';
import { colors } from '@aph/mobile-doctors/src/theme/colors';

const styles = StyleSheet.create({
  containerStyle: {
    marginTop: 6,
    marginLeft: 8,
    marginRight: 20,
    marginBottom: 20,
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
    flex: 1,
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

export interface CalendarCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  doctorname?: string;
  timing: string;
  onPress: (id: string) => void;
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  wayOfContact?: 'audio' | 'video';
  type: Appointments['timeslottype'];
  symptoms?: string[];
}

export const CalendarCard: React.FC<CalendarCardProps> = (props) => {
  const renderSlotTiming = (timeSlotType: Appointments['timeslottype'], timing: string) => {
    const formatTiming = (timing: string, type: Appointments['timeslottype']) =>
      `${type == 'missed' ? 'MISSED: ' : type == 'up-next' ? 'UP NEXT: ' : ''}${timing}`;
    return (
      <Text
        style={[
          {
            color:
              timeSlotType == 'past' || timeSlotType == 'next'
                ? '#0087ba'
                : timeSlotType == 'missed'
                ? '#890000'
                : '#ff748e',
            lineHeight: 18,
            marginLeft: 8,
            marginRight: 20,
          },
          timeSlotType == 'past'
            ? theme.fonts.IBMPlexSansMedium(12)
            : theme.fonts.IBMPlexSansBold(12),
          ,
        ]}
      >
        {formatTiming(timing, timeSlotType)}
      </Text>
    );
  };
  const containerStyle =
    props.type == 'past' || props.type == 'missed'
      ? {
          borderColor: 'rgba(2, 71, 91, 0.1)',
          borderWidth: 1,
          backgroundColor: '#f0f4f5',
        }
      : {
          borderColor: '#0087ba',
          borderWidth: 1,
          backgroundColor: '#ffffff',
          shadowColor: colors.CARD_SHADOW_COLOR,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.6,
          shadowRadius: 5,
          elevation: 5,
        };
  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={() => props.onPress('')}>
      {renderSlotTiming(props.type, props.timing!)}
      <View style={[styles.containerStyle, containerStyle, props.containerStyle]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={styles.imageView}>
            <Image
              source={require('../../images/doctor/rahul.png')}
              style={{ height: 44, width: 44 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.iconview}>
              <Text style={styles.doctorNameStyles} numberOfLines={1}>
                {props.doctorname}
              </Text>
              <View style={{ marginTop: 12, marginHorizontal: 15 }}>
                {props.wayOfContact == 'video' ? <Video /> : <Audio />}
              </View>
            </View>
            <View style={styles.seperatorline}></View>
            <View style={{ marginTop: 5.5, marginBottom: 12, flexDirection: 'row' }}>
              {props.symptoms &&
                props.symptoms.map((symptom) => (
                  <CapsuleView diseaseName={symptom} containerStyle={{ marginRight: 6 }} />
                ))}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
