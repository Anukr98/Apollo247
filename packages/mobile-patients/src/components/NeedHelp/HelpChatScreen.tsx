import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Apollo247Icon, WhatsAppIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { ChatSend } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import { ORDER_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  CommonBugFender,
  DeviceHelper,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Text,
  Platform,
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
} from '@aph/mobile-patients/src/graphql/profiles';
import HTML from 'react-native-render-html';
import { OrderStatusIndicator } from './OrderStatusIndicator';
import {
  addCommentHelpdeskTicket,
  addCommentHelpdeskTicketVariables,
} from '../../graphql/types/addCommentHelpdeskTicket';

import { Snackbar } from 'react-native-paper';

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
  chatSend: {
    width: 24,
    height: 24,
    marginTop: 8,
    marginLeft: 14,
  },
});

export interface HelpChatProps extends NavigationScreenProps {}

export const HelpChatScreen: React.FC<HelpChatProps> = (props) => {
  let ticket = props.navigation.getParam('ticket');
  let query = props.navigation.getParam('query');
  const flatListRef = useRef<FlatList<any> | undefined | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>('');
  const [contentHeight, setContentHeight] = useState(40);
  const [isTicketClosed, setIsTicketClosed] = useState<boolean>(
    ticket.statusType.toUpperCase() === 'CLOSED' ? true : false
  );
  const [conversations, setConverstions] = useState<any>([]);
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const { isIphoneX } = DeviceHelper();
  const [refreshing, setRefreshing] = useState(false);

  const [heightList, setHeightList] = useState<number>(
    isIphoneX() ? height - 166 : Platform.OS === 'ios' ? height - 141 : height - 141
  );

  const client = useApolloClient();

  useEffect(() => {
    getConversation();
  }, []);

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
    setIsTicketClosed(false);
    setSnackbarState(true);
  };

  const addCommentHelpdesk = (userComment: string) => {
    setLoading(true);

    const commentInput = {
      ticketNumber: ticket?.ticketNumber || '',
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
      })
      .catch((error) => {
        setLoading(false);
        CommonBugFender('HelpChatScreen_addCommentHelpdesk', error);
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
          <Text style={styles.orderStatusTitle}>{ticket.subject || ''}</Text>
          <OrderStatusIndicator orderStatus={ticket.statusType} />
        </View>
        <Text style={styles.orderSubTitle}>
          #{ticket.ticketNumber} | Raised on {getDate(ticket.createdTime)}
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
    return (
      <View style={styles.ticketClosedFooterContainer}>
        <Button
          title={string.needHelpScreen.reopen_ticket}
          style={styles.buttonStyles}
          titleTextStyle={styles.buttonTitleText}
          onPress={() => {
            reopenClosedTicket();
          }}
        />

        <TouchableOpacity style={styles.whatsWithUsContainer} onPress={() => onPressWhatsApp()}>
          <WhatsAppIcon style={styles.whatsAppIcon} />
          <Text style={styles.whatsWithUsText}>{string.needHelpScreen.whatsapp_with_us}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const onPressWhatsApp = async () => {
    try {
      const order = query.orderType === ORDER_TYPE.CONSULT ? 'Appointment' : 'Order';
      const chatPreFilledMessage = `I want to know the status of my Help_Ticket regarding ${order} ID - ${query.orderId}`;
      const phoneNumber = query.orderType === ORDER_TYPE.CONSULT ? '8047104009' : '4041894343';
      const whatsAppScheme = `whatsapp://send?text=${chatPreFilledMessage}&phone=91${phoneNumber}`;
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
        {renderOrderStatusHeader()}

        {loading ? (
          <ActivityIndicator style={{ flex: 1, alignItems: 'center' }} size="large" color="green" />
        ) : (
          <View style={[{ flex: 1 }]}>
            {(conversations == null || conversations.length == 0) && (
              <Text style={styles.noConversationTillNow}>
                {string.needHelpScreen.no_conversation_till_now}
              </Text>
            )}
            {renderChatView()}
          </View>
        )}

        {!isTicketClosed && (
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
          style={{ position: 'absolute', zIndex: 1001, bottom: -10 }}
          visible={snackbarState}
          onDismiss={() => {
            setSnackbarState(false);
          }}
          duration={4000}
        >
          Please add a comment to reopen ticket : {ticket.subject}
        </Snackbar>
      </SafeAreaView>
    </View>
  );
};
