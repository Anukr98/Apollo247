import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ShareGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

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

  const symptoms = [
    {
      label: 'Cold & Cough',
      data: 'Since: Last 4 days\nHow Often: Throughout the day\nSeverity: Moderate',
    },
    {
      label: 'Fever',
      data: 'Since: Last 2 days\nHow Often: In the evening\nSeverity: High',
    },
    {
      label: 'Nausea',
      data: 'Since: Last 2 days\nHow Often: In the evening\nSeverity: High',
    },
  ];
  const prescriptions = [
    {
      label: 'Sompraz-D Cap',
      data: '1 Tab\n1 times a day(morning) for 7 days\nBefore food',
    },
    {
      label: 'Redixin Plus Mouthwash',
      data: 'Throat Gargles\n3 times a day(morning) for 5 days',
    },
  ];

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
            {symptoms.map((item) => {
              return (
                <View>
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item.label}</Text>
                  </View>
                  <Text style={styles.dataTextStyle}>{item.data}</Text>
                </View>
              );
            })}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderPrescriptions = () => {
    return (
      <View>
        <CollapseCard
          heading="PRESCRIPTION"
          collapse={showPrescription}
          onPress={() => setshowPrescription(!showPrescription)}
        >
          <View style={styles.cardViewStyle}>
            {prescriptions.map((item) => {
              return (
                <View>
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item.label}</Text>
                  </View>
                  <Text style={styles.dataTextStyle}>{item.data}</Text>
                </View>
              );
            })}
          </View>
          <Text
            style={[theme.viewStyles.yellowTextStyle, { textAlign: 'right', paddingBottom: 16 }]}
          >
            {strings.health_records_home.order_medicine}
          </Text>
        </CollapseCard>
      </View>
    );
  };

  const renderDiagnosis = () => {
    return (
      <View>
        <CollapseCard
          heading="DIAGNOSIS"
          collapse={showPrescription}
          onPress={() => setshowPrescription(!showPrescription)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
            <View>
              <Text style={styles.labelStyle}>Acute Pharyngitis (unspecified)</Text>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };
  const renderGenerealAdvice = () => {
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
                {`1. Take adequate rest\n2. Take warm fluids / soft food, more frequently in small quantities\n3. Avoid cold / refrigerated food 4. Follow Prescription`}
              </Text>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderFollowUp = () => {
    return (
      <View>
        <CollapseCard
          heading="FOLLOW-UP"
          collapse={showPrescription}
          onPress={() => setshowPrescription(!showPrescription)}
        >
          <View style={styles.cardViewStyle}>
            {followUp.map((item) => {
              return (
                <View>
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item.label}</Text>
                  </View>
                  <Text style={styles.dataTextStyle}>{item.data}</Text>
                </View>
              );
            })}
          </View>
          <Text
            style={[theme.viewStyles.yellowTextStyle, { textAlign: 'right', paddingBottom: 16 }]}
          >
            {strings.health_records_home.book_follow_up}
          </Text>
        </CollapseCard>
      </View>
    );
  };

  const renderData = () => {
    return (
      <View>
        {renderSymptoms()}
        {renderPrescriptions()}
        {renderDiagnosis()}
        {renderGenerealAdvice()}
        {renderFollowUp()}
      </View>
    );
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
              <TouchableOpacity onPress={() => {}}>
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
