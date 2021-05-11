import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface WidgetCardProps {
  data: any;
  onPressWidget: any;
}

export const WidgetCard: React.FC<WidgetCardProps> = (props) => {
  const { data, onPressWidget } = props;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        onPressWidget();
      }}
    >
      <View style={styles.circleView}>
        <Image resizeMode={'contain'} source={{ uri: data?.itemIcon }} style={styles.image} />
      </View>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.textStyle}>
        {nameFormater(data?.itemTitle, 'default')}
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
  circleImg: {
    width: 65,
    height: 65,
    backgroundColor: '#E8E8E8',
    margin: 5,
    // opacity: 0.2,
    borderRadius: 50,
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
    width: 50,
    height: 50,
    backgroundColor: '#f9f9f9',
  },
});
