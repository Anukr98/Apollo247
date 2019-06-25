import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  headerView: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  titleStyles: {
    color: theme.colors.INPUT_TEXT,
    textAlign: 'left',
    ...theme.fonts.IBMPlexSansMedium(15),
    letterSpacing: 0,
  },
});

export interface sectionHeaderProps {
  style: StyleProp<ViewStyle>;
  sectionTitle: string;
}

export const SectionHeaderComponent: React.FC<sectionHeaderProps> = (props) => {
  return (
    <View style={[styles.headerView, props.style]}>
      <Text style={styles.titleStyles}>{props.sectionTitle}</Text>
    </View>
  );
};
