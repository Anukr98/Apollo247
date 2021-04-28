import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import AsyncStorage from '@react-native-community/async-storage';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CrossPopup,
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { ConsultMode } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import moment from 'moment';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainViewStyle: {
    backgroundColor: '#f7f8f5',
    marginTop: 16,
    width: width - 40,
    height: 'auto',
    maxHeight: height - 98,
    padding: 0,
    borderRadius: 10,
    overflow: 'hidden',
  },
  inputContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    padding: 4,
    justifyContent: 'center',
  },
  headerTextStyle: {
    margin: 18,
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 20,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  popDescriptionStyle: {
    marginHorizontal: 20,
    marginTop: 8,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 1,
    marginTop: 5,
    marginBottom: -5,
  },
  ctaWhiteButtonViewStyle: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginRight: 15,
    marginVertical: 5,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaSelectButtonViewStyle: {
    padding: 2,
    borderRadius: 10,
    backgroundColor: '#02475B',
    marginRight: 15,
    marginVertical: 5,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaSelectTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24),
    marginHorizontal: 5,
  },
  ctaSelectText2Style: {
    ...theme.viewStyles.text('R', 10, '#ffffff', 1, 20),
    textAlign: 'center',
    marginHorizontal: 5,
  },
  textViewStyle: {
    marginTop: 8,
    paddingVertical: 8,
  },
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#01475B', 1, 24),
    marginHorizontal: 5,
  },
  errorSelectMessage: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 14, '#E31E24', 1, 20),
    marginBottom: 5,
    width: '100%',
  },
  ctaOrangeText2Style: {
    ...theme.viewStyles.text('R', 10, '#01475B', 1, 20),
    textAlign: 'center',
    marginHorizontal: 5,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
    width: width,
    marginVertical: 12,
    marginLeft: -21,
    marginRight: 1,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  radioButtonTitleDescContainer: {
    marginLeft: 16,
  },
  radioButtonTitle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 23,
    color: theme.colors.SHERPA_BLUE,
    marginBottom: 4,
  },
  radioButtonDesc: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    marginBottom: 7.5,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
  },
  sbcContainer: {
    paddingHorizontal: 16,
    height: 66,
    marginTop: 10,
  },
  rowEven: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, .8)',
    zIndex: 5,
  },
  overlayCrossPopup: {
    marginTop: Platform.OS === 'ios' ? 38 : 14,
    backgroundColor: 'white',
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  otherInputStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
  },
  disclaimerContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
});

