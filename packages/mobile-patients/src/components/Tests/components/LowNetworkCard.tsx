import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { LowNetworkIcon } from '@aph/mobile-patients/src/components/ui/Icons';
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

interface LowNetworkCardProps {
  heading1: string;
  heading2: string;
  buttonTitle: string;
  onPress: () => void;
}

const LowNetworkCard: React.FC<LowNetworkCardProps> = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <LowNetworkIcon style={styles.networkIconStyle} />
        <View style={styles.rightView}>
          <Text style={styles.headingOneText}>{props.heading1}</Text>
          <Text style={styles.headingTwoText}>{props.heading2}</Text>
        </View>
      </View>
      <View style={{ marginVertical: '4%' }}>
        <Button title={props.buttonTitle} style={styles.buttonStyle} onPress={props.onPress} />
      </View>
    </View>
  );
};

export default React.memo(LowNetworkCard);

const styles = StyleSheet.create({
  container: { ...theme.viewStyles.cardViewStyle, padding: 10, margin: 16, paddingBottom: 4 },
  innerContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  networkIconStyle: { height: 72, width: 72, resizeMode: 'contain' },
  headingOneText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
    opacity: 1,
    marginBottom: '3%',
  },
  headingTwoText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansRegular(12),
    opacity: 0.7,
    lineHeight: 18,
  },
  rightView: { width: '76%', paddingHorizontal: 6 },
  buttonStyle: { height: 0.05 * screenHeight, width: 0.35 * screenWidth, alignSelf: 'flex-end' },
});
