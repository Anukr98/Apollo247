import { Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DummyQueryResult } from '@aph/mobile-doctors/src/helpers/commonTypes';

const styles = StyleSheet.create({
  feeeducation: {
    color: 'rgba(2, 71, 91, 0.5)',
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  feeeducationtext: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    marginBottom: 16,
    letterSpacing: 0.35,
    marginTop: 2,
  },
});

type _ProfileData = {
  acnumber: string;
  acholdername: string;
  ifsccode: string;
  accounttype: string;
};

export interface FeesProps {
  profileData: DummyQueryResult['data']['getDoctorProfile'];
}

export const Fees: React.FC<FeesProps> = ({ profileData }) => {
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
      <View style={{ flexDirection: 'column', marginLeft: 16 }}>
        <Text style={styles.feeeducation}>{title}</Text>
        <Text style={styles.feeeducationtext}>{description}</Text>
      </View>
    );
  };
  return (
    <View>
      {renderCard(
        'Consultation Fees',
        <View style={{ marginTop: 16 }}>
          {feeprofileRow(
            'What are your online consultation fees?',
            profileData!.profile.onlineConsultationFees
          )}
          {feeprofileRow(
            'What are your physical consultation fees?',
            profileData!.profile.physicalConsultationFees
          )}
          {feeprofileRow('What package do you offer your patients?', profileData!.profile.package)}
        </View>
      )}
      {renderCard(
        'Payment Details',
        <View style={{ flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' }}>
          <View>
            {feeprofileRow(
              'A/C Number: xxx xxx xxx 7890',
              profileData!.paymentDetails[0].accountNumber
            )}
            {showPaymentDetails ? (
              <>
                {feeprofileRow('Account Holder’s Name', profileData!.profile.firstName)}
                {feeprofileRow('IFSC Code', profileData!.profile.ifscCode)}
                {feeprofileRow('Account Type', profileData!.profile.accountType)}
              </>
            ) : null}
          </View>
          <View>
            <TouchableOpacity
              style={{
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                marginRight: 20,
              }}
              onPress={() => setShowPaymentDetails(!showPaymentDetails)}
            >
              {showPaymentDetails ? <Up /> : <Down />}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
