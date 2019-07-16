import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Button } from 'app/src/components/ui/Button';
import { Header } from 'app/src/components/ui/Header';
import { ProfileTabHeader } from 'app/src/components/ui/ProfileTabHeader';
import { colors } from 'app/src/theme/colors';
import { theme } from 'app/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  buttonStyle: {
    marginBottom: 32,
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
    borderRadius: 10,
    width: 240,
    backgroundColor: '#fc9916',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.BUTTON_TEXT,
  },
});

export interface TransitionPageProps extends NavigationScreenProps {}

export const TransitionPage: React.FC<TransitionPageProps> = (props) => {
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <View style={{ backgroundColor: colors.WHITE, flex: 1 }}>
        <Header />
        <ProfileTabHeader
          title="thank you, dr. rao :)"
          description="Let’s go over now to see the Apollo24x7 portal and start consultations!"
          activeTabIndex={0}
        />
        <Button
          onPress={() => props.navigation.navigate(AppRoutes.TabBar)}
          title="GET STARTED"
          titleTextStyle={styles.titleTextStyle}
          style={styles.buttonStyle}
        />
      </View>
    </SafeAreaView>
  );
};
