import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  SectionList,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { BaseScene, Header, SectionHeader, DoctorCard } from '../common';

import AppIntroSlider from 'react-native-app-intro-slider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { theme } from 'app/src/__new__/theme/theme';
import { RouteChildrenProps } from 'react-router';

import { string } from 'app/src/__new__/strings/string';
import { StickyBottomComponent } from 'app/src/__new__/components/ui/StickyBottomComponent';
import { Button, TextInputComponent, Card } from 'app/src/UI/common';
import { DatePicker } from 'app/src/__new__/components/ui/DatePicker';
import { SortDecreasing, Filter } from 'app/src/__new__/components/ui/Icons';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    paddingTop: 2,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    height: 28,
    width: '80%',
    color: theme.colors.INPUT_TEXT,
  },
  inputView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 4,
  },
  bottomDescription: {
    fontSize: 12,
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    paddingBottom: 55,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  invalidNumberStyle: {
    color: theme.colors.INPUT_FAILURE_TEXT,
  },
  mascotStyle: {
    position: 'absolute',
    top: 90,
    right: 20,
    height: 64,
    width: 64,
    zIndex: 2,
    elevation: 2,
  },
  buttonViewStyle: {
    width: '30%',
    backgroundColor: 'white',
  },
  selectedButtonViewStyle: {
    backgroundColor: theme.colors.APP_GREEN,
  },
  buttonTitleStyle: {
    color: theme.colors.APP_GREEN,
  },
  selectedButtonTitleStyle: {
    color: theme.colors.WHITE,
  },
  submitButtonView: {
    width: '40%',
    backgroundColor: 'white',
  },
  submitButtonTitleStyle: {
    color: '#fc9916',
  },
});

type doctorsList = {
  title: string;
  data: object;
};
const DoctorsList: doctorsList[] = [
  {
    title: 'Our Star Doctors',
    data: [
      {
        // image: { ...this.appImages('simran') },
        doctorName: 'Dr. Simran Rai',
        starDoctor: true,
        specialization: 'GENERAL PHYSICIAN',
        experience: '7 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT NOW',
        available: true,
      },
      {
        // image: { ...this.appImages('narayanRao') },
        doctorName: 'Dr. Jayanth Reddy',
        starDoctor: true,
        specialization: 'GENERAL PHYSICIAN',
        experience: '5 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT IN 27 MINS',
        available: false,
      },
    ],
  },
  {
    title: 'From Your Past Consults',
    data: [
      {
        // image: { ...this.appImages('rakhiSharma') },
        doctorName: 'Dr. Rakhi Sharma',
        starDoctor: false,
        specialization: 'GENERAL PHYSICIAN',
        experience: '4 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT NOW',
        available: true,
      },
    ],
  },
  {
    title: 'More Apollo Doctors In Hyderabad',
    data: [
      {
        // image: { ...this.appImages('rahul') },
        doctorName: 'Dr. Rahul Nerlekar',
        starDoctor: false,
        specialization: 'GENERAL PHYSICIAN',
        experience: '4 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT IN 45 MINS',
        available: false,
      },
    ],
  },
  {
    title: 'Apollo Doctors In Other Cities',
    data: [
      {
        // image: { ...this.appImages('rajan') },
        doctorName: 'Dr. Ranjan Gopal',
        starDoctor: false,
        specialization: 'GENERAL PHYSICIAN',
        experience: '4 YRS',
        education: 'MBBS, Internal Medicine',
        location: 'Apollo Hospitals, Jubilee Hills',
        time: 'CONSULT IN 45 MINS',
        available: false,
      },
    ],
  },
];

export interface DoctorSearchListingProps extends RouteChildrenProps {}
export const DoctorSearchListing: React.FC<DoctorSearchListingProps> = (props) => {
  const [gender, setGender] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const RightHeader = ({ images, styles, navigate }) => {
    console.log(images, 'images');
    return (
      <View style={{ flexDirection: 'row' }}>
        <Image {...images('noLocation')} />
        <TouchableOpacity onPress={() => navigate('FilterScene')}>
          <Filter />
          {/* <Image {...images('filter')} /> */}
        </TouchableOpacity>
      </View>
    );
  };
  const renderTopView = (styles: any) => {
    return (
      <View>
        <View style={styles.topView}>
          <Header
            leftIcon="backArrow"
            container={{ borderBottomWidth: 0 }}
            rightComponent={() => <RightHeader styles={styles} navigate={this.navigate} />}
          />
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={styles.headingText}>{string.LocalStrings.okay}</Text>
            <Text style={[styles.descriptionText, this.props.descriptionTextStyle]}>
              {string.LocalStrings.best_general_physicians_text}
            </Text>
          </View>
        </View>
        <View style={styles.filterView}>
          <View style={styles.filterItemView}>
            <Text style={styles.itemLabelText}>{string.LocalStrings.all_consults}</Text>
            <DropdownGreen />
            {/* <Image {...this.appImages().ic_dropdown_green} /> */}
          </View>
          <View style={styles.filterItemView}>
            <Text style={styles.itemLabelText}>{string.LocalStrings.distance}</Text>
            <SortDecreasing />
            {/* <Image {...this.appImages().sort_increasing} /> */}
          </View>
          <View style={styles.filterItemView}>
            {/* //td
            <Image {...this.appImages().ic_reset} /> */}
          </View>
        </View>
      </View>
    );
  };

  const renderSearchDoctorResultsRow = (rowData, rowID) => {
    return <DoctorCard rowData={rowData} />;
  };

  const renderHeader = (rowHeader) => {
    let sectionTitle = rowHeader.title;
    if (sectionTitle === 'Matching Doctors') {
      sectionTitle = sectionTitle + ' — ' + rowHeader.data.length;
    }
    return <SectionHeader sectionTitle={sectionTitle} />;
  };

  const renderDoctorSearches = (styles: any) => {
    return (
      <View>
        <SectionList
          contentContainerStyle={{
            flexWrap: 'wrap',
            marginTop: 12,
            marginBottom: 8,
          }}
          bounces={false}
          sections={DoctorsList}
          onEndReachedThreshold={0.5}
          renderItem={({ item, index }) => renderSearchDoctorResultsRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          renderSectionHeader={({ section }) => renderHeader(section)}
        />
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
      <ScrollView style={{ flex: 1 }}>
        {renderTopView(styles)}
        {renderDoctorSearches(styles)}
      </ScrollView>
    </SafeAreaView>
  );
};
