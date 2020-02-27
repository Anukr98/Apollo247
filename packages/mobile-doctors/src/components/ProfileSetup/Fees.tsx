import FeesStyles from '@aph/mobile-doctors/src/components/ProfileSetup/Fees.styles';
import { Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const styles = FeesStyles;
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
