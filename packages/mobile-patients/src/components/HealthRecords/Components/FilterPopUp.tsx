import { CheckIcon, UnCheckIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { filter } from 'lodash';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  subContainer: {
    flexDirection: 'column',
    left: 30,
    padding: 10,
  },
  commonBtnView: {
    ...theme.viewStyles.text('R', 18, '#01475B', 1),
  },
  contentContainerStyle: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  overlayContainerStyle: {
    marginBottom: 20,
  },
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
  },
  mainContainer: {
    alignSelf: 'flex-start',
    justifyContent: 'space-around',
    padding: 10,
    left: 20,
    flexDirection: 'row',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerView: {
    ...theme.viewStyles.text('SB', 20, '#01475B', 1),
    left: 10,
  },
  horizontalLine: {
    borderWidth: 0.5,
    borderBottomColor: 'grey',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    padding: 10,
  },
  filterTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignSelf: 'center',
    width: '100%',
    marginTop: 20,
  },
  stickyBottomComponentStyle: {
    justifyContent: 'space-around',
    marginTop: Dimensions.get('screen').height - 500,
    position: 'relative',
    flexDirection: 'row',
  },
});

export interface FilterPopUpProps {
  isVisible: boolean;
  onClickClose: () => void;
  onApplyFilter: (
    digitalizationDecider: string,
    filterDocument: string,
    filterCall: boolean
  ) => void;
}

