import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Helpers as NeedHelpHelpers } from '@aph/mobile-patients/src/components/NeedHelp';
import { NeedHelpEmailPopup } from '@aph/mobile-patients/src/components/NeedHelpPharmacyOrder/NeedHelpEmailPopup';
import {
  Events,
  Helpers as NeedHelpQueryDetailsHelpers,
} from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ArrowRight, Down } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SEND_HELP_EMAIL, CREATE_HELP_TICKET } from '@aph/mobile-patients/src/graphql/profiles';
import { ORDER_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  SendHelpEmail,
  SendHelpEmailVariables,
} from '@aph/mobile-patients/src/graphql/types/SendHelpEmail';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ListItem } from 'react-native-elements';
import Hyperlink from 'react-native-hyperlink';
import { NavigationScreenProps } from 'react-navigation';
import HTML from 'react-native-render-html';
import {
  TicketNumberMutation,
  TicketNumberMutationVariables,
} from '@aph/mobile-patients/src/graphql/types/TicketNumberMutation';

export interface Props
  extends NavigationScreenProps<{
    queryIdLevel1: string;
    queryIdLevel2: string;
    queryIdLevel3: string;
    queries?: NeedHelpHelpers.HelpSectionQuery[];
    email?: string;
    orderId?: string;
    sourcePage: WebEngageEvents[WebEngageEventName.HELP_TICKET_SUBMITTED]['Source_Page'];
    pathFollowed: string;
  }> {}

