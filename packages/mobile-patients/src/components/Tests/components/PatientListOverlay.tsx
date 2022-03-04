import { getAge } from '@aph/mobile-patients/src//helpers/helperFunctions';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import {
  AddPatientCircleIcon,
  CrossPopup,
  MinusPatientCircleIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import LottieView from 'lottie-react-native';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { checkPatientWithSkuGender } from '@aph/mobile-patients/src/components/Tests/utils/helpers';
import { InfoMessage } from '@aph/mobile-patients/src/components/Tests/components/InfoMessage';
import { BOTH_GENDER_ARRAY } from '@aph/mobile-patients/src/strings/AppConfig';
const screenHeight = Dimensions.get('window').height;

const { SHERPA_BLUE, APP_YELLOW, CARD_BG, WHITE, APP_GREEN, CLEAR } = theme.colors;
type DiagnosticOrderLineItems = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems;
interface PatientListOverlayProps {
  onPressAddNewProfile: () => void;
  onPressDone: (selectedPatient: any) => void;
  onPressClose: () => void;
  onPressAndroidBack: () => void;
  patientSelected?: any;
  title?: string;
  subTitle?: string;
  excludeProfileListIds?: string[];
  showCloseIcon: boolean;
  onCloseIconPress: () => void;
  disabledPatientId?: string;
  titleStyle?: StyleProp<TextStyle>;
  source?: string;
  responseMessage?: string | boolean;
  onCloseError?: () => void;
  refetchResult?: () => void;
  removeAllSwitchRestrictions?: boolean;
  skuItem?: DiagnosticOrderLineItems[] | any;
  showGenderSkuMsg?: boolean;
  skuGender?: string;
}

export const PatientListOverlay: React.FC<PatientListOverlayProps> = (props) => {
  const {
    onPressDone,
    onPressAddNewProfile,
    onPressClose,
    onPressAndroidBack,
    patientSelected,
    source,
    titleStyle,
    responseMessage,
    refetchResult,
    removeAllSwitchRestrictions,
    skuItem,
    showGenderSkuMsg,
    skuGender,
  } = props;
  const { allCurrentPatients } = useAllCurrentPatients();
  const [selectedPatient, setSelectedPatient] = useState<any>(patientSelected);

  const customStyle = !!source ? source === AppRoutes.YourOrdersTest : false;

  const renderPatientListItem = ({ index, item }: { index: number; item: any }) => {
    const age = getAge(item?.dateOfBirth);
    const isMinorAge = customStyle && age != null && age != undefined && age <= 10;
    const checkPatientSkuDisability =
      customStyle && !!skuItem && checkPatientWithSkuGender(skuItem, item)?.nonValidPatient;
    //if patient list has other, then it would always be eligible for switch except minor
    const isPatientGenderDisabled = checkPatientSkuDisability
      ? !BOTH_GENDER_ARRAY.includes(item?.gender?.toLowerCase()) && !isMinorAge
      : checkPatientSkuDisability;

    const patientSalutation = !!item?.gender
      ? item?.gender === Gender.FEMALE
        ? 'Ms.'
        : item?.gender === Gender.MALE
        ? 'Mr.'
        : ''
      : '';

    if (props.excludeProfileListIds?.includes(item?.uhid)) {
      return null;
    }

    const patientName = `${customStyle ? patientSalutation || '' : ''} ${item?.firstName ||
      ''} ${item?.lastName || ''}`;
    const genderAgeText = `${item?.gender || ''}, ${
      item?.dateOfBirth ? getAge(item?.dateOfBirth) : ''
    }`;

    const showGreenBg = selectedPatient?.id === item?.id;

    const itemViewStyle = [
      customStyle ? styles.patientItemViewCustomStyle : styles.patientItemViewStyle,
      (index === 0 || customStyle) && { marginTop: 12 },

      removeAllSwitchRestrictions
        ? showGreenBg && { backgroundColor: APP_GREEN, borderColor: 'transparent' }
        : isMinorAge || isPatientGenderDisabled
        ? styles.disabledStyle
        : showGreenBg && { backgroundColor: APP_GREEN, borderColor: 'transparent' },
    ];
    return item?.id === '+ADD MEMBER' ? null : (
      <TouchableOpacity
        activeOpacity={0.5}
        style={itemViewStyle}
        onPress={() => {
          removeAllSwitchRestrictions
            ? setSelectedPatient(item)
            : isMinorAge || isPatientGenderDisabled
            ? {}
            : setSelectedPatient(item);
        }}
      >
        <Text
          style={[
            styles.patientNameTextStyle,
            customStyle && { width: '69%', color: SHERPA_BLUE },
            removeAllSwitchRestrictions
              ? showGreenBg && { color: WHITE }
              : isMinorAge || isPatientGenderDisabled
              ? styles.disabledText
              : showGreenBg && { color: WHITE },
          ]}
        >
          {patientName}
        </Text>
        {customStyle ? (
          <View style={styles.rowStyle}>
            {renderGenderAge(
              isMinorAge,
              showGreenBg,
              genderAgeText,
              removeAllSwitchRestrictions!,
              isPatientGenderDisabled
            )}
            {showGreenBg ? (
              <AddPatientCircleIcon style={styles.checkedIconStyle} />
            ) : (
              <MinusPatientCircleIcon style={styles.checkedIconStyle} />
            )}
          </View>
        ) : (
          renderGenderAge(
            isMinorAge,
            showGreenBg,
            genderAgeText,
            removeAllSwitchRestrictions!,
            isPatientGenderDisabled
          )
        )}
      </TouchableOpacity>
    );
  };

  const renderGenderAge = (
    isPatientDisabled: boolean,
    showGreenBg: boolean,
    genderAgeText: string,
    revertDisabled: boolean,
    isGenderDisabled: boolean
  ) => {
    return (
      <Text
        style={[
          styles.genderAgeTextStyle,
          customStyle && { color: SHERPA_BLUE },
          revertDisabled
            ? showGreenBg && { color: WHITE }
            : isPatientDisabled || isGenderDisabled
            ? styles.disabledText
            : showGreenBg && { color: WHITE },
        ]}
      >
        {genderAgeText}
      </Text>
    );
  };

  const renderSuccessView = () => {
    return (
      <>
        <LottieView
          source={require('@aph/mobile-patients/src/components/Tests/greenTickAnimation.json')}
          autoPlay
          cacheStrategy={'strong'}
          resizeMode={'cover'}
          loop={false}
          onAnimationFinish={() => refetchResult?.()}
          style={styles.lottieAnimationStyle}
        />
        <Text style={styles.successText}>{string.diagnostics.successfulUpdatePatientDetails}</Text>
      </>
    );
  };

  const renderErrorView = () => {
    return (
      <View style={styles.errorMsgView}>
        <Text style={[styles.errorMsgTxt, { width: '92%' }]}>
          {string.diagnostics.patientSwitchError}
        </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={props.onCloseError}
          style={styles.closeIconTouch}
        >
          <Text style={styles.errorMsgCross}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPatientMsg = () => {
    const msg = string.diagnostics.switchUhidMsg?.replace(
      '{{gender}}',
      skuGender! || patientSelected?.gender?.toLowerCase()
    );
    return (
      <InfoMessage
        content={msg}
        textStyle={styles.subHeadingText}
        iconStyle={styles.infoIconStyle}
        containerStyle={styles.genderSkuMsgView}
        isCard={false}
      />
    );
  };

  return (
    <Overlay
      isVisible
      onRequestClose={() => (patientSelected?.id ? onPressClose() : onPressAndroidBack())}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={{ flex: 1 }}
          onPress={() => (patientSelected?.id ? onPressClose() : {})}
        />
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            {responseMessage == 'success'
              ? null
              : props.showCloseIcon && (
                  <View style={{ alignSelf: 'flex-end' }}>
                    <TouchableOpacity
                      activeOpacity={0.5}
                      style={{ width: 40, height: 40 }}
                      onPress={props.onCloseIconPress}
                    >
                      <CrossPopup style={{ width: 28, height: 28 }} />
                    </TouchableOpacity>
                  </View>
                )}

            <>
              {customStyle && responseMessage == 'success' ? (
                <View
                  style={[
                    styles.mainViewStyle,
                    {
                      height: screenHeight / (screenHeight < 610 ? 2.1 : 2.7),
                    },
                  ]}
                >
                  {renderSuccessView()}
                </View>
              ) : (
                <View style={styles.mainViewStyle}>
                  {customStyle && responseMessage == 'fail' && renderErrorView()}
                  <View style={styles.selectPatientNameViewStyle}>
                    <Text style={titleStyle}>
                      {props.title || string.diagnostics.selectPatientNameText}
                    </Text>
                    <Text style={styles.addMemberText} onPress={onPressAddNewProfile}>
                      {string.diagnostics.addMemberText}
                    </Text>
                  </View>
                  {props.subTitle != '' ? (
                    <Text style={styles.patientOrderTestMsgTextStyle}>
                      {props.subTitle || string.diagnostics.patientTestOrderMsg}
                    </Text>
                  ) : null}
                  {customStyle && !!showGenderSkuMsg && renderPatientMsg()}
                  <View
                    style={
                      customStyle ? styles.patientListCardCustomStyle : styles.patientListCardStyle
                    }
                  >
                    <FlatList
                      bounces={false}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      keyExtractor={(_, index) => index.toString()}
                      data={allCurrentPatients || []}
                      renderItem={renderPatientListItem}
                    />
                  </View>
                  <Button
                    title={'DONE'}
                    disabled={!selectedPatient?.id}
                    onPress={() => onPressDone(selectedPatient)}
                    style={styles.doneButtonViewStyle}
                  />
                </View>
              )}
            </>
          </SafeAreaView>
        </View>
      </View>
    </Overlay>
  );
};

const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: CLEAR,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: CLEAR,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: CLEAR,
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: CLEAR,
  },
  mainViewStyle: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  selectPatientNameViewStyle: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectPatientNameTextStyle: {
    ...text('M', 17, SHERPA_BLUE, 1, 24),
  },
  addMemberText: {
    ...text('B', 13, APP_YELLOW, 1, 24),
  },
  patientOrderTestMsgTextStyle: {
    ...text('R', 12, SHERPA_BLUE, 1, 18),
  },
  patientListCardStyle: {
    ...cardViewStyle,
    height: 180,
    backgroundColor: CARD_BG,
    marginTop: 12,
    marginBottom: 35,
  },
  patientListCardCustomStyle: {
    minHeight: 180,
    maxHeight: screenHeight / 2.3,
    marginTop: 12,
    marginBottom: 20,
  },
  doneButtonViewStyle: { width: '90%', alignSelf: 'center', marginBottom: 16 },
  patientItemViewStyle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...cardViewStyle,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    minHeight: 45,
  },
  patientItemViewCustomStyle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
    minHeight: 45,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    borderColor: '#CECECE',
    borderWidth: 1,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  patientNameTextStyle: {
    ...text('M', 16, APP_GREEN, 1, 20.8, -0.36),
    width: '75%',
  },
  genderAgeTextStyle: {
    ...text('M', 12, APP_GREEN, 1, 15.6, -0.36),
  },
  checkedIconStyle: { height: 18, width: 18, resizeMode: 'contain', marginLeft: 8 },
  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disabledStyle: {
    backgroundColor: theme.colors.LIGHT_GRAY_3,
    borderColor: '#CECECE',
    borderWidth: 1,
  },
  disabledText: { color: SHERPA_BLUE, opacity: 0.4 },
  successText: {
    ...theme.viewStyles.text('B', 16, '#1084A9', 1),
    marginTop: -30,
    marginBottom: 30,
    textAlign: 'center',
  },
  successView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
  },
  errorMsgTxt: { ...text('M', 12, WHITE, 1, 20) },
  closeIconTouch: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMsgCross: { ...text('M', 16, WHITE, 1, 20) },
  errorMsgView: {
    backgroundColor: '#D23D3D',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lottieAnimationStyle: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  subHeadingText: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 18),
  },
  infoIconStyle: { height: 18, width: 18, resizeMode: 'contain', marginRight: 5 },
  genderSkuMsgView: {
    marginVertical: 6,
    flexDirection: 'row',
    marginHorizontal: -10,
    backgroundColor: 'transparent',
    marginBottom: -16,
  },
});

PatientListOverlay.defaultProps = {
  titleStyle: styles.selectPatientNameTextStyle,
};
