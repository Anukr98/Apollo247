import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  cardContainer: {
    padding: 20,
    paddingTop: 16,
    marginVertical: 4,
    backgroundColor: '#f7f8f5',
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
  },
  leftText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  rightText: {
    color: theme.colors.APP_YELLOW,
    ...theme.fonts.IBMPlexSansSemiBold(13),
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 11,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    padding: 12,
    color: theme.colors.APP_GREEN,
  },
});

export interface filterCardProps extends NavigationScreenProps {
  cardContainer: StyleProp<ViewStyle>;
  data: {
    label: string;
    options: {
      name: string;
    }[];
  }[];
}

export const FilterCard: React.FC<filterCardProps> = (props) => {
  return (
    <View style={{ marginVertical: 20 }}>
      {props.data.map(({ label, options }) => (
        <View style={[styles.cardContainer, props.cardContainer]}>
          <View style={styles.labelView}>
            <Text style={styles.leftText}>{label}</Text>
            <Text style={styles.rightText}>SELECT ALL</Text>
          </View>
          <View style={styles.optionsView}>
            {options.map(({ name }, index: number) => (
              <Button
                title={name}
                style={[
                  styles.buttonStyle,
                  index === 0 ? { backgroundColor: theme.colors.APP_GREEN } : null,
                ]}
                titleTextStyle={[
                  styles.buttonTextStyle,
                  index === 0 ? { color: theme.colors.WHITE } : null,
                ]}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};