export const FilterPopUp: React.FC<FilterPopUpProps> = (props) => {
  const [selectType, showSelectType] = useState<boolean>(false);
  const [selectCategory, showSelectCategory] = useState<boolean>(false);
  const [digitalize, setDigitalize] = useState<boolean>(false);
  const [nonDigitalize, setNonDigitalize] = useState<boolean>(false);
  const [source, setSource] = useState<boolean>(false);

  const [checkTestReport, setCheckTestReport] = useState<boolean>(false);
  const [checkPrescription, setCheckPrescription] = useState<boolean>(false);
  const [checkBills, setCheckBills] = useState<boolean>(false);
  const [checkInsurance, setCheckInsurance] = useState<boolean>(false);
  const [checkHospitalization, setCheckHospitalization] = useState<boolean>(false);

  const renderVerticalLine = () => {
    return (
      <View
        style={{
          borderWidth: 0.3,
          borderColor: 'grey',
          margin: 2,
          bottom: 10,
        }}
      />
    );
  };

  useEffect(() => {
    if (!!source || !!selectType) {
      showSelectCategory(false);
    } else {
      showSelectType(true);
    }
  }, [source, selectType]);

  const renderCategory = () => {
    return (
      <View style={{ justifyContent: 'space-around', height: 70 }}>
        <TouchableOpacity
          onPress={() => {
            setDigitalize(!digitalize);
          }}
          style={{ flexDirection: 'row' }}
        >
          {!!digitalize ? <CheckIcon /> : <UnCheckIcon />}
          <Text
            style={{
              ...theme.viewStyles.text(!!digitalize ? 'SB' : 'R', 14, '#02475B', 1),
              left: 7,
            }}
          >
            {'Digitalized'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setNonDigitalize(!nonDigitalize);
          }}
          style={{ flexDirection: 'row' }}
        >
          {!!nonDigitalize ? <CheckIcon /> : <UnCheckIcon />}
          <Text
            style={{
              ...theme.viewStyles.text(!!nonDigitalize ? 'SB' : 'R', 14, '#02475B', 1),
              left: 7,
            }}
          >
            {'Non-Digitalized'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const onClickApplyFilter = () => {
    let filterType;
    if (
      !!checkHospitalization ||
      !!checkPrescription ||
      !!checkTestReport ||
      !!checkInsurance ||
      !!checkBills
    ) {
      filterType = !!checkTestReport
        ? 'LabTest'
        : !!checkPrescription
        ? 'Prescription'
        : !!checkHospitalization
        ? 'Hospitalization'
        : !!checkInsurance
        ? 'Insurance'
        : !!checkBills
        ? 'Bill'
        : '';
    }
    props.onClickClose();
    props.onApplyFilter(filterType || '', 'filter', filterType ? true : false);
  };

  const renderTypeOfDocument = () => {
    return (
      <View style={{ justifyContent: 'space-around', marginTop: 30 }}>
        <TouchableOpacity
          onPress={() => {
            setCheckPrescription(!checkPrescription);
            setCheckTestReport(false);
            setCheckHospitalization(false);
            setCheckBills(false);
            setCheckInsurance(false);
          }}
          style={{ flexDirection: 'row', marginBottom: 15 }}
        >
          {!!checkPrescription ? <CheckIcon /> : <UnCheckIcon />}
          <Text
            style={{
              ...theme.viewStyles.text(!!checkPrescription ? 'SB' : 'R', 14, '#02475B', 1),
              left: 7,
            }}
          >
            {'Prescription'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCheckTestReport(!checkTestReport);
            setCheckPrescription(false);
            setCheckHospitalization(false);
            setCheckBills(false);
            setCheckInsurance(false);
          }}
          style={{ flexDirection: 'row', marginBottom: 15 }}
        >
          {!!checkTestReport ? <CheckIcon /> : <UnCheckIcon />}
          <Text
            style={{
              ...theme.viewStyles.text(!!checkTestReport ? 'SB' : 'R', 14, '#02475B', 1),
              left: 7,
            }}
          >
            {'Test Report'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCheckHospitalization(!checkHospitalization);
            setCheckPrescription(false);
            setCheckTestReport(false);
            setCheckBills(false);
            setCheckInsurance(false);
          }}
          style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 }}
        >
          {!!checkHospitalization ? <CheckIcon /> : <UnCheckIcon />}
          <Text
            style={{
              ...theme.viewStyles.text(!!checkHospitalization ? 'SB' : 'R', 14, '#02475B', 1),
              left: 7,
            }}
          >
            {'Hospitalization'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCheckBills(!checkBills);
            setCheckPrescription(false);
            setCheckTestReport(false);
            setCheckHospitalization(false);
            setCheckInsurance(false);
          }}
          style={{
            flexDirection: 'row',
            marginBottom: 15,
          }}
        >
          {!!checkBills ? <CheckIcon /> : <UnCheckIcon />}
          <Text
            style={{
              ...theme.viewStyles.text(!!checkBills ? 'SB' : 'R', 14, '#02475B', 1),
              left: 7,
            }}
          >
            {'Bills'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCheckInsurance(!checkInsurance);
            setCheckPrescription(false);
            setCheckTestReport(false);
            setCheckHospitalization(false);
            setCheckBills(false);
          }}
          style={{ flexDirection: 'row', marginBottom: 0 }}
        >
          {!!checkInsurance ? <CheckIcon /> : <UnCheckIcon />}
          <Text
            style={{
              ...theme.viewStyles.text(!!checkInsurance ? 'SB' : 'R', 14, '#02475B', 1),
              left: 7,
            }}
          >
            {'Insurance'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const clearAllFilter = () => {
    setCheckBills(false);
    setCheckPrescription(false);
    setCheckTestReport(false);
    setCheckHospitalization(false);
    setCheckInsurance(false);
    setDigitalize(false);
    setNonDigitalize(false);
  };

  const renderFilterItems = () => {
    return (
      <View>
        <View style={styles.filterTitle}>
          <Text style={styles.headerView}>{'Filters'}</Text>
          <TouchableOpacity
            onPress={() => {
              clearAllFilter();
            }}
          >
            <Text style={{ ...theme.viewStyles.text('R', 13, '#E50000', 1), marginTop: 5 }}>
              {'CLEAR ALL'}
            </Text>
          </TouchableOpacity>
        </View>
        {renderVerticalLine()}
        <View style={styles.mainContainer}>
          <View
            style={{
              flexDirection: 'column',
            }}
          >
            {/* <TouchableOpacity
              onPress={() => {
                showSelectCategory(true);
                showSelectType(false);
                setSource(false);
              }}
              style={styles.horizontalLine}
            >
              <Text
                style={{
                  ...theme.viewStyles.text(
                    !!selectCategory ? 'SB' : 'R',
                    18,
                    !!selectCategory ? '#01475B' : 'grey',
                    1
                  ),
                  marginTop: 10,
                }}
              >
                {'Category'}
              </Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => {
                showSelectCategory(false);
                showSelectType(true);
                setSource(false);
              }}
              style={styles.horizontalLine}
            >
              <Text
                style={{
                  ...theme.viewStyles.text(
                    !!selectType ? 'SB' : 'R',
                    18,
                    !!selectType ? '#01475B' : 'grey',
                    1
                  ),
                  marginTop: 10,
                }}
              >
                {'Type of Document'}
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => {
                showSelectCategory(false);
                setSource(true);
                showSelectType(false);
              }}
              style={styles.horizontalLine}
            >
              <Text
                style={{
                  ...theme.viewStyles.text(
                    !!source ? 'SB' : 'R',
                    18,
                    !!source ? '#01475B' : 'grey',
                    1
                  ),
                  marginTop: 10,
                }}
              >
                {'Source'}
              </Text>
            </TouchableOpacity> */}
          </View>
          <View style={[styles.subContainer, { top: !!selectType ? 0 : 10 }]}>
            {/* {selectCategory && renderCategory()} */}
            {selectType && renderTypeOfDocument()}
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <Overlay
        onRequestClose={() => props.onClickClose()}
        isVisible={props.isVisible}
        windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
        containerStyle={styles.overlayContainerStyle}
        fullScreen
        transparent
        overlayStyle={styles.overlayStyle}
      >
        <View style={styles.overlayViewStyle1}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            <ScrollView bounces={false}>
              <View style={styles.contentContainerStyle}>
                {renderFilterItems()}
                <View style={styles.stickyBottomComponentStyle}>
                  <TouchableOpacity
                    style={{ marginBottom: 20 }}
                    onPress={() => props.onClickClose()}
                  >
                    <Text style={styles.commonBtnView}>{'CANCEL'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginBottom: 20 }}
                    onPress={() => {
                      onClickApplyFilter();
                    }}
                  >
                    <Text style={[styles.commonBtnView, { color: '#E50000' }]}>{'APPLY'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Overlay>
    </>
  );
};
