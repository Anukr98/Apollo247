import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextStyle,
  StyleProp,
  ViewStyle,
  Platform,
  Text,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { default as Moment, default as moment } from 'moment';
import { renderVaccinesTimeSlotsLoaderShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';

import {
  CovidVaccine,
  LinkedUhidIcon,
  VaccineBookingFailed,
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
  ArrowLeft,
  ArrowRight,
  CheckUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  renderSiteAndDateSelectorContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    paddingHorizontal: 21,
    paddingVertical: 23,
    marginTop: 7,
    marginBottom: 7,
    maxHeight: 400,
  },
  filledNATitle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SKY_BLUE, 0.5),
    textAlign: 'center',
    marginVertical: 18,
  },
  calendarDayTitle: {
    ...theme.viewStyles.text('M', 12, '#02475B'),
    textAlign: 'center',
    marginVertical: 8,
  },
  siteRadioContainer: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#D6CEE3',
  },
  siteHospitalNameLocalityContainer: {},
  siteHospitalName: {
    ...theme.viewStyles.text('M', 12, '#02475B'),
  },
  siteHopitalLocality: {
    ...theme.viewStyles.text('R', 12, '#02475B'),
  },
  hospitalTitle: {
    ...theme.viewStyles.text('M', 17, theme.colors.SKY_BLUE),
  },
  arrowRight: {
    marginLeft: 8,
    marginRight: -7,
    opacity: 1,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  arrowLeft: {
    marginRight: 7,
    marginTop: 10,
    opacity: 1,
    alignSelf: 'flex-end',
  },
});

const AVAILABILTY = { FILLED: 'FILLED', NA: 'NA', UNSELECTED: 'UNSELECTED', SELECTED: 'SELECTED' };

export interface VaccineSiteDateSelectorProps {
  siteList: any[];
  onSiteResourceIdSelected: (siteResourceId: string) => void;
  onDateSelected: (date: string) => void;
  onHospitalSiteSelected: (hospitalSiteSelected: string) => void;
  isRetail: boolean;
  onRetailChanged: (isRetail: boolean) => void;
  showFilterStrip: boolean;
}

