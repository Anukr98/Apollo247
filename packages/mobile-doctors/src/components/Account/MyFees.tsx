import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  BackArrow,
  Down,
  RoundChatIcon,
  RoundIcon,
  Up,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7', //theme.colors.DEFAULT_BACKGROUND_COLOR,
  },

  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    //marginTop: 20,
  },
  feeeducation: {
    color: 'rgba(2, 71, 91, 0.5)',
    fontFamily: 'IBMPlexSans',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  feeeducationbold: {
    color: 'rgba(2, 71, 91, 0.5)',
    fontFamily: 'IBMPlexSans-SemiBold',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  feeeducationtext: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    marginBottom: 16,
    letterSpacing: 0.35,
    marginTop: 2,
    marginRight: 16,
  },
  feeeducationtextname: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: 'rgba(2, 71, 91, 0.5)',
    marginBottom: 16,
    letterSpacing: 0.35,
    marginTop: 4,
  },
  feeeducationname: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.3,
  },
  commonView: {
    flexDirection: 'column',
    marginLeft: 16,
  },
  paymentbutton: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginRight: 20,
  },
  understatusline: {
    width: '100%',
    backgroundColor: '#02475b',
    opacity: 0.1,
    marginBottom: 16,
    marginLeft: 15,
    ...ifIphoneX(
      {
        height: 1,
      },
      {
        height: 1,
      }
    ),
  },
});

export interface ProfileProps
  extends NavigationScreenProps<{
    ProfileData: GetDoctorDetails_getDoctorDetails;

    //navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  }> {
  //profileData: object;
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const MyFees: React.FC<ProfileProps> = (props) => {
  const profileData = props.navigation.getParam('ProfileData');
  console.log('p', profileData);
  const BankDetails = profileData!.packages![0];
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showHelpModel, setshowHelpModel] = useState(false);

  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{
          height: 50,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowRadius: 10,
          shadowOpacity: 0.2,
          elevation: 5,
        }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText={strings.account.fees.toUpperCase()}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => setshowHelpModel(true),
          },
        ]}
      />
    );
  };
  const feeprofileRowBold = (title: JSX.Element, description: string) => {
    if (!description) return null;
    return (
      <View style={styles.commonView}>
        {title}
        <Text style={styles.feeeducationtext}>
          {strings.common.rupees} {description}
        </Text>
      </View>
    );
  };
  const feeprofileRow = (title: string, description: string) => {
    if (!description) return null;
    return (
      <View style={styles.commonView}>
        <Text style={styles.feeeducation}> {title}</Text>
        <Text style={styles.feeeducationtext}>{description}</Text>
      </View>
    );
  };
  const feeprofileRowdetails = (title: string, description: string) => {
    if (!description) return null;
    return (
      <View style={styles.commonView}>
        <Text style={styles.feeeducation}>{title}</Text>
        <Text style={styles.feeeducationtext}>{description}</Text>
      </View>
    );
  };
  const feeprofileRowbankname = (title: string, description: string) => {
    if (!description) return null;
    return (
      <View style={styles.commonView}>
        <Text style={styles.feeeducationname}>
          {strings.account.ac_num} {title.toString().slice(-4)}
        </Text>
        <Text style={styles.feeeducationtextname}>{description}</Text>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View>{showHeaderView()}</View>
      <ScrollView bounces={false}>
        {profileData!.doctorType == 'STAR_APOLLO' || profileData!.doctorType == 'APOLLO' ? (
          <View>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansSemiBold(16),
                color: '#02475b',
                marginBottom: 16,
                marginLeft: 20,
                marginTop: 20,
              }}
            >
              {strings.account.consultation_fees}
            </Text>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                marginLeft: 20,
                marginRight: 20,
                marginBottom: 32,
                shadowColor: '#000000',
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowRadius: 10,
                shadowOpacity: 0.2,
                elevation: 5,
              }}
            >
              {feeprofileRowBold(
                <Text>
                  <Text style={styles.feeeducation}>{strings.common.what_are_you}</Text>
                  <Text style={styles.feeeducationbold}> {strings.common.online}</Text>
                  <Text style={styles.feeeducation}>{strings.common.consult_fee}</Text>
                </Text>,
                profileData!.onlineConsultationFees
              )}
              {feeprofileRowBold(
                <Text>
                  <Text style={styles.feeeducation}>{strings.common.what_are_you}</Text>
                  <Text style={styles.feeeducationbold}>{strings.common.physical}</Text>
                  <Text style={styles.feeeducation}>{strings.common.consult_fee}</Text>
                </Text>,
                profileData!.physicalConsultationFees
              )}

              {BankDetails != null ? (
                <View>
                  {feeprofileRow(
                    strings.account.what_pckg_offer_your_patients,
                    [BankDetails!.name, strings.common.at_rs.concat(BankDetails!.fees)].join(
                      ', '
                    ) || ''
                  )}
                </View>
              ) : (
                <View>
                  {feeprofileRow(
                    strings.account.what_pckg_offer_your_patients,
                    strings.common.not_applicable
                  )}
                </View>
              )}
            </View>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansSemiBold(16),
                color: '#02475b',
                marginBottom: 16,
                marginLeft: 20,
                //marginTop: 20,
              }}
            >
              {strings.account.payment_details}
            </Text>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                marginLeft: 20,
                marginRight: 20,
                marginBottom: 32,
                shadowColor: '#000000',
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowRadius: 10,
                shadowOpacity: 0.2,
                elevation: 5,
              }}
            >
              {profileData.bankAccount!.length > 0 ? (
                <View
                  style={{ flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' }}
                >
                  <View style={{ flex: 1 }}>
                    {feeprofileRowbankname(
                      profileData.bankAccount![0]!.accountNumber,
                      profileData.bankAccount![0]!.bankName
                    )}

                    {showPaymentDetails ? (
                      <>
                        {/* <View style={styles.separator}></View> */}
                        <View style={styles.understatusline} />
                        {feeprofileRowdetails(
                          strings.account.ac_holder_name,
                          `${strings.common.dr} ${profileData.bankAccount![0]!.accountHolderName}`
                        )}
                        {feeprofileRowdetails(
                          strings.account.ifsc_code,
                          profileData.bankAccount![0]!.IFSCcode
                        )}
                        {feeprofileRowdetails(
                          strings.account.ac_type,
                          profileData.bankAccount![0]!.accountType
                        )}
                      </>
                    ) : null}
                  </View>
                  <View>
                    <TouchableOpacity
                      style={styles.paymentbutton}
                      onPress={() => setShowPaymentDetails(!showPaymentDetails)}
                    >
                      {showPaymentDetails ? <Up /> : <Down />}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
        <View style={{ marginLeft: 20, flexDirection: 'row', marginBottom: 10, marginRight: 20 }}>
          <View style={{ marginTop: 4 }}>
            <RoundChatIcon />
          </View>

          <View style={{ marginLeft: 14 }}>
            <Text>
              <Text style={styles.descriptionview}>{strings.common.call}</Text>
              <Text
                style={{
                  color: '#fc9916',
                  ...theme.fonts.IBMPlexSansSemiBold(16),
                  lineHeight: 22,
                }}
              >
                {' '}
                {strings.common.toll_free_num}{' '}
              </Text>
              <Text style={styles.descriptionview}>{strings.account.to_make_changes}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
      {showHelpModel ? <NeedHelpCard onPress={() => setshowHelpModel(false)} /> : null}
    </SafeAreaView>
  );
};
