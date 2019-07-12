import { Button } from 'app/src/components/ui/Button';
import { Header } from 'app/src/components/ui/Header';
import { Down, RoundIcon, Up } from 'app/src/components/ui/Icons';
import { ProfileTabHeader } from 'app/src/components/ui/ProfileTabHeader';
import { theme } from 'app/src/theme/theme';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
  },
  statusBarBg: {
    width: '100%',
    opacity: 0.05,
    backgroundColor: '#000000',
    ...ifIphoneX(
      {
        height: 44,
      },
      {
        height: 24,
      }
    ),
  },

  statusBarline: {
    width: '100%',
    backgroundColor: '#f0f4f5',
    marginTop: 20,
    ...ifIphoneX(
      {
        height: 2,
      },
      {
        height: 15.5,
      }
    ),
  },

  buttonView: {
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fc9916',
    width: 152,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },
  buttonViewback: {
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    width: 152,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },

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

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.BUTTON_TEXT,
  },
  titletxtback: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: '#fc9916',
  },
  yourprofiletext: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: '#02475b',
    marginBottom: 16,
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
export interface FeeTabProps extends NavigationScreenProps {}

export const FeeTab: React.FC<FeeTabProps> = (props) => {
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
  const buttonviewData = () => {
    return (
      <View
        style={{
          marginBottom: 32,
          flexDirection: 'row',
          justifyContent: 'space-between',
          margin: 20,
        }}
      >
        <Button title="BACK" titleTextStyle={styles.titletxtback} style={styles.buttonViewback} />
        <Button
          title="SAVE AND PROCEED"
          titleTextStyle={styles.titleTextStyle}
          style={styles.buttonView}
        />
      </View>
    );
  };
  const cardView = (title: string, children: Element) => (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7', marginBottom: -30 }}>
      <View style={{ margin: 20 }}>
        <Text style={styles.yourprofiletext}>{title}</Text>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: '#ffffff',
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          {children}
        </View>
      </View>
      <View style={styles.statusBarline} />
    </View>
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
    <View style={styles.container}>
      <View style={styles.statusBarBg} />

      <SafeAreaView style={styles.container}>
        <ScrollView bounces={false}>
          <View style={{ backgroundColor: '#fff', flex: 1 }}>
            <Header
              rightIcons={[
                {
                  icon: <RoundIcon />,
                  onPress: () => Alert.alert('click'),
                },
              ]}
            />

            <ProfileTabHeader
              title="hi dr. rao!"
              description="Lastly, some money-related matters like fees, packages and how you take payments"
              tabs={['Profile', 'Availibility', 'Fees']}
              activeTabIndex={2}
            />
          </View>
          <View style={styles.statusBarline} />

          {cardView(
            'Consultation Fees',
            <View style={{ marginTop: 16 }}>
              {feeprofileRow('What are your online consultation fees?', profileObject.fee1)}
              {feeprofileRow('What are your physical consultation fees?', profileObject.fee2)}
              {feeprofileRow('What package do you offer your patients?', profileObject.consultname)}
            </View>
          )}
          <View style={styles.statusBarline} />
          {cardView(
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

          {buttonviewData()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
