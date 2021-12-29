import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { theme } from '../../theme/theme';
import { ApolloLogo } from '../ApolloLogo';

export const MultiSignUpNew = () => {
  const [selectedIndex, setIndexForSelection] = useState<Number | null>(null);
  const renderProfileList = (item: any, index: number) => {
    return (
      <TouchableOpacity
        style={{
          borderBottomColor: theme.colors.LIGHT_GRAY_2,
          borderBottomWidth: 1,
          paddingVertical: 20,
          flexDirection: 'row',
          backgroundColor: selectedIndex == index ? '#31CD956B' : '#fff',
        }}
        onPress={() => setIndexForSelection(index)}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderColor: '#02475B',
              borderWidth: 2,
              borderRadius: 9,
              marginTop: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selectedIndex === index && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: '#02475B',
                  borderRadius: 5,
                }}
              />
            )}
          </View>
        </View>
        <View
          style={{
            flex: 4,
          }}
        >
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Rakhi Kumari</Text>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                marginRight: 20,
              }}
            >
              AGE: 27
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              GENDER: FEMALE
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View
          style={{
            alignItems: 'center',
            paddingTop: 40,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.LIGHT_GRAY_3,
          }}
        >
          <ApolloLogo />
          <View
            style={{
              alignItems: 'center',
              paddingBottom: 20,
              marginTop: 10,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.LIGHT_BLUE,
              }}
            >
              Choose Primary Profile associated with your mobile no.
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: theme.colors.LIGHT_BLUE,
              }}
            >
              +91-8893456757
            </Text>
          </View>
        </View>
        <ScrollView
          style={styles.container} //extraScrollHeight={50}
          bounces={false}
        >
          <FlatList
            data={Array.from({ length: 10 })}
            renderItem={({ item, index }) => renderProfileList(item, index)}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
        <View>
          <View
            style={{
              backgroundColor: '#F0F0F0',
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontWeight: '600',
                fontSize: 13,
                color: theme.colors.LIGHT_BLUE,
              }}
            >
              Can’t find your name? Add a new profile
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 0.48,
                borderWidth: 1,
                borderColor: theme.colors.ORANGE_BORDER,
                paddingVertical: 8,
                alignItems: 'center',
                borderRadius: 5,
              }}
            >
              <Text style={{ fontWeight: '600', fontSize: 13 }}>ADD PROFILE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 0.48,
                paddingVertical: 8,
                alignItems: 'center',
                borderRadius: 5,
                backgroundColor: theme.colors.LIGHT_ORANGE,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    backgroundColor: theme.colors.WHITE,
    paddingTop: 2,
  },
});
