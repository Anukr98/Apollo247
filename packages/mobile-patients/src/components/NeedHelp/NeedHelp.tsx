import { Props as BreadcrumbProps } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { PreviousQuery } from '@aph/mobile-patients/src/components/NeedHelp';
import { Helpers, Query } from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { EditIconNewOrange } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  subViewPopup: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  categoryItemStyle: {
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
    backgroundColor: 'white',
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
    marginVertical: 10,
  },
  categoryWrapper: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  editIconNewOrange: { height: 18, width: 18, resizeMode: 'contain' },
});

export interface Props extends NavigationScreenProps {}

export const NeedHelp: React.FC<Props> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const [email, setEmail] = useState<string>(currentPatient?.emailAddress || '');
  const [isFocused, setFocused] = useState<boolean>(false);
  const [ongoingQuery, setOngoingQuery] = useState<Query>();
  const [emailValidation, setEmailValidation] = useState<boolean>(
    currentPatient?.emailAddress ? true : false
  );
  const { showAphAlert } = useUIElements();
  const NeedHelp = AppConfig.Configuration.NEED_HELP;

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
    fetchOngoingQuery();
  }, []);

  const fetchOngoingQuery = async () => {
    try {
      const { getNeedHelpQuery: getTicket } = Helpers;
      const DISPLAY_TILL_HOURS = 48;
      const ticket = await getTicket();
      if (ticket?.createdDate) {
        const toBeShown =
          moment(new Date()).diff(moment(ticket.createdDate), 'hours') <= DISPLAY_TILL_HOURS;
        toBeShown && setOngoingQuery(ticket);
      }
    } catch (error) {}
  };

  const renderCategory = (
    { category, id }: typeof NeedHelp[0],
    containerStyle?: StyleProp<ViewStyle>
  ) => {
    const onPress = () => onSubmit(category, id);
    return (
      <TouchableOpacity
        activeOpacity={1}
        key={category}
        style={[styles.categoryItemStyle, containerStyle]}
        onPress={onPress}
      >
        <Text style={[styles.categoryTextStyle]}>{category}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmailField = () => {
    return (
      <View>
        <Text style={styles.fieldLabel}>Please enter your email address</Text>
        <TextInputComponent
          placeholder={'Enter email address'}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(text: string) => _setEmail(text)}
          icon={!isFocused && <EditIconNewOrange style={styles.editIconNewOrange} />}
          inputStyle={{ paddingBottom: 5 }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    );
  };

  const renderContent = () => {
    return (
      <View style={styles.contentContainer}>
        {renderEmailField()}
        <Text style={[styles.fieldLabel]}>{needHelpForQuery}</Text>
        <View style={styles.categoryWrapper}>{NeedHelp.map((item) => renderCategory(item))}</View>
      </View>
    );
  };

  const showAlert = () => {
    showAphAlert!({
      title: `Hi,`,
      description: `Please enter your valid email address`,
    });
  };

  const onSubmit = (helpCategory: string, helpCategoryId: string) => {
    if (!emailValidation) {
      showAlert();
      return;
    }
    const route =
      helpCategoryId === 'pharmacy'
        ? AppRoutes.NeedHelpPharmacyOrder
        : helpCategoryId === 'virtualOnlineConsult'
        ? AppRoutes.NeedHelpConsultOrder
        : AppRoutes.NeedHelpQueryDetails;
    props.navigation.navigate(route, {
      queryCategory: helpCategory,
      breadCrumb: [{ title: string.needHelp }, { title: helpCategory }] as BreadcrumbProps['links'],
      pageTitle: helpCategory.toUpperCase(),
      email: email,
    });
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{ borderBottomWidth: 0 }}
          title={'NEED HELP'}
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
      </View>
    );
  };

  const renderPreviousTicketView = () => {
    return !!ongoingQuery && <PreviousQuery query={ongoingQuery} />;
  };

  const needHelpForQuery = !!ongoingQuery
    ? 'New issue? Tell us what you need help with?'
    : 'What do you need help with?';

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <View style={{ flex: 1 }}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <KeyboardAwareScrollView style={styles.subViewPopup} bounces={false}>
              <Text style={styles.hiTextStyle}>{'Hi! :)'}</Text>
              {renderPreviousTicketView()}
              {renderContent()}
            </KeyboardAwareScrollView>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};
