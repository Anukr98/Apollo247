import DoctorCardStyles from '@aph/mobile-doctors/src/components/ProfileSetup/DoctorCard.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { DotIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { INVITEDSTATUS } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React, { useState } from 'react';
import {
  ImageStyle,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';

const styles = DoctorCardStyles;

export interface DoctorCardProps {
  doctorId?: string;
  inviteStatus?: INVITEDSTATUS;
  doctorName?: string;
  specialization?: string;
  image?: string;
  imageStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  experience?: string;
  education?: string;
  location?: string;
  time?: string;
  onPress?: TouchableOpacityProps['onPress'];
  isMenuOpen?: boolean;
  onRemove?: (id: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const [isMenuHidden, setisMenuHidden] = useState<boolean>(false);

  return (
    <View style={styles.doctorView}>
      <TouchableOpacity activeOpacity={1} onPress={() => isMenuHidden && setisMenuHidden(false)}>
        <View style={styles.doctorCardView}>
          <View style={styles.doctorCardView}>
            <View style={styles.doctorImgView}>
              <View style={styles.imageView}>
                <FastImage
                  style={styles.imageStyle}
                  source={require('../../images/doctor/rahul.png')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.iconview}>
                  <Text style={styles.doctorNameStyles} numberOfLines={1}>
                    {strings.common.dr} {props.doctorName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setisMenuHidden(!isMenuHidden)}
                    style={{ flex: 0.2 }}
                  >
                    <DotIcon style={styles.imageremovestyles} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.doctorSpecializationStyles}>
                  {props.specialization ? props.specialization + ' | ' : ''}
                  {props.experience} {strings.common.yrs}
                </Text>
                <Text style={styles.educationTextStyles}>{props.education}</Text>
                <Text style={styles.doctorLocation}>{props.location}</Text>
              </View>
            </View>
          </View>
        </View>
        {isMenuHidden ? (
          <View style={styles.removebuttonview}>
            <Button
              onPress={() => {
                setisMenuHidden(false);
                props.onRemove(props.doctorId);
              }}
              title={strings.common.remove}
              titleTextStyle={styles.titleTextStyle}
              style={[styles.containerStyles]}
            />
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};
