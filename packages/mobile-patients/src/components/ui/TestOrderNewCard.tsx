import { TestsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    paddingBottom: 12,
    flexDirection: 'row',
  },
  detailsViewStyle: {
    flex: 1,
    marginLeft: 16,
  },
  titleStyle: {
    ...theme.viewStyles.text('M', 16, '#02475b'),
  },
  statusStyle: {
    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
    flex: 1,
    textAlign: 'right',
  },
  dateTimeStyle: {
    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
    marginTop: 8,
    flex: 1,
  },
});

export interface TestOrderNewCardProps {
  orderId: string;
  dateTime: string;
  statusDesc: string;
  isCancelled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TestOrderNewCard: React.FC<TestOrderNewCardProps> = (props) => {
  const renderDetails = () => {
    return (
      <View style={styles.detailsViewStyle}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.titleStyle}>{`#${props.orderId || ''}`}</Text>
          <Text style={styles.statusStyle}>{props.statusDesc || ''}</Text>
        </View>
        <Text style={styles.dateTimeStyle}>{props.dateTime}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        props.onPress();
      }}
      style={[
        styles.containerStyle,
        props.style,
        props.isCancelled ? { backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR } : {},
      ]}
    >
      <TestsIcon style={{ height: 24, width: 24 }} />
      {renderDetails()}
    </TouchableOpacity>
  );
};
