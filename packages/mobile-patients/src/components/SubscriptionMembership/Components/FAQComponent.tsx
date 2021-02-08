import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  TextStyle,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';

export interface FAQComponentProps {
  data?: any;
  headingText?: string;
  headingStyle?: TextStyle;
  questionStyle?: TextStyle;
  answerStyle?: TextStyle;
  headerSeparatorStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  arrowStyle?: ImageStyle;
  horizontalLine?: ViewStyle;
}

export const FAQComponent: React.FC<FAQComponentProps> = (props) => {
  const faq = props.data;
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [previousIndex, setPreviousIndex] = useState<number>(-1);

  const renderQuestions = () => {
    return faq.map((value: any, index: number) => {
      return (
        <View>
          <TouchableOpacity
            style={styles.questionContainer}
            activeOpacity={0.7}
            onPress={() => {
              setActiveIndex(index);
              index != -1
                ? index == previousIndex
                  ? setPreviousIndex(-1)
                  : setPreviousIndex(activeIndex)
                : null;
            }}
          >
            <Text style={props.questionStyle}>
              {props.data ? value?.faqQuestion : value.question}
            </Text>
            <ArrowRight
              style={[
                props.arrowStyle,
                {
                  transform: [
                    {
                      rotate: !!(previousIndex != -1 && index === previousIndex)
                        ? '90deg'
                        : !!(activeIndex === index)
                        ? '270deg'
                        : '90deg',
                    },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
          {!!(previousIndex != -1 && index === previousIndex) ? (
            <></>
          ) : activeIndex === index ? (
            <Text style={props.answerStyle}>{props.data ? value?.faqAnswer : value.answer}</Text>
          ) : (
            <></>
          )}
          {faq.length - 1 !== index && <View style={props.horizontalLine} />}
        </View>
      );
    });
  };

  return (
    <View style={[styles.container, props.containerStyle]}>
      <Text style={props.headingStyle}>{props.headingText}</Text>
      <View style={props.headerSeparatorStyle} />
      {renderQuestions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  faqHeading: {
    ...theme.viewStyles.text('R', 14, '#02475B', 1, 20, 0.35),
    marginTop: 10,
  },
  horizontalLine: {
    marginVertical: 20,
    borderTopColor: '#02475B',
    opacity: 0.3,
    borderTopWidth: 1,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    ...theme.viewStyles.text('M', 14, '#01475B', 1, 24, 0.35),
    marginBottom: 10,
    width: '80%',
  },
  faqAnswer: {
    ...theme.viewStyles.text('L', 12, '#01475B', 1, 16, 0.35),
  },
});

FAQComponent.defaultProps = {
  data: Circle.FAQ,
  headingText: 'FREQUENTLY ASKED QUESTIONS',
  headingStyle: styles.faqHeading,
  questionStyle: styles.faqQuestion,
  answerStyle: styles.faqAnswer,
  headerSeparatorStyle: styles.horizontalLine,
  horizontalLine: styles.horizontalLine,
};
