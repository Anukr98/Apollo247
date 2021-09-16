import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ScrollView,
  TextStyle,
} from 'react-native';
import { isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  tabContainerView: {
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
  },
  tabView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.CLEAR,
  },
  textStyle: theme.viewStyles.text('M', isIphone5s() ? 14 : 16, 'rgba(2, 71, 91, 0.5)'),
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

interface tabData {
  title: string;
  selectedIcon?: React.ReactNode;
  unselectedIcon?: React.ReactNode;
}
export interface TabsComponentProps {
  data: tabData[];
  selectedTab: string;
  onChange: (title: string) => void;
  style?: StyleProp<ViewStyle>;
  showIcons?: boolean;
  textStyle?: StyleProp<ViewStyle>;
  height?: number;
  scrollable?: boolean;
  tabViewStyle?: StyleProp<ViewStyle>;
  selectedTitleStyle?: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showTitleAndIcons?: boolean;
}

export const TabsComponent: React.FC<TabsComponentProps> = (props) => {
  const [selected, setselectedTab] = useState<string>(props.selectedTab);

  useEffect(() => {
    if (selected !== props.selectedTab) {
      setselectedTab(props.selectedTab);
    }
  }, [props.selectedTab]);

  const renderTabs = () => {
    return props.data.map((item, index) => {
      const isSelected = selected == item.title;
      return (
        <TouchableOpacity
          activeOpacity={1}
          key={index}
          style={[
            styles.tabView,
            isSelected ? { borderBottomColor: theme.colors.APP_GREEN } : {},
            props.height ? { height: props.height } : {},
            props.tabViewStyle,
          ]}
          onPress={() => props.onChange(item.title)}
        >
          {props.showTitleAndIcons ? (
            <View style={styles.row}>
              {isSelected ? item.selectedIcon : null}
              {selected !== item.title ? item.unselectedIcon : null}
              {renderTitle(item, index, 10)}
            </View>
          ) : props.showIcons ? (
            <View
              style={{
                paddingTop: 18,
                paddingBottom: 10,
              }}
            >
              {isSelected ? item.selectedIcon : null}
              {selected !== item.title ? item.unselectedIcon : null}
            </View>
          ) : (
            renderTitle(item, index)
          )}
        </TouchableOpacity>
      );
    });
  };

  const renderTitle = (item: tabData, index: number, marginLeft: number = 0) => {
    const isSelected = selected == item.title;
    return (
      <Text
        style={[
          styles.textStyle,
          isSelected ? { color: theme.colors.LIGHT_BLUE } : {},
          props.textStyle,
          { marginLeft },
          props.scrollable
            ? {
                paddingLeft: index === 0 ? 20 : 15,
                paddingRight: index + 1 === props.data.length ? 20 : 15,
              }
            : {},
          isSelected ? props.selectedTitleStyle : props.titleStyle,
        ]}
      >
        {item.title}
      </Text>
    );
  };

  return (
    <View style={[styles.container, props.style]}>
      {props.scrollable ? (
        <ScrollView
          bounces={false}
          horizontal
          style={{ flexDirection: 'row', width: '100%' }}
          contentContainerStyle={{ alignItems: 'center' }}
          showsHorizontalScrollIndicator={false}
        >
          {renderTabs()}
        </ScrollView>
      ) : (
        <View style={styles.tabContainerView}>{renderTabs()}</View>
      )}
    </View>
  );
};

TabsComponent.defaultProps = {
  tabViewStyle: {},
  scrollable: false,
  selectedTitleStyle: {},
  titleStyle: {},
};
