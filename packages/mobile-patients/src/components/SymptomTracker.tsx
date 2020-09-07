import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  SafeAreaView,
  BackHandler,
  StyleSheet,
  Text,
  Modal,
  Platform,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import {
  Symptomtracker,
  LinkedUhidIcon,
  DropdownGreen,
  BotIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '../theme/colors';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { ProfileList } from './ui/ProfileList';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppRoutes } from './NavigatorContainer';
import AsyncStorage from '@react-native-community/async-storage';
import { CommonLogEvent, CommonBugFender } from '../FunctionHelpers/DeviceHelper';
import moment from 'moment';
import {
  startSymptomTrackerChat,
  updateSymptomTrackerChat,
  getSymptomsFromTracker,
} from '../helpers/apiCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AlertPopup } from './ui/AlertPopup';

const roundCountViewDimension = 30;
const howItWorksArrData = [
  'Tell us your symptoms',
  'We’ll analyse them and suggest a speciality',
  'Choose doctor',
  'Book Appointment',
];
let insertMessage: object[] = [];

interface SymptomTrackerProps extends NavigationScreenProps {}
interface Patient {
  name: string;
  gender: string;
  age: number;
}
interface Symptoms {
  name: string;
  id: string;
}

export const SymptomTracker: React.FC<SymptomTrackerProps> = (props) => {
  const [showProfilePopUp, setShowProfilePopUp] = useState<boolean>(false);
  const [showList, setShowList] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [selectedPatient, setSelectedPatient] = useState<any>();
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(true);
  const [messages, setMessages] = useState<any>([]);
  const [symptoms, setSymptoms] = useState<Symptoms[]>([]);
  const [specialities, setSpecialities] = useState<any>([]);
  const [chatId, setChatId] = useState<string>('');
  const [defaultSymptoms, setDefaultSymptoms] = useState<object[]>([]);
  const [chatEnded, setChatEnded] = useState<boolean>(false);
  const [restartVisible, setRestartVisible] = useState<boolean>(false);
  const flatlistRef = useRef<any>(null);

  useEffect(() => {
    return function cleanup() {
      insertMessage = [];
    };
  }, []);

  const backDataFunctionality = async () => {
    try {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
      CommonLogEvent(AppRoutes.SymptomTracker, 'Go back clicked');
      props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [
            NavigationActions.navigate({
              routeName: AppRoutes.ConsultRoom,
            }),
          ],
        })
      );
    } catch (error) {}
    return false;
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{ borderBottomWidth: 0 }}
          title={'SYMPTOM TRACKER'}
          leftIcon="backArrow"
          onPressLeftIcon={() => backDataFunctionality()}
        />
      </View>
    );
  };

  const renderHowItWorks = () => {
    return (
      <View style={styles.cardStyle}>
        <View style={styles.rowContainer}>
          <Symptomtracker style={styles.symptomTrackerIconStyle} />
          <Text style={styles.title}>{string.symptomChecker.howItWorks}</Text>
        </View>
        {howItWorksArrData.map((item, index) => {
          return (
            <View>
              <View
                key={index}
                style={[
                  styles.itemRowStyle,
                  {
                    marginTop: index === 0 ? 25 : 0,
                  },
                ]}
              >
                <View style={[styles.itemRowStyle]}>
                  <View style={styles.roundView}>
                    <View style={styles.countViewStyle}>
                      <Text style={styles.countTxtStyle}>{index + 1}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.itemTxtStyle}>{item}</Text>
              </View>
              <View
                style={[
                  styles.lineSeperatorView,
                  {
                    height: index === howItWorksArrData.length - 1 ? 0 : 25,
                  },
                ]}
              />
            </View>
          );
        })}
        <Button
          title="Proceed"
          style={styles.proceedBtn}
          onPress={() => {
            setShowProfilePopUp(true);
          }}
        />
      </View>
    );
  };

  const renderProfileListView = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProfilePopUp}
        onRequestClose={() => {
          setShowProfilePopUp(false);
          setShowHowItWorks(false);
        }}
        onDismiss={() => {
          setShowProfilePopUp(false);
          setShowHowItWorks(false);
        }}
      >
        <View style={styles.mainView}>
          <View style={styles.subViewPopup}>
            {renderProfileDrop()}
            <Text style={styles.congratulationsDescriptionStyle}>Who is the patient?</Text>
            <Text style={styles.popDescriptionStyle}>
              Prescription to be generated in the name of?
            </Text>
            {renderCTAs()}
          </View>
        </View>
      </Modal>
    );
  };

  const initializeChat = async (patient: any) => {
    console.log('patient', patient);
    setLoading(true);
    setChatEnded(false);
    insertMessage = [];
    const { uhid, id, gender } = patient;
    const body = {
      userID: uhid,
      profileID: id,
      userProfile: {
        age: Math.round(moment().diff(g(patient, 'dateOfBirth') || 0, 'years', true)),
        gender: gender,
      },
    };
    console.log('body', body);
    try {
      const res = await startSymptomTrackerChat(body);
      console.log('res', res);
      if (res && res.data && res.data.dialogue) {
        if (insertMessage.length === 0) {
          insertMessage = [{ text: res.data.dialogue.text }];
        } else {
          insertMessage = insertMessage.concat({ text: res.data.dialogue.text });
        }
        setMessages(insertMessage);
        setChatId(res.data.id);
        setDefaultSymptoms(res.data.dialogue.options);
      }
    } catch (error) {
      CommonBugFender('StartSymptomTrackerChatApi', error);
    }
    setLoading(false);
  };

  const renderProfileDrop = () => {
    return (
      <ProfileList
        showList={showList}
        menuHidden={() => setShowList(false)}
        onProfileChange={onProfileChange}
        navigation={props.navigation}
        saveUserChange={true}
        listContainerStyle={{ marginTop: Platform.OS === 'ios' ? 10 : 60 }}
        childView={
          <View
            style={{
              flexDirection: 'row',
              paddingRight: 8,
              borderRightWidth: 0,
              borderRightColor: 'rgba(2, 71, 91, 0.2)',
              backgroundColor: theme.colors.CLEAR,
            }}
          >
            <Text style={styles.hiTextStyle}>{'Hi'}</Text>
            <View style={styles.nameTextContainerStyle}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.nameTextStyle} numberOfLines={1}>
                  {(currentPatient && currentPatient!.firstName + ' ' + currentPatient!.lastName) ||
                    ''}
                </Text>
                {currentPatient && g(currentPatient, 'isUhidPrimary') ? (
                  <LinkedUhidIcon
                    style={{
                      width: 22,
                      height: 20,
                      marginLeft: 5,
                      marginTop: Platform.OS === 'ios' ? 26 : 30,
                    }}
                    resizeMode={'contain'}
                  />
                ) : null}
                <View style={{ paddingTop: 28 }}>
                  <DropdownGreen />
                </View>
              </View>
              <View style={styles.seperatorStyle} />
            </View>
          </View>
        }
        unsetloaderDisplay={true}
      />
    );
  };

  const onProfileChange = (profile: any) => {
    if (profile && profile.firstName) {
      setSelectedPatient(profile);

      // start chat
      initializeChat(profile);
    }
    setShowList(false);
    setTimeout(() => {
      setShowProfilePopUp(false);
      setShowHowItWorks(false);
    }, 1000);
  };

  const moveSelectedToTop = () => {
    if (currentPatient !== undefined) {
      const patientLinkedProfiles = [
        allCurrentPatients.find((item: any) => item.uhid === currentPatient.uhid),
        ...allCurrentPatients.filter((item: any) => item.uhid !== currentPatient.uhid),
      ];
      return patientLinkedProfiles;
    }
    return [];
  };

  const onSelectedProfile = (item: any) => {
    selectUser(item);
    setSelectedPatient(item);
    setShowProfilePopUp(false);
    setShowHowItWorks(false);

    // start chat
    initializeChat(item);
  };

  const selectUser = (selectedUser: any) => {
    AsyncStorage.setItem('selectUserId', selectedUser!.id);
    AsyncStorage.setItem('selectUserUHId', selectedUser!.uhid);
    AsyncStorage.setItem('isNewProfile', 'yes');
  };

  const renderCTAs = () => (
    <View style={styles.aphAlertCtaViewStyle}>
      {moveSelectedToTop()
        .slice(0, 5)
        .map((item: any, index: any, array: any) =>
          item.firstName !== '+ADD MEMBER' ? (
            <TouchableOpacity
              onPress={() => {
                onSelectedProfile(item);
              }}
              style={[styles.ctaWhiteButtonViewStyle]}
            >
              <Text style={[styles.ctaOrangeTextStyle]}>{item.firstName}</Text>
            </TouchableOpacity>
          ) : null
        )}
      <View style={[styles.textViewStyle]}>
        <Text
          onPress={() => {
            if (allCurrentPatients.length > 6) {
              setShowList(true);
            } else {
              setShowProfilePopUp(false);
              setShowHowItWorks(false);
              props.navigation.navigate(AppRoutes.EditProfile, {
                isEdit: false,
                isPoptype: true,
                mobileNumber: currentPatient && currentPatient!.mobileNumber,
              });
            }
          }}
          style={[styles.ctaOrangeTextStyle]}
        >
          {allCurrentPatients.length > 6 ? 'OTHERS' : '+ADD MEMBER'}
        </Text>
      </View>
    </View>
  );

  const renderPatientDetails = () => {
    return (
      <View style={styles.patientDetailContainer}>
        <View style={styles.seperatorLine}>
          <Text style={styles.patientDetailsTitle}>{string.symptomChecker.patientDetails}</Text>
        </View>
        <View style={[styles.itemRowStyle, styles.patientDetailsMargin]}>
          <Text style={styles.patientDetailsText}>
            {string.symptomChecker.name} - {selectedPatient.firstName} {selectedPatient.lastName}
          </Text>
        </View>
        <View style={[styles.itemRowStyle, styles.patientDetailsMargin]}>
          <Text style={styles.patientDetailsText}>
            {string.symptomChecker.age} - {selectedPatient.gender}
          </Text>
        </View>
        <View style={[styles.itemRowStyle, styles.patientDetailsMargin]}>
          <Text style={styles.patientDetailsText}>
            {string.symptomChecker.gender} -{' '}
            {Math.round(moment().diff(g(selectedPatient, 'dateOfBirth') || 0, 'years', true))}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.selectMemberBtn}
          onPress={() => {
            setShowProfilePopUp(true);
          }}
        >
          <Text
            style={[
              styles.patientDetailsText,
              {
                color: colors.EXTREME_LIGHT_BLUE,
              },
            ]}
          >
            {string.symptomChecker.selectAnotherMember}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChat = () => {
    return (
      <FlatList
        data={messages}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item, index }) => renderChats(item, index)}
        ListHeaderComponent={renderPatientDetails}
        ListFooterComponent={renderSymptoms}
        showsVerticalScrollIndicator={false}
        ref={flatlistRef}
      />
    );
  };

  const renderChats = (item: any, index: number) => {
    return (
      <View key={index}>
        {item.isSentByPatient ? renderPatientChat(item) : renderChatBot(item, index)}
      </View>
    );
  };

  const renderPatientChat = (item: any) => {
    return (
      <View style={styles.patientChatViewContainer}>
        <Text style={styles.patientChatTextTitle}>{item.text}</Text>
      </View>
    );
  };

  const renderChatBot = (item: any, index: number) => {
    return (
      <View style={{ marginBottom: index === messages.length - 1 ? 20 : 0 }}>
        <BotIcon style={styles.botIcon} />
        <View
          style={[
            styles.chatViewContainer,
            {
              marginRight: chatEnded && index === messages.length - 1 ? 20 : 45,
            },
          ]}
        >
          <Text style={styles.botTextTitle}>{item.text}</Text>
          {index === messages.length - 1 && !chatEnded ? (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.inputStyle}
              onPress={() => {
                props.navigation.navigate(AppRoutes.SymptomSelection, {
                  chatId: chatId,
                  goBackCallback: goBackCallback,
                  defaultSymptoms: defaultSymptoms,
                  storedMessages: messages,
                });
              }}
            >
              <Text style={styles.placeholderTxt}>
                {messages.length === 1 ? 'e.g. Headache' : 'Please type here'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {messages.length !== 1 && index === messages.length - 1 && !chatEnded ? (
            <TouchableOpacity
              style={styles.plainBtn}
              onPress={() => {
                insertMessage = insertMessage.concat({
                  text: string.symptomChecker.thanksForGivingAnswers.replace(
                    '{{name}}',
                    selectedPatient.firstName + selectedPatient.lastName
                  ),
                });
                setMessages(insertMessage);
                fetchSymptoms();
              }}
            >
              <Text style={styles.plainBtnTxt}>{string.symptomChecker.noOtherSymptoms}</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
      </View>
    );
  };

  const fetchSymptoms = async () => {
    setLoading(true);
    try {
      const res = await getSymptomsFromTracker(chatId);
      console.log('res', res);
      if (res && res.data && res.data.symptoms) {
        setSymptoms(res.data.symptoms);
        setSpecialities(res.data.specialities);
        setTimeout(() => {
          flatlistRef.current.scrollToEnd({ animated: true });
        }, 300);
        setChatEnded(true);
      }
    } catch (error) {
      CommonBugFender('GetSymptomsFromTrackerApi', error);
    }
    setLoading(false);
  };

  const goBackCallback = async (data: any, chat_id: string, storedMessages: any) => {
    insertMessage = storedMessages.concat({ text: data.name, isSentByPatient: true });
    setLoading(true);
    const body = {
      dialogue: {
        text: data.id,
        options: [],
        status: 'reporting',
        sender: 'user',
      },
    };
    console.log('body', body);
    console.log('chat_id', chat_id);
    try {
      const res = await updateSymptomTrackerChat(chat_id, body);
      if (res && res.data && res.data.dialogue) {
        insertMessage = insertMessage.concat({ text: res.data.dialogue.text });
        setDefaultSymptoms(res.data.dialogue.options);
        setTimeout(() => {
          flatlistRef.current.scrollToEnd({ animated: true });
        }, 300);
      }
      setMessages(insertMessage);
      console.log('res', res);
    } catch (error) {
      CommonBugFender('UpdateSymptomTrackerChatApi', error);
    }
    setLoading(false);
  };

  const renderSymptoms = () => {
    return (
      <View>
        {chatEnded ? (
          <View style={styles.symptomsContainer}>
            <View style={styles.seperatorLine}>
              <Text style={styles.patientDetailsTitle}>{string.symptomChecker.symptoms}</Text>
            </View>
            {symptoms &&
              symptoms.length > 0 &&
              symptoms.map((item, index) => {
                return (
                  <View key={index} style={[styles.itemRowStyle, { marginTop: 14 }]}>
                    <View style={styles.bullet} />
                    <Text style={styles.patientDetailsText}>{item.name}</Text>
                  </View>
                );
              })}
          </View>
        ) : (
          <View />
        )}
      </View>
    );
  };

  const renderBottomButtons = () => {
    return (
      <View style={styles.bottomView}>
        <TouchableOpacity
          onPress={() => {
            setRestartVisible(true);
          }}
        >
          <Text style={styles.restartBtnTxt}>{string.symptomChecker.restart}</Text>
        </TouchableOpacity>
        <Button
          title={string.symptomChecker.consultDoctor}
          style={[styles.proceedBtn, { marginTop: 0 }]}
          onPress={() => {
            const filteredSpecialities = specialities.map((item: any) => {
              return item.name;
            });
            props.navigation.push(AppRoutes.DoctorSearchListing, {
              specialities: filteredSpecialities,
              MoveDoctor: 'MoveDoctor',
            });
          }}
        />
      </View>
    );
  };

  const renderRestartChatModal = () => {
    return (
      <AlertPopup
        visible={restartVisible}
        onDismiss={() => setRestartVisible(false)}
        title={string.symptomChecker.restartSymptomTrackerDiscription}
        onContinue={() => {
          setRestartVisible(false);
          initializeChat(selectedPatient);
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderRestartChatModal()}
        {showHowItWorks && renderHowItWorks()}
        {messages && messages.length > 0 && renderChat()}
        {chatEnded && renderBottomButtons()}
        {showProfilePopUp && renderProfileListView()}
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 20,
    margin: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.HEADER_GREY,
  },
  symptomTrackerIconStyle: {
    height: 40,
    width: 40,
    resizeMode: 'contain',
    marginRight: 20,
  },
  title: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: colors.TURQUOISE_BLUE,
  },
  roundView: {
    width: roundCountViewDimension,
    height: roundCountViewDimension,
    borderWidth: 0.5,
    borderRadius: roundCountViewDimension / 2,
    borderColor: colors.SEARCH_UNDERLINE_COLOR,
  },
  itemTxtStyle: {
    color: colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansRegular(),
    marginLeft: 12,
  },
  itemRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countTxtStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: colors.SEARCH_UNDERLINE_COLOR,
  },
  countViewStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineSeperatorView: {
    width: 1,
    backgroundColor: colors.SEARCH_UNDERLINE_COLOR,
    marginLeft: roundCountViewDimension / 2,
  },
  proceedBtn: {
    marginTop: 20,
    width: 155,
    backgroundColor: colors.LIGHT_BLUE,
    alignSelf: 'center',
  },
  mainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subViewPopup: {
    backgroundColor: 'white',
    width: '88%',
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  popDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  hiTextStyle: {
    marginLeft: 20,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  nameTextContainerStyle: {
    maxWidth: '75%',
  },
  nameTextStyle: {
    marginLeft: 5,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginTop: 6,
    marginHorizontal: 5,
    marginBottom: 6,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  ctaWhiteButtonViewStyle: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginRight: 15,
    marginVertical: 5,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
  textViewStyle: {
    padding: 8,
    marginRight: 15,
    marginVertical: 5,
  },
  patientDetailContainer: {
    backgroundColor: 'rgba(252, 183, 22, 0.2)',
    paddingRight: 20,
    paddingLeft: 25,
    paddingTop: 13,
    paddingBottom: 3,
    borderRadius: 10,
    marginLeft: 43,
    marginRight: 20,
    marginTop: 24,
  },
  symptomsContainer: {
    backgroundColor: 'rgba(252, 183, 22, 0.2)',
    paddingRight: 20,
    paddingLeft: 25,
    paddingVertical: 13,
    borderRadius: 10,
    marginRight: 20,
    marginLeft: 40,
  },
  patientDetailsTitle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: colors.LIGHT_BLUE,
  },
  seperatorLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.LIGHT_BLUE,
    paddingBottom: 8,
  },
  patientDetailsMargin: {
    marginTop: 12,
  },
  patientDetailsText: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: colors.LIGHT_BLUE,
  },
  selectMemberBtn: {
    marginTop: 20,
    alignSelf: 'flex-end',
    height: 30,
  },
  botIcon: {
    width: 35,
    height: 35,
    marginTop: 28,
    marginLeft: 15,
  },
  chatViewContainer: {
    ...theme.viewStyles.cardViewStyle,
    padding: 15,
    marginLeft: 40,
    marginRight: 45,
    borderTopLeftRadius: 0,
    marginTop: 7,
  },
  patientChatViewContainer: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 20,
    borderBottomRightRadius: 0,
    marginTop: 26,
    alignSelf: 'flex-end',
    backgroundColor: colors.LIGHT_BLUE,
    minWidth: '40%',
    maxWidth: '65%',
  },
  botTextTitle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: colors.LIGHT_BLUE,
  },
  inputStyle: {
    marginTop: 15,
    borderWidth: 0.5,
    borderColor: colors.LIGHT_BLUE,
    padding: 10,
    borderRadius: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.LIGHT_BLUE,
    marginRight: 11,
  },
  bottomView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  patientChatTextTitle: {
    color: 'white',
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  plainBtnTxt: {
    color: colors.APP_YELLOW,
    ...theme.fonts.IBMPlexSansMedium(13),
  },
  plainBtn: {
    height: 25,
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  placeholderTxt: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: colors.LIGHT_BLUE,
    opacity: 0.3,
  },
  restartBtnTxt: {
    color: colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
});
