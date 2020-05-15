import { PreviewPrescriptionStyles } from '@aph/mobile-doctors/src/components/ConsultRoom/PreviewPrescription.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  AdviceIcon,
  ApploLogo2,
  MedicineIcon,
  TestsIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-doctors/src/components/ui/StickyBottomComponent';
import {
  GetCaseSheet_getCaseSheet,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { APPOINTMENT_TYPE } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { g, medicineDescription } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { Image, SafeAreaView, Text, TextStyle, View, ViewStyle } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = PreviewPrescriptionStyles;

export interface PreviewPrescriptionProps
  extends NavigationScreenProps<{
    caseSheet: GetCaseSheet_getCaseSheet | null | undefined;
    complaints: (GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null;
    diagnosis: (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null;
    medicine:
      | (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[]
      | null
      | undefined;
    tests:
      | (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosticPrescription | null)[]
      | null
      | undefined;
    advice:
      | (GetCaseSheet_getCaseSheet_caseSheetDetails_otherInstructions | null)[]
      | null
      | undefined;
    followUp?: {
      doFollowUp: boolean | null;
      followUpType: APPOINTMENT_TYPE | undefined;
      followUpDays: string | number | undefined;
    };
    referralData?: {
      referTo: string | null;
      referReason: string | null;
    };
    onEditPress?: () => void;
    onSendPress?: () => void;
    onback?: () => void;
    customButtons?: {
      onPress: () => void;
      title: string;
      titleTextStyle?: TextStyle;
      variant?: 'white' | 'orange' | 'green' | undefined;
      style?: ViewStyle;
    }[];
  }> {}

export const PreviewPrescription: React.FC<PreviewPrescriptionProps> = (props) => {
  const { doctorDetails } = useAuth();
  const caseSheet = props.navigation.getParam('caseSheet');

  const patientDetails = g(caseSheet, 'caseSheetDetails', 'patientDetails');
  const age = moment().diff(patientDetails && patientDetails.dateOfBirth, 'years', true) || -1;
  const medicalHistory = g(patientDetails, 'patientMedicalHistory');

  const complaints =
    props.navigation.getParam('complaints') || g(caseSheet, 'caseSheetDetails', 'symptoms');
  const diagnosis =
    props.navigation.getParam('diagnosis') || g(caseSheet, 'caseSheetDetails', 'diagnosis');
  const medicine =
    props.navigation.getParam('medicine') ||
    g(caseSheet, 'caseSheetDetails', 'medicinePrescription');
  const tests =
    props.navigation.getParam('tests') ||
    g(caseSheet, 'caseSheetDetails', 'diagnosticPrescription');
  const advice =
    props.navigation.getParam('advice') || g(caseSheet, 'caseSheetDetails', 'otherInstructions');
  const followUp = props.navigation.getParam('followUp') || {
    doFollowUp: g(caseSheet, 'caseSheetDetails', 'followUp'),
    followUpType: g(caseSheet, 'caseSheetDetails', 'followUpConsultType'),
    followUpDays: g(caseSheet, 'caseSheetDetails', 'followUpAfterInDays'),
  };

  const referralData = props.navigation.getParam('referralData') || {
    referTo: g(caseSheet, 'caseSheetDetails', 'referralSpecialtyName'),
    referReason: g(caseSheet, 'caseSheetDetails', 'referralDescription'),
  };
  const appointmentDetails = {
    patient: patientDetails
      ? `${(patientDetails.firstName || '').trim()} ${(
          patientDetails.lastName || ''
        ).trim()} | ${patientDetails.gender || '-'} | ${
          age > -1 ? Math.round(age).toString() : '-'
        }`
      : '',
    contact: patientDetails
      ? `${patientDetails.emailAddress ? patientDetails.emailAddress + ' | ' : ''}${
          patientDetails.mobileNumber
        }`
      : '',
    vitals: medicalHistory
      ? `Weight: ${medicalHistory.weight + ' kgs' || '-'} | Height: ${medicalHistory.height ||
          '-'} | BP: ${medicalHistory.bp + ' mm Hg' ||
          '-'} | Temperature: ${medicalHistory.temperature + '°F' || '-'} `
      : '',
    uhid: (patientDetails && patientDetails.uhid) || '',
    appId: g(caseSheet, 'caseSheetDetails', 'appointment', 'displayId') || '',
    date: moment(g(caseSheet, 'caseSheetDetails', 'appointment', 'sdConsultationDate')).format(
      'DD/MM/YYYY [at] hh:mm A'
    ),
    type: `${
      (g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentType') ||
        APPOINTMENT_TYPE.ONLINE) === APPOINTMENT_TYPE.PHYSICAL
        ? 'In person'
        : 'Online'
    }${g(caseSheet, 'caseSheetDetails', 'appointment', 'isFollowUp') ? ' | Followup' : ''}`,
    count: g(caseSheet, 'caseSheetDetails', 'appointment', 'isFollowUp'),
  };

  const onEditPress = props.navigation.getParam('onEditPress');
  const onSendPress = props.navigation.getParam('onSendPress');
  const onback = props.navigation.getParam('onback');
  const customButtons = props.navigation.getParam('customButtons');
  const renderHeader = () => {
    return (
      <Header
        containerStyle={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        headerText={'Prescription'}
        onPressLeftIcon={() => (onback ? onback() : props.navigation.goBack())}
      />
    );
  };
  const renderHeading = (heading: string, icon?: JSX.Element) => {
    return (
      <View style={styles.headingContainer}>
        {icon ? <View style={styles.headingIconContainer}>{icon}</View> : null}
        <Text style={styles.headingText}>{heading}</Text>
      </View>
    );
  };
  const renderSubHeading = (subHeading: string, custStyle?: TextStyle) => {
    return <Text style={[styles.subHeadingText, custStyle]}>{subHeading}</Text>;
  };

  const renderDescription = (description: string | Element, custStyle?: TextStyle) => {
    return <Text style={[styles.descriptionText, custStyle]}>{description}</Text>;
  };

  const renderSubItems = (subHeading: string, description: string | Element) => {
    return (
      <View style={styles.subItemsContainer}>
        <View style={styles.appoitmentMainFlex}>
          {renderSubHeading(subHeading, styles.subHeading2Text)}
        </View>
        <View style={styles.appointmentColonFlex}>
          {/* <Text style={styles.seperatorText}>:</Text> */}
        </View>
        <View style={styles.appointmentTextFlex}>
          {renderDescription(description, styles.description2Text)}
        </View>
      </View>
    );
  };

  const renderAppointmentData = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading('Appointment Details')}
        <View style={styles.subContainer}>
          {appointmentDetails.patient
            ? renderSubItems('Patient', appointmentDetails.patient)
            : null}
          {appointmentDetails.contact
            ? renderSubItems('Contact', appointmentDetails.contact)
            : null}
          {appointmentDetails.uhid ? renderSubItems('UHID', appointmentDetails.uhid) : null}
          {appointmentDetails.appId ? renderSubItems('Appt Id', appointmentDetails.appId) : null}
          {appointmentDetails.date ? renderSubItems('Consult Date', appointmentDetails.date) : null}
          {appointmentDetails.type ? renderSubItems('Consult Type', appointmentDetails.type) : null}
          {appointmentDetails.count
            ? renderSubItems('Consult Count', appointmentDetails.count.toString())
            : null}
        </View>
      </View>
    );
  };

  const renderComplaints = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading(string.case_sheet.chief_complaints)}
        <View style={styles.subContainer}>
          {complaints &&
            complaints.map((i) => {
              if (i) {
                const description = [
                  i.since ? `Since: ${i.since}` : '',
                  i.howOften ? `How often: ${i.howOften}` : '',
                  i.severity ? `Severity: ${i.severity}` : '',
                  i.details ? `Details: ${i.details}` : '',
                ]
                  .filter((d) => d !== '')
                  .join(' | ');
                return (
                  <View style={styles.itemContainer}>
                    {renderSubHeading(i.symptom || '')}
                    {renderDescription(description)}
                  </View>
                );
              }
            })}
          <View style={styles.rowFlex}>
            {renderSubHeading('Vitals ', styles.vitalsTitle)}
            {renderDescription(' (as declared by patient)', styles.addressText)}
          </View>
          {renderDescription(appointmentDetails.vitals, styles.vitalsDescription)}
        </View>
      </View>
    );
  };

  const renderDiagnosis = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading(string.case_sheet.diagnosis)}
        <View style={styles.subContainer}>
          {diagnosis &&
            diagnosis.map(
              (i) =>
                i && (
                  <View style={styles.singleItemContainer}>{renderSubHeading(i.name || '')}</View>
                )
            )}
        </View>
      </View>
    );
  };

  const renderMedicine = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading('Medication Prescribed', <MedicineIcon />)}
        <View style={styles.subContainer}>
          {medicine &&
            medicine.map((item, index) => {
              if (item) {
                return (
                  <View
                    style={
                      index !== medicine.length - 1
                        ? styles.itemContainer
                        : styles.lastItemContainer
                    }
                  >
                    {renderSubHeading(`${index + 1}. ${item.medicineName}`)}
                    {renderDescription(medicineDescription(item))}
                  </View>
                );
              }
            })}
        </View>
      </View>
    );
  };

  const renderTest = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading('Diagnostic Tests', <TestsIcon />)}
        <View style={styles.subContainer}>
          {tests &&
            tests.map(
              (item, index) =>
                item &&
                item.itemname && (
                  <View style={styles.singleItemContainer}>
                    {renderSubHeading(`${index + 1}. ${item.itemname}`)}
                  </View>
                )
            )}
        </View>
      </View>
    );
  };

  const renderAdvice = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading('Advise/ Instructions', <AdviceIcon />)}
        <View style={styles.subContainer}>
          {advice && advice.length > 0
            ? renderSubItems(
                'Doctor’s Advise',
                advice
                  .filter((i) => i && i.instruction)
                  .map((item) => (item && item.instruction ? item.instruction : ''))
                  .join('\n')
              )
            : null}
          {/* {renderFollowUp()} */}
          {renderReferral()}
        </View>
      </View>
    );
  };
  const renderReferral = () => {
    return referralData && referralData.referTo
      ? renderSubItems(
          'Referral',
          <>
            <Text style={styles.subHeadingText}>{`Consult a ${referralData.referTo}\n`}</Text>
            <Text>{referralData.referReason}</Text>
          </>
        )
      : null;
  };
  const renderFollowUp = () => {
    return followUp.doFollowUp
      ? renderSubItems(
          'Follow Up',
          <Text
            style={styles.subHeadingText}
          >{`${'Free'} Follow up (${'Online'}) after ${'5'} day${'s'} with reports`}</Text>
        )
      : null;
  };
  const renderDisclamer = () => {
    return (
      <View style={styles.singleItemContainer}>
        <View style={styles.seperatorView} />
        <View style={[styles.subContainer, styles.subItemsContainer]}>
          <Text style={styles.disclamerHeaderText}>Disclaimer:</Text>
          <Text style={styles.disclamerText}>
            This prescription is issued by the Apollo Hospitals Group on the basis of your
            teleconsultation. It is valid from the date of issue for upto 90 days (for the specific
            period/dosage of each medicine as advised).
          </Text>
        </View>
      </View>
    );
  };
  const renderButtons = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomStyle}>
        <View style={styles.footerButtonsContainer}>
          {customButtons
            ? customButtons.map((item) => {
                return (
                  <Button
                    onPress={() => item.onPress()}
                    title={item.title}
                    titleTextStyle={[styles.buttonTextStyle, item.titleTextStyle]}
                    variant={item.variant || 'white'}
                    style={[styles.buttonsaveStyle, item.style]}
                  />
                );
              })
            : null}
          {(!customButtons || (customButtons && customButtons.length === 0)) && onEditPress ? (
            <Button
              onPress={() => onEditPress()}
              title={'EDIT CASE SHEET'}
              titleTextStyle={styles.buttonTextStyle}
              variant="white"
              style={[styles.buttonsaveStyle, { marginRight: 16 }]}
            />
          ) : null}
          {(!customButtons || (customButtons && customButtons.length === 0)) && onSendPress ? (
            <Button
              title={'SEND TO PATIENT'}
              onPress={() => onSendPress && onSendPress()}
              style={styles.buttonendStyle}
            />
          ) : null}
        </View>
      </StickyBottomComponent>
    );
  };

  const renderDoctorDetails = () => {
    return (
      doctorDetails && (
        <>
          <Text
            style={theme.viewStyles.text('M', 11, theme.colors.SHARP_BLUE, 1, 13)}
          >{`${doctorDetails.salutation}. ${doctorDetails.fullName}`}</Text>
          {doctorDetails.qualification && (
            <Text
              style={theme.viewStyles.text('M', 9, theme.colors.SHARP_BLUE, 1, 13)}
            >{`${doctorDetails.qualification.replace(/;/g, ',')}`}</Text>
          )}
          {doctorDetails.specialty && (
            <Text
              style={theme.viewStyles.text('S', 9, theme.colors.SHARP_BLUE, 1, 13)}
            >{`${doctorDetails.specialty.name} | MCI Reg. No. ${doctorDetails.registrationNumber}`}</Text>
          )}
        </>
      )
    );
  };
  const renderDoctorAddress = () => {
    return (
      <>
        {doctorDetails && doctorDetails.doctorHospital.length ? (
          <Text style={styles.addressText}>{`${doctorDetails.doctorHospital[0].facility.name} | ${
            doctorDetails.doctorHospital[0].facility.streetLine1
          }${
            doctorDetails.doctorHospital[0].facility.streetLine2
              ? ` | ${doctorDetails.doctorHospital[0].facility.streetLine2}`
              : ''
          }${
            doctorDetails.doctorHospital[0].facility.streetLine3
              ? ` | ${doctorDetails.doctorHospital[0].facility.streetLine3}`
              : ''
          } | ${doctorDetails.doctorHospital[0].facility.city} - ${
            doctorDetails.doctorHospital[0].facility.zipcode
          } | ${doctorDetails.doctorHospital[0].facility.state}, ${
            doctorDetails.doctorHospital[0].facility.country
          }`}</Text>
        ) : null}
      </>
    );
  };

  const renderApolloLogo = () => {
    return (
      <View style={styles.ApolloLogo}>
        <View style={styles.logoContainer}>
          <ApploLogo2 />
        </View>
        {doctorDetails ? (
          <View style={styles.doctorDetailsStyle}>
            {renderDoctorDetails()}
            {renderDoctorAddress()}
          </View>
        ) : null}
      </View>
    );
  };

  const renderDoctorSign = () => {
    return doctorDetails && doctorDetails.signature ? (
      <View style={styles.mainContainer}>
        <View style={styles.seperatorView2} />
        <View style={styles.subContainer}>
          {renderDescription(
            `Prescribed ${moment(
              g(caseSheet, 'caseSheetDetails', 'appointment', 'sdConsultationDate')
            ).format('DD/MM/YYYY')} by`
          )}
          <Image
            style={styles.signatureStyle}
            source={{
              uri: doctorDetails.signature,
            }}
          />
          {renderDoctorDetails()}
        </View>
      </View>
    ) : null;
  };
  return (
    <SafeAreaView style={styles.flexStyle}>
      {renderHeader()}
      <ScrollView style={styles.flexStyle} bounces={false}>
        {renderApolloLogo()}
        {appointmentDetails && renderAppointmentData()}
        {renderComplaints()}
        {diagnosis && renderDiagnosis()}
        {medicine && medicine.length > 0 && renderMedicine()}
        {tests && tests.length > 0 && renderTest()}
        {(advice && advice.length > 0) ||
        (referralData && referralData.referTo) ||
        followUp.doFollowUp
          ? renderAdvice()
          : null}
        {renderDoctorSign()}
        {renderDisclamer()}
        <View
          style={
            onEditPress || onSendPress || customButtons ? styles.paddingView : styles.padding2View
          }
        />
      </ScrollView>
      {onEditPress || onSendPress || customButtons ? renderButtons() : null}
    </SafeAreaView>
  );
};