export interface BookingRequestOverlayProps extends NavigationScreenProps {
  setdisplayoverlay: (arg: boolean) => void;
  onRequestComplete?: (arg: boolean) => void;
  patientId: string;
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  doctorId: string;
  FollowUp: boolean;
  appointmentType: string;
  appointmentId: string;
  consultModeSelected: ConsultMode;
  externalConnect: boolean | null;
  availableMode: string;
  consultedWithDoctorBefore: boolean;
  callSaveSearch: string;
  mainContainerStyle?: StyleProp<ViewStyle>;
  scrollToSlot?: boolean;
  isDoctorsOfTheHourStatus?: boolean;
}
export const BookingRequestOverlay: React.FC<BookingRequestOverlayProps> = (props) => {
  const tabs = [{ title: 'Request Appointment' }];

  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  const scrollViewRef = React.useRef<any>(null);
  const [disablePay, setdisablePay] = useState<boolean>(false);
  const [isSelectedOnce, setIsSelectedOnce] = useState<boolean>(false);

  const {
    currentPatient,
    allCurrentPatients,
    setCurrentPatientId,
    currentPatientId,
  } = useAllCurrentPatients();
  const [patientProfiles, setPatientProfiles] = useState<any>([]);
  const [gender, setGender] = useState<string>(currentPatient?.gender);
  const [modeSelected, setModeSelected] = useState<string>(ConsultMode.BOTH);
  const [dateRangeSelected, setDateRangeSelected] = useState<string>('option1');
  const [othersText, setOthersText] = useState<string>('');
  const { showAphAlert, setLoading } = useUIElements();

  useEffect(() => {
    setPatientProfiles(moveSelectedToTop());
  }, []);

  const scrollToPos = (top: number = 400) => {
    if (props.scrollToSlot) {
      scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: top, animated: true });
    }
  };

  const onPressCheckout = async () => {
    //setshowSpinner(true);
    console.log(
      'csk form data',
      isSelectedOnce,
      modeSelected,
      dateRangeSelected,
      othersText,
      currentPatientId,
      currentPatient
    );
  };

  const moveSelectedToTop = () => {
    if (currentPatient !== undefined) {
      const patientLinkedProfiles = [
        allCurrentPatients?.find((item: any) => item?.uhid === currentPatient.uhid),
        ...allCurrentPatients.filter((item: any) => item?.uhid !== currentPatient.uhid),
      ];
      return patientLinkedProfiles;
    }
    return [];
  };

  const renderBottomButton = () => {
    return (
      <StickyBottomComponent defaultBG style={styles.sbcContainer}>
        <Button
          title={'SUBMIT REQUEST'}
          disabled={
            isSelectedOnce &&
            (dateRangeSelected === 'option3' && othersText.length < 3 ? false : true)
              ? false
              : true
          }
          onPress={() => {
            onPressCheckout();

            // props.setdisplayoverlay && props.setdisplayoverlay(false);
            // props.onRequestComplete && props.onRequestComplete(true);
          }}
        />
      </StickyBottomComponent>
    );
  };
  const renderDisclamer = () => {
    return (
      <View style={styles.disclaimerContainer}>
        <Text
          style={[
            theme.viewStyles.text('M', 10, theme.colors.LIGHT_BLUE, 1, 16, 0),
            { textAlign: 'justify' },
          ]}
        >
          {string.common?.DisclaimerTextBookingRequest}
        </Text>
      </View>
    );
  };
  const renderPrefferedMode = () => {
    return (
      <View style={styles.inputContainer}>
        <Text style={theme.viewStyles.text('M', 12, '#02475B', 1, 16, 0)}>
          Preferred Mode of Appointment
        </Text>
        <View style={styles.rowEven}>
          {renderModeOptionInput('Any', ConsultMode.BOTH)}
          {renderModeOptionInput('In-Person Visits', ConsultMode.PHYSICAL)}
        </View>
        <View>{renderModeOptionInput('Online', ConsultMode.ONLINE)}</View>
      </View>
    );
  };

  const renderModeOptionInput = (title: string, mode: ConsultMode) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.radioButtonContainer}
        key={1}
        onPress={() => {
          setModeSelected(mode);
        }}
      >
        {modeSelected === mode ? <RadioButtonIcon /> : <RadioButtonUnselectedIcon />}
        <View style={styles.radioButtonTitleDescContainer}>
          <Text style={styles.radioButtonTitle}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateOptionInput = (title: string, option: string) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.radioButtonContainer}
        key={1}
        onPress={() => {
          setDateRangeSelected(option);
        }}
      >
        {dateRangeSelected === option ? <RadioButtonIcon /> : <RadioButtonUnselectedIcon />}
        <View style={styles.radioButtonTitleDescContainer}>
          <Text style={styles.radioButtonTitle}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateRange = () => {
    return (
      <View style={styles.inputContainer}>
        <Text style={theme.viewStyles.text('M', 12, '#02475B', 1, 16, 0)}>
          Preferred Date Range for Appointment
        </Text>
        <View style={styles.rowEven}>
          {renderDateOptionInput('15 days from Now', 'option1')}
          {renderDateOptionInput('Anytime', 'option2')}
        </View>
        <View>
          {renderDateOptionInput('Other', 'option3')}
          {dateRangeSelected === 'option3' && (
            <TextInputComponent
              value={othersText}
              onChangeText={(text) => {
                setOthersText(text);
              }}
              textInputprops={{
                maxLength: 20,
              }}
              inputStyle={[styles.otherInputStyle]}
              conatinerstyles={{ paddingBottom: 0 }}
              placeholder={'Please Specify'}
            />
          )}
        </View>
      </View>
    );
  };

  const renderProfileListView = () => {
    return (
      <View>
        <Text style={[theme.viewStyles.text('B', 13, '#0087BA', 1, 17, 0), { marginTop: -4 }]}>
          SELECT PATIENT <Text style={{ color: theme.colors.APP_RED }}>*</Text>
        </Text>
        <View style={styles.separatorStyle} />
        {renderCTAs()}
      </View>
    );
  };

  const onNewProfileAdded = (onAdd: any) => {
    setIsSelectedOnce(onAdd?.added);
    let patientData = patientProfiles;
    patientData?.unshift(onAdd?.profileData);
    setPatientProfiles(patientData);
    //setCurrentPatientId(patientData?.id);
  };

  const onSelectedProfile = (item: any) => {
    setshowSpinner(true);
    selectUser(item);
    setLoading && setLoading(false);
  };

  const selectUser = (selectedUser: any) => {
    setGender(selectedUser?.gender);
    setCurrentPatientId(selectedUser?.id);
    AsyncStorage.setItem('selectUserId', selectedUser!.id);
    AsyncStorage.setItem('selectUserUHId', selectedUser!.uhid);
    AsyncStorage.setItem('isNewProfile', 'yes');
    moveSelectedToTop();
    setshowSpinner(false);
  };

  const renderCTAs = () => (
    <View style={styles.aphAlertCtaViewStyle}>
      {patientProfiles?.map((item: any, index: any, array: any) =>
        item.firstName !== '+ADD MEMBER' ? (
          <TouchableOpacity
            onPress={() => {
              setLoading && setLoading(true);
              onSelectedProfile(item);
              setIsSelectedOnce(true);
            }}
            style={
              currentPatient?.id === item.id && isSelectedOnce
                ? styles.ctaSelectButtonViewStyle
                : styles.ctaWhiteButtonViewStyle
            }
          >
            <Text
              style={
                currentPatient?.id === item.id && isSelectedOnce
                  ? styles.ctaSelectTextStyle
                  : styles.ctaOrangeTextStyle
              }
            >
              {item.firstName}
            </Text>
            <Text
              style={
                currentPatient?.id === item.id && isSelectedOnce
                  ? styles.ctaSelectText2Style
                  : styles.ctaOrangeText2Style
              }
            >
              {Math.round(moment().diff(item.dateOfBirth || 0, 'years', true))}, {item.gender}
            </Text>
          </TouchableOpacity>
        ) : null
      )}
      <View style={[styles.textViewStyle]}>
        <Text
          onPress={() => {
            props.navigation.navigate(AppRoutes.EditProfile, {
              isEdit: false,
              isPoptype: true,
              mobileNumber: currentPatient && currentPatient!.mobileNumber,
              onNewProfileAdded: onNewProfileAdded,
            });
          }}
          style={[styles.ctaOrangeTextStyle, { color: '#fc9916' }]}
        >
          {'+ADD MEMBER'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.overlayContainer}>
      <View style={{ paddingHorizontal: showSpinner ? 0 : 20 }}>
        <View
          style={{
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              props.setdisplayoverlay(false);
            }}
            style={[
              styles.overlayCrossPopup,
              {
                marginRight: showSpinner ? 20 : 0,
              },
            ]}
          >
            <CrossPopup />
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View style={[styles.mainViewStyle, props.mainContainerStyle]}>
            <View
              style={{
                ...theme.viewStyles.cardViewStyle,
                borderRadius: 1,
                alignItems: 'center',
                justifyContent: 'center',
                shadowOffset: { width: 5, height: 20 },
              }}
            >
              <Text
                style={[styles.headerTextStyle, theme.viewStyles.text('M', 16, '#02475B', 1, 21)]}
              >
                {tabs[0].title}
              </Text>
            </View>
            <ScrollView bounces={false} ref={scrollViewRef}>
              <View
                style={{
                  ...theme.viewStyles.cardContainer,
                  padding: 20,
                  marginTop: 15,
                }}
              >
                {renderProfileListView()}
              </View>

              {renderPrefferedMode()}
              {renderDateRange()}
              {renderDisclamer()}
              <View style={{ height: 70 }} />
            </ScrollView>
            {renderBottomButton()}
          </View>
        </View>
      </View>

      {showSpinner && <Spinner />}
    </View>
  );
};

BookingRequestOverlay.defaultProps = {
  scrollToSlot: true,
};
