import { ApolloLogo } from 'app/src/components/ApolloLogo';
import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Button } from 'app/src/components/ui/Button';
import { Card } from 'app/src/components/ui/Card';
import { DropDownComponent } from 'app/src/components/ui/DropDownComponent';
import { Mascot } from 'app/src/components/ui/Icons';
import { StickyBottomComponent } from 'app/src/components/ui/StickyBottomComponent';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MenuProvider } from 'react-native-popup-menu';
import { NavigationScreenProps } from 'react-navigation';

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
});

export interface MultiSignupProps extends NavigationScreenProps {}

export const MultiSignup: React.FC<MultiSignupProps> = (props) => {
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
            <DropDownComponent />
          </View>
        </View>
      </View>
    );
  };

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
    </SafeAreaView>
  );
};
