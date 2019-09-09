import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: 'white',
  },
  tabContainerView: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  tabView: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.CLEAR,
    marginTop: -5,
  },
  textStyle: {
    color: 'rgba(2, 71, 91, 0.5)',
    ...theme.fonts.IBMPlexSansMedium(16),
    paddingTop: 18,
    paddingBottom: 14,
  },
});

export interface TabsComponentProps {
  data: {
    title: string;
    selectedIcon?: React.ReactNode;
    unselectedIcon?: React.ReactNode;
  }[];
  selectedTab: string;
  onChange: (title: string) => void;
  style?: StyleProp<ViewStyle>;
  showIcons?: boolean;
  textStyle?: StyleProp<ViewStyle>;
}

export const TabsComponent: React.FC<TabsComponentProps> = (props) => {
  const [selected, setselectedTab] = useState<string>(props.selectedTab);

  useEffect(() => {
    if (selected !== props.selectedTab) {
      console.log(selected, 'TabsComponent', props.selectedTab);
      setselectedTab(props.selectedTab);
    }
  }, [props.selectedTab]);

  const renderTabs = () => {
    return props.data.map((item, index) => {
      // const title = props.showIcons ? item.title : item;
      return (
        <TouchableOpacity
          activeOpacity={1}
          key={index}
          style={[
            styles.tabView,
            selected === item.title ? { borderBottomColor: theme.colors.APP_GREEN } : {},
          ]}
          onPress={() => props.onChange(item.title)}
        >
          {props.showIcons ? (
            <View
              style={{
                paddingTop: 18,
                paddingBottom: 10,
              }}
            >
              {selected === item.title ? item.selectedIcon : null}
              {selected !== item.title ? item.unselectedIcon : null}
            </View>
          ) : (
            <Text
              style={[
                styles.textStyle,
                selected === item.title ? { color: theme.colors.LIGHT_BLUE } : {},
                props.textStyle,
              ]}
            >
              {item.title}
            </Text>
          )}
        </TouchableOpacity>
      );
    });
  };
  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.tabContainerView}>{renderTabs()}</View>
    </View>
  );
};
