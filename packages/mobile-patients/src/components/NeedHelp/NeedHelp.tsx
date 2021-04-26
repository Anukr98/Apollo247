import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  Helpers as NeedHelpHelpers,
  PreviousQuery,
} from '@aph/mobile-patients/src/components/NeedHelp';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  Helpers as NeedHelpQueryDetailsHelpers,
  Query,
} from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DashedLine, GrayEditIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { ArrowRight, RefreshIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import AsyncStorage from '@react-native-community/async-storage';
import HTML from 'react-native-render-html';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  BackHandler,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';
import { getHelpdeskTickets } from '../../graphql/types/getHelpdeskTickets';
import { GET_HELPDESK_TICKETS } from '@aph/mobile-patients/src/graphql/profiles';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import { OrderStatusIndicator } from './OrderStatusIndicator';

const { text } = theme.viewStyles;
const { LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  subViewPopup: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  categoryItemStyle: {
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
    backgroundColor: 'white',
    marginTop: 10,
    marginRight: 20,
  },
  categoryTextStyle: {
    color: '#00b38e',
    padding: 12,
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: -0.36,
  },
  hiTextStyle: {
    marginHorizontal: 20,
    marginTop: 19,
    marginBottom: 8,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  fieldLabel: {
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(18),
    marginVertical: 10,
  },
  email: {
    ...text('L', 15, LIGHT_BLUE),
    marginTop: 10,
    marginBottom: 10,
  },
  categoryWrapper: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  editIcon: { height: 25, width: 25, resizeMode: 'contain' },
  emailInput: { paddingBottom: 5 },
  emailInputContainer: { marginBottom: 10 },
  invisible: { height: 0, width: 0, overflow: 'hidden' },
  ticketsSummaryHeader: {
    backgroundColor: '#E8F5FF',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  previousTextContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 7,
  },
  previousTicketsTextStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansRegular(12),
  },
  clickHereTextStyle: {
    color: '#FC9916',
    ...theme.fonts.IBMPlexSansBold(12),
  },
  orderStatusCard: {
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  orderStatusTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderStatusTitle: {
    color: '#01475B',
    ...theme.fonts.IBMPlexSansBold(14),
    flex: 1,
  },
  orderSubTitle: {
    color: '#67919D',
    ...theme.fonts.IBMPlexSansRegular(12),
  },
  microDotLine: {
    borderWidth: 0.3,
    borderStyle: 'dashed',
    marginTop: 12,
    opacity: 0.3,
    marginHorizontal: -16,
    marginBottom: 5,
    borderRadius: 1,
    borderColor: '#02475B',
  },
  dotLineSeparator: {
    borderStyle: 'dotted',
    height: 1,
    borderLeftWidth: 5,
  },
  orderStatusInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: 50,
    height: 50,
  },
  orderStatusInfo: {
    color: '#00B38E',
    flex: 1,
    ...theme.fonts.IBMPlexSansMedium(10),
  },
  previousTicketsSectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  previousTicketsSectionTitle: {
    color: '#01475B',
    ...theme.fonts.IBMPlexSansBold(12),
    marginVertical: 10,
  },
  plainLine: {
    width: '100%',
    height: 1,
    marginTop: 20,
    marginBottom: 5,
  },
  arrowRight: {
    alignSelf: 'flex-start',
  },
});

export interface Props extends NavigationScreenProps {}

