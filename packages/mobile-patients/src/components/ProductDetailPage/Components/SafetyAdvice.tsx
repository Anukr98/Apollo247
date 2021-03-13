import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { filterHtmlContent } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface SafetyAdviceProps {
  name: string;
  warning: string;
  iconComponent: React.ReactNode;
}

export const SafetyAdvice: React.FC<SafetyAdviceProps> = (props) => {
  const { name, warning, iconComponent } = props;
  const [numberOfLines, setNumberOfLines] = useState<number>(3);
  const [maxLines, setMaxLines] = useState<number>(3);

  const onTextLayout = (e) => {
    setNumberOfLines(e.nativeEvent.lines.length);
  };

  const replaceName = (string: string) => {
    const warningHtml = filterHtmlContent(string);
    const text = warningHtml.replace(/(<([^>]+)>)/gi, ' ').trim();
    const replacedName = text.replace(/\$name/gi, name);
    return replacedName;
  };

  const content = replaceName(warning);

  return (
    <View style={styles.flexRow}>
      <View style={styles.iconContainer}>
        {iconComponent}
        <Text style={styles.warningHeading}>{name}</Text>
      </View>
      <View style={styles.warningContainer}>
        <Text numberOfLines={maxLines} onTextLayout={onTextLayout} style={styles.contentStyle}>
          {content}
        </Text>
        {numberOfLines > 3 && numberOfLines != maxLines && (
          <Text
            style={styles.readMoreText}
            onPress={() => {
              setMaxLines(numberOfLines);
            }}
          >
            Read more
          </Text>
        )}
        {numberOfLines > 3 && numberOfLines === maxLines && (
          <Text
            style={styles.readMoreText}
            onPress={() => {
              setMaxLines(3);
            }}
          >
            Read less
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  iconContainer: {
    width: '25%',
    alignItems: 'center',
  },
  warningHeading: {
    ...theme.viewStyles.text('R', 15, '#02475B', 1, 20),
    marginTop: 8,
  },
  warningContainer: {
    width: '70%',
    marginLeft: 10,
  },
  contentStyle: theme.viewStyles.text('R', 15, '#02475B', 1, 20),
  readMoreText: {
    ...theme.viewStyles.text('SB', 13, '#02475B', 1, 30),
    textAlign: 'right',
  },
});
