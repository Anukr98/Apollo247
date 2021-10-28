import React from 'react';
import { View, Text, StatusBar, StyleSheet, Image, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '../ui/Header';

export interface EarnedPointsProps extends NavigationScreenProps {}

export const EarnedPoints: React.FC<EarnedPointsProps> = (props) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header
          leftIcon="backArrow"
          title="Refer And Earn"
          onPressLeftIcon={() => props.navigation.goBack()}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <View
          style={{
            backgroundColor: '#fff',
            marginVertical: 5,
            alignItems: 'center',
            paddingVertical: 25,
            flex: 1.5,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              color: '#02475B',
              fontWeight: '600',
            }}
          >
            Congratulations!
          </Text>
          <View
            style={{
              marginTop: 30,
            }}
          >
            <View
              style={{
                backgroundColor: '#DCF0FF',
                borderRadius: 100,
                padding: 9,
              }}
            >
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/trophy1.png')}
                style={{}}
                resizeMode="cover"
              />
            </View>
          </View>
          <View
            style={{
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                marginTop: 20,
                fontSize: 20,
                color: '#02475B',
              }}
            >
              Your friend gift you
            </Text>
            <Text
              style={{
                marginTop: 5,
                fontSize: 20,
                color: '#02475B',
                fontWeight: '700',
              }}
            >
              100 HC
            </Text>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FC9916',
                width: 200,
                height: 40,
                marginTop: 20,
                borderRadius: 5,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '700',
                }}
              >
                Reedem Points
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            backgroundColor: '#E8EDF0',
            flex: 1,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              color: '#02475B',
              fontWeight: '600',
            }}
          >
            Why choose Apollo 247?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 30,
            }}
          >
            <View
              style={{
                width: 100,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  height: 60,
                  width: 70,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 30,
                }}
              >
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/fast-delivery1.png')}
                  style={styles.shareImage}
                  resizeMode="cover"
                />
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 15,
                  color: '#02475B',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                Delivery in 2 hours
              </Text>
            </View>
            <View
              style={{
                width: 100,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  height: 60,
                  width: 70,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 30,
                  padding: 5,
                }}
              >
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/doctor1.png')}
                  style={styles.shareImage}
                  resizeMode="cover"
                />
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 15,
                  color: '#02475B',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                Consult doctor in 15 mins
              </Text>
            </View>
            <View
              style={{
                width: 100,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  height: 60,
                  width: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 30,
                  padding: 5,
                }}
              >
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/flask1.png')}
                  style={styles.shareImage}
                  resizeMode="cover"
                />
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 15,
                  color: '#02475B',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                Lab test at home
              </Text>
            </View>
          </View>
        </View>
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
