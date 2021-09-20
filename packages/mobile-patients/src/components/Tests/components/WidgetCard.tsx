import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { WidgetLiverIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

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
        {data?.itemTitle}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 95,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 5,
    marginHorizontal: 10,
    elevation: 5,
  },
  textStyle: {
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20, 0),
    width: '100%',
    textAlign: 'center',
    padding: 5,
    margin: 5,
  },
  circleView: {
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: 48,
    height: 48,
    backgroundColor: '#f9f9f9',
    resizeMode: 'contain',
  },
});
