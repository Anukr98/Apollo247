import React, { useState } from 'react';
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

import { theme } from 'app/src/__new__/theme/theme';
import { RouteChildrenProps } from 'react-router';
import { appRoutes } from 'app/src/__new__/helpers/appRoutes';
import { AppImages } from 'app/src/__new__/images/AppImages';
import { string } from 'app/src/__new__/strings/string';
import { StickyBottomComponent } from 'app/src/__new__/components/ui/StickyBottomComponent';
import { Button, TextInputComponent, Card } from 'app/src/UI/common';
import { DatePicker } from 'app/src/__new__/components/ui/DatePicker';

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

export interface SignUpProps extends RouteChildrenProps {}
export const SignUp: React.FC<SignUpProps> = (props) => {
  const { history } = props;
  const [gender, setGender] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView style={styles.container} extraScrollHeight={100}>
        <View style={styles.mascotStyle}>
          <Image {...AppImages.ic_mascot} />
        </View>
        <View style={{ height: 100, justifyContent: 'center' }}>
          <Image {...AppImages.appLogo} style={{ left: 20, top: 20 }} />
        </View>
        <Card
          cardContainer={{ marginHorizontal: 0, marginTop: 20 }}
          heading={string.LocalStrings.welcome_text}
          description={string.LocalStrings.welcome_desc}
        >
          <TextInputComponent label={'First Name'} placeholder={'Example Jonathan'} />
          <TextInputComponent label={'Last Name'} placeholder={'Example Donut'} />
          <TextInputComponent
            label={'Date Of Birth'}
            value={date}
            placeholder={'DD/MM/YYYY'}
            onFocus={() => {
              Keyboard.dismiss();
              setIsDateTimePickerVisible(true);
              //   this.setState({ isDateTimePickerVisible: true });
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
          <TextInputComponent label={'Gender'} noInput={true} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            {GenderOptions.map((option) => (
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
            ))}
          </View>
          <TextInputComponent label={'Email Address (Optional)'} placeholder={'name@email.com'} />
          <View style={{ height: 80 }} />
        </Card>
      </KeyboardAwareScrollView>
      <StickyBottomComponent>
        <Button
          title={'FILL LATER'}
          style={{ width: '47%', backgroundColor: 'white' }}
          titleTextStyle={{ color: '#fc9916' }}
        />
        <Button
          title={'SUBMIT'}
          style={{ width: '47%' }}
          onPress={() => props.navigation.navigate(appRoutes.multiSignup())}
        />
      </StickyBottomComponent>
    </View>
  );
};
