import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
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
import { PatientDefaultImage } from '@aph/mobile-patients/src/components/ui/Icons';
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 90,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  closeButton: {
    position: 'absolute',
    top: -20,
    right: -20,
    backgroundColor: colors.WHITE,
    padding: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 30,
    elevation: 6,
  },
});

export interface LinkUHIDProps extends NavigationScreenProps { }

export const LinkUHID: React.FC<LinkUHIDProps> = (props) => {

  const { allCurrentPatients, currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const { loading, setLoading } = useUIElements();
  const [bottomPopUP, setBottomPopUP] = useState<boolean>(false);

  const [profiles, setProfiles] = useState<
    (getPatientByMobileNumber_getPatientByMobileNumber_patients | null)[]
  >();

  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [refreshFlatList, setRefreshFlatList] = useState<boolean>(false);
  const [selectedPrimary, setSelectedPrimary] = useState<string>('');
  const [selectedSecondary, setSelectedSecondary] = useState<getPatientByMobileNumber_getPatientByMobileNumber_patients[]>([]);
  const [enableSelectPrimary, setEnableSelectPrimary] = useState<boolean>(true);
  const [enableSelectSecondary, setEnableSelectSecondary] = useState<boolean>(false);

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
    if (allCurrentPatients) {
      setLoading && setLoading(false);
      setProfiles(allCurrentPatients.filter((item) => item.id !== item.emailAddress));
    }
  }, [allCurrentPatients]);

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    props.navigation.goBack();
    return false;
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{ borderBottomWidth: 0 }}
          title={'LINK UHID'}
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
        onRequestClose={() => {setShowAlert(false);}}
        onDismiss={()=>{setShowAlert(false);}}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAlert(false);
              }}
            >
              <Text style={{ color: theme.colors.APP_YELLOW}}>X</Text>
            </TouchableOpacity>
            <Text style={{...fonts.IBMPlexSansRegular(16), marginBottom: 20, color: colors.BLACK_COLOR}}>
              Are you sure you want to 
              <Text 
                style={{...fonts.IBMPlexSansSemiBold(16)}}
              > link your UHID’s.</Text>
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '90%',
              }}
            >
              <Button
                title="NO"
                style={{
                  alignContent: 'center',
                  width: '40%',
                  backgroundColor: colors.WHITE,
                  paddingLeft: 15,
                  paddingRight: 15,
                }}
                titleTextStyle={{
                  color: theme.colors.BUTTON_BG,
                  ...fonts.IBMPlexSansSemiBold(16)
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
                  paddingLeft: 15,
                  paddingRight: 15,
                }}
                titleTextStyle={{
                  ...fonts.IBMPlexSansSemiBold(16)
                }}
                onPress={() => {
                  setShowAlert(false);
                  // secondary uhid api call and open manage profile
                  props.navigation.navigate(AppRoutes.ManageProfile, {
                    primaryUHID: selectedPrimary,
                    secondaryUHID: selectedSecondary,
                  });
                }}
              />
            </View>
            <Text style={{...fonts.IBMPlexSansRegular(12), marginTop: 20, color: colors.BLACK_COLOR}}>
              Once you link your UHID’s to your
                <Text 
                  style={{...fonts.IBMPlexSansSemiBold(12)}}
                > Primary UHID, </Text>
              you can always Delink them later.
            </Text>
          </View>
        </View>
      </Modal>
    )
  };

  const renderProfile = (
    profile: getPatientByMobileNumber_getPatientByMobileNumber_patients | null,
    index: number
  ) => {
    const isSelectedPrimaryUHID = enableSelectSecondary && (profile!.id === selectedPrimary);
    const indexOfId = selectedSecondary.indexOf(profiles[index].id);
    return (
      <View
        key={index}
        style={[
          { marginHorizontal: 20 },
          profiles && index < profiles.length - 1 ? { marginBottom: 8 } : { marginBottom: 80 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          key={index}
          onPress={() => {
            if (enableSelectSecondary) {
              if (profiles) {
                if (indexOfId > -1) {
                  selectedSecondary.splice(indexOfId, 1);
                } else {
                  setSelectedSecondary([...selectedSecondary, profiles[index].id]);
                }
                setRefreshFlatList(!refreshFlatList);
              }
            }
            else if (enableSelectPrimary) {
              if (profiles) setSelectedPrimary(profiles[index].id);
              setRefreshFlatList(!refreshFlatList);
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
              //  marginTop: i === 0 ? 16 : 8,
              },
              isSelectedPrimaryUHID ? {backgroundColor: theme.colors.APP_YELLOW_COLOR} : {backgroundColor: colors.WHITE},
          ]}
            key={index}
          >
            {
              isSelectedPrimaryUHID &&
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
            }
            {
              (enableSelectSecondary && !isSelectedPrimaryUHID) && 
              <View 
                style={[
                  styles.circle,
                  (indexOfId > -1) ? {backgroundColor: theme.colors.INPUT_CURSOR_COLOR} : {},
                ]} />
            }
            {
              (enableSelectPrimary) &&
              <View 
                style={[
                  styles.circle,
                  profile!.id === selectedPrimary ? {backgroundColor: theme.colors.INPUT_CURSOR_COLOR} : {},
                ]} />
            }
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

            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <Text
                style={{
                  color: isSelectedPrimaryUHID ? colors.WHITE : colors.LIGHT_BLUE,
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
                  color: isSelectedPrimaryUHID ? colors.WHITE : '#0087ba',
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
                  color: isSelectedPrimaryUHID ? colors.WHITE : '#02475b',
                  textAlign: 'left',
                  ...fonts.IBMPlexSansMedium(12),
                }}
              >
                UHID : {profile!.uhid}
              </Text>
              <Text
                style={{
                  color: isSelectedPrimaryUHID ? colors.WHITE : '#02475b',
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
          {enableSelectPrimary && 'Create your primary UHID by selecting any one of your own profile from below.'}
          {enableSelectSecondary && 'Select your own UHID’s to link to your primary UHID.'}
        </Text>
      </View>
    )
  };

  const renderBottomStickyComponent = () => {
    return (
      <StickyBottomComponent defaultBG style={{}}>
        {
          enableSelectPrimary && (
            <Button
              title="SELECT PRIMARY UHID"
              style={{ flex: 1, marginHorizontal: 50 }}
              onPress={() => {
                // check if any profile is selected
                if (selectedPrimary) {
                  setEnableSelectPrimary(false);
                  setEnableSelectSecondary(true);
                }
              }}
            />
          )
        }
        {
          enableSelectSecondary && (
            <Button
              title="SELECT"
              style={{ flex: 1, marginHorizontal: 10, backgroundColor: theme.colors.BUTTON_BG, }}
              onPress={() => {
                // console.log('select');
              }}
            />
          )
        }
        {
          enableSelectSecondary && (
            <Button
              title="LINK"
              style={{ flex: 1, marginHorizontal: 10 }}
              onPress={() => {
                setShowAlert(true);
              }}
            />
          )
        }
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
  )
};
