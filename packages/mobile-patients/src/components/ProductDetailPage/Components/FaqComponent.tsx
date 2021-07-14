import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PharmaFAQ } from '@aph/mobile-patients/src/helpers/apiCalls';
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';

export interface FaqComponentProps {
  faqs: PharmaFAQ[];
  name: string;
}

interface medicineFaq extends PharmaFAQ {
  showFaq?: boolean;
}

export const FaqComponent: React.FC<FaqComponentProps> = (props) => {
  const { faqs, name } = props;
  const [faqContent, setFaqContent] = useState<medicineFaq[]>(faqs);

  useEffect(() => {
    returnFaqs(false);
  }, []);

  const replaceName = (faq: string) => {
    return faq.replace(/\$name/gi, name);
  };

  const returnFaqs = (showFaqs: boolean) => {
    let faqsText: medicineFaq[] = [];
    setFaqContent([]);
    faqs.forEach((item: PharmaFAQ) => {
      const itemFaq: medicineFaq = {
        field_question: replaceName(item.field_question),
        field_answer: replaceName(item.field_answer),
        showFaq: showFaqs,
      };
      faqsText.push(itemFaq);
      setFaqContent([...faqsText]);
    });
  };

  const renderFaq = (faq: medicineFaq, index: number) => {
    const isLastFaq = faqContent.length === index + 1;
    return (
      <TouchableOpacity
        style={[
          styles.faq,
          {
            borderBottomWidth: isLastFaq ? 0 : 0.8,
            paddingBottom: isLastFaq ? 0 : 10,
          },
        ]}
        onPress={() => {
          let faqs = [];
          faqs = [...faqContent];
          faqs[index].showFaq = !faqs[index].showFaq;
          setFaqContent([...faqs]);
        }}
      >
        <View style={styles.faqContainer}>
          <Text style={styles.faqQuestion}>{faq.field_question}</Text>
          <ArrowRight
            style={{
              transform: [{ rotate: '90deg' }],
            }}
          />
        </View>
        {!!faq.showFaq && <Text style={styles.faqAnswer}>{faq.field_answer}</Text>}
      </TouchableOpacity>
    );
  };

  const renderFaqs = () => {
    return (
      <View>
        {faqContent.map((faq: medicineFaq, index: number) => {
          return renderFaq(faq, index);
        })}
      </View>
    );
  };

  return (
    <View style={styles.cardStyle}>
      <View style={styles.flexRow}>
        <Text style={styles.subHeading}>FAQs</Text>
        <TouchableOpacity onPress={() => returnFaqs(true)}>
          <Text style={styles.subHeading}>Expand all</Text>
        </TouchableOpacity>
      </View>
      {renderFaqs()}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginTop: 10,
  },
  subHeading: theme.viewStyles.text('SB', 17, '#02475B', 1, 25, 0.35),
  flexRow: {
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  faqContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 13,
    paddingBottom: 6,
  },
  faqQuestion: {
    ...theme.viewStyles.text('R', 15, '#02475B', 1, 20),
    width: '90%',
  },
  faqAnswer: theme.viewStyles.text('R', 13, '#02475B', 1, 20),
  faq: {
    borderBottomColor: '#02475B',
    paddingBottom: 10,
  },
});
