import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, SafeAreaView, ScrollView } from 'react-navigation';
import Pie from 'react-native-pie';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import MyStatsStyles from '@aph/mobile-doctors/src/components/Account/MyStats.styles';

const styles = MyStatsStyles;

export interface MyStatsProps extends NavigationScreenProps<{}> {
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const MyStats: React.FC<MyStatsProps> = (props) => {
  const [showHelpModel, setshowHelpModel] = useState(false);
  const tabsData = [{ title: 'Performance' }, { title: 'Payment' }];
  const [selectedTab, setSelectedTab] = useState<string>(tabsData[0].title);

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
            onPress: () => setshowHelpModel(true),
          },
        ]}
      />
    );
  };
  const GetTabs = () => {
    return (
      <View style={styles.shadowview}>
        <View
          style={{
            overflow: 'hidden',
            backgroundColor: theme.colors.WHITE,
          }}
        >
          <TabsComponent
            titleStyle={styles.tabTitle}
            selectedTitleStyle={styles.selTitle}
            tabViewStyle={styles.tabViewstyle}
            onChange={(title) => {
              setSelectedTab(title);
            }}
            data={tabsData}
            selectedTab={selectedTab}
          />
        </View>
      </View>
    );
  };

  const GetOnlineCharts = () => {
    return (
      // <View style={styles.container}>
      <View
        style={{
          paddingTop: 15,
          flexDirection: 'row',
        }}
      >
        <View>
          <Pie
            radius={25}
            innerRadius={15}
            // // percentage={[60, 40]}

            // series={test1Arr}
            // colors={test2Arr}
            sections={[
              {
                percentage: 60,
                color: '#0087ba',
              },
              {
                percentage: 40,
                color: '#fc9916',
              },
            ]}
            dividerSize={1}
            strokeCap={'butt'}
          />
        </View>
        <View style={{ marginLeft: 15, marginTop: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            <View
              style={[
                {
                  backgroundColor: '#0087ba',
                },
                styles.circleStyle,
              ]}
            ></View>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Text style={[styles.chartText, {}]}>
                32 Online Consults |{' '}
                <Text style={[styles.chartText, { ...theme.fonts.IBMPlexSansBold(12) }]}>
                  Rs. 3000
                </Text>
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 4, flex: 1 }}>
            <View
              style={[
                {
                  backgroundColor: '#fc9916',
                },
                styles.circleStyle,
              ]}
            ></View>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Text style={styles.chartText}>
                28 Physical Consults |
                <Text style={[styles.chartText, { ...theme.fonts.IBMPlexSansBold(12) }]}>
                  Rs. 1250
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
      // </View>
    );
  };
  const GetFollowupCharts = () => {
    return (
      // <View style={styles.container}>
      <View
        style={{
          paddingTop: 15,
          flexDirection: 'row',

          // width: 160,
          //   alignItems: 'flex-start',
          // backgroundColor: 'brown',
        }}
      >
        <Pie
          radius={25}
          innerRadius={15}
          sections={[
            {
              percentage: 30,
              color: '#02475b',
            },
            {
              percentage: 70,
              color: '#00b38e',
            },
          ]}
          dividerSize={1}
          strokeCap={'butt'}
        />
        <View style={{ marginLeft: 15, marginTop: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            <View
              style={[
                {
                  backgroundColor: '#02475b',
                },
                styles.circleStyle,
              ]}
            ></View>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
              }}
            >
              <Text style={styles.chartText}>
                40 New Patients |{' '}
                <Text style={[styles.chartText, { ...theme.fonts.IBMPlexSansBold(12) }]}>
                  Rs. 3000
                </Text>
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            <View
              style={[
                {
                  backgroundColor: '#00b38e',
                },
                styles.circleStyle,
              ]}
            ></View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              <Text style={styles.chartText}>
                20 Follow-up Patients |{' '}
                <Text
                  style={[
                    styles.chartText,
                    {
                      ...theme.fonts.IBMPlexSansBold(12),
                    },
                  ]}
                >
                  Rs. 1250
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
      // </View>
    );
  };

  const GetPaymentData = () => {
    return (
      <View style={[styles.cardContainer, { padding: 12 }]}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.priceStyle}>Rs. 5250</Text>
          <Text style={styles.revnueDescr}>Revenue to date for 60 patients</Text>
        </View>
        <View style={styles.boxView}>
          <View style={styles.chartView}>
            <Text style={styles.chartHeadingText}>ONLINE vs PHYSICAL </Text>
            {GetOnlineCharts()}
          </View>
          <View style={styles.seperatorline}></View>
          <View style={styles.chartView}>
            <Text style={styles.chartHeadingText}>NEW vs FOLLOW-UP</Text>
            {GetFollowupCharts()}
          </View>
        </View>
        <View
          style={{
            marginTop: 20,
            alignItems: 'flex-end',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <Text
            style={styles.paymentTextStyle}
            onPress={() => {
              console.log('goto payment history');

              props.navigation.navigate(AppRoutes.PaymentHistory);
            }}
          >
            {'View Payment History'}
          </Text>
          {/* <ArrowRight /> */}
        </View>
      </View>
    );
  };
  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f5' }}>
        <ScrollView bounces={false}>
          {showHeaderView()}
          {GetTabs()}

          <View style={{ flex: 1 }}>
            {selectedTab == 'Performance' ? (
              <View style={styles.mainView}>
                <View style={styles.cardContainer}>
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.priceStyle}>Rs. 5250</Text>
                    <Text style={styles.revnueDescr}>Revenue to date for 60 patients</Text>
                  </View>
                  <View style={styles.seperatorline}></View>
                  <View style={styles.chartView}>
                    <Text style={styles.chartHeadingText}>ONLINE vs PHYSICAL</Text>
                    {GetOnlineCharts()}
                  </View>
                  <View style={styles.seperatorline}></View>
                  <View style={styles.chartView}>
                    <Text style={styles.chartHeadingText}>NEW vs FOLLOW-UP</Text>
                    {GetFollowupCharts()}
                  </View>
                </View>

                <View style={{ marginTop: 20 }}>
                  <Text
                    style={styles.paymentTextStyle}
                    onPress={() => {
                      console.log('goto payment history');

                      props.navigation.navigate(AppRoutes.PaymentHistory);
                    }}
                  >
                    {'View Payment History'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.mainView}>
                <Text style={styles.paymentHeading}>MY REVENUE</Text>
                {GetPaymentData()}

                <Text style={[styles.paymentHeading, { marginTop: 20 }]}>
                  REVENUE FROM MY STAR DOCTOR’S TEAM
                </Text>
                {GetPaymentData()}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {showHelpModel ? <NeedHelpCard onPress={() => setshowHelpModel(false)} /> : null}
    </View>
  );
};
