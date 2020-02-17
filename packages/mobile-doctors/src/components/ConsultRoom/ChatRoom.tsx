import {
  AddAttachmentIcon,
  ChatCallIcon,
  ChatSend,
  DoctorImage,
  DoctorPlaceholderImage,
  FileBig,
  Mascot,
  MissedCallIcon,
  RoundChatIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { getPrismUrls } from '@aph/mobile-doctors/src/helpers/clientCalls';
import { messageCodes } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
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
import { Image as ImageNative } from 'react-native-elements';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainview: {
    backgroundColor: '#ffffff',
    height: 50,
  },
  shadowview: {
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 10,
    backgroundColor: 'white',
  },
  imageStyle: {
    width: 32,
    height: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
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

let connectionCount = 0;
let timer = 900;
let intervalId: any;
let stoppedTimer: number;
let timerId: any;
let joinTimerNoShow: any;
let missedCallTimer: any;

export interface ChatRoomProps extends NavigationScreenProps {}
export const ChatRoom: React.FC<ChatRoomProps> = (props) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [overlayDisplay, setOverlayDisplay] = useState<React.ReactNode>(null);
  const [hideView, setHideView] = useState(false);
  const [chatReceived, setChatReceived] = useState(false);
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert, loading, setLoading } = useUIElements();
  const PatientInfoAll = props.navigation.getParam('PatientInfoAll');
  const AppId = props.navigation.getParam('AppId');
  const Appintmentdatetime = props.navigation.getParam('Appintmentdatetime');
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const appointmentData = props.navigation.getParam('AppoinementData');
  const [dropdownShow, setDropdownShow] = useState(false);
  const channel = props.navigation.getParam('AppId');
  const doctorId = props.navigation.getParam('DoctorId');
  const patientId = props.navigation.getParam('PatientId');
  const PatientConsultTime = props.navigation.getParam('PatientConsultTime');

  const flatListRef = useRef<FlatList<never> | undefined | null>();
  const otSessionRef = React.createRef();
  //   const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState<string>('');
  const [heightList, setHeightList] = useState<number>(height - 185);
  const [returnToCall, setReturnToCall] = useState<boolean>(false);
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [patientImageshow, setPatientImageshow] = useState<boolean>(false);
  const [showweb, setShowWeb] = useState<boolean>(false);
  const [url, setUrl] = useState('');

  const [talkStyles, setTalkStyles] = useState<object>({
    flex: 1,
    backgroundColor: 'black',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 1000,
    zIndex: 100,
  });
  const [subscriberStyles, setSubscriberStyles] = useState<object>({
    width,
    height,
    zIndex: 100,
  });
  const [publisherStyles, setPublisherStyles] = useState<object>({
    position: 'absolute',
    top: 44,
    right: 20,
    width: 112,
    height: 148,
    zIndex: 100,
    elevation: 1000,
    borderRadius: 30,
  });
  const [audioCallStyles, setAudioCallStyles] = useState<object>({
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10000,
  });
  const { messages } = props;

  const keyboardDidShow = (e: KeyboardEvent) => {
    setHeightList(height - e.endCoordinates.height - 185);
    setTimeout(() => {
      flatListRef.current && flatListRef.current.scrollToEnd();
    }, 200);
  };
  const keyboardDidHide = () => {
    setHeightList(height - 185);
  };
  useEffect(() => {
    // callAbandonmentCall();
    setTimeout(() => {
      flatListRef.current && flatListRef.current!.scrollToEnd();
    }, 1000);

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  useEffect(() => {
    console.log(messages, 'props.messages');
    setTimeout(() => {
      flatListRef.current! && flatListRef.current!.scrollToEnd();
    }, 200);
  }, [messages]);

  const openPopUp = (rowData: any) => {
    setLoading && setLoading(true);
    if (rowData.url.match(/\.(pdf)$/)) {
      if (rowData.prismId) {
        getPrismUrls(client, rowData.id, rowData.prismId)
          .then((data: any) => {
            setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch(() => {
            setUrl(rowData.url);
          })
          .finally(() => {
            setLoading && setLoading(false);
            setShowPDF(true);
          });
      } else {
        setUrl(rowData.url);
        setLoading && setLoading(false);
        setShowPDF(true);
      }
    } else if (rowData.url.match(/\.(jpeg|jpg|gif|png)$/)) {
      if (rowData.prismId) {
        getPrismUrls(client, rowData.id, rowData.prismId)
          .then((data: any) => {
            setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch(() => {
            setUrl(rowData.url);
          })
          .finally(() => {
            setLoading && setLoading(false);
            setPatientImageshow(true);
          });
      } else {
        setUrl(rowData.url);
        setLoading && setLoading(false);
        setPatientImageshow(true);
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
            setPatientImageshow(true);
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
      const dateValidate = moment(moment().format('YYYY-MM-DD')).diff(
        moment(timeStamp.messageDate).format('YYYY-MM-DD')
      );
      if (dateValidate == 0) {
        utcString = moment
          .utc(timeStamp.messageDate)
          .local()
          .format('h:mm A');
      } else {
        utcString = moment
          .utc(timeStamp.messageDate)
          .local()
          .format('DD MMM, YYYY h:mm A');
      }
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
                  resizeMode: 'stretch',
                  width: 180,
                  height: 180,
                  borderRadius: 10,
                }}
              />
            ) : (
              <FileBig
                style={{
                  resizeMode: 'stretch',
                  width: 180,
                  height: 180,
                  borderRadius: 10,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderImageView = (rowData: any) => {
    const isMatched = rowData.url.match(/\.(jpeg|jpg|gif|png)$/);
    const onPress = () => {
      if (isMatched) {
        openPopUp(rowData);
        setPatientImageshow(true);
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
    const isMatched = rowData.url && rowData.url.match(/\.(jpeg|jpg|gif|png)$/);
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
          width: rowData.message !== null ? 282 : 0,
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
                  {rowData.message}
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
      ].includes(rowData.message)
    ) {
      return null;
    }
    if (rowData.id !== doctorId) {
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
                    alignSelf: 'flex-start',
                    paddingVertical: 17,
                  }}
                >
                  {leftComponent === 1 ? <DoctorImage style={styles.imageStyle} /> : null}
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
                    width: 282,
                    borderRadius: 10,
                    marginVertical: 2,
                    alignSelf: 'flex-end',
                  }}
                >
                  {leftComponent === 1 ? <DoctorImage style={styles.imageStyle} /> : null}
                  <View
                    style={{
                      borderRadius: 10,
                      marginVertical: 2,
                      alignSelf: 'flex-end',
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
              {leftComponent === 1 ? <DoctorImage style={styles.imageStyle} /> : null}

              <View
                style={{
                  backgroundColor: rowData.message === messageCodes.imageconsult ? '' : 'white',
                  marginLeft: 38,
                  borderRadius: 10,
                  // width: 244,
                }}
              >
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
                    : rowData.message === messageCodes.imageconsult
                    ? renderImageView(rowData)
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
                  rowData.message === messageCodes.secondMessage
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
          height: returnToCall == false ? heightList : heightList + 20,
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
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
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
              {`${strings.consult_room.your_appnt_with} ${PatientInfoAll.firstName} ${
                strings.consult_room.is_scheduled_to_start
              } ${moment(Appintmentdatetime).format('hh.mm A')}`}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const ReturnCallView = () => {
    return (
      <View
        style={{
          width: width,
          height: 44,
          backgroundColor: '#00b38e',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setReturnToCall(false);
            setChatReceived(false);
            Keyboard.dismiss();
            props.setAudioCallStyles({
              flex: 1,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              elevation: 2000,
            });
          }}
        >
          <View
            style={{
              width: width,
              height: 44,
            }}
          >
            <Text
              style={{
                color: 'white',
                marginLeft: 20,
                ...theme.fonts.IBMPlexSansSemiBold(14),
                textAlign: 'left',
                height: 44,
                marginTop: 13,
              }}
            >
              {strings.consult_room.tap_to_return_call}
            </Text>
          </View>
        </TouchableOpacity>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        enabled
      >
        <View
          style={{
            width: width,
            height: 66,
            backgroundColor: 'white',
            bottom: isIphoneX() ? 36 : 0,
            //top: isIphoneX() ? 24 : 0,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              width: width,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                width: 40,
                height: 40,
                marginTop: 9,
                marginLeft: 5,
              }}
              onPress={async () => {
                setDropdownVisible(!isDropdownVisible);
              }}
            >
              <AddAttachmentIcon
                style={{
                  width: 24,
                  height: 24,
                  marginTop: 10,
                  marginLeft: 14,
                }}
              />
            </TouchableOpacity>
            <View>
              <TextInput
                autoCorrect={false}
                placeholder={strings.smartPrescr.type_here}
                multiline={true}
                style={{
                  marginLeft: 16,
                  marginTop: 5,
                  height: 40,
                  width: width - 120,
                  ...theme.fonts.IBMPlexSansMedium(16),
                }}
                value={messageText}
                blurOnSubmit={false}
                // returnKeyType="send"
                onChangeText={(value) => {
                  setMessageText(value);
                  setDropdownVisible(false);
                }}
                onFocus={() => setDropdownVisible(false)}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
              />
              <View
                style={{
                  marginLeft: 16,
                  marginTop: 0,
                  height: 2,
                  width: width - 120,
                  backgroundColor: '#00b38e',
                }}
              />
            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                width: 40,
                height: 40,
                marginTop: 10,
                marginLeft: 2,
              }}
              onPress={async () => {
                const textMessage = messageText.trim();
                console.log('ChatSend', textMessage);

                if (textMessage.length == 0) {
                  Alert.alert(strings.common.apollo, strings.consult_room.Please_write_something);
                  return;
                }
                props.send(textMessage);
                setMessageText('');
                flatListRef.current && flatListRef.current!.scrollToEnd();
              }}
            >
              <ChatSend
                style={{
                  marginTop: 8,
                  marginLeft: 14,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      {returnToCall && ReturnCallView()}
    </View>
  );
};
