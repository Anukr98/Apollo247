import { SharingScreenStyles } from '@aph/mobile-doctors/src/components/Account/SharingScreen.styles';
import React, { useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Share,
  Linking,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { isPhoneNumberValid } from '@aph/mobile-doctors/src/helpers/helperFunctions';
// import { Browser, BrowserUnselect } from '@aph/mobile-doctors/src/components/ui/Icons';

const styles = SharingScreenStyles;

export interface SharingScreenProps extends NavigationScreenProps {}

export const SharingScreen: React.FC<SharingScreenProps> = (props) => {
  const tabsData = [
    {
      title: 'URL',
      // selectedIcon: <Browser />, unselectedIcon: <BrowserUnselect />
    },
    { title: 'SMS' },
    { title: 'EMAIL' },
  ];
  const [selectedTab, setSelectedTab] = useState<string>(tabsData[0].title);
  const [url, setUrl] = useState<string>('https://www.apollo247.com/761ebcuhsbdcuhsdbnckdhjscjdhs');
  const [mobile, setMobile] = useState<string>('9876543212');
  const [validMobile, setValidMobile] = useState<boolean>(true);
  const [email, setEmail] = useState<string>(
    'https://www.apollo247.com/761ebcuhsbdcuhsdbnckdhjscjdhs'
  );
  const [validEmail, setValidEmail] = useState<boolean>(true);

  const renderHeader = () => {
    return (
      <Header headerText={string.account.share_header} containerStyle={styles.headerContainer} />
    );
  };

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <TabsComponent
          data={tabsData}
          selectedTab={selectedTab}
          onChange={setSelectedTab}
          tabViewStyle={{ borderBottomWidth: 2 }}
        />
      </View>
    );
  };

  const renderTitle = () => {
    return (
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{string.account.share_title}</Text>
        {renderTabs()}
      </View>
    );
  };

  const renderShare = (
    title: string,
    buttonText: string,
    inputValue: string,
    onChange: (text: string) => void,
    placeHolder: string,
    onPress: () => void,
    prefix: string,
    maxLength: number,
    disableEdit: boolean,
    type: 'numeric' | 'email-address' | 'default' = 'default',
    invalid: string,
    displayCSV?: boolean
  ) => {
    return (
      <View>
        <Text style={styles.shareHeadingText}>{title}</Text>
        <View style={styles.textInputView}>
          {prefix ? <Text style={styles.textInputPrefixStyle}>{prefix}</Text> : null}
          {disableEdit ? (
            <Text style={styles.disabledtext} numberOfLines={1}>
              {inputValue}
            </Text>
          ) : (
            <TextInput
              value={inputValue}
              placeholder={placeHolder}
              style={styles.textInputStyle}
              placeholderTextColor={theme.colors.darkBlueColor(0.4)}
              onChange={(value) => {
                onChange(value.nativeEvent.text);
              }}
              selectionColor={theme.colors.APP_GREEN}
              maxLength={maxLength ? maxLength : undefined}
              keyboardType={type}
              underlineColorAndroid={theme.colors.TRANSPARENT}
            />
          )}
          <View style={styles.buttonStyle}>
            <TouchableOpacity activeOpacity={1} onPress={onPress}>
              <View style={styles.buttonTextContainerStyle}>
                <Text style={styles.buttonTextStyle}>{buttonText}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {invalid ? <Text style={styles.invalidText}>{invalid}</Text> : null}
        {displayCSV ? (
          <View style={styles.csvContainer}>
            <Text style={styles.csvTitleText}>{string.account.share_sms_csv_title}</Text>
            <View style={styles.iconContainer}>
              <Text style={styles.csvIconText}>{string.account.share_sms_csv}</Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  const renderShareComponent = () => {
    return (
      <ScrollView bounces={false}>
        <View style={styles.shareContainer}>
          {selectedTab === 'URL'
            ? renderShare(
                string.account.share_url,
                'SHARE',
                url,
                setUrl,
                '',
                () => {
                  Share.share(
                    {
                      message:
                        'Hi, Doctor Sushma has invited you to the Apollo247 application. Click here https://apl247.onelink.me/AEkA/5e10e755 to download the application.',
                      url: 'https://apl247.onelink.me/AEkA/5e10e755',
                      title: 'yo',
                    },
                    { dialogTitle: 'yo' }
                  )
                    .then((res) => {})
                    .catch((e) => {});
                },
                '',
                0,
                true,
                'default',
                ''
              )
            : selectedTab === 'SMS'
            ? renderShare(
                string.account.share_sms,
                'SEND',
                mobile,
                (text) => {
                  if (/^\d+$/.test(text) || text == '') {
                    setMobile(text);
                    setValidMobile(isPhoneNumberValid(text) || text == '');
                  }
                },
                string.account.share_sms_placeholder,
                () => {},
                '+91',
                10,
                false,
                'numeric',
                validMobile ? '' : string.account.valid_mobile,
                false
              )
            : selectedTab === 'EMAIL'
            ? renderShare(
                string.account.share_email,
                'SEND',
                email,
                setEmail,
                string.account.share_email_placeholder,
                () => {
                  Linking.openURL(
                    'mailto:support@example.com?subject=SendMail&body=Description'
                  ).catch((e) => {
                    console.log(e, 'ndsjkn');
                  });
                },
                '',
                0,
                false,
                'email-address',
                validEmail ? '' : string.account.valid_email
              )
            : null}
        </View>
      </ScrollView>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeAreaView}>
        {renderHeader()}
        {renderTitle()}
        {renderShareComponent()}
      </SafeAreaView>
    </View>
  );
};
