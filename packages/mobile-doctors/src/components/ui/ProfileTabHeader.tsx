import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle, Platform } from 'react-native';
import { Text } from 'react-native-elements';
import ProfileTabHeaderStyles from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader.styles';

const styles = ProfileTabHeaderStyles;

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

      <View
        style={{
          backgroundColor: '#ffffff',
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowRadius: 5,
          shadowOpacity: 0.06,
          elevation: 10,
        }}
      >
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
    </View>
  );
};
