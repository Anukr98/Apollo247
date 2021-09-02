import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CalendarClose,
  CalendarShow,
  Reload,
  CloseCal,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { CalendarView } from '@aph/mobile-patients/src/components/ui/CalendarView';
import moment from 'moment';
import { AppointmentFilterObject } from '@aph/mobile-patients/src/components/ConsultRoom/Consult';
import _ from 'lodash';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { AppRoutes } from '../NavigatorContainer';
import { NavigationParams, NavigationRoute, NavigationScreenProp } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    elevation: 5,
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '96%',
    paddingBottom: 20,
  },
  buttonStyle: {
    width: 'auto',
    height: 'auto',
    marginRight: 8,
    marginTop: 11,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  calendarStyle: {
    display: 'flex',
    backgroundColor: '#f7f8f5',
    shadowRadius: 0,
    elevation: 0,
  },
  calendarMainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  calendarMainViewStyle: {
    width: '97.4%',
    height: 42,
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeIconStyle: {
    width: 28,
    height: 28,
  },
  calendarViewStyle: {
    borderBottomWidth: 0.1,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  content: {
    flexDirection: 'row',
  },
  menuColumn: {
    width: '33%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.CARD_BG,
  },
  menuItem: {
    paddingVertical: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.2,
    borderBottomColor: theme.colors.LIGHT_GRAY_2,
    flexDirection: 'row',
  },
  selectedMenuItem: {
    backgroundColor: theme.colors.WHITE,
  },
  menuItemText: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
  },
  settingsColumn: {
    flex: 1,
    paddingHorizontal: 15,
  },
  selectedMenuItemText: {
    ...theme.viewStyles.text('M', 14, theme.colors.BONDI_BLUE),
  },
  availabilityTextStyle: {
    ...theme.viewStyles.text('M', 15, '#02475b'),
  },
  patientView: {
    backgroundColor: theme.colors.WHITE,
    borderRadius: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 12, 
    marginTop: 10,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  patientSelectedView: {
    backgroundColor: theme.colors.APP_GREEN,
    borderRadius: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 12, 
    marginTop: 10,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  patientText: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE)
  },
  patientSelectedText: {
    ...theme.viewStyles.text('M', 14, theme.colors.WHITE)
  },
  addPatientText: {
    ...theme.viewStyles.text('M', 14, theme.colors.APP_YELLOW)
  },
});

interface AppointmentFilterSceneProps {
  selectedPatient: any;
  selectPatient: (patient: any) => void;
  dismissModal: () => void;
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const AppointmentFilterScene: React.FC<AppointmentFilterSceneProps> = (props) => {
  const {
    selectedPatient,
    selectPatient,
    dismissModal,
  } = props;
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  
  const [menuItems, setMenuItems] = useState([
    { id: '0', name: 'Patient Name' },
  ]);
  const [patient, setPatient] = useState<any>(selectedPatient);
  
  const renderPatientName = (item?: any) => {
    let isSelected = item?.id === patient?.id;
    if(item == 'ALL') {
      isSelected = item == patient;
    } 
    
    const {firstName, lastName} = item || {};
    return (
      <TouchableOpacity
        onPress={() => setPatient(item || 'ALL')} 
        style={isSelected ? styles.patientSelectedView : styles.patientView}>
        <Text style={isSelected ? styles.patientSelectedText : styles.patientText}>
          {firstName ? firstName + ' ' + lastName : 'All Patients'}
        </Text>
      </TouchableOpacity>
    )
  }
  
  const renderAddPatient = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate(AppRoutes.EditProfile, {
            isEdit: false,
            screenName: string.consult,
            mobileNumber: currentPatient && currentPatient!.mobileNumber,
          });
        }} 
        style={styles.patientView}>
        <Text style={styles.addPatientText}>
          {'Add Patient'}
        </Text>
      </TouchableOpacity>
    )
  }

  // this holds the keys of the menuItems for the view to know which category is currently being rendered.
  const filtersCard = () => {
    return (
      <View style={styles.content}>
        <View style={styles.menuColumn}>
          {menuItems.map((item, index) => {
            return (
              <View
                key={item.id}
                style={[styles.menuItem, styles.selectedMenuItem]}
              >
                <Text style={styles.menuItemText}>
                  {item.name}
                </Text>
              </View>
            );
          })}
          <View
            style={{ display: 'flex', backgroundColor: theme.colors.CARD_BG, height: '100%' }}
          />
        </View>
        <View style={styles.settingsColumn}>
          {renderPatientName('ALL')}
          {allCurrentPatients.map((item: any) =>
            item?.id != '+ADD MEMBER' && renderPatientName(item)
          )}
          {renderAddPatient()}
        </View>
      </View>
    );
  };

  const renderTopView = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'close'}
        title="FILTERS"
        rightComponent={
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setPatient(null);
            }}
          >
            <Reload />
          </TouchableOpacity>
        }
        onPressLeftIcon={dismissModal}
      />
    );
  };

  const bottomButton = () => {
    return (
      <StickyBottomComponent
        style={{ backgroundColor: theme.colors.WHITE, elevation: 20, height: '12%' }}
      >
        <Button
          title={'APPLY FILTERS'}
          style={{ flex: 1, marginHorizontal: 40, marginTop: 15 }}
          onPress={() => {
            patient && selectPatient(patient)
            dismissModal();
          }}
          disabled={!patient}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderTopView()}
      {filtersCard()}
      {bottomButton()}
    </SafeAreaView>
  );
};
