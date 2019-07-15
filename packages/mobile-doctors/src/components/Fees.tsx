import { Down, Up } from 'app/src/components/ui/Icons';
import { SquareCardWithTitle } from 'app/src/components/ui/SquareCardWithTitle';
import { theme } from 'app/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

type ProfileData = {
  fee1: string;
  fee2: string;
  consultname: string;
  acnumber: string;
  acholdername: string;
  ifsccode: string;
  accounttype: string;
};

export interface FeesProps {}

export const Fees: React.FC<FeesProps> = (props) => {
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const profileObject: ProfileData = {
    fee1: 'Rs. 399 ',
    fee2: 'Rs. 399 ',
    consultname: '3 Online Consults + 3 Physical Consults @ Rs. 999',
    acnumber: '123456777',
    acholdername: 'Dr. Simran Rao',
    ifsccode: 'HDFC0002000',
    accounttype: 'Savings Account',
  };
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
          {feeprofileRow('What are your online consultation fees?', profileObject.fee1)}
          {feeprofileRow('What are your physical consultation fees?', profileObject.fee2)}
          {feeprofileRow('What package do you offer your patients?', profileObject.consultname)}
        </View>
      )}
      {renderCard(
        'Payment Details',
        <View>
          <TouchableOpacity
            style={{
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              marginRight: 20,
              marginTop: 16,
            }}
            onPress={() => setShowPaymentDetails(!showPaymentDetails)}
          >
            {showPaymentDetails ? <Up /> : <Down />}
          </TouchableOpacity>
          {feeprofileRow('A/C Number: xxx xxx xxx 7890', profileObject.acnumber)}
          {showPaymentDetails ? (
            <>
              {feeprofileRow('Account Holder’s Name', profileObject.acholdername)}
              {feeprofileRow('IFSC Code', profileObject.ifsccode)}
              {feeprofileRow('Account Type', profileObject.accounttype)}
            </>
          ) : null}
        </View>
      )}
    </View>
  );
};
