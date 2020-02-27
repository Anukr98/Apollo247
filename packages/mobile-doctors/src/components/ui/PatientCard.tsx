import { Star, UserPlaceHolder } from '@aph/mobile-doctors/src/components/ui/Icons';
import PatientCardStyles from '@aph/mobile-doctors/src/components/ui/PatientCard.styles';
import { getPatientLog_getPatientLog_patientInfo } from '@aph/mobile-doctors/src/graphql/types/getPatientLog';
import { isValidImageUrl } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React from 'react';
import {
  ActivityIndicator,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { Image as ImageNative } from 'react-native-elements';

const styles = PatientCardStyles;

export interface CalendarCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  doctorname?: getPatientLog_getPatientLog_patientInfo;
  timing?: string;
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  icon?: Element;
  consults?: string | null;
  lastconsult?: string;
  icon2?: Element;
  typeValue?: boolean;
  revenue?: string;
  onPress?: TouchableOpacityProps['onPress'];
  photoUrl?: string;
}

export const PatientCard: React.FC<CalendarCardProps> = (props) => {
  return (
    <TouchableOpacity style={[styles.containerStyle, props.containerStyle]} onPress={props.onPress}>
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={[styles.imageView, { marginTop: 15 }]}>
            {isValidImageUrl(props.photoUrl) ? (
              <ImageNative
                placeholderStyle={styles.placeHolderLoading}
                PlaceholderContent={
                  <ActivityIndicator animating={true} size="small" color="green" />
                }
                source={{ uri: props.photoUrl }}
                style={styles.imageStyle}
              />
            ) : (
              <UserPlaceHolder style={styles.imageStyle} />
            )}
            {props.typeValue == true ? (
              <Star
                style={{
                  position: 'absolute',
                  height: 16,
                  width: 16,
                  top: 40,
                  right: -10,
                  // top: 141 - 28,
                }}
              />
            ) : null}
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              // marginRight: 12,
              marginBottom: 8,
              marginTop: 16,
              marginLeft: 12,
            }}
          >
            <View style={styles.iconview}>
              <Text style={styles.doctorNameStyles} numberOfLines={1}>
                {props.doctorname}
              </Text>
              <View style={{ marginBottom: 4 }}>{props.icon}</View>
            </View>
            <View style={styles.seperatorline}></View>
            {props.lastconsult && (
              <View style={[styles.iconview, { marginTop: 7, marginBottom: 5 }]}>
                <Text style={styles.lastconsult} numberOfLines={1}>
                  {strings.consult.last_consult}: {props.lastconsult}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', marginBottom: 3 }}>
              {props.revenue && (
                <>
                  <Text style={styles.consultstyles}>
                    {strings.consult.total_revenue} {props.revenue || '-'}
                  </Text>
                  <View
                    style={{
                      height: 12,
                      borderRightWidth: 0.5,
                      borderColor: 'rgba(2, 71, 91, 0.6)',
                      marginHorizontal: 7,
                    }}
                  />
                </>
              )}
              <Text style={styles.consultstyles} numberOfLines={1}>
                {`${props.consults} ${strings.consult.consult}${
                  Number(props.consults) !== 1 ? 's' : ''
                }`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
