import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Image
} from 'react-native';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';

export interface WidgetCardProps {
  onPress?: () => void;
  isCircleSubscribed: boolean;
  style?: ViewStyle;
  showSeparator?: boolean;
  loading?: boolean;
  data: any;
  isServiceable?: boolean;
  isVertical: boolean;
  columns?: number;
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  source: string;
  sourceScreen: string;
}

export const WidgetCard: React.FC<WidgetCardProps> = (props) => {
  const { cartItems, addCartItem, removeCartItem } = useDiagnosticsCart();
  const { data, isCircleSubscribed, source, navigation, sourceScreen } = props;

    return (
      <View style={styles.container}>
          <Image source={data.image} style={styles.circleImg}/>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.textStyle}>{data?.text}</Text>
      </View>
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

