import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Download,
  FileBig,
  MedicineRxIcon,
  PrescriptionThumbnail,
  ShareGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  imageView: {
    ...theme.viewStyles.cardViewStyle,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    backgroundColor: theme.colors.WHITE,
  },
  doctorNameStyle: {
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  timeStyle: {
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.04,
    lineHeight: 20,
  },
  doctorDetailsStyle: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  labelStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  descriptionStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  labelTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingTop: 8,
    paddingBottom: 3,
  },
  valuesTextStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingBottom: 16,
  },
});

export interface RecordDetailsProps extends NavigationScreenProps {}

export const RecordDetails: React.FC<RecordDetailsProps> = (props) => {
  const [showtopLine, setshowtopLine] = useState<boolean>(true);
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
  console.log(data, 'data');

  const detailFinding = [
    {
      label: 'Lymphocytes',
      result: '15',
      units: '%',
      normal_range: '20 - 40',
    },
    {
      label: 'Haemoglobin (Optical Light Scatter / Cyanmethaemoglobin)',
      result: '11.4',
      units: 'gm/dl',
      normal_range: '13.0 - 18.0',
    },
    {
      label: 'Lymphocytes',
      result: '15',
      units: '%',
      normal_range: '20 - 40',
    },
    {
      label: 'Haemoglobin (Optical Light Scatter / Cyanmethaemoglobin)',
      result: '11.4',
      units: 'gm/dl',
      normal_range: '13.0 - 18.0',
    },
  ];

  const renderRecordDetails = () => {
    return (
      <View>
        <View style={styles.doctorDetailsStyle}>
          <MedicineRxIcon />
          <Text style={[styles.doctorNameStyle, { paddingTop: 7 }]}>Diabetes Tablets</Text>
          <Text style={styles.timeStyle}>09 Aug 2019</Text>
        </View>
        <View style={{ margin: 20 }}>
          <PrescriptionThumbnail style={{ flex: 1, width: '100%' }} />
        </View>
      </View>
    );
  };

  const renderDoctorDetails = () => {
    return (
      <View style={styles.doctorDetailsStyle}>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorNameStyle}>CBC Details</Text>
            <Text style={styles.timeStyle}>
              {`Check-up Date: 03 May 2019\nSource: Apollo Hospital, Jubilee Hills\nReferring Doctor: Dr. Simran Rai`}
            </Text>
          </View>
          <View style={styles.imageView}>
            <FileBig />
          </View>
        </View>
      </View>
    );
  };

  const renderTopLineReport = () => {
    return (
      <View
        style={{
          marginTop: 24,
        }}
      >
        <CollapseCard
          heading="TOPLINE REPORT"
          collapse={showtopLine}
          onPress={() => setshowtopLine(!showtopLine)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12 }]}>
            <View>
              <Text style={styles.descriptionStyle}>{`RBC: Predominantly normocytic normochromic
RBCs: Few microcytic hypochromic RBCs are also noted. No nRBCs or haemoparasites seen
Platelets: Moderate thrombocytopenia noted
WBC: Within normal limits. No atypical WBCs/blasts seen`}</Text>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderDetailsFinding = () => {
    return (
      <View>
        <CollapseCard
          heading="DETAILED FINDINGS"
          collapse={showPrescription}
          onPress={() => setshowPrescription(!showPrescription)}
        >
          <View style={{ marginTop: 11, marginBottom: 20 }}>
            {detailFinding.map((item) => {
              return (
                <View style={[styles.cardViewStyle, { marginTop: 4, marginBottom: 4 }]}>
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item.label}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.labelTextStyle}>Result</Text>
                    <Text style={styles.labelTextStyle}>Units</Text>
                    <Text style={styles.labelTextStyle}>Normal Range</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.valuesTextStyle}>{item.result}</Text>
                    <Text style={styles.valuesTextStyle}>{item.units}</Text>
                    <Text style={styles.valuesTextStyle}>{item.normal_range}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderData = () => {
    return (
      <View>
        {renderTopLineReport()}
        {renderDetailsFinding()}
      </View>
    );
  };

  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="RECORD DETAILS"
          leftIcon="backArrow"
          rightComponent={
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity activeOpacity={1} style={{ marginRight: 20 }} onPress={() => {}}>
                <ShareGreen />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <Download />
              </TouchableOpacity>
            </View>
          }
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false}>
          {renderDoctorDetails()}
          {renderData()}
          {false && renderRecordDetails()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
