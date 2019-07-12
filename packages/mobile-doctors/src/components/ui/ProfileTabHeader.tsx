import { theme } from 'app/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-elements';
import { ifIphoneX } from 'react-native-iphone-x-helper';
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  titleStyle: {
    // ...theme.fonts.IBMPlexSansRegular(28), => Error Unrecognised font family
    ...theme.fonts.IBMPlexSansSemiBold(28),
    fontWeight: '600',
    color: '#02475b',
    marginHorizontal: 20,
    paddingTop: 8,
  },
  descriptionStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    color: '#0087ba',
    marginHorizontal: 20,
    paddingBottom: 20,
  },
  tabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    shadowOffset: {
      height: 10,
      width: 0,
    },
    shadowColor: '#808080',
    shadowRadius: 5,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  tabViewStyle: {
    flex: 1,
    alignItems: 'center',
  },
  tabViewActiveStyle: {
    width: '100%',
    backgroundColor: '#0087ba',
    height: 3,
  },
  tabTitleStyle: {
    paddingTop: 21,
    paddingBottom: 20,
    textAlign: 'center',
  },
  tabTitleActiveStyle: {
    ...theme.fonts.IBMPlexSansBold(16),
    letterSpacing: 0.11,
    color: '#02475b',
  },
  tabTitleDoneStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.11,
    color: '#02475b',
  },
  tabTitlePendingStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.11,
    color: '#02475b',
    opacity: 0.4,
  },
  statusBarline: {
    width: '100%',
    backgroundColor: '#f0f4f5',
    opacity: 0.5,
    ...ifIphoneX(
      {
        height: 2,
      },
      {
        height: 2.5,
      }
    ),
  },
});

export interface ProfileTabHeaderProps {
  containerStyle?: StyleProp<ViewStyle>;
  title?: string;
  description?: string;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  tabs?: string[];
  activeTabIndex: number;
}

export const ProfileTabHeader: React.FC<ProfileTabHeaderProps> = (props) => {
  const {
    containerStyle,
    title,
    description,
    titleStyle,
    descriptionStyle,
    tabs,
    activeTabIndex,
  } = props;

  return (
    <View style={[styles.container, containerStyle]}>
      <View>
        {title && <Text style={[styles.titleStyle, titleStyle]}>{title}</Text>}
        {description && (
          <Text style={[styles.descriptionStyle, descriptionStyle]}>{description}</Text>
        )}
      </View>
      <View style={styles.statusBarline}></View>
      <View style={styles.tabContainer}>
        {tabs &&
          tabs.map((tab, i) => {
            const tabTextStyle =
              activeTabIndex == i
                ? styles.tabTitleActiveStyle
                : activeTabIndex < i
                ? styles.tabTitlePendingStyle
                : styles.tabTitleDoneStyle;
            return (
              <View key={i} style={[styles.tabViewStyle]}>
                <Text style={[styles.tabTitleStyle, tabTextStyle]}>{tab}</Text>
                <View style={activeTabIndex >= i ? styles.tabViewActiveStyle : {}} />
              </View>
            );
          })}
      </View>
    </View>
  );
};
