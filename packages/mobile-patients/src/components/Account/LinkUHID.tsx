import React, { useEffect, useState, useRef } from 'react';
import {
  BackHandler,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  PixelRatio,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import moment from 'moment';
import { getPatientByMobileNumber_getPatientByMobileNumber_patients } from '@aph/mobile-patients/src/graphql/types/getPatientByMobileNumber';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  PatientDefaultImage,
  PrimaryUHIDIconBlue,
  SecondaryUHIDIconBlue,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { linkUHIDs, deLinkUHIDs } from '@aph/mobile-patients/src/helpers/clientCalls';
import { useApolloClient } from 'react-apollo-hooks/lib/ApolloContext';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { postWebEngagePHR } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';

let primary;
let secondary = [];
let areUhidsLinked = false;

const styles = StyleSheet.create({
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  profileImageStyle: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImageStyleSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  imageView: {
    marginRight: 16,
    overflow: 'hidden',
    resizeMode: 'contain',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imageViewSmall: {
    marginRight: 10,
    overflow: 'hidden',
    resizeMode: 'contain',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderColor: theme.colors.INPUT_CURSOR_COLOR,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  bannerText: {
    color: colors.WHITE,
    ...fonts.IBMPlexSansMedium(15),
  },
  centeredView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: colors.WHITE,
    padding: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 30,
    zIndex: 2,
  },
  secondaryUHIDCard: {
    width: '80%',
    alignSelf: 'flex-end',
    minHeight: 130,
    padding: 10,
    borderRadius: 10,
    borderColor: theme.colors.APP_YELLOW,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
});

export interface LinkUHIDProps extends NavigationScreenProps {}

export const LinkUHID: React.FC<LinkUHIDProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const { loading, setLoading, showAphAlert } = useUIElements();
  const client = useApolloClient();
  const [bottomPopUP, setBottomPopUP] = useState<boolean>(false);

  const [profiles, setProfiles] = useState<
    (getPatientByMobileNumber_getPatientByMobileNumber_patients | null)[]
  >();
  const [allProfiles, setAllProfiles] = useState<
    (getPatientByMobileNumber_getPatientByMobileNumber_patients | null)[]
  >(props.navigation.state.params!.profiles);

  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [refreshFlatList, setRefreshFlatList] = useState<boolean>(false);
  const [selectedPrimary, setSelectedPrimary] = useState<string>('');
  const [selectedSecondary, setSelectedSecondary] = useState<string[]>([]);
  const [enableSelectPrimary, setEnableSelectPrimary] = useState<boolean>(true);
  const [enableSelectSecondary, setEnableSelectSecondary] = useState<boolean>(false);
  const [enableSelect, setEnableSelect] = useState<boolean>(false);

  const [primaryUHIDs, setPrimaryUHIDs] = useState<string>('');
  const [secondaryUHIDs, setSecondaryUHIDs] = useState<string[]>([]);
  const [firstSecondaryUHID, setFirstSecondaryUHID] = useState<string>('');
  const [delinkSecondaryUHIDs, setDelinkSecondaryUHIDs] = useState<string[]>([]);
  const [relinkSecondaryUHIDs, setRelinkSecondaryUHIDs] = useState<string[]>([]);
  const action = props.navigation.getParam('action') || '';

  const { setisUHID } = useAppCommonData();

  const pixelRatio = PixelRatio.get();
  const { height } = Dimensions.get('window');
  const heightPercent = Math.round((5 * height) / 100);

  useEffect(() => {
    checkForLinkedProfiles();
  }, [allProfiles]);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      primary = {};
      secondary = [];
      areUhidsLinked = false;
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [props.navigation]);

  const checkForLinkedProfiles = () => {
    allProfiles!.forEach((profile) => {
      if (profile!.isUhidPrimary) {
        setPrimaryUHIDs(profile!.uhid);
        setSelectedPrimary(profile!.uhid);
        setEnableSelectPrimary(false);
        setEnableSelectSecondary(true);
        primary = profile;
        areUhidsLinked = true;
      } else if (profile!.isLinked) {
        secondary.push(profile!.uhid);
      }
    });

    if (areUhidsLinked) {
      // shuffle array as [primary, [...secondary], [...unlined]]
      setSecondaryUHIDs(secondary);
      setSelectedSecondary(secondary);
      setFirstSecondaryUHID(secondary[0]);
      const filteredArray = allProfiles!.filter((item) => {
        return item!.uhid !== primary!.uhid && !secondary.includes(item!.uhid);
      });
      const primaryArray = allProfiles!.filter((item) => item!.uhid === primary!.uhid);
      const secondaryArray = allProfiles!.filter((item) => secondary.includes(item!.uhid));
      const profileArray = [...primaryArray, ...secondaryArray, ...filteredArray];
      setProfiles(profileArray);
    } else {
      setProfiles(allProfiles);
    }
  };

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const linkUhidsApiCall = () => {
    setisUHID && setisUHID([...selectedSecondary]);
    linkUHIDs(client, selectedPrimary, selectedSecondary)
      .then((data) => {
        setLoading && setLoading(false);
        postWebEngagePHR(currentPatient, WebEngageEventName.PHR_USER_LINKING, 'LINK UHID');
        getPatientApiCall();
        props.navigation.navigate(AppRoutes.ManageProfile);
      })
      .catch((e) => {
        setLoading && setLoading(false);
        renderErrorPopup('Something went wrong, please try again after sometime');
        CommonBugFender('LinkUHIDs', e);
      });
  };

  const deLinkUhidsApiCall = () => {
    deLinkUHIDs(client, selectedPrimary, delinkSecondaryUHIDs)
      .then((data) => {
        setLoading && setLoading(false);
        postWebEngagePHR(currentPatient, WebEngageEventName.PHR_USER_DELINKING, 'DELINK UHID');
        getPatientApiCall();
        props.navigation.navigate(AppRoutes.ManageProfile);
      })
      .catch((e) => {
        setLoading && setLoading(false);
        renderErrorPopup('Something went wrong, please try again after sometime');
        CommonBugFender('LinkUHIDs', e);
      });
  };

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    if (action) {
      props.navigation.goBack();
    } else if (enableSelectSecondary) {
      setEnableSelectPrimary(true);
      setEnableSelectSecondary(false);
      setSelectedPrimary('');
    } else {
      props.navigation.goBack();
    }
    return false;
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{ borderBottomWidth: 0 }}
          title={action === 'delink' ? 'DELINK UHID' : 'LINK UHID'}
          leftIcon="backArrow"
          onPressLeftIcon={() => backDataFunctionality()}
        />
      </View>
    );
  };

  const renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAlert}
        onRequestClose={() => {
          setShowAlert(false);
        }}
        onDismiss={() => {
          setShowAlert(false);
        }}
      >
        <TouchableOpacity
          style={[
            styles.closeButton,
            pixelRatio <= 2 ? { top: 160, right: 30 } : { top: '31%', right: 50 },
          ]}
          onPress={() => {
            setShowAlert(false);
          }}
        >
          <Text style={{ color: theme.colors.APP_YELLOW }}>X</Text>
        </TouchableOpacity>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, pixelRatio <= 2 ? { margin: 60 } : { margin: 80 }]}>
            <Text
              style={{
                ...fonts.IBMPlexSansRegular(16),
                marginBottom: 20,
                color: colors.BLACK_COLOR,
              }}
            >
              Are you sure you want to
              {action === 'delink' ? (
                <Text style={{ ...fonts.IBMPlexSansSemiBold(16) }}> Delink your UHID’s.</Text>
              ) : (
                <Text style={{ ...fonts.IBMPlexSansSemiBold(16) }}> link your UHID’s.</Text>
              )}
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
              }}
            >
              <Button
                title="NO"
                style={{
                  alignContent: 'center',
                  width: '40%',
                  backgroundColor: colors.WHITE,
                  paddingLeft: 10,
                  paddingRight: 10,
                }}
                titleTextStyle={{
                  color: theme.colors.BUTTON_BG,
                  ...fonts.IBMPlexSansSemiBold(16),
                }}
                onPress={() => {
                  setShowAlert(false);
                }}
              />
              <Button
                title="YES"
                style={{
                  alignContent: 'center',
                  width: '40%',
                  paddingLeft: 10,
                  paddingRight: 10,
                }}
                titleTextStyle={{
                  ...fonts.IBMPlexSansSemiBold(16),
                }}
                onPress={() => {
                  setLoading && setLoading(true);
                  setShowAlert(false);
                  if (action === 'delink') {
                    deLinkUhidsApiCall();
                  } else {
                    linkUhidsApiCall();
                  }
                }}
              />
            </View>
            {action === 'delink' ? (
              <Text
                style={{
                  ...fonts.IBMPlexSansRegular(12),
                  marginTop: 20,
                  color: colors.BLACK_COLOR,
                }}
              >
                Once you delink your UHID’s from your
                <Text style={{ ...fonts.IBMPlexSansSemiBold(12) }}> Primary UHID, </Text>
                you can always link them back later.
              </Text>
            ) : (
              <Text
                style={{
                  ...fonts.IBMPlexSansRegular(12),
                  marginTop: 20,
                  color: colors.BLACK_COLOR,
                }}
              >
                Once you link your UHID’s to your
                <Text style={{ ...fonts.IBMPlexSansSemiBold(12) }}> Primary UHID, </Text>
                you can always Delink them later.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderProfile = (
    profile: getPatientByMobileNumber_getPatientByMobileNumber_patients | null,
    index: number
  ) => {
    const isSelectedPrimaryUHID = enableSelectSecondary && profile!.uhid === selectedPrimary;
    const indexOfId = selectedSecondary.indexOf(profiles[index].uhid);

    const isPrimaryUHID = primaryUHIDs === profile!.uhid;
    const isSecondaryUHID = secondaryUHIDs.indexOf(profile!.uhid) > -1;
    const isFirstSecondaryId = firstSecondaryUHID === profile!.uhid ? true : false;

    const indexOfDelink = delinkSecondaryUHIDs.indexOf(profile!.uhid);
    const isDelink = action === 'delink';
    const isDeSelected = isDelink && indexOfDelink > -1 ? true : false;
    return (
      <View
        key={index}
        style={[
          { marginHorizontal: 20 },
          profiles && index < profiles.length - 1 ? { marginBottom: 8 } : { marginBottom: 80 },
          index == 0 ? { marginTop: 20 } : { margin: 0 },
        ]}
      >
        {isSecondaryUHID && (
          <View style={{ zIndex: 1 }}>
            <View
              style={[
                {
                  position: 'absolute',
                  top: isFirstSecondaryId ? -10 : -80,
                  left: 30,
                  height: isFirstSecondaryId ? 80 : 150,
                  borderColor: theme.colors.LIGHT_BLUE,
                  borderLeftWidth: 1,
                  borderBottomWidth: 1,
                  zIndex: 0,
                },
                heightPercent <= 30
                  ? { width: isDeSelected ? 40 : 30 }
                  : { width: isDeSelected ? 60 : 40 },
              ]}
            />
            <View
              style={[
                {
                  position: 'absolute',
                  top: 60,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  borderColor: theme.colors.LIGHT_BLUE,
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                  borderBottomWidth: 2,
                  borderRightWidth: 2,
                  backgroundColor: isDeSelected ? theme.colors.LIGHT_BLUE : theme.colors.WHITE,
                  zIndex: 2,
                },
                heightPercent <= 30
                  ? { left: isDeSelected ? 65 : 48 }
                  : { left: isDeSelected ? 78 : 58 },
              ]}
            />
          </View>
        )}
        <TouchableOpacity
          activeOpacity={1}
          key={index}
          onPress={() => {
            if (action === 'link' && (isPrimaryUHID || isSecondaryUHID)) {
              return false;
            } else if (action === 'link') {
              if (enableSelect) {
                const indexRelink = relinkSecondaryUHIDs.indexOf(profile!.uhid);
                const indexSecondary = selectedSecondary.indexOf(profile!.uhid);
                if (indexRelink > -1) {
                  relinkSecondaryUHIDs.splice(indexRelink, 1);
                  selectedSecondary.splice(indexSecondary, 1);
                } else {
                  setSelectedSecondary([...selectedSecondary, profiles[index].uhid]);
                  setRelinkSecondaryUHIDs([...relinkSecondaryUHIDs, profiles[index].uhid]);
                }
                setRefreshFlatList(!refreshFlatList);
              }
            } else if (action === 'delink' && isSecondaryUHID) {
              if (enableSelect) {
                if (indexOfDelink > -1) {
                  delinkSecondaryUHIDs.splice(indexOfDelink, 1);
                } else {
                  setDelinkSecondaryUHIDs([...delinkSecondaryUHIDs, profiles[index].uhid]);
                }
                setRefreshFlatList(!refreshFlatList);
              }
            } else if (enableSelectSecondary) {
              if (profiles && enableSelect) {
                if (indexOfId > -1) {
                  selectedSecondary.splice(indexOfId, 1);
                } else {
                  setSelectedSecondary([...selectedSecondary, profiles[index].uhid]);
                }
                setRefreshFlatList(!refreshFlatList);
              }
            } else if (enableSelectPrimary) {
              if (profiles) {
                setSelectedPrimary(profiles[index].uhid);
                setRefreshFlatList(!refreshFlatList);
              }
            } else {
              props.navigation.navigate(AppRoutes.EditProfile, {
                isEdit: true,
                profileData: profile,
                mobileNumber: currentPatient && currentPatient!.mobileNumber,
              });
            }
          }}
        >
          <View
            style={[
              {
                ...viewStyles.cardViewStyle,
                ...viewStyles.shadowStyle,
                padding: 16,
                flexDirection: 'row',
                minHeight: 145,
              },
              { backgroundColor: theme.colors.APP_YELLOW_COLOR },
              isPrimaryUHID
                ? { backgroundColor: theme.colors.APP_YELLOW_COLOR }
                : { backgroundColor: colors.WHITE },
              isSecondaryUHID ? styles.secondaryUHIDCard : { display: 'flex' },
              isDeSelected ? { minHeight: 50, width: '75%', padding: 10 } : { display: 'flex' },
            ]}
            key={index}
          >
            {isSelectedPrimaryUHID && (
              <View
                style={{
                  ...viewStyles.cardViewStyle,
                  opacity: 0.35,
                  height: 25,
                  padding: 3,
                  paddingLeft: 20,
                  paddingRight: 20,
                  position: 'absolute',
                  right: 0,
                }}
              >
                <Text
                  style={{
                    color: colors.LIGHT_BLUE,
                  }}
                >
                  Primary
                </Text>
              </View>
            )}
            {enableSelectSecondary &&
              enableSelect &&
              !isSelectedPrimaryUHID &&
              !isSecondaryUHID &&
              !isPrimaryUHID &&
              !isDelink && (
                <View
                  style={[
                    styles.circle,
                    indexOfId > -1
                      ? { backgroundColor: theme.colors.INPUT_CURSOR_COLOR }
                      : { backgroundColor: theme.colors.WHITE },
                  ]}
                />
              )}
            {enableSelectPrimary && !isSecondaryUHID && !isPrimaryUHID && (
              <View
                style={[
                  styles.circle,
                  profile!.uhid === selectedPrimary
                    ? { backgroundColor: theme.colors.INPUT_CURSOR_COLOR }
                    : { backgroundColor: theme.colors.WHITE },
                ]}
              />
            )}
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              <View
                style={[
                  styles.imageView,
                  isDeSelected ? styles.imageViewSmall : { display: 'flex' },
                ]}
              >
                {profile!.photoUrl &&
                profile!.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/) ? (
                  <Image
                    style={[
                      styles.profileImageStyle,
                      isDeSelected ? styles.profileImageStyleSmall : { display: 'flex' },
                    ]}
                    source={{
                      uri: profile!.photoUrl,
                    }}
                  />
                ) : (
                  <PatientDefaultImage
                    style={[
                      styles.profileImageStyle,
                      isDeSelected ? styles.profileImageStyleSmall : { display: 'flex' },
                    ]}
                  />
                )}
              </View>
              {isPrimaryUHID && action !== 'firstlink' && (
                <TouchableOpacity>
                  <PrimaryUHIDIconBlue
                    style={{
                      resizeMode: 'contain',
                      width: 25,
                      height: 25,
                      marginRight: 15,
                      marginTop: 12,
                      alignSelf: 'center',
                    }}
                  />
                </TouchableOpacity>
              )}
              {isSecondaryUHID && action !== 'firstlink' && (
                <View style={{ marginRight: 16, marginTop: 5 }}>
                  <SecondaryUHIDIconBlue
                    style={{
                      resizeMode: 'contain',
                      width: 20,
                      height: 20,
                      alignSelf: 'center',
                    }}
                  />
                  <Text style={{ ...fonts.IBMPlexSansSemiBold(10), textAlign: 'center' }}>
                    LINKED
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <Text
                style={[
                  {
                    color: isSelectedPrimaryUHID ? colors.WHITE : colors.LIGHT_BLUE,
                    textAlign: 'left',
                    top: 8,
                    marginBottom: 8,
                  },
                  isDeSelected
                    ? { ...fonts.IBMPlexSansSemiBold(16) }
                    : isSecondaryUHID
                    ? { ...fonts.IBMPlexSansSemiBold(17) }
                    : { ...fonts.IBMPlexSansSemiBold(18) },
                ]}
              >
                {profile!.firstName + ' ' + profile!.lastName}
              </Text>
              <View style={styles.separatorStyle} />
              <Text
                style={[
                  {
                    color: isSelectedPrimaryUHID ? colors.WHITE : '#0087ba',
                    textAlign: 'left',
                  },
                  isDeSelected
                    ? { ...fonts.IBMPlexSansSemiBold(10) }
                    : isSecondaryUHID
                    ? { ...fonts.IBMPlexSansSemiBold(11) }
                    : { ...fonts.IBMPlexSansSemiBold(12) },
                ]}
              >
                {profile!.relation === Relation.ME ? 'SELF' : profile!.relation}
                {profile!.relation && ' | '}
                {profile!.gender}
                {profile!.gender && ' | '}
                {profile!.dateOfBirth && moment().diff(profile!.dateOfBirth, 'years')}
              </Text>
              <View style={styles.separatorStyle} />
              <Text
                style={[
                  {
                    color: isSelectedPrimaryUHID ? colors.WHITE : '#02475b',
                    textAlign: 'left',
                  },
                  isDeSelected
                    ? { ...fonts.IBMPlexSansSemiBold(10) }
                    : isSecondaryUHID
                    ? { ...fonts.IBMPlexSansSemiBold(11) }
                    : { ...fonts.IBMPlexSansSemiBold(12) },
                ]}
              >
                UHID : {profile!.uhid}
              </Text>
              <Text
                style={[
                  {
                    color: isSelectedPrimaryUHID ? colors.WHITE : '#02475b',
                    textAlign: 'left',
                    ...fonts.IBMPlexSansMedium(12),
                  },
                  isDeSelected
                    ? { ...fonts.IBMPlexSansMedium(10) }
                    : isSecondaryUHID
                    ? { ...fonts.IBMPlexSansSemiBold(11) }
                    : { ...fonts.IBMPlexSansSemiBold(12) },
                ]}
              >
                DOB :{' '}
                {profile!.dateOfBirth && moment(profile!.dateOfBirth).format('DD MMM, YYYY')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderProfilesDetails = () => {
    return (
      <View>
        <FlatList
          data={profiles || []}
          extraData={refreshFlatList}
          renderItem={({ item, index }) => renderProfile(item, index)}
          bounces={false}
          ListEmptyComponent={
            <View>
              <Text
                style={{
                  marginTop: 20,
                  color: '#0087ba',
                  textAlign: 'center',
                  ...fonts.IBMPlexSansMedium(12),
                }}
              >
                {loading ? '' : 'No Profiles avaliable'}
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderDisclaimerBanner = () => {
    return (
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 15,
          ...viewStyles.cardViewStyle,
          ...viewStyles.shadowStyle,
          padding: 16,
          backgroundColor: colors.LIGHT_BLUE,
          flexDirection: 'row',
        }}
      >
        <Text style={styles.bannerText}>
          {action === 'delink' ? (
            'Select the UHID to DELINK from primary UHID.'
          ) : (
            <>
              {enableSelectPrimary &&
                'Create your primary UHID by selecting any one of your own profile from below.'}
              {enableSelectSecondary && 'Select your own UHID’s to link to your primary UHID.'}
            </>
          )}
        </Text>
      </View>
    );
  };

  const renderBottomStickyComponent = () => {
    return (
      <StickyBottomComponent defaultBG>
        {action === 'link' && (
          <>
            <Button
              title="SELECT"
              style={{
                flex: 1,
                marginHorizontal: 10,
                backgroundColor: enableSelect
                  ? theme.colors.DEFAULT_BACKGROUND_COLOR
                  : theme.colors.WHITE,
              }}
              titleTextStyle={{ color: theme.colors.APP_YELLOW }}
              onPress={() => {
                setEnableSelect(true);
              }}
            />
            <Button
              title="LINK"
              style={{ flex: 1, marginHorizontal: 10 }}
              onPress={() => {
                if (relinkSecondaryUHIDs.length) setShowAlert(true);
              }}
            />
          </>
        )}
        {action === 'delink' && (
          <>
            <Button
              title="SELECT"
              style={{
                flex: 1,
                marginHorizontal: 10,
                backgroundColor: enableSelect
                  ? theme.colors.DEFAULT_BACKGROUND_COLOR
                  : theme.colors.WHITE,
              }}
              titleTextStyle={{ color: theme.colors.APP_YELLOW }}
              onPress={() => {
                setEnableSelect(true);
              }}
            />
            <Button
              title="DELINK"
              style={{ flex: 1, marginHorizontal: 10 }}
              onPress={() => {
                if (delinkSecondaryUHIDs.length) setShowAlert(true);
              }}
            />
          </>
        )}
        {action === 'firstlink' && enableSelectPrimary && (
          <Button
            title="SELECT PRIMARY UHID"
            style={{ flex: 1, marginHorizontal: 50 }}
            onPress={() => {
              if (selectedPrimary) {
                profiles!.forEach((item, i) => {
                  if (item!.uhid === selectedPrimary) {
                    profiles!.splice(i, 1);
                    profiles!.unshift(item);
                  }
                });
                setPrimaryUHIDs(selectedPrimary);
                setEnableSelectPrimary(false);
                setEnableSelectSecondary(true);
              }
            }}
          />
        )}
        {action === 'firstlink' && enableSelectSecondary && (
          <Button
            title="SELECT"
            style={{
              flex: 1,
              marginHorizontal: 10,
              backgroundColor: enableSelect
                ? theme.colors.DEFAULT_BACKGROUND_COLOR
                : theme.colors.WHITE,
            }}
            titleTextStyle={{ color: theme.colors.APP_YELLOW }}
            onPress={() => {
              setEnableSelect(true);
            }}
          />
        )}
        {action === 'firstlink' && enableSelectSecondary && (
          <Button
            title="LINK"
            style={{ flex: 1, marginHorizontal: 10 }}
            onPress={() => {
              if (selectedSecondary.length) setShowAlert(true);
            }}
          />
        )}
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView
      style={{
        ...theme.viewStyles.container,
      }}
    >
      {renderHeader()}
      {showAlert && renderModal()}
      {renderDisclaimerBanner()}
      <ScrollView bounces={false}>{renderProfilesDetails()}</ScrollView>
      {!loading && renderBottomStickyComponent()}
      {bottomPopUP && (
        <BottomPopUp title="Network Error!" description={'Please try again later.'}>
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setBottomPopUP(false);
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
    </SafeAreaView>
  );
};
