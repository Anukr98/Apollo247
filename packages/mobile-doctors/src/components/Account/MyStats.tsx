import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  BackArrow,
  Down,
  RoundChatIcon,
  RoundIcon,
  Up,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationScreenProps, ScrollView, SafeAreaView } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useEffect, useState, useRef } from 'react';

const styles = StyleSheet.create({});
// export interface MyStatsProps {}

export interface MyStatsProps extends NavigationScreenProps<{}> {
  //profileData: object;
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const MyStats: React.FC<MyStatsProps> = (props) => {
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
        headerText="MY STATS"
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => props.navigation.push(AppRoutes.NeedHelpAppointment),
          },
        ]}
      />
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <ScrollView bounces={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            ref={(ref) => (scrollViewRef.current = ref)}
            bounces={false}
          >
            {showHeaderView()}
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text
                onPress={() => {
                  console.log('goto payment history');

                  props.navigation.navigate(AppRoutes.PaymentHistory);
                }}
              >
                {'View Payment History'}
              </Text>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};
