import {
  BlackGridViewIcon,
  BlackListViewIcon,
  WhiteGridViewIcon,
  WhiteListViewIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

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

export interface Props {
  isListView: boolean;
  onPressListView: () => void;
  onPressGridView: () => void;
}

export const ListGridSelectionView: React.FC<Props> = (props) => {
  return (
    <View style={[styles.filterAndListViewStyle, { marginRight: props.isListView ? 20 : 5 }]}>
      <View style={styles.listViewMainStyle}>
        <TouchableOpacity
          onPress={props.onPressListView}
          style={[styles.listViewIconViewStyle, props.isListView && { backgroundColor: '#02475b' }]}
        >
          {props.isListView ? (
            <WhiteListViewIcon style={styles.listViewIconStyle} />
          ) : (
            <BlackListViewIcon style={styles.listViewIconStyle} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={props.onPressGridView}
          style={[
            styles.gridViewIconViewStyle,
            !props.isListView && { backgroundColor: '#02475b' },
          ]}
        >
          {props.isListView ? (
            <BlackGridViewIcon style={styles.gridViewIconStyle} />
          ) : (
            <WhiteGridViewIcon style={styles.gridViewIconStyle} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
