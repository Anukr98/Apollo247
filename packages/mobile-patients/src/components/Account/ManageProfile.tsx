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
import { PatientDefaultImage } from '@aph/mobile-patients/src/components/ui/Icons';
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

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{ borderBottomWidth: 0 }}
          title={'MANAGE FAMILY MEMBERS'}
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
            props.navigation.navigate(AppRoutes.EditProfile, {
              isEdit: true,
              profileData: profile,
              mobileNumber: currentPatient && currentPatient!.mobileNumber,
            });
          }}
        >
          <View
            style={{
              ...viewStyles.cardViewStyle,
              ...viewStyles.shadowStyle,
              padding: 16,
              backgroundColor: colors.WHITE,
              flexDirection: 'row',
              minHeight: 145,
              //  marginTop: i === 0 ? 16 : 8,
            }}
            key={index}
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

            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <Text
                style={{
                  color: colors.LIGHT_BLUE,
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
                  color: '#0087ba',
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
                  color: '#02475b',
                  textAlign: 'left',
                  ...fonts.IBMPlexSansMedium(12),
                }}
              >
                UHID : {profile!.uhid}
              </Text>
              <Text
                style={{
                  color: '#02475b',
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

  const renderBottomStickyComponent = () => {
    return (
      <StickyBottomComponent defaultBG style={{}}>
        <Button
          title="ADD NEW PROFILE"
          style={{ flex: 1, marginHorizontal: 60 }}
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
