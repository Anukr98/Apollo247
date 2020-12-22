import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  Breadcrumb,
  Props as BreadcrumbProps,
} from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { SEND_HELP_EMAIL } from '@aph/mobile-patients/src/graphql/profiles';
import {
  SendHelpEmail,
  SendHelpEmailVariables,
} from '@aph/mobile-patients/src/graphql/types/SendHelpEmail';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { FlatList, ListRenderItemInfo, SafeAreaView, StyleSheet, Text } from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';

export interface Props
  extends NavigationScreenProps<{
    pageTitle?: string;
    breadCrumb: BreadcrumbProps['links'];
    queryCategory: string;
    email: string;
    orderId: string;
    isOrderRelatedIssue: boolean;
  }> {}

export const NeedHelpQueryDetails: React.FC<Props> = ({ navigation }) => {
  const pageTitle = navigation.getParam('pageTitle') || string.help.toUpperCase();
  const queryCategory = navigation.getParam('queryCategory') || '';
  const email = navigation.getParam('email') || '';
  const breadCrumb = navigation.getParam('breadCrumb') || [];
  const orderId = navigation.getParam('orderId') || '';
  const isOrderRelatedIssue = navigation.getParam('isOrderRelatedIssue') || false;
  const queryReasons = getFilteredReasons(queryCategory, isOrderRelatedIssue);
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { needHelpToContactInMessage } = useAppCommonData();

  const [queryIndex, setQueryIndex] = useState<number>();
  const [comments, setComments] = useState<string>('');

  const renderHeader = () => {
    const onPressBack = () => navigation.goBack();
    return <Header title={pageTitle} leftIcon="backArrow" onPressLeftIcon={onPressBack} />;
  };

  const renderBreadCrumb = () => {
    return <Breadcrumb links={breadCrumb} containerStyle={styles.breadcrumb} />;
  };

  const onSuccess = () => {
    showAphAlert!({
      title: string.common.hiWithSmiley,
      description: needHelpToContactInMessage || string.needHelpSubmitMessage,
      unDismissable: true,
      onPressOk: () => {
        hideAphAlert!();
        navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
          })
        );
      },
    });
  };

  const onError = () => {
    showAphAlert!({
      title: string.common.uhOh,
      description: string.genericError,
    });
  };

  const onSubmit = async () => {
    try {
      setLoading!(true);
      const variables: SendHelpEmailVariables = {
        helpEmailInput: {
          category: queryCategory,
          reason: queryReasons[queryIndex!],
          comments: comments,
          patientId: currentPatient?.id,
          email: email,
        },
      };
      await client.query<SendHelpEmail, SendHelpEmailVariables>({
        query: SEND_HELP_EMAIL,
        variables,
      });
      setLoading!(false);
      onSuccess();
    } catch (error) {
      setLoading!(false);
      onError();
    }
  };

  const renderTextInput = () => {
    return [
      <TextInputComponent
        value={comments}
        onChangeText={setComments}
        placeholder={string.weAreSorryWhatWentWrong}
        conatinerstyles={styles.textInputContainer}
        autoFocus={true}
      />,
      <Text onPress={onSubmit} style={[styles.submit, { opacity: comments ? 1 : 0.5 }]}>
        {string.submit.toUpperCase()}
      </Text>,
    ];
  };

  const renderItem = ({ index, item }: ListRenderItemInfo<string>) => {
    const onPress = () => {
      setQueryIndex(index);
      setComments('');
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

const getFilteredReasons = (queryCategory: string, isOrderRelated?: boolean) => {
  const needHelp = AppConfig.Configuration.NEED_HELP;
  const category = needHelp.find(({ category }) => category === queryCategory);
  const queryReasons = category?.options || [];

  return category?.orderRelatedIndices
    ? queryReasons.filter((_, index) =>
        isOrderRelated
          ? (category?.orderRelatedIndices || [])?.indexOf(index) > -1
          : (category?.orderRelatedIndices || [])?.indexOf(index) === -1
      )
    : queryReasons;
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
