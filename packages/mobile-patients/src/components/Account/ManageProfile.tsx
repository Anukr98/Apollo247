import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { getPatientByMobileNumber_getPatientByMobileNumber_patients } from '@aph/mobile-patients/src/graphql/types/getPatientByMobileNumber';
import { Gender, Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  PatientDefaultImage,
  PrimaryUHIDIconWhite,
  PrimaryUHIDIconBlue,
  SecondaryUHIDIconBlue,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';

const styles = StyleSheet.create({
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  profileImageStyle: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imageView: {
    marginRight: 16,
    overflow: 'hidden',
    resizeMode: 'contain',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImageStyleSecondary: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  imageViewSecondary: {
    marginRight: 10,
    overflow: 'hidden',
    resizeMode: 'contain',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  readMoreBanner: {
    ...viewStyles.cardViewStyle,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  readMoreText: {
    color: colors.LIGHT_BLUE,
    padding: 6,
    paddingLeft: 20,
    paddingRight: 20,
  },
  bannerText: {
    color: colors.WHITE,
    ...fonts.IBMPlexSansMedium(15),
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

let count = 0;
let primary;
let secondary = [];
let areUhidsLinked = false;

type profile = {
  id?: number;
  email?: string;
  firstName: string;
  lastName: string;
  relation: Relation | undefined;
  gender: Gender | undefined;
  uhid?: string;
  dateOfBirth?: Date;
  photoUrl?: string;
  image?: ImageSourcePropType;
};

export interface ManageProfileProps extends NavigationScreenProps {}

export const ManageProfile: React.FC<ManageProfileProps> = (props) => {
  const { loading, setLoading } = useUIElements();
  const { height } = Dimensions.get('window');
  const heightPercent = Math.round((5 * height) / 100);

  const [profiles, setProfiles] = useState<
    (getPatientByMobileNumber_getPatientByMobileNumber_patients | null)[]
  >();
  const [bottomPopUP, setBottomPopUP] = useState<boolean>(false);
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  const [showLinkUhid, setShowLinkUhid] = useState<boolean>(true);
  const [showLinkButtons, setShowLinkButtons] = useState<boolean>(false);
  const [showSecondaryUhids, setShowSecondaryUHIDs] = useState<boolean>(true);
  const [primaryUHIDs, setPrimaryUHIDs] = useState<string>('');
  const [secondaryUHIDs, setSecondaryUHIDs] = useState<string[]>([]);
  const [firstSecondaryUHID, setFirstSecondaryUHID] = useState<string>('');
  const [showLinkUHIDButton, setShowLinkUHIDButton] = useState<boolean>(true);

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    props.navigation.goBack();
    return false;
  };

  useEffect(() => {
    setLoading && setLoading(true);
    if (allCurrentPatients) {
      const profiles = allCurrentPatients.filter((item) => item.id !== item.emailAddress);
      checkForLinkedProfiles(profiles);
    } else {
      getPatientApiCall();
      setLoading && setLoading(true);
    }
  }, []);

  useEffect(() => {
    if (allCurrentPatients) {
      setLoading && setLoading(true);
      const profiles = allCurrentPatients.filter((item) => item.id !== item.emailAddress);
      checkForLinkedProfiles(profiles);
    }
  }, [allCurrentPatients]);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      count = 0;
      primary = {};
      secondary = [];
      areUhidsLinked = false;
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [props.navigation]);

  const checkForLinkedProfiles = (
    profiles: getPatientByMobileNumber_getPatientByMobileNumber_patients[]
  ) => {
    profiles!.forEach((profile) => {
      if (profile!.isUhidPrimary) {
        count++;
        setPrimaryUHIDs(profile!.uhid);
        primary = profile;
        areUhidsLinked = true;
      } else if (profile!.isLinked) {
        count++;
        secondary.push(profile!.uhid);
      }
    });
    setShowLinkUHIDButton(count !== profiles.length);
    setShowLinkUhid(profiles.length !== 1);

    if (areUhidsLinked) {
      // shuffle array as [primary, [...secondary], [...unlined]]
      setShowLinkButtons(true);
      setSecondaryUHIDs(secondary);
      setFirstSecondaryUHID(secondary[0]);
      setShowSecondaryUHIDs(false);
      const filteredArray = profiles!.filter((item) => {
        return item!.uhid !== primary!.uhid && !secondary.includes(item!.uhid);
      });
      const primaryArray = profiles!.filter((item) => item!.uhid === primary!.uhid);
      const secondaryArray = profiles!.filter((item) => secondary.includes(item!.uhid));
      const profileArray = [...primaryArray, ...secondaryArray, ...filteredArray];
      setProfiles(profileArray);
    } else {
      setPrimaryUHIDs('');
      setShowLinkButtons(false);
      setSecondaryUHIDs([]);
      setFirstSecondaryUHID('');
      setShowSecondaryUHIDs(true);
      setProfiles(profiles);
    }
    setLoading && setLoading(false);
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{ borderBottomWidth: 0 }}
          title={'MANAGE FAMILY MEMBERS'}
          leftIcon="backArrow"
          onPressLeftIcon={() => backDataFunctionality()}
        />
      </View>
    );
  };
  const renderProfile = (
    profile: getPatientByMobileNumber_getPatientByMobileNumber_patients | null,
    index: number
  ) => {
    const isPrimaryUHID = showLinkButtons && primaryUHIDs === profile!.uhid;
    const isSecondaryUHID = showLinkButtons && secondaryUHIDs.indexOf(profile!.uhid) > -1;
    const isFirstSecondaryId = showLinkButtons
      ? firstSecondaryUHID === profile!.uhid
        ? true
        : false
      : false;
    return (
      <View
        key={index}
        style={[
          { marginHorizontal: 20 },
          profiles && index < profiles.length - 1
            ? { marginBottom: isSecondaryUHID && !showSecondaryUhids ? 0 : 8 }
            : { marginBottom: 80 },
          index == 0 ? { marginTop: 20 } : { margin: 0 },
        ]}
      >
        {showSecondaryUhids && isSecondaryUHID && (
          <View>
            <View
              style={[
                {
                  position: 'absolute',
                  top: isFirstSecondaryId ? -10 : -80,
                  left: 30,
                  width: 40,
                  height: isFirstSecondaryId ? 80 : 150,
                  borderColor: theme.colors.LIGHT_BLUE,
                  borderLeftWidth: 1,
                  borderBottomWidth: 1,
                  zIndex: 0,
                },
                heightPercent <= 30 ? { width: 30 } : { width: 40 },
              ]}
            />
            <View
              style={[
                {
                  position: 'absolute',
                  top: 60,
                  left: 58,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  borderColor: theme.colors.LIGHT_BLUE,
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                  borderBottomWidth: 2,
                  borderRightWidth: 2,
                  backgroundColor: theme.colors.WHITE,
                  zIndex: 2,
                },
                heightPercent <= 30 ? { left: 48 } : { left: 58 },
              ]}
            />
          </View>
        )}
        <TouchableOpacity
          activeOpacity={1}
          key={index}
          onPress={() => {
            props.navigation.navigate(AppRoutes.EditProfile, {
              isEdit: true,
              profileData: profile,
              mobileNumber: currentPatient && currentPatient!.mobileNumber,
            });
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
              isPrimaryUHID
                ? { backgroundColor: theme.colors.APP_YELLOW_COLOR }
                : { backgroundColor: colors.WHITE },
              isSecondaryUHID ? styles.secondaryUHIDCard : { display: 'flex' },
              isSecondaryUHID && !showSecondaryUhids ? { display: 'none' } : { display: 'flex' },
            ]}
            key={index}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              <View style={isSecondaryUHID ? styles.imageViewSecondary : styles.imageView}>
                {profile!.photoUrl &&
                profile!.photoUrl.match(
                  /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/
                ) ? (
                  <Image
                    style={styles.profileImageStyle}
                    source={{
                      uri: profile!.photoUrl,
                    }}
                  />
                ) : (
                  <PatientDefaultImage
                    style={
                      isSecondaryUHID ? styles.profileImageStyleSecondary : styles.profileImageStyle
                    }
                  />
                )}
              </View>
              {isPrimaryUHID && (
                <TouchableOpacity onPress={() => setShowSecondaryUHIDs(!showSecondaryUhids)}>
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
              {isSecondaryUHID && (
                <View style={{ marginRight: 10, marginTop: 5 }}>
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
                    color: isPrimaryUHID ? colors.WHITE : colors.LIGHT_BLUE,
                    textAlign: 'left',
                    top: 8,
                    marginBottom: 8,
                  },
                  isSecondaryUHID
                    ? { ...fonts.IBMPlexSansSemiBold(16) }
                    : { ...fonts.IBMPlexSansSemiBold(18) },
                ]}
              >
                {profile!.firstName + ' ' + profile!.lastName}
              </Text>
              <View style={styles.separatorStyle} />
              <Text
                style={[
                  {
                    color: isPrimaryUHID ? colors.WHITE : '#0087ba',
                    textAlign: 'left',
                  },
                  isSecondaryUHID
                    ? { ...fonts.IBMPlexSansSemiBold(10) }
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
                    color: isPrimaryUHID ? colors.WHITE : '#02475b',
                    textAlign: 'left',
                    ...fonts.IBMPlexSansMedium(12),
                  },
                  isSecondaryUHID
                    ? { ...fonts.IBMPlexSansSemiBold(10) }
                    : { ...fonts.IBMPlexSansSemiBold(12) },
                ]}
              >
                UHID : {profile!.uhid}
              </Text>
              <Text
                style={[
                  {
                    color: isPrimaryUHID ? colors.WHITE : '#02475b',
                    textAlign: 'left',
                    ...fonts.IBMPlexSansMedium(12),
                  },
                  isSecondaryUHID
                    ? { ...fonts.IBMPlexSansSemiBold(10) }
                    : { ...fonts.IBMPlexSansSemiBold(12) },
                ]}
              >
                DOB : {profile!.dateOfBirth && moment(profile!.dateOfBirth).format('DD MMM, YYYY')}
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
                {loading ? '' : 'No Profiles avaliable'}
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
          paddingBottom: 28,
          backgroundColor: colors.LIGHT_BLUE,
          flexDirection: 'row',
        }}
      >
        {showLinkButtons ? (
          <Text style={styles.bannerText}>
            Your UHID are linked. Click on{' '}
            <PrimaryUHIDIconWhite
              style={{
                resizeMode: 'contain',
                width: 20,
                height: 20,
              }}
            />{' '}
            icon to view them.
          </Text>
        ) : (
          <>
            <Text
              style={[
                styles.bannerText,
                heightPercent <= 31
                  ? { ...fonts.IBMPlexSansMedium(13) }
                  : { ...fonts.IBMPlexSansMedium(15) },
              ]}
            >
              Create your primary UHID by selecting any one of your own profile from below.
            </Text>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.readMoreBanner}
              onPress={() => {
                props.navigation.navigate(AppRoutes.ReadMoreLinkUHID);
              }}
            >
              <Text
                style={[
                  styles.readMoreText,
                  heightPercent <= 31
                    ? { ...fonts.IBMPlexSansMedium(9) }
                    : { ...fonts.IBMPlexSansMedium(10) },
                ]}
              >
                Read More
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const renderLinkingButtons = () => {
    return (
      <StickyBottomComponent defaultBG style={{ minHeight: 120 }}>
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Button
            title="ADD NEW PROFILE"
            style={{
              flex: 1,
              marginHorizontal: 20,
              width: '60%',
              alignSelf: 'center',
              marginBottom: 15,
            }}
            onPress={() => {
              props.navigation.navigate(AppRoutes.EditProfile, {
                isEdit: false,
                mobileNumber: currentPatient && currentPatient!.mobileNumber,
              });
            }}
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: !showLinkUHIDButton ? 'center' : 'space-between',
            }}
          >
            {showLinkUHIDButton && (
              <Button
                title="LINK"
                style={{ flex: 1, marginHorizontal: 20, backgroundColor: colors.WHITE }}
                titleTextStyle={{
                  color: theme.colors.BUTTON_BG,
                  ...fonts.IBMPlexSansSemiBold(16),
                }}
                onPress={() => {
                  props.navigation.navigate(AppRoutes.LinkUHID, {
                    action: 'link',
                    profiles: profiles,
                  });
                }}
              />
            )}
            <Button
              title="DELINK"
              style={
                showLinkUHIDButton
                  ? {
                      flex: 1,
                      marginHorizontal: 20,
                      backgroundColor: colors.WHITE,
                    }
                  : {
                      backgroundColor: colors.WHITE,
                      marginHorizontal: 20,
                      width: '45%',
                      alignSelf: 'center',
                      marginBottom: 15,
                    }
              }
              titleTextStyle={{
                color: theme.colors.BUTTON_BG,
                ...fonts.IBMPlexSansSemiBold(16),
              }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.LinkUHID, {
                  action: 'delink',
                  profiles: profiles,
                });
              }}
            />
          </View>
        </View>
      </StickyBottomComponent>
    );
  };

  const renderBottomStickyComponent = () => {
    return (
      <StickyBottomComponent defaultBG style={{ minHeight: showLinkUhid ? 120 : 60 }}>
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {showLinkUhid && (
            <Button
              title="LINK UHID"
              style={{
                flex: 1,
                marginHorizontal: 20,
                width: '35%',
                alignSelf: 'center',
                marginBottom: 15,
              }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.LinkUHID, {
                  action: 'firstlink',
                  profiles: profiles,
                });
              }}
            />
          )}
          <Button
            title="ADD NEW PROFILE"
            style={{
              flex: 1,
              marginHorizontal: 20,
              width: '75%',
              alignSelf: 'center',
              backgroundColor: theme.colors.LIGHT_BLUE,
            }}
            onPress={() => {
              props.navigation.navigate(AppRoutes.EditProfile, {
                isEdit: false,
                mobileNumber: currentPatient && currentPatient!.mobileNumber,
              });
            }}
          />
        </View>
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
      {renderDisclaimerBanner()}
      <ScrollView
        bounces={false}
        style={showLinkButtons ? { marginBottom: 120 } : { marginBottom: 90 }}
      >
        {renderProfilesDetails()}
      </ScrollView>
      {!loading ? showLinkButtons ? renderLinkingButtons() : renderBottomStickyComponent() : <></>}
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