export const NeedHelpContentView: React.FC<Props> = ({ navigation }) => {
  const sourcePage = navigation.getParam('sourcePage') || 'My Account';
  const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;
  const queries = navigation.getParam('queries');
  const pathFollowed = navigation.getParam('pathFollowed') || '';
  const queryIdLevel1 = navigation.getParam('queryIdLevel1') || helpSectionQueryId.pharmacy;
  const queryIdLevel2 = navigation.getParam('queryIdLevel2') || helpSectionQueryId.returnOrder;
  const queryIdLevel3 = navigation.getParam('queryIdLevel3') || '';
  const headingTitle = queries?.find((q) => q.id === queryIdLevel1)?.title || 'Query';
  const orderId = navigation.getParam('orderId') || '';
  const issueNotResolvedText = 'My issue is still not resolved';

  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(false);
  const [isOpen, setOpen] = useState(false);
  const [email, setEmail] = useState(navigation.getParam('email') || '');
  const [comments, setComments] = useState<string>('');
  const { saveNeedHelpQuery, getQueryData } = NeedHelpQueryDetailsHelpers;
  const subQueriesData = getQueryData(queries || [], queryIdLevel1, queryIdLevel2, queryIdLevel3);

  const { circlePlanId, circleStatus } = useAppCommonData();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { needHelpToContactInMessage, needHelpTicketReferenceText } = useAppCommonData();

  const renderHeader = () => {
    const onPressBack = () => navigation.goBack();
    const pageTitle = 'HELP';
    return <Header title={pageTitle} leftIcon="backArrow" onPressLeftIcon={onPressBack} />;
  };

  const renderHeading = () => {
    const title = headingTitle;
    const text = `HELP WITH ${title?.toUpperCase()}`;
    return <Text style={styles.heading}>{text}</Text>;
  };

  const renderBreadCrumb = () => {
    const breadCrumb = [
      {
        title: string.needHelp,
      },
      {
        title: headingTitle,
      },
    ];

    return <Breadcrumb links={breadCrumb} containerStyle={styles.breadcrumb} />;
  };

  const ignoreStyles = [
    'line-height',
    'margin-bottom',
    'color',
    'text-align',
    'font-size',
    'font-family',
  ];

  const renderCard = () => {
    const isCircleMember = circlePlanId && circleStatus === 'active';
    const { title, text, cta, ctaNonCircle, ctaCircle, contentType } =
      subQueriesData?.content || {};

    const { title: buttonTitle, appRoute, appRouteParams } =
      cta || (isCircleMember ? ctaCircle : ctaNonCircle) || {};
    const onPressUrl = (url: string) => {
      try {
        Linking.openURL(url);
      } catch (error) {
        CommonBugFender(`${AppRoutes.NeedHelpContentView}-onPressUrl`, error);
      }
    };
    return (
      <View style={styles.card}>
        {!!title && <Text style={styles.cardTitle}>{title}</Text>}
        {!!text && (
          <Hyperlink onPress={(url) => onPressUrl(url)}>
            {contentType?.toUpperCase() === 'HTML' ? (
              <HTML
                html={text}
                onLinkPress={(evt, href) => {
                  Linking.openURL(href);
                }}
                baseFontStyle={styles.cardText}
                ignoredStyles={ignoreStyles}
              />
            ) : (
              <Text style={styles.cardText}>{text}</Text>
            )}
          </Hyperlink>
        )}
        {!!(buttonTitle && appRoute) && (
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => {
              navigation.push(appRoute, { ...appRouteParams });
            }}
          >
            <Text style={styles.cardButtonTitle}>{buttonTitle}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderIssueNotResolved = () => {
    return (
      <View style={styles.card}>
        <ListItem
          containerStyle={styles.listItemContainer}
          titleStyle={styles.listItemTitle}
          onPress={() => setOpen(!isOpen)}
          title={issueNotResolvedText}
          rightIcon={isOpen ? <Down /> : <ArrowRight />}
          Component={TouchableOpacity}
        />
        {isOpen && [
          <TextInputComponent
            value={comments}
            onChangeText={setComments}
            placeholder={string.pleaseProvideMoreDetails}
            conatinerstyles={styles.textInputContainer}
            autoFocus={true}
          />,
          <Text
            onPress={onSubmitShowEmailPopup}
            style={[styles.submit, { opacity: comments ? 1 : 0.5 }]}
          >
            {string.submit.toUpperCase()}
          </Text>,
        ]}
      </View>
    );
  };

  const onSubmitShowEmailPopup = async () => {
    if (!email) {
      setShowEmailPopup(true);
    } else {
      onSubmit(email);
    }
  };

  const onSubmit = async (email: string) => {
    try {
      setLoading!(true);
      const queryOrderId = Number(orderId) || null;
      const parentQuery = queries?.find(({ id }) => id === queryIdLevel1);
      const orderType =
        parentQuery?.id == helpSectionQueryId.pharmacy
          ? ORDER_TYPE.PHARMACY
          : parentQuery?.id == helpSectionQueryId.consult
          ? ORDER_TYPE.CONSULT
          : parentQuery?.id == helpSectionQueryId.diagnostic
          ? ORDER_TYPE.DIAGNOSTICS
          : null;
      const variables: TicketNumberMutationVariables = {
        createHelpTicketHelpEmailInput: {
          category: parentQuery?.title,
          reason: pathFollowed,
          comments: comments,
          patientId: currentPatient?.id,
          email: email,
          orderId: queryOrderId,
          orderType,
        },
      };

      let res = await client.mutate<TicketNumberMutation, TicketNumberMutationVariables>({
        mutation: CREATE_HELP_TICKET,
        variables,
      });

      setLoading!(false);
      onSuccess(res);
      if (orderType && queryOrderId) {
        saveNeedHelpQuery({ orderId: `${queryOrderId}`, orderType, createdDate: new Date() });
      }
      Events.helpTicketSubmitted({
        BU: parentQuery?.title!,
        Reason: issueNotResolvedText,
        Source_Page: sourcePage,
      });
    } catch (error) {
      setLoading!(false);
      onError();
    }
  };

  const onSuccess = (res: any) => {
    let ticket = res?.data?.createHelpTicket?.ticket;
    let ticketNumber = ticket?.ticketNumber;
    let referenceNumberText = ticketNumber
      ? needHelpTicketReferenceText.replace('#ticketNumber', '#' + ticketNumber)
      : '';

    showAphAlert!({
      title: string.common.hiWithSmiley,
      description:
        (needHelpToContactInMessage || string.needHelpSubmitMessage) + '. ' + referenceNumberText,
      unDismissable: true,
      onPressOk: () => {
        hideAphAlert!();

        navigation.navigate(AppRoutes.HelpChatScreen, {
          ticket: ticket,
          level: queryIdLevel2 ? 3 : queryIdLevel1 ? 2 : 1,
        });
      },
    });
  };

  const onError = () => {
    showAphAlert!({
      title: string.common.uhOh,
      description: string.genericError,
    });
  };

  const renderEmailPopup = () => {
    return showEmailPopup ? (
      <NeedHelpEmailPopup
        onRequestClose={() => setShowEmailPopup(false)}
        onBackdropPress={() => setShowEmailPopup(false)}
        onPressSendORConfirm={(textEmail) => {
          setEmail(textEmail);
          setShowEmailPopup(false);
          onSubmit(textEmail);
        }}
      />
    ) : null;
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      <ScrollView>
        {renderBreadCrumb()}
        {renderHeading()}
        {renderCard()}
        {renderIssueNotResolved()}
      </ScrollView>
      {renderEmailPopup()}
    </SafeAreaView>
  );
};

const { text, container, card } = theme.viewStyles;
const { APP_YELLOW, CLEAR, LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  heading: {
    ...text('M', 12, LIGHT_BLUE),
    marginHorizontal: 20,
  },
  card: {
    ...card(),
    marginTop: 10,
  },
  cardButton: {
    backgroundColor: CLEAR,
    paddingVertical: 5,
    alignSelf: 'flex-end',
  },
  cardButtonTitle: {
    ...text('B', 15, APP_YELLOW),
  },
  cardTitle: {
    ...text('M', 15, LIGHT_BLUE),
    marginTop: 5,
  },
  cardText: {
    ...text('R', 13, LIGHT_BLUE),
    marginVertical: 5,
  },
  breadcrumb: {
    marginHorizontal: 20,
  },
  listItemContainer: {
    padding: 0,
  },
  listItemTitle: {
    ...text('M', 15, LIGHT_BLUE),
  },
  textInputContainer: {
    marginTop: 15,
  },
  submit: {
    ...text('B', 14, APP_YELLOW),
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 12,
    marginHorizontal: 5,
  },
});
