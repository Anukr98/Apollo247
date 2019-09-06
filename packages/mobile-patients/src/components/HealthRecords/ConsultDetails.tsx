import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ShareGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect, useCallback } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  getCaseSheet,
  getCaseSheet_getCaseSheet_caseSheetDetails,
} from '@aph/mobile-patients/src/graphql/types/getCaseSheet';
import { GET_CASESHEET_DETAILS } from '@aph/mobile-patients/src/graphql/profiles';

const styles = StyleSheet.create({
  imageView: {
    width: 80,
    marginLeft: 20,
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  timeStyle: {
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.04,
  },
  descriptionStyle: {
    paddingTop: 7,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.TEXT_LIGHT_BLUE,
  },
  doctorDetailsStyle: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  labelStyle: {
    paddingBottom: 4,
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  dataTextStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingTop: 7,
    paddingBottom: 12,
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
});

export interface ConsultDetailsProps extends NavigationScreenProps {}

export const ConsultDetails: React.FC<ConsultDetailsProps> = (props) => {
  const [showsymptoms, setshowsymptoms] = useState<boolean>(true);
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [caseSheetDetails, setcaseSheetDetails] = useState<
    getCaseSheet_getCaseSheet_caseSheetDetails
  >();

  const getData = useQuery<getCaseSheet>(GET_CASESHEET_DETAILS, {
    fetchPolicy: 'no-cache',
    variables: {
      appointmentId: 'c2d9a989-5763-4eb3-8923-0a3700441eef',
    },
  });
  console.log(getData, 'getData');

  if (getData.data) {
    if (
      getData &&
      getData.data &&
      getData.data.getCaseSheet &&
      getData.data.getCaseSheet.caseSheetDetails &&
      caseSheetDetails !== getData.data.getCaseSheet.caseSheetDetails
    ) {
      console.log(getData.data.getCaseSheet.caseSheetDetails, 'caseSheetDetails');
      setcaseSheetDetails(getData.data.getCaseSheet.caseSheetDetails);
    }
  } else {
    console.log(getData.error, 'getData error');
  }

  const data = {
    doctorInfo: {
      firstName: 'Mamatha',
      photoUrl:
        'https://image.shutterstock.com/image-photo/smiling-doctor-posing-arms-crossed-600w-519507367.jpg',
    },
    id: '34567890987654',
    consult_info: '03 Aug 2019, Online Consult',
    description: 'This is a follow-up consult to the Clinic Visit on 27 Jul 2019',
  };

  const followUp = [
    {
      label: 'Online Consult / Clinic Visit',
      data: 'Recommended after 5 days',
    },
  ];

  const renderDoctorDetails = () => {
    return (
      <View style={styles.doctorDetailsStyle}>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(12),
                color: theme.colors.SEARCH_EDUCATION_COLOR,
                paddingBottom: 4,
              }}
            >
              #{data.id}
            </Text>
            <View style={theme.viewStyles.lightSeparatorStyle} />
            <Text style={styles.doctorNameStyle}>Dr. {data.doctorInfo.firstName}</Text>
            <Text style={styles.timeStyle}>{data.consult_info}</Text>
            <View style={theme.viewStyles.lightSeparatorStyle} />
          </View>
          <View style={styles.imageView}>
            {data.doctorInfo.photoUrl && (
              <Image
                source={{ uri: data.doctorInfo.photoUrl }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                }}
              />
            )}
          </View>
        </View>

        <Text style={styles.descriptionStyle}>{data.description}</Text>
        <Text style={[theme.viewStyles.yellowTextStyle, { textAlign: 'right', paddingBottom: 16 }]}>
          {strings.health_records_home.view_consult}
        </Text>
      </View>
    );
  };

  const renderSymptoms = () => {
    if (caseSheetDetails && caseSheetDetails.symptoms && caseSheetDetails.symptoms.length > 0)
      return (
        <View
          style={{
            marginTop: 24,
          }}
        >
          <CollapseCard
            heading="SYMPTOMS"
            collapse={showsymptoms}
            onPress={() => setshowsymptoms(!showsymptoms)}
          >
            <View style={styles.cardViewStyle}>
              {caseSheetDetails.symptoms.map((item) => {
                if (item && item.symptom)
                  return (
                    <View>
                      <View style={styles.labelViewStyle}>
                        <Text style={styles.labelStyle}>{item.symptom}</Text>
                      </View>
                      <Text style={styles.dataTextStyle}>
                        {`Since: ${item.since}\nHow Often: ${item.howOften}\nSeverity: ${item.severity}`}
                      </Text>
                    </View>
                  );
              })}
            </View>
          </CollapseCard>
        </View>
      );
  };

  const renderPrescriptions = () => {
    if (
      caseSheetDetails &&
      caseSheetDetails.medicinePrescription &&
      caseSheetDetails.medicinePrescription.length > 0
    )
      return (
        <View>
          <CollapseCard
            heading="PRESCRIPTION"
            collapse={showPrescription}
            onPress={() => setshowPrescription(!showPrescription)}
          >
            <View style={styles.cardViewStyle}>
              {caseSheetDetails.medicinePrescription.map((item) => {
                if (item)
                  return (
                    <View>
                      <View style={styles.labelViewStyle}>
                        <Text style={styles.labelStyle}>{item.medicineName}</Text>
                      </View>
                      <Text style={styles.dataTextStyle}>
                        {item.medicineDosage}
                        {item.medicineTimings
                          ? `\n${
                              item.medicineTimings.length
                            } times a day (${item.medicineTimings.join(', ').toLowerCase()}) for ${
                              item.medicineConsumptionDurationInDays
                            } days\n`
                          : ''}

                        {item.medicineToBeTaken
                          ? item.medicineToBeTaken
                              .map(
                                (item) =>
                                  item &&
                                  item
                                    .split('_')
                                    .join(' ')
                                    .toLowerCase()
                              )
                              .join(', ')
                          : ''}
                      </Text>
                    </View>
                  );
              })}
              <Text
                style={[
                  theme.viewStyles.yellowTextStyle,
                  { textAlign: 'right', paddingBottom: 16 },
                ]}
              >
                {strings.health_records_home.order_medicine}
              </Text>
            </View>
          </CollapseCard>
        </View>
      );
  };

  const renderDiagnosis = () => {
    if (caseSheetDetails && caseSheetDetails.diagnosis && caseSheetDetails.diagnosis.length > 0)
      return (
        <View>
          <CollapseCard
            heading="DIAGNOSIS"
            collapse={showPrescription}
            onPress={() => setshowPrescription(!showPrescription)}
          >
            <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
              <View>
                <Text style={styles.labelStyle}>
                  {caseSheetDetails.diagnosis.map((item) => item && item.name).join(', ')}
                </Text>
              </View>
            </View>
          </CollapseCard>
        </View>
      );
  };
  const renderGenerealAdvice = () => {
    if (
      caseSheetDetails &&
      caseSheetDetails.otherInstructions &&
      caseSheetDetails.otherInstructions.length > 0
    )
      return (
        <View>
          <CollapseCard
            heading="GENERAL ADVICE"
            collapse={showPrescription}
            onPress={() => setshowPrescription(!showPrescription)}
          >
            <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
              <View>
                <Text style={styles.labelStyle}>
                  {caseSheetDetails.otherInstructions
                    .map((item, i) => {
                      if (item && item.instruction !== '') {
                        return `${i + 1}. ${item.instruction}`;
                      }
                    })
                    .join('\n')}
                </Text>
              </View>
            </View>
          </CollapseCard>
        </View>
      );
  };

  const renderFollowUp = () => {
    if (caseSheetDetails && caseSheetDetails.followUp)
      return (
        <View>
          <CollapseCard
            heading="FOLLOW-UP"
            collapse={showPrescription}
            onPress={() => setshowPrescription(!showPrescription)}
          >
            <View style={styles.cardViewStyle}>
              <View>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>
                    {caseSheetDetails.consultType === 'PHYSICAL'
                      ? 'Clinic Visit'
                      : 'Online Consult '}
                  </Text>
                </View>
                <Text style={styles.dataTextStyle}>
                  Recommended after {caseSheetDetails.followUpAfterInDays} days
                </Text>
              </View>
              <Text
                style={[
                  theme.viewStyles.yellowTextStyle,
                  { textAlign: 'right', paddingBottom: 16 },
                ]}
              >
                {strings.health_records_home.book_follow_up}
              </Text>
            </View>
          </CollapseCard>
        </View>
      );
  };

  const renderData = () => {
    if (caseSheetDetails)
      return (
        <View>
          {renderSymptoms()}
          {renderPrescriptions()}
          {renderDiagnosis()}
          {renderGenerealAdvice()}
          {renderFollowUp()}
        </View>
      );
    return null;
  };

  if (data.doctorInfo)
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            title="PRESCRIPTION"
            leftIcon="backArrow"
            rightComponent={
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <ShareGreen />
              </TouchableOpacity>
            }
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <ScrollView bounces={false}>
            {renderDoctorDetails()}
            {renderData()}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  return null;
};
