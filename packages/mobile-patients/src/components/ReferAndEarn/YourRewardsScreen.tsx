import React from 'react';
import { View, Text, StatusBar, StyleSheet, Image, Dimensions, FlatList } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '../ui/Header';
import { createMaterialTopTabNavigator, createAppContainer } from 'react-navigation';

export interface YourRewardsScreenProps extends NavigationScreenProps {}

export const YourRewardsScreen: React.FC<YourRewardsScreenProps> = (props) => {
  const ClaimedCard = (item: any) => {
    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 14,
          paddingVertical: 20,
          borderWidth: 2,
          borderColor: '#ccc',
          marginBottom: 5,
          borderRadius: 5,
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            marginRight: 10,
          }}
        >
          <Image
            source={require('@aph/mobile-patients/src/images/referAndEarn/check.webp')}
            style={{}}
            resizeMode="cover"
          />
        </View>
        <View>
          <Text
            style={{
              marginBottom: 10,
              fontWeight: '500',
            }}
          >
            Claimed
          </Text>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                width: '75%',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 5,
                }}
              >
                You earned refree points on 3rd
              </Text>
              <Text
                style={{
                  fontSize: 14,
                }}
              >
                Aug, 2021 first time Login.
              </Text>
            </View>
            <View
              style={{
                width: '20%',
                justifyContent: 'flex-end',
              }}
            >
              <Text
                style={{
                  fontWeight: '700',
                }}
              >
                100HC
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const ClaimedCardWithExpirationSet = (item: any) => {
    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 14,
          paddingVertical: 20,
          borderWidth: 2,
          borderColor: '#ccc',
          marginBottom: 5,
          borderRadius: 5,
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            marginRight: 10,
          }}
        >
          <Image
            source={require('@aph/mobile-patients/src/images/referAndEarn/check.webp')}
            style={{}}
            resizeMode="cover"
          />
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingRight: 10,
            }}
          >
            <Text
              style={{
                marginBottom: 10,
                fontWeight: '500',
              }}
            >
              Shriya Singh
            </Text>
            <Text
              style={{
                color: '#FE5959',
                fontSize: 13,
                fontWeight: '400',
              }}
            >
              Expires on 12 Sep,21
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                width: '75%',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 5,
                }}
              >
                Purchased On 20th July
              </Text>
            </View>
            <View
              style={{
                width: '20%',
                justifyContent: 'flex-end',
              }}
            >
              <Text
                style={{
                  fontWeight: '700',
                }}
              >
                100HC
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPendingCards = (item: any) => {
    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 14,
          paddingVertical: 20,
          borderWidth: 2,
          borderColor: '#ccc',
          marginBottom: 5,
          borderRadius: 5,
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            marginRight: 10,
          }}
        ></View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingRight: 10,
            }}
          >
            <Text
              style={{
                marginBottom: 10,
                fontWeight: '500',
              }}
            >
              Shriya Singh
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View style={{}}>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 5,
                }}
              >
                Signed up 20th July, Purchase is Pending.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const noReferralReward = () => {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#02475B',
              fontWeight: '600',
              fontSize: 18,
              marginBottom: 15,
            }}
          >
            No referral rewards
          </Text>
          <Text
            style={{
              color: '#979797',
              fontWeight: '400',
              fontSize: 18,
              marginBottom: 25,
              width: 250,
              textAlign: 'center',
            }}
          >
            You have not invited your friends yet
          </Text>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('EarnedPoints');
            }}
            style={{
              backgroundColor: '#FC9916',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 5,
              paddingVertical: 10,
              paddingHorizontal: 25,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              Refer Your Friend
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ClaimedSection = () => {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        {/* <FlatList
          data={Array.from({ length: 1 }, (_, index) => index + 1)}
          renderItem={({ item }) => ClaimedCard(item)}
        />
        <FlatList
          data={Array.from({ length: 2 }, (_, index) => index + 1)}
          renderItem={({ item }) => ClaimedCardWithExpirationSet(item)}
        /> */}
        {noReferralReward()}
      </View>
    );
  };
  const PendingSection = () => {
    return (
      <View>
        <FlatList
          data={Array.from({ length: 5 }, (_, index) => index + 1)}
          renderItem={({ item }) => renderPendingCards(item)}
        />
      </View>
    );
  };

  const TopTabBar = createAppContainer(
    createMaterialTopTabNavigator(
      {
        Claimed: ClaimedSection,
        Pending: PendingSection,
      },
      {
        initialRouteName: 'Claimed',
        tabBarOptions: {
          upperCaseLabel: false,
          style: {
            backgroundColor: '#fff',
          },
          labelStyle: {
            color: '#000',
            fontWeight: '600',
            fontSize: 15,
          },
          activeBackgroundColor: '#000',
          indicatorStyle: {
            backgroundColor: '#00B38E',
            alignContent: 'center',
            height: 5,
            width: 150,
            marginHorizontal: 20,
          },
        },
      }
    )
  );

  const renderTotalHCContainer = () => {
    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingVertical: 30,
        }}
      >
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '700',
            }}
          >
            Total HC: 200.00
          </Text>
          <View
            style={{
              position: 'absolute',
              right: 20,
            }}
          >
            <TouchableOpacity onPress={() => {}}>
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/refresh.webp')}
                style={{}}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header
          leftIcon="backArrow"
          title="Your Rewards"
          onPressLeftIcon={() => props.navigation.goBack()}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        {renderTotalHCContainer()}
        <TopTabBar />
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  shareImage: {},
});
