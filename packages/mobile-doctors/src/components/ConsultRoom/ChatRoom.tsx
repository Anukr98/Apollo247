import { ChatRoomStyles } from '@aph/mobile-doctors/src/components/ConsultRoom/ChatRoom.styles';
import {
  AttachmentIcon,
  ChatCallIcon,
  ChatSend,
  FileBig,
  MissedCallIcon,
  RoundChatIcon,
  UserPlaceHolder,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { getPrismUrls } from '@aph/mobile-doctors/src/helpers/clientCalls';
import { messageCodes } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image, Image as ImageNative } from 'react-native-elements';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';

const { height, width } = Dimensions.get('window');

const styles = ChatRoomStyles;

export interface ChatRoomProps extends NavigationScreenProps {
  messages: any[];
  send: (messageText: any) => void;
  flatListRef: React.MutableRefObject<FlatList<never> | null | undefined>;
  setShowPDF: Dispatch<SetStateAction<boolean>>;
  setPatientImageshow: Dispatch<SetStateAction<boolean>>;
  isDropdownVisible: boolean;
  setDropdownVisible: Dispatch<SetStateAction<boolean>>;
  setUrl: Dispatch<SetStateAction<string>>;
  patientDetails: GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails | null | undefined;
  extendedHeader?: boolean;
  patientId: string;
  messageText: string;
  setMessageText: React.Dispatch<React.SetStateAction<string>>;
}
export const ChatRoom: React.FC<ChatRoomProps> = (props) => {
  // const [isDropdownVisible, setDropdownVisible] = useState(false);
  let leftComponent = 0;
  let rightComponent = 0;
  const client = useApolloClient();
  const { setLoading } = useUIElements();
  const { patientDetails } = props;
  const Appintmentdatetime = props.navigation.getParam('Appintmentdatetime');
  const doctorId = props.navigation.getParam('DoctorId');
  const patientId = props.patientId || props.navigation.getParam('PatientId');
  const [hideSend, setHideSend] = useState<boolean>(true);
  const iPhoneHeight = isIphoneX() ? 45 : Platform.OS === 'ios' ? -6 : 0;

  const patientImage = patientDetails && (
    <Image style={styles.imageStyle} source={{ uri: patientDetails.photoUrl || '' }} />
  );
  const { messages, messageText, setMessageText, flatListRef } = props;
  const [keyboardHeight, setKeyBoardHeight] = useState<number>(0);

  const keyboardDidShow = async (e: KeyboardEvent) => {
    setKeyBoardHeight((e.endCoordinates.height || 0) + (isIphoneX() ? -40 : 0));
    setTimeout(() => {
      flatListRef.current && flatListRef.current.scrollToEnd();
    }, 200);
  };

  const keyboardDidHide = async () => {
    setKeyBoardHeight(0);
  };

  useEffect(() => {
    // callAbandonmentCall();
    setTimeout(() => {
      flatListRef.current && flatListRef.current.scrollToEnd();
    }, 1000);
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardDidShow
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardDidHide
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current && flatListRef.current.scrollToEnd();
    }, 200);
  }, [messages]);

  const openPopUp = (rowData: any) => {
    setLoading && setLoading(true);
    if (rowData.url.match(/\.(pdf)$/) || (rowData.fileType && rowData.fileType === 'pdf')) {
      if (rowData.prismId) {
        getPrismUrls(client, rowData.id, rowData.prismId)
          .then((data: any) => {
            props.setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch(() => {
            props.setUrl(rowData.url);
          })
          .finally(() => {
            setLoading && setLoading(false);
            props.setShowPDF(true);
          });
      } else {
        props.setUrl(rowData.url);
        setLoading && setLoading(false);
        props.setShowPDF(true);
      }
    } else if (
      rowData.url.match(/\.(jpeg|jpg|gif|png)$/) ||
      (rowData.fileType && rowData.fileType === 'image')
    ) {
      if (rowData.prismId) {
        getPrismUrls(client, rowData.id, rowData.prismId)
          .then((data: any) => {
            props.setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch(() => {
            props.setUrl(rowData.url);
          })
          .finally(() => {
            setLoading && setLoading(false);
            props.setPatientImageshow(true);
          });
      } else {
        props.setUrl(rowData.url);
        setLoading && setLoading(false);
        props.setPatientImageshow(true);
      }
    } else {
      if (rowData.prismId) {
        getPrismUrls(client, rowData.id, rowData.prismId)
          .then((data: any) => {
            Linking.openURL((data && data.urls[0]) || rowData.url).catch((err) =>
              console.error('An error occurred', err)
            );
          })
          .catch(() => {
            Linking.openURL(rowData.url).catch((err) => console.error('An error occurred', err));
          })
          .finally(() => {
            setLoading && setLoading(false);
            // props.setPatientImageshow(true);
          });
      } else {
        setLoading && setLoading(false);
        Linking.openURL(rowData.url).catch((err) => console.error('An error occurred', err));
      }
    }
  };

  const convertChatTime = (timeStamp: any) => {
    let utcString;
    if (timeStamp.messageDate) {
      utcString = moment(Number(timeStamp.timetoken) / 10000).calendar('', {
        sameDay: 'hh:mm A',
        nextDay: '[Tomorrow], hh:mm A',
        nextWeek: 'DD MMM YYYY, hh:mm A',
        lastDay: '[Yesterday], hh:mm A',
        lastWeek: 'DD MMM YYYY, hh:mm A',
        sameElse: 'DD MMM YYYY,  hh:mm A',
      });
    }
    return utcString ? utcString : '--';
  };

  const renderCommonImageView = (rowData: any, isMatched: boolean, onPress: () => void) => {
    return (
      <View style={styles.automatedMainContianer}>
        <TouchableOpacity onPress={onPress} activeOpacity={1}>
          <View style={styles.imageMainContainer}>
            {isMatched ? (
              <ImageNative
                placeholderStyle={styles.imagePlaceHolderStyle}
                PlaceholderContent={
                  <Spinner
                    style={{ backgroundColor: 'transparent' }}
                    message={strings.common.imageLoading}
                  />
                }
                source={{
                  uri: rowData.url,
                }}
                style={styles.documentImageStyle}
              />
            ) : (
              <FileBig style={styles.documentImageStyle} />
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.chatTimeTextContainer}>
          <Text style={styles.chatTimeText2}>{convertChatTime(rowData)}</Text>
        </View>
      </View>
    );
  };

  const renderImageView = (rowData: any) => {
    const isMatched =
      rowData.url.match(/\.(jpeg|jpg|gif|png)$/) ||
      (rowData.fileType && rowData.fileType === 'image');
    return renderCommonImageView(rowData, isMatched, () => {
      if (isMatched) {
        openPopUp(rowData);
        props.setPatientImageshow(true);
      } else {
        openPopUp(rowData);
      }
    });
  };

  const renderAutomatedText = (rowData: any) => {
    if (rowData.automatedText) {
      return (
        <View style={styles.automatedMainContianer}>
          <View style={styles.automatedTextView}>
            <Text style={styles.automatedLeftText}>{rowData.automatedText}</Text>
            <Text style={styles.automatedRightText}>{convertChatTime(rowData)}</Text>
          </View>
        </View>
      );
    }
  };

  const messageView = (rowData: any, index: number) => {
    return (
      <View style={styles.automatedMainContianer}>
        <View style={styles.messageTextContainer}>
          <Text style={styles.messageTextStyle}>
            {rowData.message === messageCodes.exotelCall
              ? `A Telephonic Voice call is initiated from ${rowData.exotelNumber ||
                  strings.exoTel.exotelNumber}. Request you to answer the call.`
              : rowData.message}
          </Text>
          <View style={styles.chatTimeTextContainer}>
            <Text style={styles.chatTimeText2}>{convertChatTime(rowData)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCallView = (rowData: any, isPatient: boolean) => {
    return (
      <View>
        {rowData.duration === '00 : 00' ? (
          <View style={styles.missedCallMainContainer}>
            <View style={styles.missedCallContiner}>
              <View style={styles.missedCallIconContiner}>
                <MissedCallIcon style={styles.missedCallIcon} />
                <Text style={styles.missedCallText}>
                  {rowData.message === 'Audio call ended'
                    ? isPatient
                      ? strings.consult_room.you_missed_voice_call
                      : strings.consult_room.patient_missed_voice_call
                    : isPatient
                    ? strings.consult_room.you_missed_video_call
                    : strings.consult_room.patient_missed_video_call}
                </Text>
              </View>
              <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.callContainer}>
            <ChatCallIcon />
            <View style={styles.callTextContainer}>
              <Text style={styles.callHeadingText}>{rowData.message}</Text>
              <Text style={styles.callSubHeadingText}>
                {strings.consult_room.duration} - {rowData.duration}
              </Text>
              <Text style={styles.chatTimeText}>{convertChatTime(rowData)}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderChatRow = (
    rowData: {
      id: string;
      message: string;
      duration: string;
      automatedText?: string;
    },
    index: number
  ) => {
    if (
      !rowData.message ||
      ((rowData.message &&
        [
          messageCodes.typingMsg,
          messageCodes.endCallMsg,
          messageCodes.audioCallMsg,
          messageCodes.videoCallMsg,
          messageCodes.acceptedCallMsg,
          messageCodes.rescheduleconsult,
          messageCodes.followupconsult,
          messageCodes.appointmentComplete,
          messageCodes.firstMessage,
          messageCodes.secondMessage,
          messageCodes.covertVideoMsg,
          messageCodes.covertAudioMsg,
          messageCodes.callAbandonment,
          messageCodes.stopConsultMsg,
          messageCodes.jdThankyou,
          messageCodes.cancelConsultInitiated,
          messageCodes.autoResponse,
          messageCodes.leaveChatRoom,
          messageCodes.patientJoined,
          messageCodes.patientRejected,
        ].includes(rowData.message)) ||
        JSON.stringify(messageCodes.patientRejected) === JSON.stringify(rowData))
    ) {
      return null;
    }
    const isPatientMessage = rowData.id === patientId;
    leftComponent = isPatientMessage ? leftComponent + 1 : 0;
    rightComponent = isPatientMessage ? 0 : rightComponent + 1;
    return (
      <View
        style={
          isPatientMessage
            ? { alignItems: 'flex-start', marginVertical: 2 }
            : { alignItems: 'flex-end', marginVertical: 2 }
        }
      >
        {leftComponent === 1 || rightComponent === 1 ? (
          <View style={styles.messagePadding} />
        ) : null}
        {leftComponent === 1 ? (
          patientDetails && patientDetails.photoUrl ? (
            patientImage
          ) : (
            <UserPlaceHolder style={styles.imageStyle} />
          )
        ) : null}
        {rowData.message === 'Audio call ended' || rowData.message === 'Video call ended'
          ? renderCallView(rowData, isPatientMessage)
          : rowData.message === messageCodes.consultPatientStartedMsg ||
            rowData.message === messageCodes.firstMessage ||
            rowData.message === messageCodes.secondMessage ||
            rowData.message === messageCodes.languageQue ||
            rowData.message === messageCodes.startConsultjr ||
            rowData.message === messageCodes.stopConsultJr ||
            rowData.message === messageCodes.startConsultMsg
          ? renderAutomatedText(rowData)
          : rowData.message === messageCodes.imageconsult
          ? renderImageView(rowData)
          : messageView(rowData, index)}
      </View>
    );
  };

  const renderChatView = () => {
    return (
      <View
        style={{
          width: width,
          height: props.extendedHeader
            ? height - 238 - iPhoneHeight - keyboardHeight
            : height - 200 - iPhoneHeight - keyboardHeight,
          marginTop: 0,
          backgroundColor: '#f0f4f5',
        }}
      >
        {messages.length != 0 ? (
          <FlatList
            ref={(ref) => (flatListRef.current = ref)}
            contentContainerStyle={styles.flatListContainerStyle}
            removeClippedSubviews={false}
            bounces={false}
            data={messages}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => renderChatRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
            numColumns={1}
            ListFooterComponent={() => {
              return <View style={{ height: 8 }} />;
            }}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          />
        ) : (
          <View style={styles.noChatContainer}>
            <View style={styles.noChatIconContainer}>
              <RoundChatIcon />
            </View>
            <Text style={styles.noChatTextStyle}>
              {`${strings.consult_room.your_appnt_with} ${patientDetails &&
                patientDetails.firstName} ${strings.consult_room.is_scheduled_to_start} ${moment(
                Appintmentdatetime
              ).format('hh.mm A')}`}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const onSubmitText = (text?: string) => {
    const textMessage = text ? text.trim() : messageText.trim();
    if (textMessage.length == 0) {
      Alert.alert(strings.common.apollo, strings.consult_room.Please_write_something);
      return;
    }
    props.send(textMessage);
    setMessageText('');
    flatListRef.current && flatListRef.current!.scrollToEnd();
  };
  const renderChatInput = () => {
    return (
      <View style={styles.chatInputMainContainer}>
        <View style={styles.chatInputSubContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={async () => {
              props.setDropdownVisible(!props.isDropdownVisible);
            }}
          >
            <View style={styles.chatAttachIconContainer}>
              {hideSend ? (
                <Text style={theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE)}>Attach</Text>
              ) : null}
              <AttachmentIcon size="sm" />
            </View>
          </TouchableOpacity>
          <View style={styles.chatInputContainer}>
            <View style={{ flex: 1 }}>
              <TextInput
                autoCorrect={false}
                placeholder={strings.smartPrescr.type_here}
                multiline={true}
                style={{
                  minHeight: 40,
                  ...theme.fonts.IBMPlexSansMedium(16),
                  padding: 0,
                  paddingBottom: hideSend ? 0 : 12,
                }}
                value={messageText}
                blurOnSubmit={false}
                onChangeText={(value) => {
                  setMessageText(value);
                  flatListRef.current && flatListRef.current.scrollToEnd();
                  props.setDropdownVisible(false);
                }}
                onFocus={() => {
                  props.setDropdownVisible(false);
                  setHideSend(false);
                }}
                onBlur={() => {
                  setHideSend(true);
                }}
                underlineColorAndroid={theme.colors.TRANSPARENT}
                selectionColor={theme.colors.APP_GREEN}
              />
            </View>
            {!hideSend ? (
              <View style={{ height: 40 }}>
                <TouchableOpacity
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  activeOpacity={1}
                  onPress={() => {
                    onSubmitText();
                  }}
                >
                  <ChatSend />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {renderChatView()}
      {renderChatInput()}
    </View>
  );
};
