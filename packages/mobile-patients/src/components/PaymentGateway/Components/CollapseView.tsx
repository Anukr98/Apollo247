import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';

export interface CollapseViewProps {
  Heading: string;
  ChildComponent: any;
}

export const CollapseView: React.FC<CollapseViewProps> = (props) => {
  const { Heading, ChildComponent } = props;
  const [dropDown, setdropDown] = useState<boolean>(false);

  const renderHeader = () => {
    return (
      <TouchableOpacity style={styles.header} onPress={() => setdropDown(!dropDown)}>
        <Text style={styles.heading}>{Heading}</Text>
        <ArrowRight style={{ transform: [{ rotate: dropDown ? '90deg' : '270deg' }] }} />
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
    marginBottom: 10,
    marginTop: 20,
  },
  heading: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#01475B',
  },
});
