import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { WidgetLiverIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';

const screenWidth = Dimensions.get('window').width;

export interface WidgetCardProps {
  data: any;
  onPressWidget: any;
}

export const WidgetCard: React.FC<WidgetCardProps> = (props) => {
  const { data, onPressWidget } = props;
  const itemIcon = !!data?.itemIcon
    ? data?.itemIcon
    : AppConfig.Configuration.DIAGNOSTIC_DEFAULT_ICON;
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        onPressWidget();
      }}
    >
      <View style={styles.circleView}>
        {itemIcon != '' ? (
          <Image resizeMode={'contain'} source={{ uri: itemIcon }} style={styles.image} />
        ) : (
          <WidgetLiverIcon style={styles.image} resizeMode={'contain'} />
        )}
      </View>
      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.textStyle}>
        {nameFormater(data?.itemTitle, 'default')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth / 4.15,
    backgroundColor: theme.colors.HEX_WHITE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: 5,
    elevation: 5,
    padding: 16,
    paddingLeft: 12,
    paddingRight: 12,
    marginHorizontal: 10,
  },
  textStyle: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 1, 20, 0),
    width: '100%',
    textAlign: 'center',
    paddingVertical: 5,
  },
  circleView: {
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.BGK_GRAY,
  },
  image: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.BGK_GRAY,
    resizeMode: 'contain',
  },
});
