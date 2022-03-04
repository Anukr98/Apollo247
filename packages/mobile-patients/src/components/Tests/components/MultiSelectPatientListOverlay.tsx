import {
  checkPatientAge,
  extractPatientDetails,
  nameFormater,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import {
  AddPatientCircleIcon,
  CrossPopup,
  InfoIconRed,
  MinusPatientCircleIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { GENDER } from '@aph/mobile-patients/src/graphql/types/globalTypes';

const {
  SHERPA_BLUE,
  CARD_BG,
  WHITE,
  APP_GREEN,
  CLEAR,
  TEST_CARD_BUTTOM_BG,
  LIGHT_GRAY_3,
  BGK_GRAY,
} = theme.colors;

interface MultiSelectPatientListOverlayProps {
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
  listToShow?: any;
  source?: string;
  rightTitle?: string | number;
  gender: GENDER;
}

export const MultiSelectPatientListOverlay: React.FC<MultiSelectPatientListOverlayProps> = (
  props
) => {
  const {
    onPressDone,
    onPressAddNewProfile,
    onPressClose,
    onPressAndroidBack,
    patientSelected,
    listToShow,
    source,
    gender,
  } = props;
  const { allCurrentPatients } = useAllCurrentPatients();
  const [selectedPatientArray, setSelectedPatientArray] = useState([] as any);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const patientList = !!listToShow ? listToShow : allCurrentPatients;
  const ignoredGenders = [GENDER.ALL, GENDER.OTHER];

  const getPatientSkuGenderMismatch = ignoredGenders?.includes(gender)
    ? []
    : !!gender
    ? patientList?.filter((patient: any) => patient?.gender != gender)
    : [];

  function _onPressPatient(selectedPatient: any) {
    if (!checkPatientAge(selectedPatient)) {
      const isPresent = selectedPatientArray?.find(
        (items: any) => items?.id === selectedPatient?.id
      );
      if (!!isPresent) {
        _onPressUnselectPatient(selectedPatient);
      } else {
        const array = [...selectedPatientArray, selectedPatient];
        setSelectedPatientArray(array);
      }
    } else {
      renderBelowAgePopUp(true);
    }
  }

  const renderBelowAgePopUp = (fromPopUp: boolean) => {
    if (fromPopUp) {
      Alert.alert(string.common.uhOh, string.diagnostics.minorAgeText, [
        {
          text: 'OK',
          onPress: () => {},
        },
      ]);
    } else {
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.diagnostics.minorAgeText,
        onPressOk: () => {
          hideAphAlert?.();
        },
      });
    }
  };

  function _onPressUnselectPatient(selectedPatient: any) {
    const removeItem = selectedPatientArray?.filter(
      (item: any) => item?.id !== selectedPatient?.id
    );
    setSelectedPatientArray(removeItem);
  }

  const renderPatientListItem = ({ index, item }: { index: number; item: any }) => {
    if (props.excludeProfileListIds?.includes(item?.uhid)) {
      return null;
    }
    const { patientName, genderAgeText, patientSalutation } = extractPatientDetails(item);
    const isPatientDisabled = !!gender
      ? gender == GENDER.ALL || gender == GENDER.OTHER
        ? false
        : gender != item?.gender
      : false;
    const showGreenBg = selectedPatientArray?.find((items: any) => items?.id === item?.id);
    const isMinorAge = checkPatientAge(item);
    const minorAgeTextStyle = isMinorAge && { opacity: 0.6 };
    const disabledPatientTextStyle = isPatientDisabled && { opacity: 0.4 };
    const itemViewStyle = [
      styles.patientItemViewStyle,
      index === 0 && { marginTop: 12 },
      isMinorAge && { backgroundColor: BGK_GRAY },
      isPatientDisabled && { backgroundColor: LIGHT_GRAY_3 },
      showGreenBg && { backgroundColor: APP_GREEN },
    ];
    return item?.id === '+ADD MEMBER' ? null : (
      <TouchableOpacity
        activeOpacity={1}
        style={itemViewStyle}
        onPress={() => (disabledPatientTextStyle || isMinorAge ? null : _onPressPatient(item))}
      >
        <Text
          style={[
            styles.patientNameTextStyle,
            minorAgeTextStyle,
            disabledPatientTextStyle,
            showGreenBg && { color: WHITE },
          ]}
        >
          {patientSalutation} {patientName}
        </Text>
        <Text
          style={[
            styles.genderAgeTextStyle,
            minorAgeTextStyle,
            disabledPatientTextStyle,
            showGreenBg && { color: WHITE },
          ]}
        >
          {genderAgeText}
        </Text>
        {!showGreenBg ? (
          <MinusPatientCircleIcon style={[styles.arrowStyle]} />
        ) : (
          <AddPatientCircleIcon style={[styles.arrowStyle]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderCrossIcon = () => {
    return (
      props.showCloseIcon && (
        <View style={{ alignSelf: 'flex-end' }}>
          <TouchableOpacity style={styles.crossIconTouch} onPress={props.onCloseIconPress}>
            <CrossPopup style={styles.crossIconStyle} />
          </TouchableOpacity>
        </View>
      )
    );
  };

  const renderTopTitleView = () => {
    return (
      <View style={styles.selectPatientNameViewStyle}>
        {!!props.title && <Text style={styles.selectPatientNameTextStyle}>{props.title}</Text>}
        {!!props.rightTitle && (
          <Text style={styles.addMemberText}>
            {string.common.Rs} {props.rightTitle}
          </Text>
        )}
      </View>
    );
  };

  const renderTopViewWithAddMember = () => {
    return (
      <View style={styles.selectPatientNameViewStyle}>
        <Text style={styles.selectPatientNameTextStyle}>
          {props.title || string.diagnostics.selectPatientNameText}
        </Text>
        <Text style={styles.addMemberText} onPress={onPressAddNewProfile}>
          {string.diagnostics.addMemberText}
        </Text>
      </View>
    );
  };

  const renderGenderSkuMsg = () => {
    return (
      <View style={styles.genderSkuMsgView}>
        <InfoIconRed style={styles.infoIconStyle} />
        <Text style={styles.patientOrderTestMsgTextStyle}>
          {string.diagnostics.skuGenderMessage?.replace('{{gender}}', gender?.toLowerCase())}
        </Text>
      </View>
    );
  };

  const renderPatientSelectionTitle = () => {
    return (
      <Text style={[styles.selectPatientHeading, { marginTop: 24, marginLeft: 16 }]}>
        {nameFormater(`${string.diagnostics.selectPatientNameText}s`, 'title')}
      </Text>
    );
  };

  const renderPatientList = () => {
    return (
      <View style={styles.patientListCardStyle}>
        <FlatList
          bounces={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyExtractor={(_, index) => index.toString()}
          data={patientList || []}
          renderItem={renderPatientListItem}
        />
      </View>
    );
  };

  const renderDoneCTA = () => {
    return (
      <Button
        title={'DONE'}
        disabled={selectedPatientArray?.length == 0}
        onPress={() => onPressDone(selectedPatientArray)}
        style={styles.doneButtonViewStyle}
      />
    );
  };

  const renderBottomSection = () => {
    return (
      <View style={styles.topViewContainer}>
        {renderPatientSelectionTitle()}
        {renderPatientList()}
        {renderDoneCTA()}
      </View>
    );
  };

  return (
    <Overlay
      isVisible
      onRequestClose={() => (patientSelected?.id ? onPressClose() : onPressAndroidBack())}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => (patientSelected?.id ? onPressClose() : {})}
        />
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            {renderCrossIcon()}

            <View style={styles.mainViewStyle}>
              {!!source && source == AppRoutes.CartPage
                ? renderTopTitleView()
                : renderTopViewWithAddMember()}
              {!!source && source == AppRoutes.CartPage ? (
                <Text style={styles.patientOrderTestMsgTextStyle}>{props.subTitle}</Text>
              ) : (
                <Text style={styles.patientOrderTestMsgTextStyle}>
                  {props.subTitle || string.diagnostics.patientTestOrderMsg}
                </Text>
              )}
              {!!source && source == AppRoutes.CartPage && getPatientSkuGenderMismatch?.length > 0
                ? renderGenderSkuMsg()
                : null}
              {renderBottomSection()}
            </View>
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
    backgroundColor: TEST_CARD_BUTTOM_BG,
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
    ...text('SB', 16, SHERPA_BLUE, 1, 20),
    width: '82%',
  },
  addMemberText: {
    marginLeft: 20,
    ...text('B', 16, SHERPA_BLUE, 1, 20.8),
  },
  patientOrderTestMsgTextStyle: {
    ...text('R', 12, SHERPA_BLUE, 1, 18),
  },
  selectPatientHeading: {
    ...text('B', 16, SHERPA_BLUE, 1, 24),
  },
  patientListCardStyle: {
    height: 180,
    backgroundColor: CARD_BG,
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
    marginTop: 16,
    minHeight: 45,
  },
  patientNameTextStyle: {
    ...text('SB', 14, SHERPA_BLUE, 1, 18.2, -0.36),
    width: '72%',
  },
  genderAgeTextStyle: {
    ...text('M', 12, SHERPA_BLUE, 1, 15.6, -0.36),
  },
  arrowStyle: {
    height: 18,
    width: 20,
    resizeMode: 'contain',
  },
  topViewContainer: {
    backgroundColor: CARD_BG,
    marginTop: 16,
    marginLeft: -16,
    marginRight: -16,
  },
  crossIconTouch: { width: 40, height: 40 },
  crossIconStyle: { width: 28, height: 28 },
  genderSkuMsgView: {
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconStyle: { height: 18, width: 18, resizeMode: 'contain', marginRight: 5 },
});
