import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  cardContainer: {
    ...theme.viewStyles.cardViewStyle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    height: 86,
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 3,
  },
  cardViewStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 71, 91, 0.2)',
    borderRadius: 5,
  },
  contentContainerStyle: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  overlayContainerStyle: {
    marginBottom: 20,
  },
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '88.88%',
    height: '88.88%',
    borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
  },
  commentText: {
    ...theme.viewStyles.text('M', 16, '#01475B', 1, 19),
    paddingHorizontal: 16,
    paddingTop: 15,
    textAlign: 'justify',
    alignSelf: 'flex-start',
  },
  descText: {
    ...theme.viewStyles.text('M', 14, '#01475B', 1, 19),
    paddingHorizontal: 16,
    paddingTop: 15,
    textAlign: 'justify',
    bottom: 10,
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: 'transparent',
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headingView: { marginTop: 1 },
  headingText: {
    ...theme.viewStyles.text('M', 17, '#01475B'),
    paddingVertical: 5,
    paddingHorizontal: 16,
    textAlign: 'left',
    left: 10,
  },
  closeIcon: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  renderHeader: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 23,
    width: '100%',
  },
  renderHeaderText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.LIGHT_BLUE,
    alignSelf: 'flex-start',
    left: 35,
    top: 5,
  },
  renderDescription: {
    width: '90%',
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    left: 20,
    flexDirection: 'column',
    borderRadius: 10,
    bottom: 15,
    marginTop: 10,
  },
});

export interface ResultTestReportsPopUpProps {
  isVisible: boolean;
  heading: string;
  onClickClose: () => void;
  title: string;
}

export const ResultTestReportsPopUp: React.FC<ResultTestReportsPopUpProps> = (props) => {
  const renderCloseIcon = () => {
    return (
      <View style={styles.closeIcon}>
        <TouchableOpacity onPress={() => props.onClickClose()}>
          <CrossPopup style={{ marginRight: 1, width: 30, height: 30 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.renderHeader}>
        <Text style={styles.renderHeaderText}>{props.heading}</Text>
      </View>
    );
  };

  const renderDescription = () => (
    <View style={styles.renderDescription}>
      <Text style={styles.commentText}>{'COMMENTS:'}</Text>
      <Text style={styles.descText}>{props.title}</Text>
    </View>
  );

  return (
    <>
      <Overlay
        onRequestClose={() => props.onClickClose()}
        isVisible={props.isVisible}
        windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
        containerStyle={styles.overlayContainerStyle}
        fullScreen
        transparent
        overlayStyle={styles.overlayStyle}
      >
        <View style={styles.overlayViewStyle1}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            {renderCloseIcon()}
            {renderHeader()}
            <ScrollView bounces={false}>
              <View style={styles.contentContainerStyle}>{renderDescription()}</View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Overlay>
    </>
  );
};
