import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { DropdownGreen, Mascot } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { SEND_HELP_EMAIL } from '@aph/mobile-patients/src/graphql/profiles';
import {
  SendHelpEmail,
  SendHelpEmailVariables,
} from '@aph/mobile-patients/src/graphql/types/SendHelpEmail';
import { handleGraphQlError, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { NeedHelp } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Keyboard,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  CommonLogEvent,
  CommonBugFender,
  // setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useUIElements } from '../UIElementsProvider';

const styles = StyleSheet.create({
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    flex: 1,
    left: 0,
    right: 0,
  },
  subViewPopup: {
    marginTop: 120,
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  mascotIconStyle: {
    position: 'absolute',
    top: -32,
    right: 20,
  },
  categoryItemStyle: {
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
    backgroundColor: 'white',
    marginTop: 10,
    marginRight: 20,
  },
  categoryItemSelectedStyle: {
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
    backgroundColor: '#00b38e',
    marginTop: 10,
    marginRight: 20,
  },
  categoryTextStyle: {
    color: '#00b38e',
    padding: 12,
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: -0.36,
  },
  hiTextStyle: {
    marginHorizontal: 20,
    marginTop: 31,
    marginBottom: 8,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  fieldLabel: {
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  categoryWrapper: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonStyle: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resetButtonTextStyle: {
    color: '#fc9916',
  },
  submitButtonStyle: {
    flex: 1,
  },
  buttonsWrapperStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 22,
  },
});

export interface MobileHelpProps extends NavigationScreenProps {}

export const MobileHelp: React.FC<MobileHelpProps> = (props) => {
  const [comment, setComment] = useState<string>('');
  const [helpCategory, setHelpCategory] = useState<string>('');
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [mobileFollowup, setMobileFollowup] = useState<boolean>(false);
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { needHelpToContactInMessage } = useAppCommonData();
  const [email, setEmail] = useState<string>('');
  const [emailValidation, setEmailValidation] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert } = useUIElements();

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const _setEmail = (value: string) => {
    const trimmedValue = (value || '').trim();
    setEmail(trimmedValue);
    setEmailValidation(isSatisfyingEmailRegex(trimmedValue));
  };

  useEffect(() => {
    setSelectedQuery('');
  }, [helpCategory]);

  const renderCategory = (category: string, containerStyle?: StyleProp<ViewStyle>) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        key={category}
        style={[
          category == helpCategory ? styles.categoryItemSelectedStyle : styles.categoryItemStyle,
          containerStyle,
        ]}
        onPress={() => {
          setHelpCategory(category);
        }}
      >
        <Text
          style={[
            category == helpCategory
              ? { ...styles.categoryTextStyle, color: 'white' }
              : styles.categoryTextStyle,
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderQueyFiled = () => {
    const handleDropdownClick = () => {
      Keyboard.dismiss();
      if (!helpCategory) {
        Alert.alert('Alert', 'Please select from above categories first.');
      } else {
        setDropdownOpen(!isDropdownOpen);
      }
    };
    return (
      <View style={{ marginTop: 5, marginBottom: 14 }}>
        <Text style={[styles.fieldLabel, { marginBottom: 12 }]}>
          Please select a reason that best matches your query
        </Text>
        <TouchableOpacity activeOpacity={1} onPress={() => handleDropdownClick()}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={[
                selectedQuery
                  ? {}
                  : {
                      opacity: 0.3,
                    },
                {
                  flex: 0.9,
                  ...theme.fonts.IBMPlexSansMedium(18),
                  color: theme.colors.SHERPA_BLUE,
                },
              ]}
              numberOfLines={2}
            >
              {selectedQuery || 'Select a query'}
            </Text>
            <View style={{ flex: 0.1 }}>
              <DropdownGreen style={{ alignSelf: 'flex-end' }} />
            </View>
          </View>
          <View
            style={{
              marginTop: 5,
              backgroundColor: '#00b38e',
              height: 2,
            }}
          />
        </TouchableOpacity>
        {renderSelectReasonOptions()}
      </View>
    );
  };

  const renderSelectReasonOptions = () => {
    const options =
      (helpCategory && NeedHelp.find((item) => item.category == helpCategory)!.options) || [];
    if (isDropdownOpen)
      return (
        <Overlay
          onBackdropPress={() => setDropdownOpen(!isDropdownOpen)}
          isVisible={isDropdownOpen}
          overlayStyle={styles.dropdownOverlayStyle}
        >
          <View>
            {options.length > 0 && (
              <DropDown
                cardContainer={{
                  margin: 0,
                }}
                options={options.map(
                  (item) =>
                    ({
                      optionText: item,
                      onPress: () => {
                        setDropdownOpen(!isDropdownOpen);
                        setSelectedQuery(item);
                      },
                    } as Option)
                )}
              />
            )}
          </View>
        </Overlay>
      );
  };

  const renderEmailField = () => {
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={styles.fieldLabel}>Please enter your email address</Text>
        <TextInputComponent
          placeholder={'Enter email address'}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(text: string) => _setEmail(text)}
          inputStyle={{
            paddingBottom: 8,
            marginTop: 8,
          }}
        />
      </View>
    );
  };

  const renderCommentField = () => {
    return (
      <View>
        <Text style={styles.fieldLabel}>Please share more details (mandatory)</Text>
        <TextInputComponent
          placeholder={'Share your details here…'}
          value={comment}
          onChangeText={(text) => setComment(text)}
          inputStyle={{
            paddingBottom: 8,
            marginTop: 8,
          }}
        />
      </View>
    );
  };

  const renderContent = () => {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}>
        <View style={styles.categoryWrapper}>
          {NeedHelp.map((item) => renderCategory(item.category))}
        </View>
        {renderEmailField()}
        {renderQueyFiled()}
        {renderCommentField()}
        {renderButtons()}
      </View>
    );
  };

  // const submit = (
  //   category: string,
  //   reason: string,
  //   comments: string,
  //   patientId: string,
  //   email: string
  // ) =>
  //   client.query<SendHelpEmail, SendHelpEmailVariables>({
  //     query: SEND_HELP_EMAIL,
  //     variables: {
  //       helpEmailInput: {
  //         category,
  //         reason,
  //         comments,
  //         patientId,
  //         email,
  //       },
  //     },
  //   });

  const showAlert = () => {
    showAphAlert!({
      title: `Hi,`,
      description: `Please enter your valid email address`,
      unDismissable: true,
      CTAs: [
        {
          text: 'Okay',
          onPress: () => {
            hideAphAlert && hideAphAlert();
          },
          type: 'orange-button',
        },
      ],
    });
  };
  const onSubmit = () => {
    if (!emailValidation) {
      showAlert();
      return;
    }
    setShowSpinner(true);
    // submit(helpCategory, selectedQuery, comment, g(currentPatient, 'id'), email);

    const helpEmail = {
      category: helpCategory,
      reason: selectedQuery,
      comments: comment,
      patientId: g(currentPatient, 'id'),
      email: email,
    };
    // setBugFenderLog('SEND_HELP_EMAIL', helpEmail);
    client
      .query<SendHelpEmail, SendHelpEmailVariables>({
        query: SEND_HELP_EMAIL,
        variables: {
          helpEmailInput: helpEmail,
        },
      })
      .then(() => {
        setShowSpinner(false);
        setMobileFollowup(true);
      })
      .catch((e) => {
        CommonBugFender('MobileHelp_onSubmit', e);
        setShowSpinner(false);
        props.navigation.goBack();
        handleGraphQlError(e);
      });
  };

  const isInitialState = !(helpCategory || selectedQuery || comment);
  const onReset = () => {
    if (isInitialState) {
      CommonLogEvent(AppRoutes.MobileHelp, 'Go back clicked');
      props.navigation.goBack();
      return;
    }
    setHelpCategory('');
    setComment('');
    setSelectedQuery('');
    setEmail('');
  };

  const renderButtons = () => {
    return (
      <View style={styles.buttonsWrapperStyle}>
        <Button
          onPress={() => onReset()}
          title={isInitialState ? 'GO BACK' : 'RESET'}
          style={styles.resetButtonStyle}
          titleTextStyle={styles.resetButtonTextStyle}
        />
        <View style={{ width: 16 }} />
        <Button
          onPress={() => onSubmit()}
          disabled={!(helpCategory && selectedQuery && email && comment)}
          title="SUBMIT"
          style={styles.submitButtonStyle}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <View style={styles.showPopUp}>
        <View style={styles.subViewPopup}>
          <Text style={styles.hiTextStyle}>{'Hi! :)'}</Text>
          <Text style={[styles.fieldLabel, { marginHorizontal: 20 }]}>
            {'What do you need help with?'}
          </Text>
          <KeyboardAwareScrollView bounces={false}>{renderContent()}</KeyboardAwareScrollView>
          <Mascot style={styles.mascotIconStyle} />
        </View>
      </View>
      {mobileFollowup && (
        <BottomPopUp
          title={'Hi:)'}
          description={
            needHelpToContactInMessage ||
            'Thank you for reaching out. Our team will call you back shortly.'
          }
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setMobileFollowup(false);
                CommonLogEvent(AppRoutes.MobileHelp, 'Submitted successfully');
                props.navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
                  })
                );
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
    </View>
  );
};
