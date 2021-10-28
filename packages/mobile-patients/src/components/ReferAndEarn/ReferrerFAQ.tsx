import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FlatList, NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { FaqDownArrow, FaqRightArrow } from '../ui/Icons';

interface FAQType {
  id: number;
  question: string;
  answer: string;
}
export interface RefererFAQProps extends NavigationScreenProps {}

export const RefererFAQ: React.FC<RefererFAQProps> = (props) => {
  const { navigation } = props;
  const [openIndexId, setOpenIndex] = useState(0);

  const renderFaqItem = (item: FAQType) => {
    return (
      <View style={styles.faqItemContainer}>
        <TouchableOpacity
          onPress={() => {
            setOpenIndex(openIndexId == item.id ? 0 : item.id);
          }}
        >
          <View style={styles.faqArrowTextContainer}>
            <Text style={styles.faqQuestion}>{item.question}</Text>

            {openIndexId == item.id ? <FaqDownArrow /> : <FaqRightArrow />}
          </View>
        </TouchableOpacity>

        {openIndexId == item.id && (
          <View style={styles.faqAnswerContainer}>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        )}
        <View style={styles.faqHorizontalLine} />
      </View>
    );
  };

  const renderFAQList = () => {
    return (
      <View style={styles.faqMainListContainer}>
        <FlatList
          data={string.referAndEarn.refererFAQs}
          renderItem={({ item }) => renderFaqItem(item)}
        />
      </View>
    );
  };

  const referralFAQHeading = () => {
    return (
      <View style={styles.faqHeadingContainer}>
        <Text style={styles.faqHeading}>{string.referAndEarn.referralFaqHeading}</Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.SHERPA_BLUE} />
      <SafeAreaView style={styles.container}>
        <Header
          leftIcon="backArrow"
          title="FAQ's"
          onPressLeftIcon={() => navigation.goBack()}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <ScrollView>
          {referralFAQHeading()}
          {renderFAQList()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  faqMainListContainer: {
    padding: 20,
  },
  faqItemContainer: {
    marginBottom: 5,
  },
  faqArrowTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    color: theme.colors.BLACK_COLOR,
    fontWeight: '700',
    width: '90%',
  },
  faqAnswerContainer: {
    marginTop: 10,
  },
  faqAnswer: {
    letterSpacing: 1,
    fontSize: 14,
  },
  faqHorizontalLine: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.LIGHT_GRAY_2,
    marginVertical: 15,
  },
  faqHeadingContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  faqHeading: {
    fontSize: 22,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '700',
  },
});
