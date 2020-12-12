import { ArrowRight, DriveWayIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ListItem, ListItemProps } from 'react-native-elements';

interface Props extends ListItemProps {}

export const BuyAgainSection: React.FC<Props> = ({ onPress }) => {
  const subtitle = (
    <View style={styles.subtitleContainer}>
      <Text style={styles.subtitleStyle}>{string.buyAgain}</Text>
      <ArrowRight />
    </View>
  );

  return (
    <ListItem
      title={string.lookingForBoughtPreviously}
      subtitle={subtitle}
      leftAvatar={<DriveWayIcon style={styles.icon} />}
      pad={20}
      containerStyle={styles.containerStyle}
      titleStyle={styles.titleStyle}
      subtitleStyle={styles.subtitleStyle}
      onPress={onPress}
    />
  );
};

const { text, card } = theme.viewStyles;
const { APP_YELLOW, LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  containerStyle: {
    ...card(),
    marginVertical: 0,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  titleStyle: {
    ...text('SB', 16, LIGHT_BLUE),
  },
  subtitleContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitleStyle: {
    ...text('SB', 12, APP_YELLOW),
  },
  icon: {
    height: 80,
    width: 67,
  },
});
