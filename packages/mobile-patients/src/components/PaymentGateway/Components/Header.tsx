import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  BackArrow,
  BackArrowWhite,
  Remove,
  HomeIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
export interface HeaderProps {
  amount: number;
  onPressLeftIcon?: TouchableOpacityProps['onPress'];
}
const windowWidth = Dimensions.get('window').width;

export const Header: React.FC<HeaderProps> = (props) => {
  const { amount } = props;

  const renderHeader = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity activeOpacity={0.5} onPress={props.onPressLeftIcon}>
          <BackArrow style={styles.icon} />
        </TouchableOpacity>
        <View style={styles.subCont}>
          <Text style={styles.amount}>Amount to be Paid</Text>
          <Text style={styles.amount}>₹{amount}</Text>
        </View>
      </View>
    );
  };
  return <View style={styles.container}>{renderHeader()}</View>;
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: 56,
    borderColor: '#D4D4D4',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    width: windowWidth,
  },
  subCont: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 12,
  },
  amount: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    lineHeight: 20,
    color: '#01475B',
  },
  icon: {
    height: 16,
    width: 24,
  },
});
