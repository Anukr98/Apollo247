import { CaseSheetView } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView';
import { BackArrow, Call, DotIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { doctorProfile } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import MaterialTabs from 'react-native-material-tabs';

const styles = StyleSheet.create({
  mainview: {
    backgroundColor: '#ffffff',
    height: 50,
  },
  shadowview: {
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
  },
});

const {
  data: { getDoctorProfile },
  error,
  loading,
} = doctorProfile;
if (!loading && error) {
  Alert.alert('Error', 'Unable to get the data');
} else {
  console.log('getDoctorProfile', getDoctorProfile);
}

const showHeaderView = () => {
  return (
    <NotificationHeader
      containerStyle={styles.mainview}
      leftIcons={[
        {
          icon: (
            <View style={{ marginTop: 0 }}>
              <BackArrow />
            </View>
          ),
          onPress: () => Alert.alert('click'),
        },
      ]}
      middleText="CONSULT ROOM"
      timerText="Time to Consult  04:25"
      //textStyles={{ marginTop: 30 }}
      rightIcons={[
        {
          icon: (
            <View style={{ marginTop: 0 }}>
              <Call />
            </View>
          ),
          onPress: () => Alert.alert('Call'),
        },
        {
          icon: (
            <View style={{ marginTop: 0 }}>
              <DotIcon />
            </View>
          ),
          onPress: () => Alert.alert('Call'),
        },
      ]}
    />
  );
};

export interface ConsultRoomScreenProps {}

export const ConsultRoomScreen: React.FC<ConsultRoomScreenProps> = (props) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const renderTabPage = () => {
    return (
      <>
        <View style={styles.shadowview}>
          <MaterialTabs
            items={['Case Sheet', 'Chat']}
            selectedIndex={activeTabIndex}
            onChange={(index) => setActiveTabIndex(index)}
            barColor="#ffffff"
            indicatorColor="#00b38e"
            activeTextColor="#02475b"
            inactiveTextColor={'#02475b'}
            activeTextStyle={{ ...theme.fonts.IBMPlexSansBold(14), color: '#02475b' }}
          ></MaterialTabs>
        </View>
        <View style={{ flex: 1 }}>{activeTabIndex == 0 ? <CaseSheetView /> : null}</View>
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {showHeaderView()}
      {renderTabPage()}
    </SafeAreaView>
  );
};
