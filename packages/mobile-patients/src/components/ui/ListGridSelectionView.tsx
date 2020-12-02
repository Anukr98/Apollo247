import {
  BlackGridViewIcon,
  BlackListViewIcon,
  WhiteGridViewIcon,
  WhiteListViewIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export interface Props {
  isListView: boolean;
  onPressListView: () => void;
  onPressGridView: () => void;
}

export const ListGridSelectionView: React.FC<Props> = ({
  isListView,
  onPressListView,
  onPressGridView,
}) => {
  return (
    <View style={styles.filterAndListViewStyle}>
      <View style={styles.listViewMainStyle}>
        <TouchableOpacity
          onPress={onPressListView}
          style={[styles.listViewIconViewStyle, isListView && { backgroundColor: COLOR }]}
        >
          {isListView ? (
            <WhiteListViewIcon style={styles.listViewIconStyle} />
          ) : (
            <BlackListViewIcon style={styles.listViewIconStyle} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressGridView}
          style={[styles.gridViewIconViewStyle, , !isListView && { backgroundColor: COLOR }]}
        >
          {isListView ? (
            <BlackGridViewIcon style={styles.gridViewIconStyle} />
          ) : (
            <WhiteGridViewIcon style={styles.gridViewIconStyle} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const COLOR = '#02475b';
const styles = StyleSheet.create({
  filterAndListViewStyle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginRight: 5,
    marginTop: 0,
  },
  listViewMainStyle: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: COLOR,
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
