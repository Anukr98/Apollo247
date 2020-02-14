import { Selected, UnSelected } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface RadioButtonsProps {
  data: { label: string; key: string }[];
  setselectedItem: (selectedItem: string) => void;
  selectedItem: string;
  horizontal?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const RadioButtons: React.FC<RadioButtonsProps> = (props) => {
  const { setselectedItem, selectedItem, data, horizontal } = props;

  // const [selectedItemChildren, setselectedItemChildren] = useState<ReactNode>(
  //   data.length ? data[0].children : null
  // );

  return (
    <View pointerEvents={props.disabled ? 'none' : 'auto'}>
      <View
        style={[
          horizontal ? { flexDirection: 'row', alignItems: 'center' } : null,
          props.containerStyle,
        ]}
      >
        {data.map((item) => (
          <View style={horizontal ? { flex: 1 } : null}>
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
                // setselectedItemChildren(item.children);
              }}
            >
              {item.key == selectedItem ? <Selected /> : <UnSelected />}
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
