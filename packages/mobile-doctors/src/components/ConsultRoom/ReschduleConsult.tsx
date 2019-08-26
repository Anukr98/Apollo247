import { MedicineProduct } from '@aph/mobile-doctors/src/components/ApiCall';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Cancel, Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import Highlighter from 'react-native-highlight-words';
import { Doctor, DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: theme.colors.INPUT_TEXT,
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
  },
  inputView: {
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#30c1a3',
    color: '#01475b',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
  },
  buttonView: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fed6a2',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },
  buttonViewfull: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fc9916',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.BUTTON_TEXT,
  },
  dropDownCardStyle: {
    marginTop: Platform.OS == 'android' ? -35 : -35,
    marginBottom: 26,
    paddingTop: 16,
    paddingBottom: 15,
    //position: Platform.OS == 'android' ? 'relative' : 'absolute',
    top: 0,
    zIndex: 2,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'flex-end',
    ...theme.viewStyles.whiteRoundedCornerCard,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    position: 'absolute',
  },
  commonView: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    marginBottom: 16,
  },
  commonText: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(16),
    marginLeft: 20,
    marginRight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  commonSubText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    opacity: 0.4,
    marginTop: 10,
    marginBottom: 9,
  },
});

export interface ProfileProps extends NavigationScreenProps {}

export const ReschduleConsult: React.FC<ProfileProps> = (props) => {
  const [selectreason, setSelectReason] = useState<string>('Select a reason');
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const isEnabled = selectreason != 'Select a reason';
  const sysmptonsList = [
    {
      id: '1',
      firstName: 'Fever ',
      secondName: '2days ',
      thirdName: 'Night',
      fourthName: 'High',
    },
    {
      id: '1',
      firstName: 'Cold ',
      secondName: '2days ',
      thirdName: 'Night',
      fourthName: 'High',
    },
  ];
  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{
          height: 50,
          backgroundColor: '#ffffff',
        }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText="RESCHDULE CONSULT"
        rightIcons={[
          {
            icon: <Cancel />,
            //onPress: () => props.navigation.push(AppRoutes.NeedHelpAppointment),
          },
        ]}
      ></Header>
    );
  };
  const onPressDoctorSearchListItem = (text: string, id: string) => {
    setDropdownOpen(false);
    setSelectReason(text);
  };
  const renderDropdownCard = () => (
    <View style={{ marginTop: 2 }}>
      <View style={styles.dropDownCardStyle}>
        {sysmptonsList!.map((_doctor, i, array) => {
          const drName = ` ${_doctor.firstName}`;

          return (
            <TouchableOpacity
              onPress={() => onPressDoctorSearchListItem(` ${_doctor.firstName}`, _doctor!.id)}
              style={{ marginHorizontal: 16 }}
              key={i}
            >
              {formatSuggestionsText(drName, '')}
              {i < array!.length - 1 ? (
                <View
                  style={{
                    marginTop: 8,
                    marginBottom: 7,
                    height: 1,
                    opacity: 0.1,
                  }}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const formatSuggestionsText = (text: string, searchKey: string) => {
    return (
      <Highlighter
        style={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansMedium(18),
        }}
        highlightStyle={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansBold(18),
        }}
        searchWords={[searchKey]}
        textToHighlight={text}
      />
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.commonView}>{showHeaderView()}</View>
      <ScrollView bounces={false} style={styles.container}>
        <View style={styles.commonView}>
          <Text style={styles.commonText}>Why do you want to reschedule this consult?</Text>
          <View style={{ marginRight: 20, marginLeft: 20, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setDropdownOpen(!isDropdownOpen)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {selectreason == 'Select a reason' ? (
                  <Text style={styles.commonSubText}>{selectreason}</Text>
                ) : (
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansMedium(16),
                      color: '#02475b',
                      marginTop: 10,
                      marginBottom: 9,
                    }}
                  >
                    {selectreason}
                  </Text>
                )}
                <View style={{ alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                  {!isDropdownOpen ? <Down /> : <Up />}
                </View>
              </View>
            </TouchableOpacity>
            <View style={[styles.inputStyle]} />
          </View>
        </View>
        {isDropdownOpen ? <View style={{ top: 0 }}>{renderDropdownCard()}</View> : null}
        <View
          style={{
            zIndex: -1,
            // flex: 1,
            justifyContent: 'flex-end',
            marginBottom: 36,
            alignItems: 'flex-end',
            marginTop: 314,
          }}
        >
          <Button
            title="RESCHDULE CONSULT"
            titleTextStyle={styles.titleTextStyle}
            style={selectreason != 'Select a reason' ? styles.buttonViewfull : styles.buttonView}
            //onPress={() => props.navigation.push(AppRoutes.NeedHelpDonePage)}
            disabled={!isEnabled}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
