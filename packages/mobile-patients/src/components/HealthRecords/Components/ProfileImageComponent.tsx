import { AccountCircleDarkIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

export interface ProfileImageComponentProps {
  onPressProfileImage: () => void;
  currentPatient: any;
}

export const ProfileImageComponent: React.FC<ProfileImageComponentProps> = (props) => {
  const { onPressProfileImage, currentPatient } = props;
  return (
    <TouchableOpacity activeOpacity={1} onPress={onPressProfileImage}>
      {currentPatient?.photoUrl?.match(
        /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/
      ) ? (
        <Image
          source={{ uri: currentPatient?.photoUrl }}
          style={{ height: 30, width: 30, borderRadius: 15, marginTop: 8 }}
        />
      ) : (
        <AccountCircleDarkIcon
          style={{
            height: 36,
            width: 36,
            borderRadius: 18,
            marginTop: 5,
          }}
        />
      )}
    </TouchableOpacity>
  );
};
