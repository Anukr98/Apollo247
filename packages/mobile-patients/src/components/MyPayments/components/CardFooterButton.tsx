/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

interface CardFooterButtonProps {
  buttonTitle: string;
  onPressAction: () => void;
}
const CardFooterButton: FC<CardFooterButtonProps> = (props) => {
  const { buttonTitle, onPressAction } = props;
  return (
    <View style={styles.buttonContainer}>
      <Button style={{ width: '80%' }} title={buttonTitle} onPress={onPressAction} />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
});

export default CardFooterButton;
