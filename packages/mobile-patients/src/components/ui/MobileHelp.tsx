import { Mascot, Down, Up, DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacityProps,
  View,
  ViewStyle,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    // margin: 40,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#ffffff', //theme.colors.CARD_BG,
    //padding: 20,
    marginBottom: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    marginTop: 40,
  },
  inputView: {
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30c1a3',
    marginTop: 10,
    color: '#01475b',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
  },
  buttonsaveStyle: {
    width: '40%',
    height: 40,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
    color: '#fc9916',
  },
  footerButtonsContainer: {
    // zIndex: -1,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonendStyle: {
    width: '40%',
    height: 40,
    backgroundColor: '#FFFFFF',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.4,
    elevation: 2,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    opacity: 0.6,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: theme.colors.INPUT_TEXT,
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    marginRight: 10,
  },
});

export interface MobileHelpProps extends NavigationScreenProps {
  cardContainer?: StyleProp<ViewStyle>;
  heading?: string;
  descriptionTextStyle?: StyleProp<ViewStyle>;
  description?: string;
  disableButton?: boolean;
  buttonIcon?: React.ReactNode;
  onClickButton?: TouchableOpacityProps['onPress'];
}

export const MobileHelp: React.FC<MobileHelpProps> = (props) => {
  const [value, setValue] = useState<string>('');
  const [Selectquery, setSelectquery] = useState<string>('Select a query');
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const data = [
    {
      name: 'Pharmacy',
    },
    {
      name: 'Online Consult',
    },
    {
      name: 'Health Records',
    },
    {
      name: 'Physical Consult',
    },
    {
      name: 'Something else',
    },
  ];
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.cardContainer, props.cardContainer]}>
        <View style={{ alignItems: 'flex-end', marginTop: -20, marginRight: 20 }}>
          <Mascot />
        </View>
        <View style={{ flexDirection: 'column', marginBottom: 15 }}>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansSemiBold(18),
              color: '#02475b',
              marginLeft: 20,
              marginBottom: 5,
            }}
          >
            Hi! :)
          </Text>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(17),
              color: '#0087ba',
              lineHeight: 24,
              marginLeft: 20,
              //marginBottom: 32,
            }}
          >
            What do you need help with?
          </Text>
          <View style={{ marginLeft: 10 }}>
            <FlatList
              bounces={false}
              data={data}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    marginBottom: 10,
                    marginLeft: 12,
                    marginTop: 10,
                    ...theme.viewStyles.cardViewStyle,
                    flexWrap: 'wrap',
                  }}
                >
                  <Text
                    style={{
                      color: '#00b38e',
                      ...theme.fonts.IBMPlexSansMedium(16),
                      letterSpacing: 0.06,
                      marginLeft: 20,
                      marginTop: 12,
                      marginBottom: 12,
                      marginRight: 20,
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(17),
              color: '#0087ba',
              lineHeight: 24,
              marginTop: 25,
              marginLeft: 20,
            }}
          >
            Please select a reason that best matches your query
          </Text>
          <View>
            <View
              style={{
                marginTop: 0,
                borderRadius: 10,
              }}
            >
              <View style={{ marginBottom: 30, marginLeft: 20, marginRight: 20 }}>
                <TouchableOpacity>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        ...theme.fonts.IBMPlexSansMedium(16),
                        color: '#02475b',
                        opacity: 0.3,
                        marginTop: 10,
                        marginBottom: 9,
                      }}
                    >
                      {Selectquery}
                    </Text>
                    <View
                      style={{ alignItems: 'flex-end', alignSelf: 'flex-end', marginBottom: 5 }}
                    >
                      {!isDropdownOpen ? <DropdownGreen /> : <DropdownGreen />}
                    </View>
                  </View>
                </TouchableOpacity>
                <View
                  style={[
                    styles.inputStyle,
                    !isDropdownOpen ? { borderBottomColor: '#00b38e' } : {},
                  ]}
                />
              </View>
            </View>
            {isDropdownOpen ? <View style={{ top: 0 }}></View> : null}
          </View>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(17),
              color: '#0087ba',
              lineHeight: 24,
              marginLeft: 20,
            }}
          >
            any other comments (optional)?
          </Text>

          <TextInput
            style={{
              ...theme.fonts.IBMPlexSansMedium(14),
              //paddingLeft: 12,
              marginLeft: 20,
              color: '#01475b',
              marginBottom: 10,
              marginTop: 5,
              ...theme.fonts.IBMPlexSansMedium(16),
            }}
            placeholder="Write your comments here…"
            underlineColorAndroid="transparent"
            placeholderTextColor="rgba(2, 71, 91, 0.3)"
            value={value}
            onChangeText={(value) => setValue(value)}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#30c1a3',
              borderRadius: 10,
              marginBottom: 16,
              marginLeft: 20,
              marginRight: 20,
            }}
          ></View>
          <View style={styles.footerButtonsContainer}>
            <Button
              title="RESET"
              titleTextStyle={styles.buttonTextStyle}
              style={[styles.buttonendStyle, { marginRight: 16 }]}
            />
            <Button
              onPress={() => props.navigation.goBack()}
              title="SUBMIT"
              style={styles.buttonsaveStyle}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
