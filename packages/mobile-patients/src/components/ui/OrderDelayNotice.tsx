import { AppText } from '@aph/mobile-patients/src/components/ui/AppText';
import { NoticeIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

export interface Props {
  title: string;
  description: string;
  containerStyle?: ViewProps['style'];
}

export const OrderDelayNotice: React.FC<Props> = ({ title, description, containerStyle }) => {
  return (
    <View style={[containerStyle]}>
      <View style={[styles.titleContainer]}>
        <NoticeIcon />
        <AppText c="BLUMINE" fw="600" fs={11} lh={15} ml={5}>
          {title}
        </AppText>
      </View>
      <AppText c="BLUE_BAYOUX" fs={11} lh={15} mt={7}>
        {description}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
