import { PreviewPrescriptionStyles } from '@aph/mobile-doctors/src/components/ConsultRoom/PreviewPrescription.styles';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import {
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
  MEDICINE_UNIT,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { medUsageType, nameFormater } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { StickyBottomComponent } from '@aph/mobile-doctors/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { ApploLogo2 } from '@aph/mobile-doctors/src/components/ui/Icons';

const styles = PreviewPrescriptionStyles;

export interface PreviewPrescriptionProps
  extends NavigationScreenProps<{
    appointmentDetails: {
      patient: string;
      vitals: string;
      uhid: string;
      appId: string;
      date: string;
      type: string;
    };
    complaints: (GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null;
    diagnosis: (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null;
    medicine:
      | (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[]
      | null
      | undefined;
    tests: string[] | null;
    advice: string[] | null;
    followUp: string | null;
    onEditPress: () => void;
    onSendPress: () => void;
  }> {}

export const PreviewPrescription: React.FC<PreviewPrescriptionProps> = (props) => {
  const appointmentDetails = props.navigation.getParam('appointmentDetails');
  const complaints = props.navigation.getParam('complaints');
  const diagnosis = props.navigation.getParam('diagnosis');
  const medicine = props.navigation.getParam('medicine');
  const tests = props.navigation.getParam('tests');
  const advice = props.navigation.getParam('advice');
  const followUp = props.navigation.getParam('followUp');
  const onEditPress = props.navigation.getParam('onEditPress');
  const onSendPress = props.navigation.getParam('onSendPress');

  const renderHeader = () => {
    return (
      <Header
        containerStyle={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        headerText={'Prescription'}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };
  const renderHeading = (heading: string) => {
    return (
      <View style={styles.headingContainer}>
        <Text style={styles.headingText}>{heading}</Text>
      </View>
    );
  };
  const renderSubHeading = (subHeading: string) => {
    return <Text style={styles.subHeadingText}>{subHeading}</Text>;
  };

  const renderDescription = (description: string) => {
    return <Text style={styles.descriptionText}>{description}</Text>;
  };

  const renderSubItems = (subHeading: string, description: string) => {
    return (
      <View style={styles.subItemsContainer}>
        <View style={styles.appoitmentMainFlex}>{renderSubHeading(subHeading)}</View>
        <View style={styles.appointmentColonFlex}>
          <Text style={styles.seperatorText}>:</Text>
        </View>
        <View style={styles.appointmentTextFlex}>{renderDescription(description)}</View>
      </View>
    );
  };

  const renderAppointmentData = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading('Appointment Details')}
        <View style={styles.subContainer}>
          {renderSubItems('Patient', appointmentDetails.patient)}
          {renderSubItems('Vitals', appointmentDetails.vitals)}
          {renderSubItems('UHID', appointmentDetails.uhid)}
          {renderSubItems('Appt Id', appointmentDetails.appId)}
          {renderSubItems('Consult Date', appointmentDetails.date)}
          {renderSubItems('Consult Type', appointmentDetails.type)}
        </View>
      </View>
    );
  };

  const renderComplaints = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading('Chief Complaints')}
        <View style={styles.subContainer}>
          {complaints &&
            complaints.map((i) => {
              if (i) {
                return (
                  <View style={styles.itemContainer}>
                    {renderSubHeading(i.symptom || '')}
                    {renderDescription(
                      `${i.since ? `Since: ${i.since} | ` : ''}${
                        i.howOften ? `How often: ${i.howOften} | ` : ''
                      }${i.severity ? `Severity: ${i.severity} | ` : ''}${
                        i.details ? `Details: ${i.details}` : ''
                      }`
                    )}
                  </View>
                );
              }
            })}
        </View>
      </View>
    );
  };

  const renderDiagnosis = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading('Provisional Diagnosis')}
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
        {renderHeading('Medication Prescribed')}
        <View style={styles.subContainer}>
          {medicine &&
            medicine.map((item, index) => {
              if (item) {
                const type = medUsageType(item.medicineUnit);
                const unit: string =
                  item.medicineUnit === MEDICINE_UNIT.OTHERS
                    ? 'other'
                    : (item.medicineUnit || '').toLowerCase();
                return (
                  <View
                    style={
                      index !== medicine.length - 1
                        ? styles.itemContainer
                        : styles.lastItemContainer
                    }
                  >
                    {renderSubHeading(`${index + 1}. ${item.medicineName}`)}
                    {renderDescription(
                      `${type + ' '}${
                        item.medicineDosage
                          ? (type === 'Take' ? item.medicineDosage : '') + ' '
                          : ''
                      }${item.medicineUnit ? (type === 'Take' ? unit + '(s) ' : unit + ' ') : ''}${
                        item.medicineFrequency
                          ? nameFormater(item.medicineFrequency).toLowerCase() + ' '
                          : ''
                      }${
                        item.medicineConsumptionDurationInDays
                          ? `for ${item.medicineConsumptionDurationInDays} ${
                              item.medicineConsumptionDurationUnit
                                ? `${item.medicineConsumptionDurationUnit
                                    .slice(0, -1)
                                    .toLowerCase()}(s) `
                                : ``
                            }`
                          : ''
                      }${
                        item.medicineToBeTaken && item.medicineToBeTaken.length
                          ? item.medicineToBeTaken
                              .map((i: MEDICINE_TO_BE_TAKEN | null) =>
                                nameFormater(i || '').toLowerCase()
                              )
                              .join(', ') + ' '
                          : ''
                      }${
                        item.medicineTimings && item.medicineTimings.length
                          ? 'in the ' +
                            (item.medicineTimings.length > 1
                              ? item.medicineTimings
                                  .slice(0, -1)
                                  .map((i: MEDICINE_TIMINGS | null) =>
                                    nameFormater(i || '').toLowerCase()
                                  )
                                  .join(', ') +
                                ' and ' +
                                nameFormater(
                                  (item.medicineTimings &&
                                    item.medicineTimings[item.medicineTimings.length - 1]) ||
                                    ''
                                ).toLowerCase() +
                                ' '
                              : item.medicineTimings
                                  .map((i: MEDICINE_TIMINGS | null) =>
                                    nameFormater(i || '').toLowerCase()
                                  )
                                  .join(', ') + ' ')
                          : ''
                      }${'\n' + item.medicineInstructions}`
                    )}
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
        {renderHeading('Diagnostic Tests')}
        <View style={styles.subContainer}>
          {tests &&
            tests.map(
              (item, index) =>
                item && (
                  <View style={styles.singleItemContainer}>
                    {renderSubHeading(`${index + 1}. ${item}`)}
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
        {renderHeading('Advice Given')}
        <View style={styles.subContainer}>
          {advice &&
            advice.map(
              (item) =>
                item && <View style={styles.singleItemContainer}>{renderSubHeading(item)}</View>
            )}
        </View>
      </View>
    );
  };

  const renderFollowUp = () => {
    return (
      <View style={styles.mainContainer}>
        {renderHeading('Follow Up')}
        <View style={styles.subContainer}>{renderSubHeading(followUp || '')}</View>
      </View>
    );
  };
  const renderDisclamer = () => {
    return (
      <View style={styles.singleItemContainer}>
        <View style={styles.seperatorView} />
        <View style={styles.subContainer}>
          <Text style={styles.disclamerText}>
            Disclaimer: The prescription has been issued based on your inputs during chat/call with
            the doctor. In case of emergency please visit a nearby hospital. This is an
            electronically generated prescription and will not require a doctor signature.
          </Text>
        </View>
      </View>
    );
  };
  const renderButtons = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomStyle}>
        <View style={styles.footerButtonsContainer}>
          <Button
            onPress={() => onEditPress && onEditPress()}
            title={'EDIT CASE SHEET'}
            titleTextStyle={styles.buttonTextStyle}
            variant="white"
            style={[styles.buttonsaveStyle, { marginRight: 16 }]}
          />
          <Button
            title={'SEND TO PATIENT'}
            onPress={() => onSendPress && onSendPress()}
            style={styles.buttonendStyle}
          />
        </View>
      </StickyBottomComponent>
    );
  };

  const renderApolloLogo = () => {
    return (
      <View style={styles.ApolloLogo}>
        <ApploLogo2 />
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.flexStyle}>
      {renderHeader()}
      <ScrollView style={styles.flexStyle} bounces={false}>
        {renderApolloLogo()}
        {appointmentDetails && renderAppointmentData()}
        {complaints && renderComplaints()}
        {diagnosis && renderDiagnosis()}
        {medicine && renderMedicine()}
        {tests && renderTest()}
        {advice && renderAdvice()}
        {followUp && renderFollowUp()}
        {renderDisclamer()}
        <View style={styles.paddingView} />
      </ScrollView>
      {renderButtons()}
    </SafeAreaView>
  );
};
