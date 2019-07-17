import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

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
  },
  textStyle: {
    color: 'rgba(2, 71, 91, 0.5)',
    ...theme.fonts.IBMPlexSansMedium(16),
    paddingTop: 18,
    paddingBottom: 14,
  },
});

export interface TabsComponentProps extends NavigationScreenProps {
  data: string[];
  selectedTab: string;
  onChange: (selectedTab: string) => any;
  style?: StyleProp<ViewStyle>;
  showIcons?: boolean;
}

export const TabsComponent: React.FC<TabsComponentProps> = (props) => {
  const renderTabs = () => {
    return props.data.map((item, index) => {
      const title = props.showIcons ? item.title : item;
      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.tabView,
            props.selectedTab === title ? { borderBottomColor: theme.colors.APP_GREEN } : {},
          ]}
          onPress={() => props.onChange(title)}
        >
          {props.showIcons ? (
            <View
              style={{
                paddingTop: 18,
                paddingBottom: 10,
              }}
            >
              {props.selectedTab === title ? item.selectedIcon : item.unselectedIcon}
            </View>
          ) : (
            <Text
              style={[
                styles.textStyle,
                props.selectedTab === title ? { color: theme.colors.LIGHT_BLUE } : {},
              ]}
            >
              {title}
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
