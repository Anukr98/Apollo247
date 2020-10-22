import { Selected, UnSelected } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  outerCircleStyle: {
    height: 18,
    width: 18,
    borderRadius: 100,
    borderColor: theme.colors.APP_GREEN,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircleStyle: {
    height: 10,
    width: 10,
    borderRadius: 100,
    backgroundColor: theme.colors.APP_GREEN,
  },
});

export interface RadioButtonsProps {
  data: { label: string; key: string }[];
  setselectedItem: (selectedItem: string) => void;
  selectedItem: string;
  horizontal?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  itemStyle?: StyleProp<ViewStyle>;
  checkStyles?: 'circle' | 'tick';
}

export const RadioButtons: React.FC<RadioButtonsProps> = (props) => {
  const {
    setselectedItem,
    selectedItem,
    data,
    horizontal,
    itemStyle,
    disabled,
    checkStyles,
  } = props;

  const circleOption = (selected: boolean) => {
    return (
      <View style={styles.outerCircleStyle}>
        {selected ? <View style={styles.innerCircleStyle} /> : null}
      </View>
    );
  };

  return (
    <View pointerEvents={disabled ? 'none' : 'auto'}>
      <View
        style={[
          horizontal ? { flexDirection: 'row', alignItems: 'center' } : null,
          { opacity: disabled ? 0.5 : 1 },
          props.containerStyle,
        ]}
      >
        {data.map((item) => (
          <View style={[horizontal ? { flex: 1 } : null, itemStyle]}>
            <TouchableOpacity
              style={[
                {
                  flexDirection: 'row',
                  marginTop: 16,
                  marginBottom: 4,
                },
              ]}
              onPress={() => {
                setselectedItem(item.key);
              }}
              activeOpacity={1}
            >
              {checkStyles === 'circle' ? (
                circleOption(item.key == selectedItem)
              ) : item.key == selectedItem ? (
                <Selected />
              ) : (
                <UnSelected />
              )}
              <Text
                style={{
                  ...theme.viewStyles.text(
                    item.key == selectedItem ? 'B' : 'M',
                    14,
                    theme.colors.SHARP_BLUE,
                    item.key == selectedItem ? 1 : 0.6,
                    undefined,
                    0.02
                  ),
                  marginLeft: 8,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
            {!horizontal && item.key == selectedItem ? props.children : null}
          </View>
        ))}
      </View>
      {horizontal && props.children ? props.children : null}
    </View>
  );
};
