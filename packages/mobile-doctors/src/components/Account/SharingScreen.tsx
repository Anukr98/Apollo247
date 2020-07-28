import { SharingScreenStyles } from '@aph/mobile-doctors/src/components/Account/SharingScreen.styles';
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Share,
  Linking,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import {
  isPhoneNumberValid,
  g,
  isSatisfyingEmailRegex,
} from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import {
  UPSERT_DOCTORS_DEEPLINK,
  SEND_MESSAGE_TO_MOBILE_NUMBER,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  UpsertDoctorsDeeplink,
  UpsertDoctorsDeeplinkVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpsertDoctorsDeeplink';
import {
  SendMessageToMobileNumber,
  SendMessageToMobileNumberVariables,
} from '@aph/mobile-doctors/src/graphql/types/SendMessageToMobileNumber';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import {
  URLActive,
  URLInActive,
  ChatActive,
  ChatInActive,
  MailActive,
  MailInActive,
} from '@aph/mobile-doctors/src/components/ui/Icons';

const styles = SharingScreenStyles;
const { width } = Dimensions.get('screen');
export interface SharingScreenProps extends NavigationScreenProps {}

export const SharingScreen: React.FC<SharingScreenProps> = (props) => {
  const tabsData = [
    {
      title: 'URL',
      selectedIcon: <URLActive />,
      unselectedIcon: <URLInActive />,
    },
    { title: 'SMS', selectedIcon: <ChatActive />, unselectedIcon: <ChatInActive /> },
    // { title: 'EMAIL', selectedIcon: <MailActive />, unselectedIcon: <MailInActive /> },
  ];
  const { doctorDetails } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>(tabsData[0].title);
  const [url, setUrl] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [validMobile, setValidMobile] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [validEmail, setValidEmail] = useState<boolean>(true);
  const client = useApolloClient();
  const { showAphAlert, setLoading, hideAphAlert } = useUIElements();
  useEffect(() => {
    setLoading && setLoading(true);
    client
      .mutate<UpsertDoctorsDeeplink, UpsertDoctorsDeeplinkVariables>({
        mutation: UPSERT_DOCTORS_DEEPLINK,
        variables: {
          doctorId: doctorDetails ? doctorDetails.id : null,
        },
      })
      .then((data) => {
        setUrl(g(data, 'data', 'upsertDoctorsDeeplink', 'deepLink') || '');
        setLoading && setLoading(false);
      })
      .catch(() => {
        setLoading && setLoading(false);
        showAphAlert &&
          showAphAlert({
            title: 'Alert!',
            description: 'Error in getting URL',
            onPressOk: () => {
              hideAphAlert && hideAphAlert();
              props.navigation.pop();
            },
          });
      });
  }, []);

  const renderHeader = () => {
    return (
      <Header
        headerText={string.account.share_header}
        containerStyle={styles.headerContainer}
        rightComponent={
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.navigation.goBack()}
            style={{
              height: 35,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Remove style={{ height: 24, width: 24 }} />
          </TouchableOpacity>
        }
      />
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
          showTextIcons={true}
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
    displayCSV: boolean,
    enableButton: boolean
  ) => {
    return (
      <View>
        <Text style={styles.shareHeadingText}>{title}</Text>
        <View style={styles.textInputView}>
          {prefix ? <Text style={styles.textInputPrefixStyle}>{prefix}</Text> : null}
          {inputValue === '' ? (
            <Text
              style={{
                position: 'absolute',
                left: prefix ? 20 + prefix.length * 10.2 : 20,
                width: width - 124 - (prefix ? 20 + prefix.length * 10.2 : 20),
                ...theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.4)),
              }}
              numberOfLines={1}
            >
              {placeHolder}
            </Text>
          ) : null}
          {disableEdit ? (
            <Text style={styles.disabledtext} numberOfLines={1}>
              {inputValue}
            </Text>
          ) : (
            <TextInput
              value={inputValue}
              style={styles.textInputStyle}
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
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (enableButton) {
                  onPress();
                }
              }}
            >
              <View style={[styles.buttonTextContainerStyle, { opacity: enableButton ? 1 : 0.5 }]}>
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
                      message: string.account.message
                        .replace('{0}', doctorDetails ? doctorDetails.fullName || '' : '')
                        .replace('{1}', url),
                      title: string.account.message_title,
                    },
                    { dialogTitle: string.account.message_title }
                  )
                    .then((res) => {})
                    .catch((e) => {});
                },
                '',
                0,
                true,
                'default',
                '',
                false,
                true
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
                () => {
                  if (isPhoneNumberValid(mobile) && mobile.length === 10) {
                    setLoading && setLoading(true);
                    client
                      .query<SendMessageToMobileNumber, SendMessageToMobileNumberVariables>({
                        query: SEND_MESSAGE_TO_MOBILE_NUMBER,
                        fetchPolicy: 'no-cache',
                        variables: {
                          mobileNumber: `+91${mobile}`,
                          textToSend: `${string.account.message
                            .replace('{0}', doctorDetails ? doctorDetails.fullName || '' : '')
                            .replace('{1}', url)}`,
                        },
                      })
                      .then((data) => {
                        setLoading && setLoading(false);
                        setMobile('');
                        if (g(data, 'data', 'sendMessageToMobileNumber', 'status') === 'OK') {
                          showAphAlert &&
                            showAphAlert({
                              title: 'Success',
                              description: `We have sent the app invite to +91${mobile}`,
                              onPressOk: () => {
                                hideAphAlert && hideAphAlert();
                                props.navigation.goBack();
                              },
                            });
                        } else {
                          showAphAlert &&
                            showAphAlert({
                              title: 'Alert!',
                              description: 'An error occuered in sending message to mobile number',
                            });
                        }
                      })
                      .catch((e) => {
                        setLoading && setLoading(false);
                        showAphAlert &&
                          showAphAlert({
                            title: 'Alert!',
                            description: 'An error occuered in sending message to mobile number',
                          });
                      });
                  } else {
                    showAphAlert &&
                      showAphAlert({ title: 'Alert!', description: string.account.valid_mobile });
                  }
                },
                '+91',
                10,
                false,
                'numeric',
                validMobile ? '' : string.account.valid_mobile,
                false,
                isPhoneNumberValid(mobile) && mobile.length === 10
              )
            : selectedTab === 'EMAIL'
            ? renderShare(
                string.account.share_email,
                'SEND',
                email,
                (text) => {
                  setEmail(text);
                  setValidEmail(true);
                },
                string.account.share_email_placeholder,
                () => {
                  if (isSatisfyingEmailRegex(email)) {
                    Linking.openURL(
                      `mailto:${email}?subject=${
                        string.account.message_title
                      }&body=${string.account.message
                        .replace('{0}', doctorDetails ? doctorDetails.fullName || '' : '')
                        .replace('{1}', url)}`
                    )
                      .then(() => {})
                      .catch((e) => {
                        showAphAlert &&
                          showAphAlert({
                            title: 'Alert!',
                            description: 'An error occuered while opening email',
                          });
                      });
                    setEmail('');
                  } else {
                    setValidEmail(false);
                    showAphAlert &&
                      showAphAlert({ title: 'Alert!', description: string.account.valid_email });
                  }
                },
                '',
                0,
                false,
                'email-address',
                validEmail ? '' : string.account.valid_email,
                false,
                isSatisfyingEmailRegex(email)
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
