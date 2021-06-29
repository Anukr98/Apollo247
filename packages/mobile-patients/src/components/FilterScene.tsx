import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CalendarClose, CalendarShow, Reload } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  Modal,
  SectionList,
  TextInput,
} from 'react-native';
import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { CalendarView } from '@aph/mobile-patients/src/components/ui/CalendarView';
import moment from 'moment';
import {
  CheckUnselectedIcon,
  CheckedIcon,
  CloseCal,
  SearchIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

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
  applyFilterButton: {
    flex: 1,
    marginHorizontal: 40,
    marginTop: 15,
  },
  cardContainer: {
    padding: 20,
    paddingBottom: 0,
    marginVertical: 4,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    backgroundColor: '#f7f8f5',
  },
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
  },
  leftText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  rightText: {
    color: theme.colors.APP_YELLOW,
    ...theme.fonts.IBMPlexSansSemiBold(13),
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '96%',
    paddingBottom: 20,
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 11,
    backgroundColor: theme.colors.WHITE,
  },
  brandStyle: {
    width: '46%',
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    marginHorizontal: 4,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
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
  //start
  content: {
    flexDirection: 'row',
  },
  sectionHeaderStyles: {
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 10,
    marginVertical: 5,
  },
  checkboxViewStyle: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  checkboxTextStyle: {
    ...theme.viewStyles.text('M', 15, '#02475b'),
    marginLeft: 9,
  },
  searchInputStyles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // menu Column - left
  menuColumn: {
    width: '33%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.CARD_BG,
  },
  menuItem: {
    paddingVertical: 21,
    paddingRight: 12,
    paddingLeft: 30,
    justifyContent: 'space-between',
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

  // settings column -right
  settingsColumn: {
    flex: 1,
    padding: 15,
  },
  settingsView: {
    justifyContent: 'center',
    backgroundColor: theme.colors.WHITE,
  },
  selectedMenuItemText: {
    ...theme.viewStyles.text('M', 14, theme.colors.BONDI_BLUE),
  },
  availabilityTextStyle: {
    ...theme.viewStyles.text('M', 15, '#02475b'),
  },
  //end
});

