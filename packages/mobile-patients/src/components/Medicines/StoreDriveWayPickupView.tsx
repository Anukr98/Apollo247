import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DriveWayIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const styles = StyleSheet.create({
  touchContainerView: { backgroundColor: '#f7f8f5', alignItems: 'center' },
  containerView: {
    width: '86%',
  },
  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    width: 82,
    height: 15,
    borderRadius: 2,
  },
  buttonTitle: { ...theme.viewStyles.text('M', 9, '#fff') },
});

export interface StoreDriveWayPickupViewProps {
  onPress: () => void;
}

export const StoreDriveWayPickupView: React.FC<StoreDriveWayPickupViewProps> = (props) => {
  const renderRow1 = () => (
    <View style={[styles.rowView, { marginTop: 10 }]}>
      <Text style={{ ...theme.viewStyles.text('M', 12, '#01475b') }}>Don’t want to wait ?</Text>
      <DriveWayIcon style={{ height: 29, width: 82 }} />
    </View>
  );

  const renderRow2 = () => (
    <View style={[styles.rowView, { marginBottom: 9 }]}>
      <Text style={{ ...theme.viewStyles.text('SB', 13, '#01475b') }}>
        Opt for our driveway pickup
      </Text>
      <Button
        style={styles.button}
        titleTextStyle={styles.buttonTitle}
        title="KNOW MORE"
        onPress={props.onPress}
      />
    </View>
  );

  return (
    <TouchableOpacity activeOpacity={0.5} style={styles.touchContainerView} onPress={props.onPress}>
      <View style={styles.containerView}>
        {renderRow1()}
        {renderRow2()}
      </View>
    </TouchableOpacity>
  );
};
