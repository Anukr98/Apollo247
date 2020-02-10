import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, DotIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, SafeAreaView, ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  cardView: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    shadowColor: '#31004053',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    // height: 50,
    paddingHorizontal: 12,
    paddingVertical: 13,
    width: '100%',
  },
  leftSmallText: {
    color: '#004053',
    opacity: 0.6,
    letterSpacing: -0.01,
    ...theme.fonts.IBMPlexSans(8),
  },
  leftMidiumText: {
    color: '#004053',

    letterSpacing: 0.02,
    ...theme.fonts.IBMPlexSansMedium(10),
  },
  rupeesStyle: {
    color: '#004053',
    letterSpacing: -0.01,
    ...theme.fonts.IBMPlexSansBold(14),
    alignItems: 'flex-end',
  },
  cunsultTextStyle: {
    color: '#0087ba',
    letterSpacing: -0.01,
    ...theme.fonts.IBMPlexSansBold(8),
    alignItems: 'flex-end',
  },
  underline: {
    borderBottomColor: '#2602475b',
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    opacity: 0.1,
  },
  consultStyles: {
    color: '#004053',
    letterSpacing: -0.01,
    ...theme.fonts.IBMPlexSans(8),
  },
  nameStyles: {
    color: '#004053',
    letterSpacing: -0.01,
    ...theme.fonts.IBMPlexSansMedium(10),
  },
});

export interface PaymentHistoryProps extends NavigationScreenProps<{}> {
  //profileData: object;
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = (props) => {
  const scrollViewRef = useRef<KeyboardAwareScrollView | null>();
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
        headerText="PAYEMENT HISTORY"
        rightIcons={[
          {
            icon: <DotIcon />,
          },
        ]}
      />
    );
  };

  const BodyView = () => {
    return (
      <View>
        <View style={styles.cardView}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.leftSmallText}>Appointment Details : </Text>
              <Text style={styles.leftMidiumText}> 6th June, 2019</Text>
            </View>

            <Text style={styles.rupeesStyle}>Rs. 100</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.leftSmallText}>Appointment ID : </Text>
              <Text style={styles.leftMidiumText}> 12345</Text>
            </View>

            <Text style={styles.cunsultTextStyle}>Online Consult | New</Text>
          </View>
          <View style={styles.underline} />

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={styles.consultStyles}>Consult by </Text>
            <Text style={styles.nameStyles}> Dr. Ajay Sharma</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    // <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <View>{showHeaderView()}</View>

      <ScrollView bounces={false}>
        <View style={{ marginTop: 20, marginHorizontal: 20 }}>{BodyView()}</View>
      </ScrollView>
    </SafeAreaView>
    // </View>
  );
};
