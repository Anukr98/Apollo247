import { Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
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
  separator: {
    flex: 1,
    height: 1,
    //width: 300,
    marginRight: 0,
    marginLeft: 15,
    backgroundColor: '#658f9b',
    opacity: 0.2,
    marginBottom: 16,
  },
  paymentbutton: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginRight: 20,
  },
  commonView: {
    flexDirection: 'column',
    marginLeft: 16,
  },
  understatusline: {
    width: '100%',
    backgroundColor: '#02475b',
    marginTop: 11,
    opacity: 0.1,
    marginBottom: 16,
    marginLeft: 15,
    ...ifIphoneX(
      {
        height: 2,
      },
      {
        height: 1,
      }
    ),
  },
});

export interface FeesProps {
  profileData: GetDoctorDetails_getDoctorDetails;
}

export const Fees: React.FC<FeesProps> = ({ profileData }) => {
  const Feedata = profileData!;
  const BankDetails = profileData!.packages![0];
  console.log(Feedata.bankAccount!.length);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const renderCard = (title: string, children: Element) => (
    <SquareCardWithTitle title={title} containerStyle={{ marginTop: 16 }}>
      <View
        style={[
          theme.viewStyles.whiteRoundedCornerCard,
          { marginHorizontal: 20, marginTop: 16, marginBottom: 20 },
        ]}
      >
        {children}
      </View>
    </SquareCardWithTitle>
  );
  const feeprofileRow = (title: string, description: string) => {
    if (!description) return null;
    return (
      <View style={styles.commonView}>
        <Text style={styles.feeeducation}> {title}</Text>
        <Text style={styles.feeeducationtext}>{description}</Text>
      </View>
    );
  };
  const feeprofileRowBold = (title: Element, description: string) => {
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
          {strings.account.ac_num}
          {title.toString().slice(-4)}
        </Text>
        <Text style={styles.feeeducationtextname}>{description}</Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={{ marginTop: -20 }}>
        {renderCard(
          strings.common.consult_fee,
          <View style={{ marginTop: 16 }}>
            {feeprofileRowBold(
              <Text>
                <Text style={styles.feeeducation}>{strings.common.what_are_you}</Text>
                <Text style={styles.feeeducationbold}>{strings.common.online}</Text>
                <Text style={styles.feeeducation}>{strings.account.consult_fee_q}</Text>
              </Text>,
              Feedata!.onlineConsultationFees
            )}
            {feeprofileRowBold(
              <Text>
                <Text style={styles.feeeducation}>{strings.common.what_are_you}</Text>
                <Text style={styles.feeeducationbold}> {strings.common.physical}</Text>
                <Text style={styles.feeeducation}> {strings.account.consult_fee_q}</Text>
              </Text>,
              Feedata!.physicalConsultationFees
            )}

            {BankDetails != null ? (
              <View>
                {feeprofileRow(
                  ` ${strings.account.what_pckg_offer_your_patients}`,
                  [BankDetails!.name, '@Rs. '.concat(BankDetails!.fees)].join(', ') || ''
                )}
              </View>
            ) : (
              <View>
                {feeprofileRow(
                  ` ${strings.account.what_pckg_offer_your_patients}`,
                  strings.common.not_applicable
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {renderCard(
        strings.account.payment_details,
        <View>
          {Feedata.bankAccount!.length > 0 ? (
            <View style={{ flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                {feeprofileRowbankname(
                  Feedata.bankAccount![0]!.accountNumber,

                  Feedata.bankAccount![0]!.bankName
                )}

                {showPaymentDetails ? (
                  <>
                    {/* <View style={styles.separator}></View> */}
                    <View style={styles.understatusline} />
                    {feeprofileRowdetails(
                      strings.account.ac_holder_name,
                      `${strings.common.dr} ${Feedata.bankAccount![0]!.accountHolderName}`
                    )}
                    {feeprofileRowdetails(
                      strings.account.ifsc_code,
                      Feedata.bankAccount![0]!.IFSCcode
                    )}
                    {feeprofileRowdetails(
                      strings.account.ac_type,
                      Feedata.bankAccount![0]!.accountType
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
      )}
    </View>
  );
};
