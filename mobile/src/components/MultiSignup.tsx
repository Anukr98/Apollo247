import { ApolloLogo } from 'app/src/components/ApolloLogo';
import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Button } from 'app/src/components/ui/Button';
import { Card } from 'app/src/components/ui/Card';
import { DropDownComponent } from 'app/src/components/ui/DropDownComponent';
import { Mascot, DropdownGreen } from 'app/src/components/ui/Icons';
import { StickyBottomComponent } from 'app/src/components/ui/StickyBottomComponent';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MenuProvider } from 'react-native-popup-menu';
import { NavigationScreenProps } from 'react-navigation';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    backgroundColor: theme.colors.WHITE,
    paddingTop: 2,
  },
  mascotStyle: {
    position: 'absolute',
    top: -32,
    right: 20,
    height: 64,
    width: 64,
    zIndex: 2,
    elevation: 2,
  },
  idTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.INPUT_TEXT,
  },
  nameTextStyle: {
    paddingTop: 15,
    paddingBottom: 8,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
  },
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 7,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
});

export interface MultiSignupProps extends NavigationScreenProps {}

export const MultiSignup: React.FC<MultiSignupProps> = (props) => {
  const [relation, setRelation] = useState<string>('Relations');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const renderUserForm = (styles: any) => {
    return (
      <View>
        <View
          style={{
            marginTop: 12,
            borderRadius: 5,
            backgroundColor: '#f7f8f5',
            padding: 16,
            paddingBottom: 6,
          }}
        >
          <View style={{ flex: 1 }}></View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottomColor: 'rgba(2,71,91, 0.3)',
              borderBottomWidth: 0.5,
              paddingBottom: 8,
            }}
          >
            <Text style={styles.idTextStyle}>1.</Text>

            <Text style={styles.idTextStyle}>APD1.0010783329</Text>
          </View>
          <Text style={styles.nameTextStyle}>Surj Gupta</Text>
          <Text style={styles.idTextStyle}>Male | 01 January 1987</Text>
          <View style={{ marginTop: 10 }}>
            <View style={{ paddingTop: 5, paddingBottom: 10 }}>
              <TouchableOpacity
                style={styles.placeholderViewStyle}
                onPress={() => setShowPopup(true)}
              >
                <Text
                  style={[
                    styles.placeholderTextStyle,
                    relation === 'Relations' ? styles.placeholderStyle : null,
                  ]}
                >
                  {relation}
                </Text>
                <DropdownGreen size="sm" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  type options = {
    name: string;
  };

  const Options: options[] = [
    {
      name: 'Me',
    },
    {
      name: 'Mother',
    },
    {
      name: 'Father',
    },
    {
      name: 'Sister',
    },
    {
      name: 'Wife',
    },
    {
      name: 'Father',
    },
    {
      name: 'Husband',
    },
    {
      name: 'Son',
    },
    {
      name: 'Daughter',
    },
    {
      name: 'Other',
    },
  ];

  const Popup = () => (
    <TouchableOpacity
      style={{
        // width: 160,
        paddingVertical: 9,
        position: 'absolute',
        width: width,
        height: height,
        flex: 1,
        // top: 0,
        // left: 0,
        // right: 0,
        // bottom: 0,
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 3,
        backgroundColor: 'transparent',
      }}
      onPress={() => setShowPopup(false)}
    >
      <View
        style={{
          width: 160,
          borderRadius: 10,
          backgroundColor: 'white',
          marginRight: 20,
          shadowColor: '#808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 5,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        {Options.map((menu) => (
          <View style={styles.textViewStyle}>
            <Text
              style={styles.textStyle}
              onPress={() => {
                setRelation(menu.name);
                setShowPopup(false);
              }}
            >
              {menu.name}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderButtons = () => {
    return (
      <StickyBottomComponent>
        <Button
          style={{ width: '100%', flex: 1, marginHorizontal: 40 }}
          title={'SUBMIT'}
          onPress={() => props.navigation.navigate(AppRoutes.TabBar)}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MenuProvider customStyles={{ menuProviderWrapper: { flex: 1 } }}>
        <KeyboardAwareScrollView style={styles.container}>
          <View style={{ justifyContent: 'center', marginTop: 20, marginLeft: 20 }}>
            <ApolloLogo />
          </View>

          <Card
            cardContainer={{
              marginHorizontal: 0,
              marginTop: 20,
              shadowOffset: { width: 0, height: -10 },
              shadowOpacity: 0.4,
            }}
            heading={string.LocalStrings.welcome_text}
            description={string.LocalStrings.multi_signup_desc}
            descriptionTextStyle={{ paddingBottom: 50 }}
          >
            <View style={styles.mascotStyle}>
              <Mascot />
            </View>
            {renderUserForm(styles)}
            {renderUserForm(styles)}
            <View style={{ height: 80 }} />
          </Card>
        </KeyboardAwareScrollView>
        {renderButtons()}
      </MenuProvider>
      {showPopup && Popup()}
    </SafeAreaView>
  );
};
