import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Image,
  TouchableOpacity
} from 'react-native';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';

export interface WidgetCardProps {
  data: any;
  onPressWidget: any
}

export const WidgetCard: React.FC<WidgetCardProps> = (props) => {
  const { data, onPressWidget } = props;

    return (
      <TouchableOpacity style={styles.container} onPress={()=>{
        onPressWidget()
      }}>
          <Image source={{uri: data.itemIcon}} style={styles.circleImg}/>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.textStyle}>{data?.itemTitle}</Text>
      </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: {
    width: 95,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems:'center',
    justifyContent:'center',
    paddingVertical:5,
    paddingHorizontal:10,
    margin:5,
    marginHorizontal:10,
    elevation:5
  },
  textStyle: {
    ...theme.viewStyles.text('SB', 14, '#000000', 1, 20, 0),
    width:'100%',
    textAlign:'center',
    padding: 5,
    margin: 5,
  },
  circleImg: {
    width: 65,
    height: 65,
    backgroundColor: '#E8E8E8',
    margin:5,
    // opacity: 0.2,
    borderRadius: 50,
  }
});

