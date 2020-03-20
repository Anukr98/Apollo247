import MyFeesStyles from '@aph/mobile-doctors/src/components/Account/MyFees.styles';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { HelpView } from '@aph/mobile-doctors/src/components/ui/HelpView';
import { BackArrow, Down, RoundIcon, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = MyFeesStyles;

export interface ProfileProps
  extends NavigationScreenProps<{
    ProfileData: GetDoctorDetails_getDoctorDetails;
  }> {
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const MyFees: React.FC<ProfileProps> = (props) => {
  const profileData = props.navigation.getParam('ProfileData');
  const BankDetails = profileData!.packages![0];
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showHelpModel, setshowHelpModel] = useState(false);

  const showHeaderView = () => {
    return (
      <Header
        containerStyle={styles.headerview}
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
    <SafeAreaView style={theme.viewStyles.container}>
      <View>{showHeaderView()}</View>
      <ScrollView bounces={false}>
        {profileData!.doctorType == 'STAR_APOLLO' || profileData!.doctorType == 'APOLLO' ? (
          <View>
            <Text style={styles.fee}>{strings.account.consultation_fees}</Text>
            <View style={styles.doctortype}>
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
            <Text style={styles.payment}>{strings.account.payment_details}</Text>
            <View style={styles.paymentView}>
              {profileData.bankAccount!.length > 0 ? (
                <View style={styles.rowview}>
                  <View style={{ flex: 1 }}>
                    {feeprofileRowbankname(
                      profileData.bankAccount![0]!.accountNumber,
                      profileData.bankAccount![0]!.bankName
                    )}

                    {showPaymentDetails ? (
                      <>
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
        <HelpView />
      </ScrollView>
      {showHelpModel ? <NeedHelpCard onPress={() => setshowHelpModel(false)} /> : null}
    </SafeAreaView>
  );
};
