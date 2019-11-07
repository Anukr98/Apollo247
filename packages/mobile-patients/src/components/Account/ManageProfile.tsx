import React, { useState, useEffect } from 'react';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  BackHandler,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import { Relation, Gender } from '../../graphql/types/globalTypes';
import { PatientDefaultImage } from '../ui/Icons';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { GET_PATIENTS_MOBILE } from '../../graphql/profiles';
import {
  getPatientByMobileNumberVariables,
  getPatientByMobileNumber,
  getPatientByMobileNumber_getPatientByMobileNumber_patients,
} from '../../graphql/types/getPatientByMobileNumber';

const styles = StyleSheet.create({
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  profileImageStyle: { width: 80, height: 80, borderRadius: 40 },
  imageView: {
    marginRight: 16,
    overflow: 'hidden',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});

export interface ManageProfileProps extends NavigationScreenProps {}

export const ManageProfile: React.FC<ManageProfileProps> = (props) => {
  const date = new Date();
  date.setFullYear(1987, 10, 27);
  const client = useApolloClient();
  const [profiles, setProfiles] = useState<
    (getPatientByMobileNumber_getPatientByMobileNumber_patients | null)[]
  >();
  const { currentPatient } = useAllCurrentPatients();

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    props.navigation.goBack();
    return false;
  };
  useEffect(() => {
    console.log(currentPatient!.mobileNumber);
    client
      .query<getPatientByMobileNumber, getPatientByMobileNumberVariables>({
        query: GET_PATIENTS_MOBILE,
        variables: {
          mobileNumber: currentPatient!.mobileNumber,
        },

        fetchPolicy: 'no-cache',
      })
      .then(({ data: { getPatientByMobileNumber } }) => {
        try {
          if (
            getPatientByMobileNumber &&
            getPatientByMobileNumber.patients &&
            getPatientByMobileNumber.patients.length
          ) {
            console.log(getPatientByMobileNumber.patients);
            setProfiles(getPatientByMobileNumber.patients);
          }
        } catch (error) {
          console.log('error', error);
        }
      })
      .catch((e: any) => {
        console.log('error', e);
      })
      .finally(() => {});
  }, []);

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{ borderBottomWidth: 0 }}
          title={'MANAGE PROFILES'}
          leftIcon="backArrow"
          onPressLeftIcon={() => backDataFunctionality()}
        />
      </View>
    );
  };

  const renderProfilesDetails = () => {
    if (profiles)
      return (
        <View>
          {profiles.map((item, i) =>
            item ? (
              <View key={i} style={{}}>
                <TouchableOpacity
                  activeOpacity={1}
                  key={i}
                  // onPress={() => {
                  //   props.navigation.navigate(AppRoutes.EditProfile, {
                  //     isEdit: true,
                  //     profileData: profile,
                  //   });
                  // }}
                >
                  <View
                    style={{
                      ...viewStyles.cardViewStyle,
                      ...viewStyles.shadowStyle,
                      padding: 16,
                      marginHorizontal: 20,
                      backgroundColor: colors.WHITE,
                      flexDirection: 'row',
                      height: 145,
                      marginTop: i === 0 ? 16 : 8,
                      marginBottom: 8,
                    }}
                  >
                    <View style={styles.imageView}>
                      {item.photoUrl &&
                      item.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/) ? (
                        <Image
                          style={styles.profileImageStyle}
                          source={{
                            uri: item.photoUrl,
                          }}
                          resizeMode={'contain'}
                        />
                      ) : (
                        <PatientDefaultImage style={styles.profileImageStyle} />
                      )}
                      {/* {profile.photoUrl &&
                            profile.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/) && ( */}
                      {/* <Image style={styles.profileImageStyle} source={profile.image} /> */}
                      {/* )} */}
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
                        {item.firstName + ' ' + item.lastName}
                      </Text>
                      <View style={styles.separatorStyle} />
                      <Text
                        style={{
                          color: '#0087ba',
                          textAlign: 'left',
                          ...fonts.IBMPlexSansMedium(12),
                        }}
                      >
                        {item.relation} &nbsp; | &nbsp; {item.gender} &nbsp;| &nbsp;
                        {item.dateOfBirth && moment().diff(item.dateOfBirth, 'years')}
                      </Text>
                      <View style={styles.separatorStyle} />
                      <Text
                        style={{
                          color: '#02475b',
                          textAlign: 'left',
                          ...fonts.IBMPlexSansMedium(12),
                        }}
                      >
                        UHID : {item.uhid}
                      </Text>
                      <Text
                        style={{
                          color: '#02475b',
                          textAlign: 'left',
                          ...fonts.IBMPlexSansMedium(12),
                        }}
                      >
                        DOB : {item.dateOfBirth && moment(item.dateOfBirth).format('DD MMM, YYYY')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null
          )}
        </View>
      );
  };

  const renderBottomStickyComponent = () => {
    return (
      <StickyBottomComponent defaultBG style={{}}>
        <Button
          title="ADD NEW PROFILE"
          style={{ flex: 1, marginHorizontal: 60 }}
          // onPress={() => props.navigation.navigate(AppRoutes.EditProfile, { isEdit: false })}
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
      {renderBottomStickyComponent()}
    </SafeAreaView>
  );
};
