import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  KeyboardAvoidingView,
  KeyboardEvent,
  AsyncStorage,
  Image,
  NativeModules,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { string } from '@aph/mobile-patients/src/strings/string';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  RadioButtonUnselectedIcon,
  RadioButtonIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  headerText: {
    marginHorizontal: 20,
    marginTop: 24,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#01475b',
  },
  listView: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
  },
  nameStyles: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    marginTop: 16,
    width: 186,
  },
  qualificationStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: '#0087ba',
    marginTop: 5,
    letterSpacing: 0.3,
    width: 186,
  },
  seperatorStyles: {
    marginLeft: 56,
    marginRight: 16,
    backgroundColor: '#02475b',
    opacity: 0.3,
    marginTop: 12,
    height: 1,
  },
  appointmentStyles: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    paddingLeft: 56,
    paddingTop: 11,
    paddingBottom: 16,
  },
});

type ArrayDoctor = {
  id: number;
  name: string;
  qualification: string;
  experience: string;
  appointmentTime: string;
  image: ImageSourcePropType;
};

const ArrayDoctor: ArrayDoctor[] = [
  {
    id: 1,
    name: 'Dr. Jayanth Reddy',
    qualification: 'GENERAL PHYSICIAN',
    experience: '5 YRS',
    appointmentTime: '18th May, Monday, 9:00 am',
    image: require('@aph/mobile-patients/src/components/ui/icons/narayanRao.png'),
  },
  {
    id: 2,
    name: 'Dr. Jayanth Reddy',
    qualification: 'GENERAL PHYSICIAN',
    experience: '5 YRS',
    appointmentTime: '18th May, Monday, 9:00 am',
    image: require('@aph/mobile-patients/src/components/ui/icons/narayanRao.png'),
  },
  {
    id: 3,
    name: 'Dr. Jayanth Reddy',
    qualification: 'GENERAL PHYSICIAN',
    experience: '5 YRS',
    appointmentTime: '18th May, Monday, 9:00 am',
    image: require('@aph/mobile-patients/src/components/ui/icons/narayanRao.png'),
  },
];

export interface ChooseDoctorProps extends NavigationScreenProps {}
export const ChooseDoctor: React.FC<ChooseDoctorProps> = (props) => {
  const [rowSelected, setRowSelected] = useState<number>(0);

  const renderRow = (rowData: ArrayDoctor, index: number) => {
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            setRowSelected(index);
          }}
        >
          <View style={styles.listView}>
            <View style={{ flexDirection: 'row' }}>
              {rowSelected === index ? (
                <RadioButtonIcon
                  style={{ marginHorizontal: 18, marginTop: 18, width: 20, height: 20 }}
                />
              ) : (
                <RadioButtonUnselectedIcon
                  style={{ marginHorizontal: 18, marginTop: 18, width: 20, height: 20 }}
                />
              )}

              <View>
                <Text style={styles.nameStyles}>{rowData.name}</Text>
                <Text style={styles.qualificationStyles}>
                  {rowData.qualification} | {rowData.experience}
                </Text>
              </View>
              <Image
                style={{ height: 40, width: 40, marginTop: 16, marginLeft: 35 }}
                source={rowData.image}
              />
            </View>
            <View style={styles.seperatorStyles} />
            <Text style={styles.appointmentStyles}>{rowData.appointmentTime}</Text>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const renderList = () => {
    return (
      <View>
        <FlatList
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          contentContainerStyle={{
            marginTop: 16,
            marginBottom: 20,
          }}
          bounces={false}
          data={ArrayDoctor}
          onEndReachedThreshold={0.1}
          renderItem={({ item, index }) => renderRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
        />
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <Header
          title={'CHOOSE DOCTOR'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <Text style={styles.headerText}>{string.LocalStrings.chooseDoctorHeaderText}</Text>
        {renderList()}
        <StickyBottomComponent defaultBG style={{ paddingHorizontal: 0 }}>
          <Button title={'CONFIRM'} style={{ flex: 1, marginHorizontal: 60 }} onPress={() => {}} />
        </StickyBottomComponent>
      </SafeAreaView>
    </View>
  );
};
