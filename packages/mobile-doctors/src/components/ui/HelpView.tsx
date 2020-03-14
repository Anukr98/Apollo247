import { styles } from '@aph/mobile-doctors/src/components/ui/HelpView.styles';
import { RoundChatIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React from 'react';
import { Linking, Text, View, StyleProp, ViewStyle } from 'react-native';

export interface HelpViewProps {
  styles?: StyleProp<ViewStyle>;
}

export const HelpView: React.FC<HelpViewProps> = (props) => {
  return (
    <View style={[styles.helpview, props.styles]}>
      <View style={{ marginTop: 4 }}>
        <RoundChatIcon />
      </View>
      <View style={{ marginLeft: 14, flex: 1 }}>
        <Text style={styles.descriptionview}>
          <Text>{strings.common.call}</Text>
          <Text
            style={styles.helptext}
            onPress={() => Linking.openURL(`tel:${strings.common.toll_free_num}`)}
          >
            {' '}
            {strings.common.toll_free_num}{' '}
          </Text>
          <Text>{strings.account.to_make_changes}</Text>
        </Text>
      </View>
    </View>
  );
};
