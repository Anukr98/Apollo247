import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { OffToggle, OnToggle } from '@aph/mobile-patients/src/components/ui/Icons';

export interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = (props) => {
  const { onChange, value } = props;
  const [toggleOn, setToggleOn] = useState<boolean>(value || false);
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        onChange && onChange(!toggleOn);
        setToggleOn(!toggleOn);
      }}
    >
      {toggleOn ? (
        <OnToggle style={styles.toggleStyle} />
      ) : (
        <OffToggle style={styles.toggleStyle} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggleStyle: {
    width: 51,
    height: 26,
    marginLeft: 6,
  },
});
