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
import { TagCard } from '@aph/mobile-doctors/src/components/ui/TagCard';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import CalendarCardStyles from '@aph/mobile-doctors/src/components/Appointments/CalendarCard.styles';

const styles = CalendarCardStyles;

export interface CalendarCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  doctorname?: string;
  timing?: string;
  onPress: (
    doctorId: string,
    patientId: string,
    PatientInfo: object,
    consultTime: string,
    appId: string,
    appintmentdatetime: string,
    appointmentStatus: string
  ) => void;
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  wayOfContact: 'clinic' | 'video';
  status: Appointments['timeslottype'];
  symptoms: string[];
  doctorId?: string;
  patientId?: string;
  isNewPatient: boolean;
  PatientInfo?: Object;
  consultTime?: string;
  appId?: string;
  appintmentdatetime: string;
  appointmentStatus: string;
  showNext?: boolean;
}

export const CalendarCard: React.FC<CalendarCardProps> = (props) => {
  const renderNewTag = () => {
    if (!props.isNewPatient) return null;
    return (
      <View style={styles.newtagWrapperStyle}>
        <TagCard
          label={strings.appointments.new}
          containerStyle={{
            height: 'auto',
            width: 'auto',
            paddingHorizontal: 6,
            paddingVertical: 3,
          }}
          labelStyle={{
            ...theme.fonts.IBMPlexSansBold(8),
          }}
        />
      </View>
    );
  };
  const renderSlotTiming = (timeSlotType: Appointments['timeslottype'], timing: string) => {
    const formatTiming = (timing: string, type: Appointments['timeslottype']) =>
      // `${type == 'missed' ? 'MISSED: ' : type == 'up-next' ? 'UP NEXT: ' : ''}${timing}`;
      `${props.showNext ? strings.appointments.up_next : ''}${timing}`;
    return (
      <Text
        style={[
          {
            color: props.showNext ? '#ff748e' : '#0087ba',
            // : timeSlotType == 'past' || timeSlotType == 'next'
            // ? '#0087ba'
            // : '#890000',
            //   : timeSlotType == 'missed'
            //   ? '#890000'
            //   : '#ff748e',
            lineHeight: 18,
            marginRight: 20,
          },
          // timeSlotType == 'past'
          //   ? theme.fonts.IBMPlexSansMedium(12)
          //   : theme.fonts.IBMPlexSansBold(12),
          theme.fonts.IBMPlexSansBold(12),
        ]}
      >
        {formatTiming(timing, timeSlotType)}
      </Text>
    );
  };
  const containerStyle =
    props.status == 'past' || props.status == 'missed'
      ? {
          borderColor: props.status == 'missed' ? '#e50000' : 'rgba(2, 71, 91, 0.1)',
          // borderColor: 'rgba(2, 71, 91, 0.1)',
          borderWidth: 1,
          backgroundColor: '#f0f4f5',
        }
      : {
          borderColor: props.showNext ? '#ff748e' : '#0087ba',
          borderWidth: 1,
          backgroundColor: '#ffffff',
          shadowColor: colors.CARD_SHADOW_COLOR,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.6,
          shadowRadius: 5,
          elevation: 5,
        };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{ flex: 1 }}
      onPress={() =>
        props.onPress(
          props.doctorId!,
          props.patientId!,
          props.PatientInfo!,
          props.consultTime!,
          props.appId!,
          props.appintmentdatetime!,
          props.appointmentStatus
        )
      }
    >
      {renderSlotTiming(props.status!, props.timing!)}
      <View style={[styles.containerStyle, containerStyle, props.containerStyle]}>
        {renderNewTag()}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={styles.imageView}>
            <Image
              source={require('../../images/doctor/rahul.png')}
              style={{ height: 44, width: 44 }}
            />
          </View>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={styles.iconview}>
              <Text style={styles.doctorNameStyles} numberOfLines={1}>
                {props.doctorname}
              </Text>
              <View style={{ marginTop: 0 /*12*/, marginHorizontal: 15 }}>
                {props.wayOfContact == 'video' ? <Video /> : <Audio />}
              </View>
            </View>
            {props.symptoms.length > 0 && (
              <>
                <View style={styles.seperatorline} />
                <View style={{ marginTop: 5.5, marginBottom: 12, flexDirection: 'row' }}>
                  {props.symptoms &&
                    props.symptoms.map((symptom) => (
                      <CapsuleView diseaseName={symptom} containerStyle={{ marginRight: 6 }} />
                    ))}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
