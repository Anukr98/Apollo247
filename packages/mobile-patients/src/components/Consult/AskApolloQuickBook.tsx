import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CallIconWhite } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { GENEREATE_ASK_APOLLO_LEAD } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { askApolloLead } from '@aph/mobile-patients/src/graphql/types/askApolloLead';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  postCleverTapEvent,
  validateEmail,
  validateName,
  validateNumber,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

interface AskApolloQuickBookProps extends NavigationScreenProps {
  ctAttributes: object;
}

export const AskApolloQuickBook: React.FC<AskApolloQuickBookProps> = (props) => {
  const client = useApolloClient();
  const { showAphAlert } = useUIElements();

  const [patientName, setPatientName] = useState<string>('');
  const [patientNumber, setPatientNumber] = useState<string>('');
  const [emailId, setEmailId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const ctAttributes = props.navigation.getParam('ctAttributes');

  const renderHeader = () => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.askApollo.quickBook}
        container={styles.headerContainer}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const onRequestCallBack = async () => {
    setLoading(true);
    try {
      const res = await client.query<askApolloLead>({
        query: GENEREATE_ASK_APOLLO_LEAD,
        fetchPolicy: 'no-cache',
        variables: {
          askApolloLeadInput: {
            patientName,
            email: emailId,
            mobileNumber: patientNumber,
          },
        },
      });
      const { message } = res?.data?.askApolloLead || {};
      postLeadSubmitEvent();
      props.navigation.goBack();
      showAphAlert?.({
        title: ' ',
        description: message || string.askApollo.submitSuccess,
      });
    } catch (error) {
      showAphAlert?.({
        title: 'Error',
        description: string.common.somethingWentWrong,
      });
      CommonBugFender('Error_GenerateAskApolloLead', error);
    } finally {
      setLoading(false);
    }
  };

  const postLeadSubmitEvent = () => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.SUBMITTED_QUICK_BOOK_LEAD] = {
      ...ctAttributes,
      'Entered Email': emailId,
      'Entered Mobile Number': patientNumber,
      'Entered Name': patientName,
    };
    postCleverTapEvent(CleverTapEventName.SUBMITTED_QUICK_BOOK_LEAD, eventAttributes);
  };

  const postCallEvent = () => {
    postCleverTapEvent(CleverTapEventName.CLICKED_ON_APOLLO_NUMBER, ctAttributes);
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <View style={styles.container}>
        {renderHeader()}
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => {
            postCallEvent();
            Linking.openURL(`tel:${AppConfig.Configuration.Ask_Apollo_Number}`);
          }}
        >
          <CallIconWhite style={styles.callLogo} />
          <Text style={styles.callText}>{string.askApollo.callToBook}</Text>
        </TouchableOpacity>
        <View style={styles.separatorView}>
          <View style={styles.separator} />
          <Text style={styles.separatorText}>or</Text>
          <View style={styles.separator} />
        </View>
        <Text style={styles.callBackText}>{string.askApollo.reqCallBack}</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputHeading}>{string.askApollo.patientName}</Text>
          <TextInput
            value={patientName}
            keyboardType={'default'}
            onChangeText={(text) => setPatientName(text)}
            style={styles.textInput}
          />
          {!!patientName && !validateName(patientName) && (
            <Text style={styles.errorText}>{string.common.nameError}</Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputHeading}>{string.askApollo.emailId}</Text>
          <TextInput
            value={emailId}
            keyboardType={'email-address'}
            onChangeText={(text) => setEmailId(text)}
            style={styles.textInput}
          />
          {!!emailId && !validateEmail(emailId) && (
            <Text style={styles.errorText}>{string.common.emailError}</Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputHeading}>{string.askApollo.mobileNumber}</Text>
          <View>
            <Text style={styles.codeText}>+91</Text>
            <TextInput
              value={patientNumber}
              keyboardType={'number-pad'}
              onChangeText={(text) => setPatientNumber(text)}
              style={{ ...styles.textInput, paddingStart: 40 }}
            />
            {!!patientNumber && !validateNumber(patientNumber) && (
              <Text style={styles.errorText}>{string.common.numberError}</Text>
            )}
          </View>
        </View>
        <Button
          title={string.submit}
          style={styles.submitBtn}
          disabled={
            !(validateEmail(emailId) && validateName(patientName) && validateNumber(patientNumber))
          }
          onPress={onRequestCallBack}
        />
      </View>
      {loading && <Spinner />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  headerContainer: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  callBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    borderRadius: 6,
    backgroundColor: theme.colors.APP_YELLOW,
    alignSelf: 'center',
    marginVertical: 44,
  },
  callLogo: {
    height: 16,
    width: 16,
    marginEnd: 12,
  },
  callText: {
    ...theme.viewStyles.text('M', 12, theme.colors.WHITE, undefined, 16),
  },
  separatorView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  separatorText: {
    ...theme.viewStyles.text('M', 15, theme.colors.CAROUSEL_INACTIVE_DOT, undefined, 20),
  },
  separator: {
    height: 1,
    flex: 0.45,
    backgroundColor: theme.colors.CAROUSEL_INACTIVE_DOT,
  },
  callBackText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, undefined, 16),
    textAlign: 'center',
  },
  inputHeading: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, undefined, 16),
  },
  inputContainer: {
    marginVertical: 16,
    marginHorizontal: 48,
  },
  textInput: {
    borderRadius: 6,
    borderColor: theme.colors.CAROUSEL_INACTIVE_DOT,
    borderWidth: 1,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  submitBtn: {
    width: 100,
    alignSelf: 'flex-end',
    marginEnd: 50,
    marginTop: 14,
    backgroundColor: theme.colors.APP_YELLOW,
  },
  errorText: {
    ...theme.viewStyles.text('M', 10, theme.colors.INPUT_FAILURE_TEXT, undefined, 13),
  },
  codeText: {
    ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, undefined, 21),
    position: 'absolute',
    top: Platform.OS == 'android' ? 15 : 10,
    start: 6,
  },
});
