import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState, useRef } from 'react';

import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Down, Up } from '@aph/mobile-patients/src/components/ui/Icons';
import HTML from 'react-native-render-html';

const styles = StyleSheet.create({
  faqTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
  },
  faqContainer: {
    ...theme.viewStyles.cardViewStyle,
    padding: 20,
    marginHorizontal: 5,
  },
  faqItemContainer: {
    marginVertical: 12,
    flexDirection: 'row',
  },
  faqQuestion: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
    marginRight: 22,
    marginLeft: 0,
  },
  faqAnswer: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE),
    marginTop: 8,
    opacity: 0.8,
  },
  howDoesItWorkSeparator: {
    height: 0.5,
    marginVertical: 10,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.25,
  },
});

interface ConsultPackageFAQProps {
  faq: any;
}

export const ConsultPackageFAQ: React.FC<ConsultPackageFAQProps> = (props) => {
  const [faq, setFaq] = useState<[]>(props.faq || []);

  useEffect(() => {
    let arr: any[] = [];
    for (let index = 0; index < faq.length; index++) {
      const elem: any = faq[index];
      const updatedElem = { ...elem, isCollapsed: false };
      arr.push(updatedElem);
    }

    setFaq(arr);
  }, []);

  const expandFaqItem = (collapseChangeIndex: number, isCollapsed: boolean) => {
    let arr: any[] = [];

    for (let index = 0; index < faq.length; index++) {
      const elem: any = faq[index];
      if (index == collapseChangeIndex) {
        elem.isCollapsed = isCollapsed;
      }
      arr.push(elem);
    }
    setFaq(arr);
  };

  return (
    <View style={styles.faqContainer}>
      <Text style={styles.faqTitle}>FREQUENTLY ASKED QUESTIONS</Text>
      <View style={styles.howDoesItWorkSeparator} />

      {faq?.map((faqItem: any, index: number) => (
        <View style={styles.faqItemContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.faqQuestion}>
              {faqItem?.FaqQuestion || faqItem?.question || ''}
            </Text>

            {faqItem?.isCollapsed ? (
              <HTML
                html={faqItem?.FaqAnswer || faqItem?.answer || ''}
                baseFontStyle={styles.faqAnswer}
                ignoredStyles={[
                  'line-height',
                  'margin-bottom',
                  'color',
                  'text-align',
                  'font-size',
                  'font-family',
                ]}
              />
            ) : null}
          </View>

          {faqItem?.isCollapsed ? (
            <TouchableOpacity
              style={{}}
              onPress={() => {
                expandFaqItem(index, false);
              }}
            >
              <Up />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{}}
              onPress={() => {
                expandFaqItem(index, true);
              }}
            >
              <Down />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};
