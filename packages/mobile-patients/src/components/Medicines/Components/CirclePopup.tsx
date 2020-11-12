import React from 'react';
import { StyleSheet, Text, Dimensions, View, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Overlay } from 'react-native-elements';
import { CrossPopup, CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface CirclePopupProps {}

export const CirclePopup: React.FC<CirclePopupProps> = (props) => {

  const renderCloseIcon = () => {
    return (
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          // alignSelf: 'flex-end',
          backgroundColor: 'white',
          // marginBottom: 16,
        }}
      >
        <TouchableOpacity onPress={() => {}}>
          <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          backgroundColor: theme.colors.WHITE,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 23,
          width: '100%',
        }}
      >
        <Text
          style={{
            ...theme.fonts.IBMPlexSansMedium(16),
            color: theme.colors.LIGHT_BLUE,
          }}
        >
          Circle Membership Plans
        </Text>
      </View>
    );
  };

  const renderContent = () => {
    return (
      <View style={{
        padding: 10,
      }}>
        <View style={{
          padding: 10,
          ...theme.viewStyles.cardContainer,
          backgroundColor: theme.colors.WHITE,
          // alignItems: 'center',
          // justifyContent: 'center',
          borderRadius: 10,
          borderWidth: 2,
          borderColor: '#00B38E',
          borderStyle: 'dashed',
        }}>
          <View style={{
            flexDirection: 'row',
          }}>
            <CircleLogo style={{
              resizeMode: 'contain',
              width: 60,
              height: 50,
            }} />
            <Text style={{
              marginTop: 8,
              ...theme.viewStyles.text('R', 12, '#02475B', 1, 17),
              width: '80%',
            }}>
              Enable Circle membership to get the best discounts, cashbacks, free delivery and more...
            </Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <Overlay
      onRequestClose={() => {}}
      isVisible={true}
      windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
      containerStyle={{
        marginBottom: 20,
      }}
      fullScreen
      transparent
      overlayStyle={{
        padding: 0,
        margin: 0,
        width: '88.88%',
        height: '60.88%',
        borderRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: 'transparent',
        overflow: 'hidden',
        elevation: 0,
      }}
    >
      <View style={{
          flexGrow: 1,
          backgroundColor: 'white',
      }}>
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: 'white',
        }}>
          {renderCloseIcon()}
          {renderHeader()}
          {renderContent()}
        </SafeAreaView>
      </View>
      
    </Overlay>
  );
};

const styles = StyleSheet.create({
  addressCard: {
    flex: 1,
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 6,
    width: 0.4 * windowWidth,
    paddingLeft: 10,
    marginTop: 2,
    marginBottom: 20,
    borderColor: '#FC9916',
    paddingBottom: 9,
  },
  header: {
    flexDirection: 'row',
    marginTop: 7,
    marginRight: 5,
  },
  address: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 13,
    color: '#01475B',
    opacity: 0.8,
    marginTop: 3,
    marginRight: 5,
  },
  addressType: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 14,
    color: '#01475B',
  },
});
