import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface CollapseViewProps {
  Heading: string;
  ChildComponent: any;
  isDown: boolean;
  isViewDownload?: boolean;
}

export const CollapseView: React.FC<CollapseViewProps> = (props) => {
  const { Heading, ChildComponent, isDown, isViewDownload } = props;
  const [dropDown, setdropDown] = useState<boolean>(isDown);

  const renderHeader = () => {
    return (
      <TouchableOpacity
        style={{ ...styles.header, borderBottomWidth: dropDown || isViewDownload ? 0 : 1 }}
        onPress={() => setdropDown(!dropDown)}
      >
        <Text style={styles.heading}>
          {Heading}
          {isViewDownload && <Text style={styles.isView}>{'  ' + string.common.viewDownload}</Text>}
        </Text>
        <ArrowRight style={{ transform: [{ rotate: dropDown ? '270deg' : '90deg' }] }} />
      </TouchableOpacity>
    );
  };

  const renderChildComponent = () => {
    return dropDown ? <View>{ChildComponent}</View> : null;
  };
  return (
    <View>
      {renderHeader()}
      {renderChildComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    flexDirection: 'row',
    paddingBottom: 10,
    marginTop: 20,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  heading: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#01475B',
  },
  isView: { ...theme.fonts.IBMPlexSansRegular(11) },
});