export interface FilterSceneProps {
  onClickClose: (arg0: filterDataType[]) => void;
  data: filterDataType[];
  setData: (arg0: filterDataType[]) => void;
  filterLength: () => void;
}
export const FilterScene: React.FC<FilterSceneProps> = (props) => {
  const [data, setData] = useState<filterDataType[]>(props.data);
  const [showCalander, setshowCalander] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<Date>(new Date());

  const renderItem = (item: any, id: number) => (
    <TouchableOpacity
      onPress={() => {
        let selectedData = [...data][id]['selectedOptions'] || [];
        const dataCopy = [...data];
        if (selectedData.includes(item)) {
          selectedData = selectedData.filter((item1: string) => item1 !== item);
        } else {
          selectedData.push(item);
        }
        dataCopy[id] = {
          ...dataCopy[id],
          selectedOptions: selectedData,
        };
        setData(dataCopy);
      }}
      activeOpacity={1}
      style={styles.checkboxViewStyle}
    >
      {[...data][id]['selectedOptions'].includes(item) ? <CheckedIcon /> : <CheckUnselectedIcon />}
      <Text style={styles.checkboxTextStyle}>{item}</Text>
    </TouchableOpacity>
  );

  const searchedData = (sectionsData: any, searchTerm = '') => {
    const finalData = sectionsData.reduce((result, sectionData) => {
      const { state, data } = sectionData;

      const filteredData = data.filter((item: any) => {
        let searchDataItem = state;
        searchDataItem = ''
          ? ''.split('.').reduce((prevVal, currVal) => prevVal[currVal], item)
          : item;
        return searchDataItem.toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (filteredData.length !== 0) {
        result.push({
          state,
          data: filteredData,
        });
      }

      return result;
    }, []);
    return finalData;
  };
  const renderCities = (id: number) => {
    const sectionInfo = data[id];
    const { options } = sectionInfo;
    return (
      <>
        <View style={styles.searchInputStyles}>
          <SearchIcon />
          <TextInput
            style={{ marginLeft: 14 }}
            placeholder={'Search'}
            onChangeText={(searchTerm) => {
              setSearchTerm(searchTerm);
            }}
          />
        </View>
        <SectionList
          sections={searchedData(options, searchTerm)}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => renderItem(item, id)}
          renderSectionHeader={({ section: { state } }) => (
            <View style={styles.sectionHeaderStyles}>
              <Text style={{ ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE) }}>
                {state}
              </Text>
            </View>
          )}
        />
      </>
    );
  };
  //TODO: Get brand image from data
  const renderBrands = (id: number) => {
    const sectionData = data[id];
    const { options, selectedOptions } = sectionData;
    return (
      <View style={[styles.optionsView]}>
        {selectedOptions &&
          options &&
          options.length > 0 &&
          options.map((option: any, index: any) => (
            <Button
              title={option.brandName!.replace(
                /\w+/g,
                (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()
              )}
              style={[
                styles.buttonStyle,
                selectedOptions.includes(option.name)
                  ? { backgroundColor: theme.colors.APP_GREEN }
                  : null,
              ]}
              titleTextStyle={[
                styles.buttonTextStyle,
                selectedOptions.includes(option.name) ? { color: theme.colors.WHITE } : null,
              ]}
              onPress={() => {
                let selectedData = [...data][id]['selectedOptions'] || [];
                const dataCopy = [...data];

                if (selectedData.includes(option.name)) {
                  selectedData = selectedData.filter((item: string) => item !== option.name);
                } else {
                  selectedData.push(option.name);
                }
                dataCopy[id] = {
                  ...dataCopy[id],
                  selectedOptions: selectedData,
                };
                setData(dataCopy);
              }}
            />
          ))}
      </View>
    );
  };

  const [menuItems, setMenuItems] = useState([
    { id: '0', name: 'City' },
    { id: '1', name: 'Brands' },
    { id: '2', name: 'Experience' },
    { id: '3', name: 'Availability' },
    { id: '4', name: 'Fees' },
    { id: '5', name: 'Gender' },
    { id: '6', name: 'Language' },
  ]);
  const renderFilterSection = (id: number) => {
    const sectionData = data[id];
    const { label, options, selectedOptions } = sectionData;
    const ifAvailability = selectedOptions && id === 3;
    return (
      <>
        {label.length ? (
          label === 'Availability' ? null : (
            <View style={styles.settingsView}>
              <Text style={styles.leftText}>{label}</Text>
            </View>
          )
        ) : null}
        <View style={[styles.optionsView]}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showCalander}
            onRequestClose={() => {
              setshowCalander(false);
            }}
            onDismiss={() => {
              setshowCalander(false);
            }}
          >
            <View style={styles.calendarMainView}>
              <View
                style={{
                  width: '97.4%',
                  height: 42,
                  backgroundColor: theme.colors.CARD_BG,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                }}
              >
                <View>
                  <Text style={styles.availabilityTextStyle}>Availability</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setshowCalander(false);
                  }}
                >
                  <CloseCal
                    style={{
                      width: 28,
                      height: 28,
                    }}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  borderBottomWidth: 0.1,
                  borderBottomColor: 'rgba(2, 71, 91, 0.3)',
                }}
              />
              <CalendarView
                styles={styles.calendarStyle}
                date={date}
                minDate={new Date()}
                onPressDate={(date) => {
                  const selectedDate = moment(date).format('YYYY-MM-DD');
                  const selectedData = [...data][3]['selectedOptions'] || [];
                  const dataCopy = [...data];
                  selectedData.push(selectedDate);
                  dataCopy[3] = {
                    ...dataCopy[3],
                    selectedOptions: selectedData,
                  };

                  setData(dataCopy);

                  setDate(date);
                  setshowCalander(false);
                }}
                showWeekView={false}
              />
            </View>
          </Modal>
          {selectedOptions &&
            options &&
            options.length > 0 &&
            options.map((name, index) => (
              <Button
                title={name.replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())}
                style={[
                  styles.buttonStyle,
                  selectedOptions.includes(name)
                    ? { backgroundColor: theme.colors.APP_GREEN }
                    : null,
                  label === 'Availability' && id === 3 ? { marginRight: 10 } : null,
                ]}
                titleTextStyle={[
                  styles.buttonTextStyle,
                  selectedOptions.includes(name) ? { color: theme.colors.WHITE } : null,
                ]}
                onPress={() => {
                  let selectedData = [...data][id]['selectedOptions'] || [];
                  const dataCopy = [...data];

                  if (selectedData.includes(name)) {
                    selectedData = selectedData.filter((item: string) => item !== name);
                  } else {
                    selectedData.push(name);
                  }

                  dataCopy[id] = {
                    ...dataCopy[id],
                    label: menuItems[id].name,
                    selectedOptions: selectedData,
                  };
                  setData(dataCopy);
                }}
              />
            ))}
          {ifAvailability &&
            data[3].selectedOptions.map((name, index) =>
              moment(name)! && moment(name).format('D MMM YYYY') === 'Invalid date' ? null : (
                <Button
                  title={moment(name).format('D MMM YYYY')}
                  style={[
                    styles.buttonStyle,
                    selectedOptions.includes(name)
                      ? { backgroundColor: theme.colors.APP_GREEN }
                      : null,
                    label === 'Availability' && id === 3 ? { marginRight: 10 } : null,
                  ]}
                  titleTextStyle={[
                    styles.buttonTextStyle,
                    selectedOptions.includes(name) ? { color: theme.colors.WHITE } : null,
                  ]}
                  onPress={() => {
                    let selectedData = [...data][id]['selectedOptions'] || [];
                    const dataCopy = [...data];

                    if (selectedData.includes(name)) {
                      selectedData = selectedData.filter((item: string) => item !== name);
                    } else {
                      selectedData.push(name);
                    }
                    dataCopy[id] = {
                      ...dataCopy[id],
                      selectedOptions: selectedData,
                    };
                    setData(dataCopy);
                  }}
                />
              )
            )}
          {label === 'Availability' ? (
            <TouchableOpacity
              style={{ position: 'absolute', right: 10, top: 15 }}
              activeOpacity={1}
              onPress={() => {
                setshowCalander(!showCalander);
                const selectedData: string[] = [];
                const dataCopy = [...data];
                dataCopy[3] = {
                  ...dataCopy[3],
                  selectedOptions: selectedData,
                };
                setData(dataCopy);
              }}
            >
              {showCalander ? <CalendarClose /> : <CalendarShow />}
            </TouchableOpacity>
          ) : null}
        </View>
      </>
    );
  };
  const renderSelectedView = (selectedItem: string) => {
    switch (selectedItem) {
      case '0':
        return renderCities(0);
      case '1':
        return renderBrands(1);
      case '2':
        return renderFilterSection(2);
      case '3':
        return renderFilterSection(3);
      case '4':
        return renderFilterSection(4);
      case '5':
        return renderFilterSection(5);
      case '6':
        return renderFilterSection(6);
      default:
        return renderFilterSection(0);
    }
  };
  // this holds the keys of the menuItems for the view to know which category is currently being rendered.
  const [selectedItem, setSelectedItem] = useState('0');
  const filtersCard = () => {
    return (
      <View style={styles.content}>
        <View style={styles.menuColumn}>
          {menuItems.map((item, index) => {
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedItem(item.id)}
                style={[styles.menuItem, item.id === selectedItem ? styles.selectedMenuItem : null]}
              >
                <Text
                  style={[
                    item.id === selectedItem ? styles.selectedMenuItemText : styles.menuItemText,
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    marginLeft: 10,
                    ...theme.viewStyles.text('M', 13, theme.colors.APP_GREEN),
                  }}
                >
                  {data[index].selectedOptions.length === 0
                    ? null
                    : data[index].selectedOptions.length}
                </Text>
              </TouchableOpacity>
            );
          })}
          <View
            style={{ display: 'flex', backgroundColor: theme.colors.CARD_BG, height: '100%' }}
          />
        </View>
        <View style={styles.settingsColumn}>
          {/* Option 1: AGE */}
          {renderSelectedView(selectedItem)}
        </View>
      </View>
    );
  };

  const closePop = () => {
    const filterData = data.map((obj) => {
      if (obj) obj.selectedOptions = [];
      return obj;
    });
    setData(filterData);
    props.setData(filterData);
    props.onClickClose(data);
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
              const filterData = data.map((obj) => {
                if (obj) obj.selectedOptions = [];
                return obj;
              });
              setData(filterData);
              props.setData(filterData);
            }}
          >
            <Reload />
          </TouchableOpacity>
        }
        onPressLeftIcon={() => closePop()}
      />
    );
  };

  const bottomButton = () => {
    let length = 0;
    data.forEach((item) => {
      if (item.selectedOptions) length += item.selectedOptions.length;
    });
    if (length == 0) {
      props.filterLength();
    }
    return (
      <StickyBottomComponent
        style={{ backgroundColor: theme.colors.WHITE, elevation: 20, height: '12%' }}
      >
        <Button
          title={'APPLY FILTERS'}
          style={styles.applyFilterButton}
          onPress={() => {
            props.setData(data);
            props.onClickClose(data);
          }}
          disabled={length > 0 ? false : true}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderTopView()}
      <ScrollView style={{ flex: 1 }} bounces={false}>
        {filtersCard()}
        <View style={{ height: 160 }} />
      </ScrollView>
      {bottomButton()}
    </SafeAreaView>
  );
};
