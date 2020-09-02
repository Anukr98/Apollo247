import {
  AttachmentIcon,
  ChatCallIcon,
  ChatSend,
  DoctorPlaceholderImage,
  FileBig,
  Mascot,
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
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image, Image as ImageNative } from 'react-native-elements';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  imageStyle: {
    width: 32,
    height: 32,
    position: 'absolute',
    borderRadius: 16,
    bottom: 0,
    left: 0,
    top: 0,
  },
  automatedLeftText: {
    ...theme.viewStyles.text('M', 15, theme.colors.WHITE),
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 16,
    textAlign: 'left',
  },
  automatedRightText: {
    ...theme.viewStyles.text('M', 10, theme.colors.WHITE),
    paddingHorizontal: 16,
    paddingVertical: 4,
    textAlign: 'right',
  },
  automatedTextView: {
    backgroundColor: '#0087ba',
    marginLeft: 38,
    borderRadius: 10,
  },
});
export interface ChatRoomProps extends NavigationScreenProps {
  setChatReceived: Dispatch<SetStateAction<boolean>>;
  messages: never[];
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
      utcString = moment(timeStamp.messageDate).calendar('', {
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
      <View>
        <TouchableOpacity onPress={onPress} activeOpacity={1}>
          <View
            style={{
              backgroundColor: 'transparent',
              width: 180,
              height: 180,
              borderRadius: 10,
              marginVertical: 2,
              flex: 1,
              marginBottom: isMatched ? 4 : 0,
              top: isMatched ? 5 : 0,
            }}
          >
            {isMatched ? (
              <ImageNative
                placeholderStyle={{
                  height: 180,
                  width: '100%',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}
                PlaceholderContent={
                  <Spinner
                    style={{
                      backgroundColor: 'transparent',
                    }}
                  />
                }
                source={{
                  uri: rowData.url,
                }}
                style={{
                  resizeMode: 'center',
                  width: 180,
                  height: 180,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}
              />
            ) : (
              <FileBig
                style={{
                  resizeMode: 'contain',
                  width: 180,
                  height: 180,
                  borderRadius: 10,
                }}
              />
            )}
            <View
              style={{
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                backgroundColor: 'white',
              }}
            >
              <Text
                style={{
                  color: 'rgba(2,71,91,0.6)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  textAlign: 'right',
                  ...theme.fonts.IBMPlexSansMedium(10),
                }}
              >
                {convertChatTime(rowData)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderImageView = (rowData: any) => {
    const isMatched =
      rowData.url.match(/\.(jpeg|jpg|gif|png)$/) ||
      (rowData.fileType && rowData.fileType === 'image');
    const onPress = () => {
      if (isMatched) {
        openPopUp(rowData);
        props.setPatientImageshow(true);
      } else {
        openPopUp(rowData);
        // setShowWeb(true);
      }
    };

    return renderCommonImageView(rowData, isMatched, onPress);
  };

  const renderAutomatedText = (rowData: any, style = {}) => (
    <View style={[styles.automatedTextView, style]}>
      {rowData.automatedText ? (
        <>
          <Text style={styles.automatedLeftText}>{rowData.automatedText}</Text>
          <Text style={styles.automatedRightText}>{convertChatTime(rowData)}</Text>
          <View
            style={{
              backgroundColor: 'transparent',
              height: 4,
              width: 20,
            }}
          />
        </>
      ) : null}
    </View>
  );

  const patientAutomatedMessage = (rowData: any, index: number) => {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          borderRadius: 10,
          marginVertical: 2,
          alignSelf: 'flex-start',
        }}
      >
        {leftComponent === 1 && (
          <View style={styles.imageStyle}>
            <Mascot style={styles.imageStyle} />
          </View>
        )}
        {renderAutomatedText(rowData, { marginBottom: 4 })}
      </View>
    );
  };

  const doctorAutomatedMessage = (rowData: any, index: number) => {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          borderRadius: 10,
          marginVertical: 2,
          alignSelf: 'flex-start',
        }}
      >
        {leftComponent === 1 && (
          <View style={styles.imageStyle}>
            <Mascot style={styles.imageStyle} />
          </View>
        )}
        {renderAutomatedText(rowData, { marginBottom: 4, width: 244 })}
      </View>
    );
  };

  const messageView = (rowData: any, index: number) => {
    const isMatched =
      (rowData.url && rowData.url.match(/\.(jpeg|jpg|gif|png)$/)) ||
      (rowData.fileType && rowData.fileType === 'image');
    // const isMatched = rowData.url.match(/\.(jpeg|jpg|gif|png)$/);
    const onPress = () => {
      if (isMatched) {
        openPopUp(rowData);
      }
    };
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          maxWidth: rowData.message !== null ? '85%' : 0,
          borderRadius: 10,
          marginVertical: -2,
          // alignSelf: 'flex-start',
        }}
      >
        {leftComponent === 1 && (
          <View style={styles.imageStyle}>
            <DoctorPlaceholderImage style={styles.imageStyle} />
          </View>
        )}
        <View>
          {rowData.message === messageCodes.imageconsult ? (
            renderCommonImageView(rowData, isMatched, onPress)
          ) : rowData.message === '^^#startconsultJr' ? (
            renderAutomatedText(rowData)
          ) : rowData.message === '^^#startconsult' ? (
            renderAutomatedText(rowData)
          ) : rowData.message === messageCodes.stopConsultJr ? (
            renderAutomatedText(rowData)
          ) : (
            <>
              <View
                style={{
                  backgroundColor: 'white',
                  marginLeft: 38,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: '#0087ba',
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 3,
                    ...theme.fonts.IBMPlexSansMedium(16),
                    textAlign: 'left',
                  }}
                >
                  {rowData.message === messageCodes.exotelCall
                    ? `A Telephonic Voice call is initiated from ${rowData.exotelNumber ||
                        strings.exoTel.exotelNumber}. Request you to answer the call.`
                    : rowData.message}
                </Text>
                <Text
                  style={{
                    color: 'rgba(2,71,91,0.6)',
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {convertChatTime(rowData)}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: 'transparent',
                  height: 4,
                  width: 20,
                }}
              />
            </>
          )}
        </View>
      </View>
    );
  };

  let leftComponent = 0;
  let rightComponent = 0;

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
        messageCodes.startConsultMsg,
        messageCodes.stopConsultMsg,
        messageCodes.jdThankyou,
        messageCodes.cancelConsultInitiated,
        messageCodes.autoResponse,
        messageCodes.leaveChatRoom,
        messageCodes.patientJoined,
        messageCodes.patientRejected,
      ].includes(rowData.message) ||
      JSON.stringify(messageCodes.patientRejected) === JSON.stringify(rowData)
    ) {
      return null;
    }
    if (rowData.id === patientId) {
      leftComponent++;
      rightComponent = 0;
      return (
        <View>
          {leftComponent === 1 ? (
            <View
              style={{
                backgroundColor: 'transparent',
                width: width,
                marginVertical: 8,
              }}
            />
          ) : null}
          {rowData.message === 'Audio call ended' || rowData.message === 'Video call ended' ? (
            <>
              {rowData.duration === '00 : 00' ? (
                <View
                  style={{
                    backgroundColor: 'transparent',
                    width: 282,
                    borderRadius: 10,
                    marginVertical: 2,
                    alignSelf: 'flex-end',
                    paddingVertical: 17,
                  }}
                >
                  {leftComponent === 1 ? (
                    patientDetails && patientDetails.photoUrl ? (
                      patientImage
                    ) : (
                      <UserPlaceHolder style={styles.imageStyle} />
                    )
                  ) : null}
                  <View
                    style={{
                      marginLeft: 40,
                      borderRadius: 10,
                      height: 29,
                      width: 244,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: '#e50000',
                        opacity: 0.04,
                        width: 244,
                        borderRadius: 10,
                        height: 29,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: 'transparent',
                        alignItems: 'center',
                      }}
                    >
                      <MissedCallIcon
                        style={{
                          width: 16,
                          height: 16,
                          marginLeft: 16,
                          marginTop: 3,
                        }}
                      />
                      <Text
                        style={{
                          color: '#890000',
                          marginLeft: 27,
                          textAlign: 'left',
                          ...theme.fonts.IBMPlexSansMedium(12),
                          lineHeight: 24,
                          letterSpacing: 0.04,
                          marginTop: 2,
                        }}
                      >
                        {rowData.message === 'Audio call ended'
                          ? strings.consult_room.you_missed_voice_call
                          : strings.consult_room.you_missed_video_call}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: 'transparent',
                    borderRadius: 10,
                    marginVertical: 2,
                  }}
                >
                  {leftComponent === 1 ? (
                    patientDetails && patientDetails.photoUrl ? (
                      patientImage
                    ) : (
                      <UserPlaceHolder style={styles.imageStyle} />
                    )
                  ) : null}
                  <View
                    style={{
                      borderRadius: 10,
                      marginVertical: 2,
                      alignSelf: 'flex-start',
                      flexDirection: 'row',
                      marginLeft: 40,
                    }}
                  >
                    <ChatCallIcon />
                    <View
                      style={{
                        marginLeft: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: '#01475b',
                          marginLeft: 0,
                          textAlign: 'left',
                          ...theme.fonts.IBMPlexSansMedium(14),
                        }}
                      >
                        {rowData.message}
                      </Text>
                      <Text
                        style={{
                          color: '#01475b',
                          marginTop: 2,
                          marginLeft: 0,
                          textAlign: 'left',
                          ...theme.fonts.IBMPlexSansMedium(10),
                        }}
                      >
                        {strings.consult_room.duration} - {rowData.duration}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View
              style={{
                backgroundColor: 'transparent',
                width: 282,
                borderRadius: 10,
                marginVertical: 2,
                alignSelf: 'flex-start',
              }}
            >
              {leftComponent === 1 ? (
                patientDetails && patientDetails.photoUrl ? (
                  patientImage
                ) : (
                  <UserPlaceHolder style={styles.imageStyle} />
                )
              ) : null}
              <View
                style={{
                  backgroundColor: rowData.message === messageCodes.imageconsult ? '' : 'white',
                  marginLeft: 38,
                  borderRadius: 10,
                  // width: 244,
                }}
              >
                {rowData.message === messageCodes.imageconsult ? (
                  renderImageView(rowData)
                ) : (
                  <Text
                    style={{
                      color: '#0087ba',
                      paddingHorizontal: 16,
                      paddingVertical: 4,
                      ...theme.fonts.IBMPlexSansMedium(16),
                      textAlign: 'left',
                    }}
                  >
                    {rowData.message === messageCodes.languageQue ||
                    rowData.message === messageCodes.startConsultjr ||
                    rowData.message === messageCodes.stopConsultJr
                      ? rowData.automatedText
                      : // : rowData.message === messageCodes.imageconsult
                        // ? renderImageView(rowData)
                        rowData.message}
                  </Text>
                )}

                <Text
                  style={{
                    color: 'rgba(2,71,91,0.6)',
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {rowData.message === messageCodes.imageconsult ? '' : convertChatTime(rowData)}
                </Text>
              </View>
            </View>
          )}
        </View>
      );
    } else {
      leftComponent = 0;
      rightComponent++;
      return (
        <View>
          {rightComponent == 1 ? (
            <View
              style={{
                backgroundColor: 'transparent',
                width: width,
                marginVertical: 8,
              }}
            />
          ) : null}
          {rowData.message === 'Audio call ended' || rowData.message === 'Video call ended' ? (
            <View
              style={{
                borderRadius: 10,
                marginVertical: 2,
                alignSelf: 'flex-end',
                flexDirection: 'row',
              }}
            >
              <ChatCallIcon />
              <View>
                <Text
                  style={{
                    color: '#01475b',
                    marginLeft: 12,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(14),
                  }}
                >
                  {rowData.message}
                </Text>
                <Text
                  style={{
                    color: '#01475b',
                    marginTop: 2,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {strings.consult_room.duration} - {rowData.duration}
                </Text>
                <Text
                  style={{
                    color: '#01475b',
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {convertChatTime(rowData)}
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={{
                borderRadius: 10,
                marginVertical: 2,
                alignSelf: 'flex-end',
                flexDirection: 'row',
              }}
            >
              {rowData.message === messageCodes.consultPatientStartedMsg
                ? patientAutomatedMessage(rowData, index)
                : rowData.message === messageCodes.firstMessage ||
                  rowData.message === messageCodes.secondMessage ||
                  rowData.message === messageCodes.languageQue ||
                  rowData.message === messageCodes.startConsultjr ||
                  rowData.message === messageCodes.stopConsultJr
                ? doctorAutomatedMessage(rowData, index)
                : rowData.message === messageCodes.imageconsult
                ? renderImageView(rowData)
                : messageView(rowData, index)}
            </View>
          )}
        </View>
      );
    }
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
            contentContainerStyle={{
              marginHorizontal: 20,
              marginTop: 0,
            }}
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
          <View
            style={{
              flexDirection: 'row',
              margin: 20,
            }}
          >
            <View
              style={{
                marginTop: 3,
              }}
            >
              <RoundChatIcon />
            </View>
            <Text
              style={{
                marginLeft: 14,
                color: '#0087ba',
                ...theme.fonts.IBMPlexSansMedium(12),
                marginRight: 20,
                lineHeight: 16,
              }}
            >
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
      <View
        style={{
          height: 66,
          backgroundColor: 'white',
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={async () => {
              props.setDropdownVisible(!props.isDropdownVisible);
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 20,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {hideSend ? (
                <Text style={theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE)}>Attach</Text>
              ) : null}
              <AttachmentIcon
                style={{
                  width: 24,
                  height: 24,
                }}
              />
            </View>
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              height: 40,
              borderBottomWidth: 2,
              borderColor: theme.colors.APP_GREEN,
              marginRight: 20,
              marginLeft: 16,
            }}
          >
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
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}
    >
      {renderChatView()}
      {renderChatInput()}
    </View>
  );
};
