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
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
  Image,
  ImageSourcePropType,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { GET_PATIENTS_MOBILE } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientByMobileNumber,
  getPatientByMobileNumberVariables,
  getPatientByMobileNumber_getPatientByMobileNumber_patients,
} from '@aph/mobile-patients/src/graphql/types/getPatientByMobileNumber';
import { Gender, Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { PatientDefaultImage, PrimaryUHIDIconWhite, PrimaryUHIDIconBlue, } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';

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
  imageView: {
    marginRight: 16,
    overflow: 'hidden',
    resizeMode: 'contain',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  readMoreBanner: {
    ...viewStyles.cardViewStyle,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  readMoreText: {
    color: colors.LIGHT_BLUE,
    ...fonts.IBMPlexSansMedium(11),
    padding: 6,
    paddingLeft: 20,
    paddingRight: 20,
  },
  bannerText: {
    color: colors.WHITE,
    ...fonts.IBMPlexSansMedium(15),
  },
  secondaryUHIDCard: {
    width:'80%',
    alignSelf: 'flex-end',
    minHeight: 130,
    padding: 10,
    borderRadius: 10,
    borderColor: theme.colors.APP_YELLOW,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  }
});

type profile = {
  id?: number;
  email?: string;
  firstName: string;
  lastName: string;
  relation: Relation | undefined;
  gender: Gender | undefined;
  //  descripiton: string;
  uhid?: string;
  dateOfBirth?: Date;
  photoUrl?: string;
  image?: ImageSourcePropType;
};

export interface ManageProfileProps extends NavigationScreenProps {}

export const ManageProfile: React.FC<ManageProfileProps> = (props) => {
  const client = useApolloClient();
  const { loading, setLoading } = useUIElements();

  const [profiles, setProfiles] = useState<
    (getPatientByMobileNumber_getPatientByMobileNumber_patients | null)[]
  >();
  const [bottomPopUP, setBottomPopUP] = useState<boolean>(false);
  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  const [showLinkUhid, setShowLinkUhid] = useState<boolean>(true);
  const [showLinkButtons, setShowLinkButtons] = useState<boolean>(false);
  const [primaryUHIDs, setPrimaryUHIDs] = useState<string>('');
  const [secondaryUHIDs, setSecondaryUHIDs] = useState<string[]>([]);

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    props.navigation.goBack();
    return false;
  };

  useEffect(() => {
    setLoading && setLoading(true);
    if (allCurrentPatients) {
      setProfiles(allCurrentPatients.filter((item) => item.id !== item.emailAddress));
      setLoading && setLoading(false);
    } else {
      getPatientApiCall();
      setLoading && setLoading(true);
    }
  }, []);

  useEffect(() => {
    // setLoading!(true);
    // client
    //   .query<getPatientByMobileNumber, getPatientByMobileNumberVariables>({
    //     query: GET_PATIENTS_MOBILE,
    //     variables: {
    //       mobileNumber: currentPatient && currentPatient!.mobileNumber,
    //     },
    //     fetchPolicy: 'no-cache',
    //   })
    //   .then((data) => {
    //     const profileData = data.data.getPatientByMobileNumber;
    //     profileData && setProfiles(profileData!.patients!);
    //   })
    //   .catch((e: any) => {
    //     setBottomPopUP(true);
    //   })
    //   .finally(() => {
    //     setLoading!(false);
    //   });
    if (allCurrentPatients) {
      setLoading && setLoading(false);
      setProfiles(allCurrentPatients.filter((item) => item.id !== item.emailAddress));
    }
  }, [allCurrentPatients]);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      if (props.navigation.state.params!.primaryUHID && props.navigation.state.params!.secondaryUHID) {
        setPrimaryUHIDs(props.navigation.state.params!.primaryUHID);
        setSecondaryUHIDs(props.navigation.state.params!.secondaryUHID);
        setShowLinkButtons(true);
        setShowLinkUhid(false);
      }
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [props.navigation]);

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{ borderBottomWidth: 0 }}
          title={'MANAGE PROFILES'}
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
    const isPrimaryUHID = showLinkButtons && (primaryUHIDs === profile!.id);
    const idSecondaryUHID = showLinkButtons && (secondaryUHIDs.indexOf(profile!.id) > -1);
    const isFirstSecondaryId = showLinkButtons ? (secondaryUHIDs[0] === profile!.id ? true : false) : false;
    return (
      <View
        key={index}
        style={[
          { marginHorizontal: 20 },
          profiles && index < profiles.length - 1 ? { marginBottom: 8 } : { marginBottom: 80 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
      >
        {
          idSecondaryUHID && (
            <View style={{zIndex: 1}}>
              <View
                style={{
                  position: 'absolute',
                  top: isFirstSecondaryId ? -10 : -80,
                  left: 30,
                  width: 40,
                  height: isFirstSecondaryId ? 80 : 150,
                  borderColor: theme.colors.LIGHT_BLUE,
                  borderLeftWidth: 1,
                  borderBottomWidth: 1,
                  zIndex: 0,
                }}
              />
              <View
                style={{
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
                }}
              />
            </View>
          )
        }
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
                //  marginTop: i === 0 ? 16 : 8,
              },
              isPrimaryUHID ? {backgroundColor: theme.colors.APP_YELLOW_COLOR, zIndex: 6} : {backgroundColor: colors.WHITE},
              idSecondaryUHID ? styles.secondaryUHIDCard : {},
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
              <View style={styles.imageView}>
                {profile!.photoUrl &&
                profile!.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/) ? (
                  <Image
                    style={styles.profileImageStyle}
                    source={{
                      uri: profile!.photoUrl,
                    }}
                    // resizeMode={'contain'}
                  />
                ) : (
                  <PatientDefaultImage style={styles.profileImageStyle} />
                )}
                {/* {profile.photoUrl &&
        profile.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/) && ( */}
                {/* <Image style={styles.profileImageStyle} source={profile.image} /> */}
                {/* )} */}
              </View>
              {
                isPrimaryUHID && (
                  <PrimaryUHIDIconBlue style={{
                    width: 20,
                    height: 20,
                    marginRight: 16,
                    marginTop: 16,
                    alignSelf: 'center'
                  }} />
                )
              }
            </View>

            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <Text
                style={{
                  color: isPrimaryUHID ? colors.WHITE : colors.LIGHT_BLUE,
                  textAlign: 'left',
                  ...fonts.IBMPlexSansSemiBold(18),
                  top: 8,
                  marginBottom: 8,
                }}
              >
                {profile!.firstName + ' ' + profile!.lastName}
              </Text>
              <View style={styles.separatorStyle} />
              <Text
                style={{
                  color: isPrimaryUHID ? colors.WHITE : '#0087ba',
                  textAlign: 'left',
                  ...fonts.IBMPlexSansMedium(12),
                }}
              >
                {profile!.relation === Relation.ME ? 'SELF' : profile!.relation}
                {profile!.relation && ' | '}
                {profile!.gender}
                {profile!.gender && ' | '}
                {profile!.dateOfBirth && moment().diff(profile!.dateOfBirth, 'years')}
              </Text>
              <View style={styles.separatorStyle} />
              <Text
                style={{
                  color: isPrimaryUHID ? colors.WHITE : '#02475b',
                  textAlign: 'left',
                  ...fonts.IBMPlexSansMedium(12),
                }}
              >
                UHID : {profile!.uhid}
              </Text>
              <Text
                style={{
                  color: isPrimaryUHID ? colors.WHITE : '#02475b',
                  textAlign: 'left',
                  ...fonts.IBMPlexSansMedium(12),
                }}
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
        {
          showLinkButtons ? (
            <Text style={styles.bannerText}>
              Your UHID are linked.Click on <PrimaryUHIDIconWhite style={{
                width: 20,
                height: 20,
              }} /> icon to view them.
            </Text>
          ) : (
            <>
              <Text style={styles.bannerText}>
                Create your primary UHID by selecting any one of your own profile from below.
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.readMoreBanner}
                onPress={() => {
                  props.navigation.navigate(AppRoutes.ReadMoreLinkUHID);
                }}>
                  <Text style={styles.readMoreText}>
                    Read More
                  </Text>
              </TouchableOpacity>
            </>
          )
        }
        
      </View>
    )
  };

  const renderLinkingButtons = () => {
    return (
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
          title="ADD NEW PROFILE"
          style={{ flex: 1 ,marginHorizontal: 20, width: '60%', alignSelf: 'center', marginBottom: 20 }}
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
            justifyContent: 'space-between',
          }}
        >
          <Button
            title="LINK"
            style={{ flex: 1, marginHorizontal: 20, backgroundColor: colors.WHITE, }}
            titleTextStyle={{
              color: theme.colors.BUTTON_BG,
              ...fonts.IBMPlexSansSemiBold(16)
            }}
            onPress={() => {
              console.log('link');
            }}
          />
          <Button
            title="DELINK"
            style={{ flex: 1, marginHorizontal: 20, backgroundColor: colors.WHITE, }}
            titleTextStyle={{
              color: theme.colors.BUTTON_BG,
              ...fonts.IBMPlexSansSemiBold(16)
            }}
            onPress={() => {
              console.log('delink');
            }}
          />
        </View>
      </View>
    );
  };

  const renderBottomStickyComponent = () => {
    return (
      <StickyBottomComponent defaultBG style={{}}>
        {
          showLinkUhid && (
            <Button
              title="LINK UHID"
              style={{ flex: 1, marginHorizontal: 10 }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.LinkUHID);
              }}
            />
          )
        }
        <Button
          title="ADD NEW PROFILE"
          style={{ flex: 1, marginHorizontal: 10 }}
          onPress={() => {
            props.navigation.navigate(AppRoutes.EditProfile, {
              isEdit: false,
              mobileNumber: currentPatient && currentPatient!.mobileNumber,
            });
          }}
        />
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
      {/* condition on disclainer banner */}
      {renderDisclaimerBanner()}
      <ScrollView bounces={false}>{renderProfilesDetails()}</ScrollView>
      {!loading ? (showLinkButtons ? renderLinkingButtons() : renderBottomStickyComponent()) : {}}
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
