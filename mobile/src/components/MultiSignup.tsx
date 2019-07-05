import { ApolloLogo } from 'app/src/components/ApolloLogo';
import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Button } from 'app/src/components/ui/Button';
import { Card } from 'app/src/components/ui/Card';
import { DropdownGreen, Mascot } from 'app/src/components/ui/Icons';
import { StickyBottomComponent } from 'app/src/components/ui/StickyBottomComponent';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MenuProvider } from 'react-native-popup-menu';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '../hooks/authHooks';
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

type currentProfiles = {
  firstName: string;
  id: string;
  lastName: string;
  mobileNumber: string;
  sex: string;
  uhid: string;
  relation?: string;
};

export interface MultiSignupProps extends NavigationScreenProps {}

export const MultiSignup: React.FC<MultiSignupProps> = (props) => {
  const [relationIndex, setRelationIndex] = useState<number>(0);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [user, setUser] = useState<object>([]);
  const { currentUser, analytics, currentProfiles } = useAuth();
  const [profiles, setProfiles] = useState<any>(currentProfiles);
  const [discriptionText, setDiscriptionText] = useState<string>('');
  const [showText, setShowText] = useState<boolean>(false);

  useEffect(() => {
    analytics.setCurrentScreen(AppRoutes.MultiSignup);
    setUser(currentUser);
    setProfiles(currentProfiles);
    const length =
      profiles &&
      (profiles.length == 1 ? profiles.length + ' account' : profiles.length + ' accounts');
    const baseString =
      'We have found ' +
      length +
      ' registered with this mobile number. Please tell us who is who ? :)';
    setDiscriptionText(baseString);

    if (length !== 'undefined accounts') {
      setShowText(true);
      console.log('length', length);
    }
    console.log('discriptionText', discriptionText);
  }, [currentUser, currentProfiles, analytics, user, profiles, discriptionText, showText]);

  const renderUserForm = (styles: any, currentProfiles: currentProfiles, i: number) => {
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
            <Text style={styles.idTextStyle}>{i + 1}.</Text>
            <Text style={styles.idTextStyle}>{currentProfiles.uhid}</Text>
          </View>
          <Text style={styles.nameTextStyle}>
            {currentProfiles.firstName} {currentProfiles.lastName}
          </Text>
          <Text style={styles.idTextStyle}>{currentProfiles.sex} | 01 January 1987</Text>
          <View style={{ marginTop: 10 }}>
            <View style={{ paddingTop: 5, paddingBottom: 10 }}>
              <TouchableOpacity
                style={styles.placeholderViewStyle}
                onPress={() => {
                  setShowPopup(true);
                  setRelationIndex(i);
                }}
              >
                <Text
                  style={[
                    styles.placeholderTextStyle,
                    currentProfiles.relation ? null : styles.placeholderStyle,
                  ]}
                >
                  {currentProfiles.relation ? currentProfiles.relation : 'Relation'}
                </Text>
                <DropdownGreen size="sm" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  const isDisabled = () => {
    const filteredProfiles = profiles.filter((obj: object) => obj.relation);
    if (profiles.length === filteredProfiles.length) {
      return false;
    }
    return true;
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
        paddingVertical: 9,
        position: 'absolute',
        width: width,
        height: height,
        flex: 1,
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
                profiles[relationIndex].relation = menu.name;
                setProfiles(profiles);
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
          onPress={() =>
            props.navigation.navigate(AppRoutes.TabBar, {
              name: '',
            })
          }
          disabled={isDisabled()}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MenuProvider customStyles={{ menuProviderWrapper: { flex: 1 } }}>
        <KeyboardAwareScrollView style={styles.container} bounces={false}>
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
            description={showText ? discriptionText : string.LocalStrings.multi_signup_desc}
            descriptionTextStyle={{ paddingBottom: 50 }}
          >
            <View style={styles.mascotStyle}>
              <Mascot />
            </View>
            {profiles.map((currentProfiles: currentProfiles, i: number) => (
              <View key={i}>{renderUserForm(styles, currentProfiles, i)}</View>
            ))}
            <View style={{ height: 80 }} />
          </Card>
        </KeyboardAwareScrollView>
        {renderButtons()}
      </MenuProvider>
      {showPopup && Popup()}
    </SafeAreaView>
  );
};
