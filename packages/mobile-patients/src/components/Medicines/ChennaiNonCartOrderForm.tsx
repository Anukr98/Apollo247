import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CheckedIcon, CheckUnselectedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  textStyle1: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    textAlign: 'justify',
    paddingTop: 27,
  },
  textStyle2: {
    ...theme.viewStyles.text('M', 13, '#02475b'),
    textAlign: 'justify',
  },
  textStyle3: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    marginBottom: 5,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  checkboxViewStyle: {
    flexDirection: 'row',
    marginTop: 10,
  },
  checkboxTextStyle: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    flex: 1,
    marginLeft: 6,
    marginRight: 16,
  },
  separatorStyle: {
    marginTop: 19,
    marginBottom: 20,
    backgroundColor: '#02475b',
    opacity: 0.1,
  },
});

export interface ChennaiNonCartOrderFormProps
  extends NavigationScreenProps<{
    onSubmitOrder: (isChennaiOrder: boolean, email?: string) => Promise<void>;
  }> {}

export const ChennaiNonCartOrderForm: React.FC<ChennaiNonCartOrderFormProps> = (props) => {
  const onSubmitOrder = props.navigation.getParam('onSubmitOrder');
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert } = useUIElements();

  const [email, setEmail] = useState<string>(g(currentPatient, 'emailAddress') || '');
  const [emailIdCheckbox, setEmailIdCheckbox] = useState<boolean>(
    !g(currentPatient, 'emailAddress')
  );
  const [agreementCheckbox, setAgreementCheckbox] = useState<boolean>(false);

  useEffect(() => {
    if (email) {
      setEmailIdCheckbox(false);
    } else {
      setEmailIdCheckbox(true);
    }
  }, [emailIdCheckbox, email]);

  const renderChennaiOrderForm = () => {
    return (
      <>
        <Text style={styles.textStyle1}>
          {`Dear ${g(currentPatient, 'firstName') ||
            ''},\n\nSUPERB!\n\nYour order request is in process\n`}
        </Text>
        <Text style={styles.textStyle2}>
          {'Just one more step. New Regulation in your region requires your email id.\n'}
        </Text>
        <Text style={styles.textStyle3}>{'Your email id please'}</Text>
        <TextInputComponent
          value={`${email}`}
          onChangeText={(email) => setEmail(email)}
          placeholder={'name@email.com'}
          inputStyle={styles.inputStyle}
        />
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => setEmailIdCheckbox(!emailIdCheckbox)}
          style={styles.checkboxViewStyle}
        >
          {emailIdCheckbox ? <CheckedIcon /> : <CheckUnselectedIcon />}
          <Text style={styles.checkboxTextStyle}>
            {
              'Check this box if you don’t have an Email Id & want us to share your order details over SMS.'
            }
          </Text>
        </TouchableOpacity>
        <Spearator style={styles.separatorStyle} />
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => setAgreementCheckbox(!agreementCheckbox)}
          style={[styles.checkboxViewStyle, { marginTop: 0 }]}
        >
          {agreementCheckbox ? <CheckedIcon /> : <CheckUnselectedIcon />}
          <Text style={styles.checkboxTextStyle}>
            {'I agree to share my medicine requirements with Apollo Pharmacy for home delivery.'}
          </Text>
        </TouchableOpacity>
        <Spearator style={styles.separatorStyle} />
        <Text style={styles.checkboxTextStyle}>{'Payment Mode: Cash on Delivery'}</Text>
      </>
    );
  };

  const renderChennaiOrderPayButton = () => {
    const isPayDisabled = !agreementCheckbox;
    return (
      <StickyBottomComponent
        style={[styles.stickyBottomComponentStyle, { paddingHorizontal: 40, paddingTop: 25 }]}
      >
        <Button
          style={{ width: '100%' }}
          title={`SUBMIT TO CONFIRM ORDER`}
          onPress={onPressChennaiOrderPayButton}
          disabled={isPayDisabled}
        />
      </StickyBottomComponent>
    );
  };

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const onPressChennaiOrderPayButton = () => {
    if (!(email === '' || (email && isSatisfyingEmailRegex(email.trim())))) {
      showAphAlert!({ title: 'Uh oh.. :(', description: 'Enter valid email' });
    } else {
      CommonLogEvent(AppRoutes.ChennaiNonCartOrderForm, `SUBMIT TO CONFIRM ORDER`);
      onSubmitOrder(true, email);
    }
  };

  const renderChennaiOrderFormAndPayButton = () => {
    return (
      <View style={{ ...theme.viewStyles.card(16, 20, 10, '#fff'), flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }} bounces={false}>
          {renderChennaiOrderForm()}
        </ScrollView>
        {renderChennaiOrderPayButton()}
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          title={'CHECKOUT'}
          leftIcon="backArrow"
          container={{ ...theme.viewStyles.shadowStyle, zIndex: 1 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        {renderChennaiOrderFormAndPayButton()}
      </SafeAreaView>
    </View>
  );
};
