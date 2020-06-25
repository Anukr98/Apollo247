import React, { useEffect, useState } from 'react';
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ScrollView,
  TextStyle,
} from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import TabsComponentStyles from '@aph/mobile-doctors/src/components/ui/TabsComponent.styles';

const styles = TabsComponentStyles;

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
  showTextIcons?: boolean;
  textStyle?: StyleProp<ViewStyle>;
  height?: number;
  scrollable?: boolean;
  tabViewStyle?: StyleProp<ViewStyle>;
  selectedTitleStyle?: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export const TabsComponent: React.FC<TabsComponentProps> = (props) => {
  const [selected, setselectedTab] = useState<string>(props.selectedTab);

  useEffect(() => {
    if (selected !== props.selectedTab) {
      console.log(selected, 'TabsComponent', props.selectedTab);
      setselectedTab(props.selectedTab);
    }
  }, [props.selectedTab]);
  const renderImage = (
    item: {
      title: string;
      selectedIcon?: React.ReactNode;
      unselectedIcon?: React.ReactNode;
    },
    isSelected: boolean
  ) => {
    return (
      <View
        style={{
          paddingTop: 18,
          paddingBottom: 10,
        }}
      >
        {isSelected ? item.selectedIcon : null}
        {selected !== item.title ? item.unselectedIcon : null}
      </View>
    );
  };
  const renderText = (
    item: {
      title: string;
      selectedIcon?: React.ReactNode;
      unselectedIcon?: React.ReactNode;
    },
    isSelected: boolean,
    index: number,
    hasImage: boolean
  ) => {
    return (
      <Text
        style={[
          styles.textStyle,
          hasImage ? { marginLeft: 14, marginTop: 5 } : {},
          isSelected ? { color: theme.colors.LIGHT_BLUE } : {},
          props.textStyle,
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
          {props.showIcons ? (
            renderImage(item, isSelected)
          ) : props.showTextIcons ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {renderImage(item, isSelected)}
              {renderText(item, isSelected, index, true)}
            </View>
          ) : (
            renderText(item, isSelected, index, false)
          )}
        </TouchableOpacity>
      );
    });
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
