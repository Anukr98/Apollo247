import {
  BlackGridViewIcon,
  BlackListViewIcon,
  WhiteGridViewIcon,
  WhiteListViewIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  filterAndListViewStyle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginRight: 5,
    marginTop: 0,
  },
  filterByViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#02475b',
    transform: [{ rotate: '180deg' }],
    marginLeft: 3,
    marginTop: 4,
  },
  filterByTextStyle: {
    ...theme.viewStyles.text('M', 12, '#02475b'),
  },
  listViewMainStyle: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#02475b',
    borderRadius: 3,
    marginLeft: 8,
  },
  listViewIconViewStyle: {
    paddingLeft: 6,
    paddingTop: 6,
    paddingBottom: 5,
    paddingRight: 5,
  },
  gridViewIconViewStyle: {
    paddingHorizontal: 7,
    paddingTop: 5,
    paddingBottom: 4,
  },
  listViewIconStyle: { width: 14, height: 9 },
  gridViewIconStyle: { width: 11, height: 11 },
});

export interface FilterAndListViewComponentProps {
  showListView: boolean;
  onPressFilter: () => void;
  onPressListView: () => void;
  onPressGridView: () => void;
  showFilterByView: boolean;
}

export const FilterAndListViewComponent: React.FC<FilterAndListViewComponentProps> = (props) => {
  return (
    <View
      style={[
        styles.filterAndListViewStyle,
        {
          marginRight: props.showListView ? 20 : 5,
          alignSelf: 'flex-end',
          marginTop: props.showFilterByView ? 0 : 5,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={props.onPressFilter}
        style={styles.filterByViewStyle}
      >
        <Text style={styles.filterByTextStyle}>{'Filter by'}</Text>
        <View style={styles.triangle} />
      </TouchableOpacity>
      <View style={styles.listViewMainStyle}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={props.onPressListView}
          style={[
            styles.listViewIconViewStyle,
            props.showListView && { backgroundColor: '#02475b' },
          ]}
        >
          {props.showListView ? (
            <WhiteListViewIcon style={styles.listViewIconStyle} />
          ) : (
            <BlackListViewIcon style={styles.listViewIconStyle} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          onPress={props.onPressGridView}
          style={[
            styles.gridViewIconViewStyle,
            !props.showListView && { backgroundColor: '#02475b' },
          ]}
        >
          {props.showListView ? (
            <BlackGridViewIcon style={styles.gridViewIconStyle} />
          ) : (
            <WhiteGridViewIcon style={styles.gridViewIconStyle} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
