import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StyleProp,
  ImageStyle,
  TextStyle,
  ImageSourcePropType,
  Keyboard,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MenuProvider } from 'react-native-popup-menu';

import { theme } from 'app/src/__new__/theme/theme';
import { RouteChildrenProps } from 'react-router';
import { AppRoutes } from 'app/src/__new__/components/AppNavigatorContainer';
import { string } from 'app/src/__new__/strings/string';
import { StickyBottomComponent } from 'app/src/__new__/components/ui/StickyBottomComponent';
import { Button, TextInputComponent, Card } from 'app/src/UI/common';
import { DatePicker } from 'app/src/__new__/components/ui/DatePicker';
import { DropDownComponent } from 'app/src/__new__/components/ui/DropDownComponent';
import { Mascot, More } from 'app/src/__new__/components/ui/Icons';
import { ApolloLogo } from 'app/src/__new__/components/ApolloLogo';
import firebase from 'react-native-firebase';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    paddingTop: 2,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    height: 28,
    width: '80%',
    color: theme.colors.INPUT_TEXT,
  },
  inputView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 4,
  },
  bottomDescription: {
    fontSize: 12,
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    paddingBottom: 55,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  invalidNumberStyle: {
    color: theme.colors.INPUT_FAILURE_TEXT,
  },
  mascotStyle: {
    position: 'absolute',
    top: 90,
    right: 20,
    height: 64,
    width: 64,
    zIndex: 2,
    elevation: 2,
  },
  buttonViewStyle: {
    width: '30%',
    backgroundColor: 'white',
  },
  selectedButtonViewStyle: {
    backgroundColor: theme.colors.APP_GREEN,
  },
  buttonTitleStyle: {
    color: theme.colors.APP_GREEN,
  },
  selectedButtonTitleStyle: {
    color: theme.colors.WHITE,
  },
  submitButtonView: {
    width: '40%',
    backgroundColor: 'white',
  },
  submitButtonTitleStyle: {
    color: '#fc9916',
  },
});

type genderOptions = {
  name: string;
};

const GenderOptions: genderOptions[] = [
  {
    name: 'Male',
  },
  {
    name: 'Female',
  },
  {
    name: 'Other',
  },
];

export interface MultiSignupProps extends RouteChildrenProps {}

export const MultiSignup: React.FC<MultiSignupProps> = (props) => {
  const [gender, setGender] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);

  useEffect(() => {
    firebase.analytics().setCurrentScreen('MultiSignup');
  });

  const renderGenderButtons = (styles: any) => {
    return GenderOptions.map((option) => (
      <Button
        key={option.name}
        title={option.name}
        style={[
          styles.buttonViewStyle,
          gender === option.name ? styles.selectedButtonViewStyle : null,
        ]}
        titleTextStyle={
          gender === option.name ? styles.selectedButtonTitleStyle : styles.buttonTitleStyle
        }
        onPress={() => setGender(option.name)}
      />
    ));
  };

  const renderUserForm = (styles: any) => {
    return (
      <View style={{ flexDirection: 'row', marginTop: 15 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.idTextStyle}>1.</Text>
        </View>
        <View style={{ flex: 9 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.idTextStyle}>APD1.0010783329</Text>
            <More />
            {/* <Image {...AppImages.ic_more} /> */}
          </View>
          <TextInputComponent placeholder={'First Name'} />
          <TextInputComponent placeholder={'Last Name'} />
          <DropDownComponent />
          <TextInputComponent
            value={date}
            placeholder={'DD/MM/YYYY'}
            onFocus={() => {
              Keyboard.dismiss();
              setIsDateTimePickerVisible(true);
            }}
          />
          <DatePicker
            isDateTimePickerVisible={isDateTimePickerVisible}
            handleDatePicked={() => {
              setDate(date);
              setIsDateTimePickerVisible(false);
            }}
            hideDateTimePicker={() => {
              setIsDateTimePickerVisible(false);
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 25,
              marginTop: 10,
            }}
          >
            {renderGenderButtons(styles)}
          </View>
        </View>
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <StickyBottomComponent>
        <Button
          title={'FILL LATER'}
          style={{ width: '47%', backgroundColor: 'white' }}
          titleTextStyle={{ color: '#fc9916' }}
        />
        <Button
          style={{ width: '47%' }}
          title={'SUBMIT'}
          onPress={() => props.navigation.navigate(AppRoutes.TabBar)}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <MenuProvider menuProviderWrapper={{ flex: 1 }}>
        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.mascotStyle}>
            <Mascot />
            {/* <Image {...AppImages.ic_mascot} /> */}
          </View>

          <View style={{ height: 100, justifyContent: 'center' }}>
            <ApolloLogo />
            {/* <Image {...AppImages.appLogo} style={{ left: 20, top: 20 }} /> */}
          </View>

          <Card
            cardContainer={{ marginHorizontal: 0, marginTop: 20 }}
            heading={string.LocalStrings.welcome_text}
            description={string.LocalStrings.multi_signup_desc}
          >
            {renderUserForm(styles)}
            {renderUserForm(styles)}
            <View style={{ height: 60 }} />
          </Card>
        </KeyboardAwareScrollView>
        {renderButtons()}
      </MenuProvider>
    </View>
  );
};