export const NeedHelp: React.FC<Props> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const [email, setEmail] = useState<string>(currentPatient?.emailAddress || '');
  const [queries, setQueries] = useState<NeedHelpHelpers.HelpSectionQuery[]>([]);
  const [isFocused, setFocused] = useState<boolean>(false);
  const [ongoingQuery, setOngoingQuery] = useState<Query>();
  const [emailValidation, setEmailValidation] = useState<boolean>(
    currentPatient?.emailAddress ? true : false
  );
  const { showAphAlert, setLoading } = useUIElements();
  const apolloClient = useApolloClient();
  const { getHelpSectionQueries } = NeedHelpHelpers;
  const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;
  const [showPreviousTickets, setShowPreviousTickets] = useState<boolean>(false);
  const [helpdeskTickets, setHelpdeskTickets] = useState<any>([]);

  const client = useApolloClient();

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const _setEmail = (value: string) => {
    const trimmedValue = (value || '').trim();
    setEmail(trimmedValue);
    setEmailValidation(isSatisfyingEmailRegex(trimmedValue));
  };

  useEffect(() => {
    fetchQueries();
    fetchOngoingQuery();

    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });

    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
      fetchHelpdeskTickets();
    });

    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, []);

  const fetchHelpdeskTickets = () => {
    client
      .query<getHelpdeskTickets>({
        query: GET_HELPDESK_TICKETS,
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setHelpdeskTickets(
          response?.data?.getHelpdeskTickets?.tickets?.sort(function sortFunction(a: any, b: any) {
            var dateA = new Date(a.createdTime).getDate();
            var dateB = new Date(b.createdTime).getDate();
            return dateA > dateB ? -1 : 1;
          })
        );
      })
      .catch((error) => {
        CommonBugFender('fetchHelpdeskTickets', error);
      });
  };

  const fetchQueries = async () => {
    try {
      setLoading?.(true);
      const queries = await getHelpSectionQueries(apolloClient);
      setQueries(queries);
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.genericError,
      });
    }
  };

  const fetchOngoingQuery = async () => {
    try {
      const { getNeedHelpQuery: getTicket } = NeedHelpQueryDetailsHelpers;
      const DISPLAY_TILL_HOURS = 48;
      const ticket = await getTicket();
      if (ticket?.createdDate) {
        const toBeShown =
          moment(new Date()).diff(moment(ticket.createdDate), 'hours') <= DISPLAY_TILL_HOURS;
        toBeShown && setOngoingQuery(ticket);
      }
    } catch (error) {}
  };

  const renderCategory = (
    { title, id }: NeedHelpHelpers.HelpSectionQuery,
    containerStyle?: StyleProp<ViewStyle>
  ) => {
    const onPress = () => onSubmit(id!);
    return (
      <TouchableOpacity
        activeOpacity={1}
        key={id}
        style={[styles.categoryItemStyle, containerStyle]}
        onPress={onPress}
      >
        <Text style={[styles.categoryTextStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmailField = () => {
    return (
      <View>
        <Text style={styles.email}>{'Your email address '}</Text>
        <TextInputComponent
          placeholder={'Enter email address'}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(text: string) => _setEmail(text)}
          icon={!isFocused && <GrayEditIcon style={styles.editIcon} />}
          inputStyle={styles.emailInput}
          conatinerstyles={styles.emailInputContainer}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    );
  };

  const renderContent = () => {
    const whatYouNeedHelp = 'Tell us what you need help with?';
    const toReportAnIssue = 'To report an issue:';

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.fieldLabel}>{toReportAnIssue}</Text>
        {renderEmailField()}
        <Text style={[styles.fieldLabel]}>{whatYouNeedHelp}</Text>
        <View style={styles.categoryWrapper}>{queries.map((item) => renderCategory(item))}</View>
      </View>
    );
  };

  const showAlert = () => {
    showAphAlert!({
      title: `Hi,`,
      description: `Please enter your valid email address`,
    });
  };

  const onSubmit = (helpCategoryId: string) => {
    if (!emailValidation) {
      showAlert();
      return;
    }
    const route =
      helpCategoryId === helpSectionQueryId.pharmacy
        ? AppRoutes.NeedHelpPharmacyOrder
        : helpCategoryId === helpSectionQueryId.consult
        ? AppRoutes.NeedHelpConsultOrder
        : AppRoutes.NeedHelpQueryDetails;
    props.navigation.navigate(route, {
      queries: queries,
      queryIdLevel1: helpCategoryId,
      email: email,
    });
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          title={'NEED HELP'}
          leftIcon="backArrow"
          onPressLeftIcon={() => {
            handleBack();
          }}
        />
      </View>
    );
  };

  // deprecated as now being shown by helpdeskSection Header
  const renderPreviousTicketView = () => {
    return !!ongoingQuery && <PreviousQuery query={ongoingQuery} />;
  };

  const renderTicketsSummaryHeader = () => {
    return helpdeskTickets != null && helpdeskTickets.length > 0 ? (
      <View>
        <View style={styles.ticketsSummaryHeader}>
          {renderOrderStatusCard(helpdeskTickets[0])}

          <View style={styles.previousTextContainerStyle}>
            <Text style={styles.previousTicketsTextStyle}>
              {string.needHelpScreen.view_previous_tickets}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowPreviousTickets(true);
              }}
            >
              <Text style={styles.clickHereTextStyle}>{string.needHelpScreen.click_here}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <DashedLine style={styles.plainLine} />
      </View>
    ) : null;
  };

  const renderOrderStatusCard = (ticket: any) => {

    return (
      <TouchableOpacity
        onPress={() => {
          setShowPreviousTickets(false);
          props.navigation.navigate(AppRoutes.HelpChatScreen, {
            ticket: ticket,
          });
        }}
        style={styles.orderStatusCard}
      >
        <View style={styles.orderStatusTitleContainer}>
          <Text style={styles.orderStatusTitle}>{ticket.subject || ''}</Text>
          <OrderStatusIndicator orderStatus={ticket.statusType} />
          <ArrowRight style={styles.arrowRight} />
        </View>
        <Text style={styles.orderSubTitle}>
          #{ticket.ticketNumber} | Raised on {getDate(ticket.createdTime)}
        </Text>
        {/* This is intentionally commented for future cases  */}
        {/* {ticket.description && (
          <>
            <View style={styles.microDotLine}></View>
            <View style={styles.orderStatusInfoContainer}>
              <HTML html={ticket.description} baseFontStyle={styles.orderStatusInfo} />
              <RefreshIcon />
            </View>
          </>
        )} */}
      </TouchableOpacity>
    );
  };

  const renderPreviousTicketsSection = () => {
    return helpdeskTickets != null && helpdeskTickets.length > 0 ? (
      <View style={styles.previousTicketsSectionContainer}>
        <Text style={styles.previousTicketsSectionTitle}>Previous tickets </Text>

        {helpdeskTickets.map((ticket: any) => {
          return renderOrderStatusCard(ticket);
        })}
      </View>
    ) : null;
  };

  const handleBack = async () => {
    fetchHelpdeskTickets();
    props.navigation.goBack();
    return true;
  };

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <View style={[{ flex: 1 }, !queries?.length && styles.invisible]}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {showPreviousTickets ? (
              renderPreviousTicketsSection()
            ) : (
              <KeyboardAwareScrollView style={styles.subViewPopup} bounces={false}>
                <Text style={styles.hiTextStyle}>{'Hi! :)'}</Text>
                {renderTicketsSummaryHeader()}
                {/* {renderPreviousTicketView()} // deprecated as now being shown by helpdeskSection Header */}
                {renderContent()}
              </KeyboardAwareScrollView>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};
