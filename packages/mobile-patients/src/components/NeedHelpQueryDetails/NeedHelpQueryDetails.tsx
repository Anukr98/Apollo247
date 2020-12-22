import {
  Breadcrumb,
  Props as BreadcrumbProps,
} from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { FlatList, ListRenderItemInfo, SafeAreaView, StyleSheet, Text } from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';

export interface Props
  extends NavigationScreenProps<{
    pageTitle?: string;
    breadCrumb: BreadcrumbProps['links'];
    queryCategory: string;
    email: string;
    orderId: string;
  }> {}

export const NeedHelpQueryDetails: React.FC<Props> = ({ navigation }) => {
  const pageTitle = navigation.getParam('pageTitle') || string.help.toUpperCase();
  const queryCategory = navigation.getParam('queryCategory') || '';
  const email = navigation.getParam('email') || '';
  const breadCrumb = navigation.getParam('breadCrumb') || [];
  const orderId = navigation.getParam('orderId') || '';
  const needHelp = AppConfig.Configuration.NEED_HELP;
  const queryReasons = needHelp.find(({ category }) => category === queryCategory)?.options || [];

  const [queryIndex, setQueryIndex] = useState<number>();
  const [comment, setComment] = useState<string>('');

  const renderHeader = () => {
    const onPressBack = () => navigation.goBack();
    return <Header title={pageTitle} leftIcon="backArrow" onPressLeftIcon={onPressBack} />;
  };

  const renderBreadCrumb = () => {
    return <Breadcrumb links={breadCrumb} containerStyle={styles.breadcrumb} />;
  };

  const renderTextInput = () => {
    return [
      <TextInputComponent
        value={comment}
        onChangeText={setComment}
        placeholder={string.weAreSorryWhatWentWrong}
        conatinerstyles={styles.textInputContainer}
      />,
      <Text style={[styles.submit, { opacity: comment ? 1 : 0.5 }]}>
        {string.submit.toUpperCase()}
      </Text>,
    ];
  };

  const renderItem = ({ index, item }: ListRenderItemInfo<string>) => {
    const onPress = () => {
      setQueryIndex(index);
      setComment('');
    };
    return (
      <>
        <Text onPress={onPress} style={styles.flatListItem}>
          {item}
        </Text>
        {index === queryIndex ? renderTextInput() : null}
      </>
    );
  };

  const renderReasons = () => {
    return (
      <FlatList
        data={queryReasons}
        renderItem={renderItem}
        keyExtractor={(_, i) => `${i}`}
        bounces={false}
        removeClippedSubviews={true}
        ItemSeparatorComponent={renderDivider}
        contentContainerStyle={styles.flatListContainer}
      />
    );
  };

  const renderDivider = () => {
    return <Divider style={styles.divider} />;
  };

  const renderHeading = () => {
    const text = orderId
      ? `HELP WITH ORDER #${orderId}`
      : `HELP WITH ${queryCategory.toUpperCase()}`;
    return <Text style={styles.heading}>{text}</Text>;
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderBreadCrumb()}
      {renderHeading()}
      {renderReasons()}
    </SafeAreaView>
  );
};

const { text, container, card } = theme.viewStyles;
const { APP_YELLOW, LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  flatListContainer: {
    ...card(),
    marginTop: 10,
  },
  flatListItem: {
    ...text('M', 14, LIGHT_BLUE),
  },
  breadcrumb: {
    marginHorizontal: 20,
  },
  divider: { marginVertical: 10 },
  heading: {
    ...text('M', 12, LIGHT_BLUE),
    marginHorizontal: 20,
    marginTop: 5,
  },
  textInputContainer: {
    marginTop: 15,
  },
  submit: {
    ...text('B', 13, APP_YELLOW),
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 12,
  },
});
