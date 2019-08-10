import { Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';

const styles = StyleSheet.create({
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
    marginTop: 2,
  },
  feeeducationname: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.3,
  },
  separator: {
    flex: 1,
    height: 1,
    // width: 300,
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
        <Text style={styles.feeeducationtext}>Rs. {description}</Text>
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
        <Text style={styles.feeeducationname}>{title}</Text>
        <Text style={styles.feeeducationtextname}>{description}</Text>
      </View>
    );
  };
  return (
    <View>
      {renderCard(
        'Consultation Fees',
        <View style={{ marginTop: 16 }}>
          {feeprofileRowBold(
            <Text>
              <Text style={styles.feeeducation}>What are your</Text>
              <Text style={styles.feeeducationbold}> online</Text>
              <Text style={styles.feeeducation}> consultation fees?</Text>
            </Text>,
            Feedata!.onlineConsultationFees
          )}
          {feeprofileRowBold(
            <Text>
              <Text style={styles.feeeducation}>What are your</Text>
              <Text style={styles.feeeducationbold}> physical</Text>
              <Text style={styles.feeeducation}> consultation fees?</Text>
            </Text>,
            Feedata!.physicalConsultationFees
          )}
          {BankDetails != null ? (
            <View>
              {feeprofileRow(
                'What package do you offer your patients?',
                [BankDetails!.name, '@Rs. '.concat(BankDetails!.fees)].join(', ') || ''
              )}
            </View>
          ) : null}
        </View>
      )}

      {renderCard(
        'Payment Details',
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
                    <View style={styles.separator}></View>
                    {feeprofileRowdetails(
                      'Account Holder’s Name',
                      `Dr. ${Feedata.bankAccount![0]!.accountHolderName}`
                    )}
                    {feeprofileRowdetails('IFSC Code', Feedata.bankAccount![0]!.IFSCcode)}
                    {feeprofileRowdetails('Account Type', Feedata.bankAccount![0]!.accountType)}
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
