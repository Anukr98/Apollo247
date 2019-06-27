import { ApolloLogo } from 'app/src/components/ApolloLogo';
import { AppRoutes } from 'app/src/components/AppNavigatorContainer';
import { Button } from 'app/src/components/ui/Button';
import { Card } from 'app/src/components/ui/Card';
import { DatePicker } from 'app/src/components/ui/DatePicker';
import { Mascot } from 'app/src/components/ui/Icons';
import { StickyBottomComponent } from 'app/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from 'app/src/components/ui/TextInputComponent';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React, { useState } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
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

export interface SignUpProps extends NavigationScreenProps {}
export const SignUp: React.FC<SignUpProps> = (props) => {
  const [gender, setGender] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);

  console.log(isDateTimePickerVisible, 'isDateTimePickerVisible');
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView style={styles.container} extraScrollHeight={50}>
        <View style={{ justifyContent: 'center', marginTop: 20, marginLeft: 20 }}>
          <ApolloLogo />
        </View>
        <Card
          cardContainer={{ marginHorizontal: 0, marginTop: 20 }}
          heading={string.LocalStrings.welcome_text}
          description={string.LocalStrings.welcome_desc}
        >
          <View style={styles.mascotStyle}>
            <Mascot />
          </View>
          <TextInputComponent label={'Full Name'} placeholder={'First Name'} />
          <TextInputComponent placeholder={'Last Name'} />
          <TextInputComponent
            label={'Date Of Birth'}
            value={date}
            placeholder={'dd/mm/yyyy'}
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
          title={'SUBMIT'}
          style={{ width: '100%', flex: 1, marginHorizontal: 40 }}
          onPress={() => props.navigation.navigate(AppRoutes.MultiSignup)}
        />
      </StickyBottomComponent>
    </SafeAreaView>
  );
};
