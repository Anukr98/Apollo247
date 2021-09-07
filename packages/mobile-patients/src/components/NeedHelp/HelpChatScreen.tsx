import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Apollo247Icon, WhatsAppIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { ChatSend } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import { getHelpdeskTickets } from '../../graphql/types/getHelpdeskTickets';
import { GET_HELPDESK_TICKETS } from '@aph/mobile-patients/src/graphql/profiles';
import moment from 'moment';
import {
  HELP_DESK_TICKET_STATUS,
  ORDER_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Dimensions,
  View,
  ActivityIndicator,
  Linking,
  FlatList,
  RefreshControl,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { getHelpdeskTicketConversation } from '@aph/mobile-patients/src/graphql/types/getHelpdeskTicketConversation';
import {
  ADD_COMMENTS_HELPDESK_TICKET,
  GET_HELPDESK_TICKET_CONVERSATION,
  UPDATE_HELPDESK_TICKET,
} from '@aph/mobile-patients/src/graphql/profiles';
import HTML from 'react-native-render-html';
import { OrderStatusIndicator } from './OrderStatusIndicator';
import {
  addCommentHelpdeskTicket,
  addCommentHelpdeskTicketVariables,
} from '../../graphql/types/addCommentHelpdeskTicket';

import { Snackbar } from 'react-native-paper';
import {
  updateHelpdeskTicketVariables,
  updateHelpdeskTicket,
} from '../../graphql/types/updateHelpdeskTicket';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  inputMainContainer: {},
  textInputContainerStyles: {
    flex: 1,
    paddingBottom: 15,
  },
  inputStyles: {
    marginLeft: 20,
    marginTop: 5,
    ...theme.fonts.IBMPlexSansMedium(16),
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
  },
  inputTextLine: {
    marginLeft: 20,
    marginTop: 0,
    height: 2,
    backgroundColor: '#00b38e',
  },
  sendButtonStyles: {
    width: 50,
    margin: 5,
    marginBottom: 20,
  },
  chatFooterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  orderStatusCard: {
    zIndex: 1,
    backgroundColor: '#F7F8F5',
    paddingVertical: 12,
    paddingHorizontal: 36,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
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
  userMessageCard: {
    maxWidth: 240,
    borderRadius: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#F7F8F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  userMessageText: {
    color: '#01475B',
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  messageDateTime: {
    color: '#658F9B',
    ...theme.fonts.IBMPlexSansMedium(10),
    alignSelf: 'flex-end',
    marginHorizontal: 4,
    marginVertical: 2,
  },
  fromHelpdeskMessage: {
    flexDirection: 'row',
    marginLeft: 14,
    margin: 8,
  },
  agentIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    padding: 3,
    borderRadius: 18,
    alignSelf: 'flex-end',
    marginRight: 6,
  },
  agentIcon: {
    width: 32,
    height: 32,
    alignSelf: 'center',
  },

  fromHelpdeskMessageCard: {
    maxWidth: 240,
    borderRadius: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fromHelpdeskMessageText: {
    color: '#0087BA',
    ...theme.fonts.IBMPlexSansMedium(15),
  },

  ticketClosedFooterContainer: {
    alignSelf: 'center',
    margin: 20,
    alignItems: 'center',
  },
  buttonStyles: {
    height: 40,
    width: 180,
    marginTop: 16,
  },
  buttonTitleText: {
    ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24, 0),
  },
  whatsWithUsContainer: {
    flexDirection: 'row',
    margin: 20,
  },
  whatsWithUsText: {
    color: '#FC9916',
    ...theme.fonts.IBMPlexSansSemiBold(11),
    marginHorizontal: 3,
  },
  whatsAppIcon: {
    height: 17,
    width: 17,
    resizeMode: 'contain',
  },
  noConversationTillNow: {
    color: '#FC9916',
    ...theme.fonts.IBMPlexSansRegular(15),
    marginHorizontal: 3,
    alignSelf: 'center',
    marginTop: 50,
  },
  ticketCreationLagTime: {
    color: '#FC9916',
    ...theme.fonts.IBMPlexSansRegular(15),
    marginHorizontal: 3,
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 50,
  },
  chatSend: {
    width: 24,
    height: 24,
    marginTop: 8,
    marginLeft: 14,
  },
  ticketClosedMessage: {
    color: '#0087BA',
    ...theme.fonts.IBMPlexSansRegular(14),
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 10,
  },
});

