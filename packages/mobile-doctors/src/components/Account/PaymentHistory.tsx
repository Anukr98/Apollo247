import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  BackArrow,
  Down,
  RoundChatIcon,
  RoundIcon,
  Up,
  DotIcon,
  UnSelected,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationScreenProps, ScrollView, SafeAreaView } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useRef, useState } from 'react';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { AphOverlay } from '@aph/mobile-doctors/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { RadioButtons } from '@aph/mobile-doctors/src/components/ui/RadioButtons';

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
    elevation: 2,
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
  popupText: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(15),
  },
});

export interface PaymentHistoryProps extends NavigationScreenProps<{}> {
  //profileData: object;
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = (props) => {
  const scrollViewRef = useRef<KeyboardAwareScrollView | null>();
  const [visibleDownloadStatement, setVisibleDownloadStatement] = useState<boolean>(false);

  type OptionsType = {
    key: string;
    label: string;
  };
  const statementFreqency = [
    {
      key: 'Last Week',
      label: 'Last Week',
    },
    {
      key: 'Last Month',
      label: 'Last Month',
    },
    {
      key: 'Last 6 Months',
      label: 'Last 6 Months',
    },
    { key: 'Last 1 Year', label: 'Last 1 Year' },
    { key: 'Custom Dates', label: 'Custom Dates' },
  ];

  const [selectedFrequency, setSelectedFrequency] = useState<any>();
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
            onPress: () => {
              setVisibleDownloadStatement(true);
            },
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

          {/* <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={styles.consultStyles}>Consult by </Text>
            <Text style={styles.nameStyles}> Dr. Ajay Sharma</Text>
          </View> */}

          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ flexDirection: 'column', marginRight: 5 }}>
              <Text style={styles.leftSmallText}>Fee </Text>
              <Text style={[styles.nameStyles, { marginLeft: -3 }]}> Rs. 499</Text>
            </View>
            <View style={{ flexDirection: 'column', marginRight: 5 }}>
              <Text style={styles.leftSmallText}> </Text>
              <Text style={styles.nameStyles}>-</Text>
            </View>

            <View style={{ flexDirection: 'column', marginRight: 5 }}>
              <Text style={styles.leftSmallText}>Commission </Text>
              <Text style={styles.nameStyles}> Rs. 50</Text>
            </View>

            <View style={{ flexDirection: 'column', marginRight: 5 }}>
              <Text style={styles.leftSmallText}> </Text>
              <Text style={styles.nameStyles}>-</Text>
            </View>

            <View style={{ flexDirection: 'column', marginRight: 5 }}>
              <Text style={styles.leftSmallText}>Discount </Text>
              <Text style={styles.nameStyles}> Rs. 50</Text>
            </View>
            <View style={{ flexDirection: 'column', marginRight: 5 }}>
              <Text style={styles.leftSmallText}> </Text>
              <Text style={styles.nameStyles}>=</Text>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={styles.leftSmallText}>Received </Text>
              <Text style={styles.nameStyles}> Rs. 399</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const statmentPopup = () => {
    return (
      <AphOverlay
        isVisible={true}
        onClose={() => {
          setVisibleDownloadStatement(false);
        }}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <View>
            <Text style={styles.popupText}>
              For which period do you wish to download the statement?
            </Text>

            <RadioButtons
              data={statementFreqency}
              selectedItem={selectedFrequency}
              setselectedItem={setSelectedFrequency}
              //  isSelected={selectedItem?<Selected/> : <UnSelected/>}
            >
              {/* {selectedFrequency && 
  console.log("Sannn");
  
} 
 */}
            </RadioButtons>
          </View>
          {/* <View>
            {statementFreqency.map((item, i) => (
              <Text>item</Text>
            ))}
          </View> */}

          <View></View>
          <View style={{ marginTop: 20 }}>
            <Button title="DOWNLOAD STATEMENT" style={{ backgroundColor: '#fc9916' }}></Button>
          </View>
        </View>
      </AphOverlay>
    );
  };
  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        <View>{visibleDownloadStatement && statmentPopup()}</View>
        <View>{showHeaderView()}</View>

        <ScrollView style={{ flex: 1 }} bounces={false}>
          <View style={{ marginTop: 20, marginHorizontal: 20 }}>{BodyView()}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