export const VaccineSiteDateSelector: React.FC<VaccineSiteDateSelectorProps> = (props) => {
  const flatListRef = useRef<FlatList<any> | undefined | null>();
  const [currentStripIndex, setCurrentStripIndex] = useState<number>(0);
  const [dateStripList, setDateStripList] = useState<any[]>([]);

  useEffect(() => {
    //populate the data
    populateDaysInMonth();
  }, []);

  const populateDaysInMonth = () => {
    let today = moment();
    var arrDays: any = [];

    let previousDay = today.subtract(1, 'days');

    for (let day = 0; day <= 30; day++) {
      //generate strips ; strips will be equal to number of days;add next 30 days
      var newDay = previousDay.add(1, 'days');
      var newDayString = newDay.format('YYYY-MM-DD');

      let siteWiseAvailabilityForTheDay: any[] = [];

      for (let index = 0; index < props.siteList.length; index++) {
        const site = props.siteList[index];
        let isDateFound = false;
        for (let sessionIndex = 0; sessionIndex < site.session_dates.length; sessionIndex++) {
          const sessionItem = site.session_dates[sessionIndex];
          if (sessionItem.date == newDayString) {
            isDateFound = true;
            if (sessionItem.available === true) {
              siteWiseAvailabilityForTheDay.push({
                availableState: AVAILABILTY.UNSELECTED,
                site: site,
                date: newDayString,
              });
            } else {
              siteWiseAvailabilityForTheDay.push({
                availableState: AVAILABILTY.FILLED,
                site: site,
                date: newDayString,
              });
            }
          }
        }

        if (isDateFound) {
          //no need to do anything
        } else {
          siteWiseAvailabilityForTheDay.push({
            availableState: AVAILABILTY.NA,
            site: site,
            date: newDayString,
          });
        }
      }

      arrDays.push({
        date: newDay.date(),
        month: today.format('MMM'),
        avialability: siteWiseAvailabilityForTheDay,
      });
    }

    setDateStripList(arrDays);
  };

  useEffect(() => {
    if (currentStripIndex >= 0 && dateStripList.length > 0) {
      flatListRef.current! &&
        flatListRef.current!.scrollToIndex({
          index: currentStripIndex,
          animated: true,
        });
    }
  }, [currentStripIndex]);

  const renderHospitalSiteItem = (item: any, index: number) => {
    return (
      <View style={[styles.siteHospitalNameLocalityContainer, { height: 50 }]}>
        <Text style={styles.siteHospitalName}>{item.name}</Text>
        <Text style={styles.siteHopitalLocality}>{item.city}</Text>
      </View>
    );
  };

  const renderSitesWithDateVerticalStrip = (item: any, index: number) => {
    return (
      <View
        style={{
          width: 53,
          flexDirection: 'column',
        }}
      >
        <Text style={styles.calendarDayTitle}>
          {item.date} {'\n'} {item.month}
        </Text>

        {item?.avialability?.map((availabilityInfo: any, indexAvail: number) => (
          <View style={{ height: 50 }}>
            {availabilityInfo.availableState == AVAILABILTY.FILLED ||
            availabilityInfo.availableState == AVAILABILTY.NA ? (
              <View style={{}}>
                <Text style={styles.filledNATitle}>{availabilityInfo.availableState}</Text>
              </View>
            ) : null}

            {availabilityInfo.availableState == AVAILABILTY.UNSELECTED ? (
              <TouchableOpacity
                style={styles.siteRadioContainer}
                onPress={() => {
                  let stripDataClone = [...dateStripList];
                  stripDataClone = resetAvaiabilityState(stripDataClone);
                  stripDataClone[index].avialability[indexAvail].availableState =
                    AVAILABILTY.SELECTED;
                  setDateStripList(stripDataClone);

                  props.onSiteResourceIdSelected(availabilityInfo.site.id);
                  props.onDateSelected(availabilityInfo.date);
                  props.onHospitalSiteSelected(availabilityInfo.site.name);
                }}
              >
                <RadioButtonUnselectedIcon style={{ width: 18, height: 18 }} />
              </TouchableOpacity>
            ) : null}

            {availabilityInfo.availableState == AVAILABILTY.SELECTED ? (
              <TouchableOpacity
                style={styles.siteRadioContainer}
                onPress={() => {
                  availabilityInfo.availableState = AVAILABILTY.UNSELECTED;
                }}
              >
                <RadioButtonIcon style={{ width: 18, height: 18 }} />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  const resetAvaiabilityState = (dataMatrix: any) => {
    //reset all other checboxes
    dataMatrix?.forEach((strip: any) => {
      for (let index = 0; index < strip?.avialability?.length; index++) {
        if (strip.avialability[index].availableState == AVAILABILTY.SELECTED) {
          strip.avialability[index].availableState = AVAILABILTY.UNSELECTED;
        }
      }
    });

    return dataMatrix;
  };

  const renderFilterStrip = () => {
    return props.showFilterStrip ? (
      <View style={{ marginVertical: 16, flexDirection: 'row' }}>
        <TouchableOpacity
          style={{ flexDirection: 'row' }}
          onPress={() => {
            props.onRetailChanged(false);
          }}
        >
          {props.isRetail ? (
            <RadioButtonUnselectedIcon style={{ width: 18, height: 18 }} />
          ) : (
            <RadioButtonIcon style={{ width: 18, height: 18 }} />
          )}
          <Text style={{ ...theme.viewStyles.text('M', 12, '#02475B'), marginLeft: 6 }}>
            Corporate Sponsored
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flexDirection: 'row', marginLeft: 12 }}
          onPress={() => {
            props.onRetailChanged(true);
          }}
        >
          {props.isRetail ? (
            <RadioButtonIcon style={{ width: 18, height: 18 }} />
          ) : (
            <RadioButtonUnselectedIcon style={{ width: 18, height: 18 }} />
          )}

          <Text style={{ ...theme.viewStyles.text('M', 12, '#02475B'), marginLeft: 6 }}>
            Pay By Self
          </Text>
        </TouchableOpacity>
      </View>
    ) : null;
  };

  return (
    <View style={styles.renderSiteAndDateSelectorContainer}>
      <Text style={styles.hospitalTitle}>{string.vaccineBooking.select_a_hospital_clininc}</Text>

      {/* render filter strip  */}
      {renderFilterStrip()}

      <ScrollView nestedScrollEnabled={true}>
        <View style={{ backgroundColor: '#fff', flex: 1, flexDirection: 'row' }}>
          <View
            style={{
              backgroundColor: '#fff',
              flex: 2,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (currentStripIndex < 3) {
                  setCurrentStripIndex(0);
                } else {
                  setCurrentStripIndex(currentStripIndex - 3);
                }
              }}
            >
              <ArrowLeft style={styles.arrowLeft} />
            </TouchableOpacity>
            <View style={[styles.divider, { marginTop: 17, marginRight: -100, width: '270%' }]} />

            <FlatList
              style={{ marginTop: 8 }}
              data={props.siteList}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => renderHospitalSiteItem(item, index)}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <View style={{ flex: 3 }}>
            <FlatList
              ref={(ref) => (flatListRef.current = ref)}
              horizontal
              data={dateStripList}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => renderSitesWithDateVerticalStrip(item, index)}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              if (currentStripIndex > dateStripList.length - 3) {
                setCurrentStripIndex(dateStripList.length - 1);
              } else {
                setCurrentStripIndex(currentStripIndex + 3);
              }
            }}
          >
            <ArrowRight style={styles.arrowRight} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {props.siteList == undefined || props.siteList.length == 0 ? (
        <Text style={{ ...theme.viewStyles.text('R', 11, '#890000') }}>
          No site available for this criteria{' '}
        </Text>
      ) : null}
    </View>
  );
};