const BUSINESS = {
  PHARMACY: 'Pharmacy',
  VIRTUAL_CONSULTATION: 'Virtual Consultation',
  PHYSICAL_CONSULTATION: 'Physical Consultation',
  DIAGNOSTICS: 'Diagnostics',
};

export interface HelpChatProps extends NavigationScreenProps {}

export const HelpChatScreen: React.FC<HelpChatProps> = (props) => {
  let ticketId = props.navigation.getParam('ticketId');
  const [ticket, setTicket] = useState<any>(props.navigation.getParam('ticket'));
  const flatListRef = useRef<FlatList<any> | undefined | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>('');
  const [contentHeight, setContentHeight] = useState(40);
  const [isTicketClosed, setIsTicketClosed] = useState<boolean>(
    ticket?.statusType?.toUpperCase() === 'CLOSED' ? true : false
  );
  const [conversations, setConverstions] = useState<any>([]);
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTicketCreationLagMessage, setShowTicketCreationLagMessage] = useState(false);

  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();

  useEffect(() => {
    if (ticketId) {
      // when there is only ticketId
      setShowTicketCreationLagMessage(true);
      setTimeout(() => fetchTicketDetails(), 10000);
    } else {
      if (ticket) {
        getConversation();
      }
    }
  }, []);

  const fetchTicketDetails = () => {
    setShowTicketCreationLagMessage(true);

    client
      .query<getHelpdeskTickets>({
        query: GET_HELPDESK_TICKETS,
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        let correspondingTicket = response?.data?.getHelpdeskTickets?.tickets?.filter(
          (t) => t?.id === ticketId
        )[0];

        if (correspondingTicket) {
          setTicket(correspondingTicket);
          setTimeout(() => getConversation(), 3000);
        } else {
          showAphAlert!({
            title: `Oops :)`,
            description:
              'Your ticket is still being submitted. Please reload this screen by clicking OK, GOT IT',
            onPressOk: () => {
              hideAphAlert!();

              setShowTicketCreationLagMessage(true);
              setTimeout(() => fetchTicketDetails(), 5000);
            },
          });
        }

        setShowTicketCreationLagMessage(false);
      })
      .catch((error) => {
        setShowTicketCreationLagMessage(false);

        CommonBugFender('fetchHelpdeskTickets', error);
      });
  };

  const getConversation = () => {
    setLoading(true);
    setRefreshing(true);
    client
      .query<getHelpdeskTicketConversation>({
        query: GET_HELPDESK_TICKET_CONVERSATION,
        variables: {
          ticketId: ticket?.id || '',
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setLoading(false);
        setRefreshing(false);

        setConverstions(
          response?.data?.getHelpdeskTicketConversation?.conversations?.sort(function sortFunction(
            a: any,
            b: any
          ) {
            var dateA = new Date(a.createdTime).getDate();
            var dateB = new Date(b.createdTime).getDate();
            return dateA > dateB ? 1 : -1;
          })
        );

        setTimeout(() => {
          flatListRef.current! && flatListRef.current!.scrollToEnd();
        }, 700);
      })
      .catch((error) => {
        setLoading(false);
        setRefreshing(false);
        CommonBugFender('HelpChatScreen_getConversation', error);
      });
  };

  const reopenClosedTicket = () => {
    setLoading(true);

    const updateHelpdeskInput = {
      ticketId: ticket?.id || '',
      status: HELP_DESK_TICKET_STATUS.Open,
    };

    client
      .mutate<updateHelpdeskTicket, updateHelpdeskTicketVariables>({
        mutation: UPDATE_HELPDESK_TICKET,
        variables: { updateHelpdeskTicketInput: updateHelpdeskInput },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setLoading(false);
        setIsTicketClosed(false);
        setSnackbarState(true);
      })
      .catch((error) => {
        setLoading(false);
        CommonBugFender('HelpChatScreen_updateHelpdeskTicket', error);
      });
  };

  const addCommentHelpdesk = (userComment: string) => {
    setLoading(true);

    const commentInput = {
      ticketNumber: ticket?.ticketNumber || '',
      ticketId: ticket?.id || '',
      comment: userComment,
    };

    client
      .mutate<addCommentHelpdeskTicket, addCommentHelpdeskTicketVariables>({
        mutation: ADD_COMMENTS_HELPDESK_TICKET,
        variables: { addCommentHelpdeskTicketInput: commentInput },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setLoading(false);
        setMessageText('');

        setConverstions([...conversations, addProxyCommentObject(userComment)]);

        setTimeout(() => {
          flatListRef.current! && flatListRef.current!.scrollToEnd();
        }, 500);

        showCommentConfirmationAlert();
      })
      .catch((error) => {
        setLoading(false);
        CommonBugFender('HelpChatScreen_addCommentHelpdesk', error);
      });
  };

  const showCommentConfirmationAlert = () => {
    showAphAlert!({
      title: `Hi :)`,
      description: AppConfig.Configuration.Helpdesk_Chat_Confim_Msg,
    });
  };

  const addProxyCommentObject = (userComment: string) => {
    return {
      comment: userComment,
      commenterName: 'info',
      commenterType: 'END_USER',
      contentType: 'text/html',
      createdTime: new Date().getTime(),
      id: '',
      type: 'thread',
    };
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          title={'HELP'}
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
      </View>
    );
  };

  const renderOrderStatusHeader = () => {
    return (
      <View style={styles.orderStatusCard}>
        <View style={styles.orderStatusTitleContainer}>
          <Text style={styles.orderStatusTitle}>{ticket?.subject || ''}</Text>
          <OrderStatusIndicator orderStatus={ticket?.statusType} />
        </View>
        <Text style={styles.orderSubTitle}>
          #{ticket?.ticketNumber} | Raised on {getDate(ticket?.createdTime)}
        </Text>
      </View>
    );
  };

  const renderChatRow = (conversation: any, index: number) => {
    if (conversation.commenterType == 'END_USER') {
      return (
        <View style={styles.userMessageCard}>
          <HTML html={conversation.comment} baseFontStyle={styles.userMessageText} />
          <Text style={styles.messageDateTime}>{getDate(conversation.createdTime)}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.fromHelpdeskMessage}>
          <View style={styles.agentIconContainer}>
            <Apollo247Icon style={styles.agentIcon} />
          </View>
          <View style={styles.fromHelpdeskMessageCard}>
            <HTML html={conversation.comment} baseFontStyle={styles.fromHelpdeskMessageText} />
            <Text style={styles.messageDateTime}>{getDate(conversation.createdTime)}</Text>
          </View>
        </View>
      );
    }
  };

  const renderReopenTicket = () => {
    var reopenCTADisabled: boolean = false;
    let showWhatsappCTA: boolean = false;

    if (ticket?.closedTime) {
      var closedTime = moment(ticket?.closedTime);
      var nowTime = moment(new Date());
      var duration = moment.duration(nowTime.diff(closedTime)).asHours();

      var reopenHelpTicketMaxTime = AppConfig.Configuration.Reopen_Help_Max_Time || 24;
      if (duration > reopenHelpTicketMaxTime) {
        reopenCTADisabled = true;
      }

      if (duration <= 24) {
        showWhatsappCTA = true;
      }
    }

    return (
      <View style={styles.ticketClosedFooterContainer}>
        <Button
          title={string.needHelpScreen.reopen_ticket}
          style={styles.buttonStyles}
          disabled={reopenCTADisabled}
          titleTextStyle={styles.buttonTitleText}
          onPress={() => {
            reopenClosedTicket();
          }}
        />
        {reopenCTADisabled ? (
          <Text style={styles.ticketClosedMessage}>
            This ticket is closed , if you still have issues in this order, please open a new
            ticket.
          </Text>
        ) : null}
        {showWhatsappCTA ? renderWhatsapp() : null}
      </View>
    );
  };

  const renderWhatsapp = () => {
    return (
      <View>
        {ticket?.customFields?.Business == BUSINESS.PHARMACY ||
        ticket?.customFields?.Business == BUSINESS.VIRTUAL_CONSULTATION ||
        ticket?.customFields?.Business == BUSINESS.PHYSICAL_CONSULTATION ||
        ticket?.customFields?.Business == BUSINESS.DIAGNOSTICS ? (
          <TouchableOpacity style={styles.whatsWithUsContainer} onPress={() => onPressWhatsApp()}>
            <WhatsAppIcon style={styles.whatsAppIcon} />
            <Text style={styles.whatsWithUsText}>{string.needHelpScreen.whatsapp_with_us}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const onPressWhatsApp = async () => {
    try {
      let phoneNumber = '';
      let message = '';

      if (ticket?.customFields?.Business == BUSINESS.PHARMACY) {
        phoneNumber = '914041894343';
        message = `I want to know the status of my Help_ticket , Ticket Number : ${ticket?.ticketNumber}`;
      } else if (ticket?.customFields?.Business == BUSINESS.VIRTUAL_CONSULTATION) {
        phoneNumber = '918047104009';
        message = `I want to know the status of my VC_Help_ticket  , Ticket Number :  ${ticket?.ticketNumber}`;
      } else if (ticket?.customFields?.Business == BUSINESS.PHYSICAL_CONSULTATION) {
        phoneNumber = '918047104009';
        message = `I want to know the status of my PC_Help_ticket , Ticket Number:  ${ticket?.ticketNumber}`;
      } else if (ticket?.customFields?.Business == BUSINESS.DIAGNOSTICS) {
        phoneNumber = '914048218743';
        message = `I want to know the status of my Help_ticket , Ticket Number :  ${ticket?.ticketNumber}`;
      }

      const whatsAppScheme = `whatsapp://send?text=${message}&phone=${phoneNumber}`;
      const canOpenURL = await Linking.canOpenURL(whatsAppScheme);
      canOpenURL && Linking.openURL(whatsAppScheme);
    } catch (error) {
      CommonBugFender('HelpChatScreen_onPressWhatsApp', error);
    }
  };

  const renderChatView = () => {
    return (
      <View style={{ width: width, marginTop: 0, flex: 1 }}>
        <FlatList
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          ref={(ref) => (flatListRef.current = ref)}
          contentContainerStyle={{
            marginTop: 0,
          }}
          data={conversations || []}
          renderItem={({ item, index }) => renderChatRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => getConversation()} />
          }
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialNumToRender={conversations ? conversations.length : 0}
          ListFooterComponent={() => {
            if (isTicketClosed) {
              return renderReopenTicket();
            } else {
              return <View style={{ height: 0 }}></View>;
            }
          }}
        />
      </View>
    );
  };

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {!showTicketCreationLagMessage ? renderOrderStatusHeader() : null}

        {loading ? (
          <ActivityIndicator style={{ flex: 1, alignItems: 'center' }} size="large" color="green" />
        ) : (
          <View style={[{ flex: 1 }]}>
            {!showTicketCreationLagMessage &&
              (conversations == null || conversations.length == 0) && (
                <Text style={styles.noConversationTillNow}>
                  {string.needHelpScreen.no_conversation_till_now}
                </Text>
              )}

            {showTicketCreationLagMessage ? (
              <View style={{ marginTop: 300 }}>
                <ActivityIndicator
                  style={{ flex: 1, alignItems: 'center' }}
                  size="large"
                  color="green"
                />
                <Text style={styles.ticketCreationLagTime}>
                  {string.needHelpScreen.ticket_creation_lag_time}
                </Text>
              </View>
            ) : null}

            {!showTicketCreationLagMessage ? renderChatView() : null}
          </View>
        )}

        {!isTicketClosed && !showTicketCreationLagMessage && (
          <View style={styles.chatFooterContainer}>
            <View style={styles.textInputContainerStyles}>
              <TextInput
                autoCorrect={false}
                placeholder="Type here…"
                multiline={true}
                style={[styles.inputStyles, { height: Math.max(40, contentHeight) }]}
                onContentSizeChange={(event) => {
                  setContentHeight(event.nativeEvent.contentSize.height);
                }}
                numberOfLines={6}
                value={messageText}
                blurOnSubmit={false}
                onChangeText={(value) => {
                  setMessageText(value);
                }}
                editable={!isTicketClosed}
              />
              <View style={styles.inputTextLine} />
            </View>

            <TouchableOpacity
              activeOpacity={1}
              style={[styles.sendButtonStyles, { opacity: isTicketClosed ? 0.5 : 1 }]}
              onPress={async () => {
                if (!isTicketClosed) {
                  const textMessage = messageText.trim();
                  if (textMessage.length == 0) {
                    Alert.alert('Apollo', 'Please write something to send message.');
                    return;
                  }
                  addCommentHelpdesk(textMessage);
                }
              }}
            >
              <ChatSend style={styles.chatSend} />
            </TouchableOpacity>
          </View>
        )}

        <Snackbar
          style={{ position: 'absolute', zIndex: 1001, bottom: 100 }}
          visible={snackbarState}
          onDismiss={() => {
            setSnackbarState(false);
          }}
          duration={3000}
        >
          Ticket reopened,please add a comment to describe futher.
        </Snackbar>
      </SafeAreaView>
    </View>
  );
};
