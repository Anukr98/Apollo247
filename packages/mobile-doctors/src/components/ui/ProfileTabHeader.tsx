import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle, Platform } from 'react-native';
import { Text } from 'react-native-elements';
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.WHITE,
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
    marginTop: 4,
  },
  tabContainerShadow: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    borderRadius: 0,
    marginBottom: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
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
  textShadow: {
    ...Platform.select({
      ios: {
        ...theme.viewStyles.whiteRoundedCornerCard,
        borderRadius: 0,
        shadowOpacity: 0.1,
        marginBottom: 2,
      },
      android: { overflow: 'hidden' },
    }),
  },
  statusBarline: {
    width: '100%',
    height: 2,
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
      <View style={[tabs ? styles.textShadow : {}]}>
        {title && <Text style={[styles.titleStyle, titleStyle]}>{title}</Text>}
        {description && (
          <Text style={[styles.descriptionStyle, descriptionStyle]}>{description}</Text>
        )}
      </View>
      {Platform.select({ android: <View style={styles.statusBarline}></View> })}
      <View style={styles.tabContainerShadow}>
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
    </View>
  );
};
