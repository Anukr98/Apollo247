import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Store } from '../../helpers/apiCalls';
import { Spearator } from '../ui/BasicComponents';
import { DriveWayIcon } from '../ui/Icons';

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.31)',
    width: '100%',
    height: '100%',
  },
  popupView: {
    top: Dimensions.get('window').height * 0.15,
    maxHeight: Dimensions.get('window').height * 0.8,
    marginHorizontal: 20,
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingTop: 9,
    paddingBottom: 15,
  },
  headingView: { backgroundColor: '#02475b', marginTop: 1 },
  headingText: {
    ...theme.viewStyles.text('M', 17, '#fff'),
    paddingVertical: 5,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  descText: {
    ...theme.viewStyles.text('M', 13, '#02475b', 1, 19),
    paddingHorizontal: 16,
    paddingTop: 17,
    textAlign: 'justify',
  },
  storeDetailView: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
  },
  storeDetailText1: {
    ...theme.viewStyles.text('M', 14, '#02475b', 0.7, 24),
    paddingRight: 7,
  },
  storeDetailText2: {
    ...theme.viewStyles.text('SB', 14, '#02475b', 1, 20),
    flex: 1,
  },
  infoText: {
    ...theme.viewStyles.text('R', 13, '#02475b', 1, 19),
    paddingHorizontal: 16,
    paddingTop: 4,
    textAlign: 'justify',
  },
  button: {
    alignSelf: 'center',
    marginTop: 13,
    width: 106,
    height: 26,
    borderRadius: 5,
  },
  buttonTitle: {
    ...theme.viewStyles.text('B', 13, '#fff', 1, 24),
  },
});

export interface StoreDriveWayPickupPopupProps {
  onPressOkGotIt: () => void;
  store?: Store;
}

export const StoreDriveWayPickupPopup: React.FC<StoreDriveWayPickupPopupProps> = (props) => {
  const renderDriveWayIcon = () => (
    <DriveWayIcon style={{ height: 75, width: 212, alignSelf: 'center' }} />
  );

  const renderHeading = () => (
    <View style={styles.headingView}>
      <Text style={styles.headingText}>Introducing New Store-Side Delivery</Text>
    </View>
  );

  const renderDescription = () => (
    <Text style={styles.descText}>
      {
        'Get your medicines without waiting!\nDrive in to our store, our staff will deliver your medicines to you.'
      }
    </Text>
  );

  const renderStoreDetails = () => (
    <View>
      <Spearator style={{ marginTop: 10 }} />
      {!!props.store && (
        <>
          <View style={styles.storeDetailView}>
            <Text style={styles.storeDetailText1}>Store Selected :</Text>
            <Text
              style={styles.storeDetailText2}
            >{`${props.store.storename}\n${props.store.address}`}</Text>
          </View>
          <View style={[styles.storeDetailView, { marginTop: 17 }]}>
            <Text style={styles.storeDetailText1}>Store Timings :</Text>
            <Text style={styles.storeDetailText2}>{props.store.workinghrs}</Text>
          </View>
          {!!props.store.phone && (
            <View style={[styles.storeDetailView, { marginTop: 17 }]}>
              <Text style={styles.storeDetailText1}>Store Phone Number :</Text>
              <Text style={styles.storeDetailText2}>{props.store.phone}</Text>
            </View>
          )}
          <Spearator style={{ marginTop: 10 }} />
        </>
      )}
    </View>
  );

  const renderInfo = () => {
    const infoTextList = [
      "Place your order, get an SMS with store details and executive's number",
      'Once the items are ready, you will have an option to alert store.',
      'Alert the store 10 minutes before you reach',
      'Collect your medicines and drive off',
    ];
    return (
      <View style={{ marginTop: 5 }}>
        {infoTextList.map((item) => (
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.infoText, { paddingRight: 0 }]}>{'\u2022'}</Text>
            <Text style={[styles.infoText, { paddingLeft: 10, flex: 1 }]}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderGotItButton = () => (
    <Button
      title="OK, GOT IT"
      onPress={props.onPressOkGotIt}
      style={styles.button}
      titleTextStyle={styles.buttonTitle}
    />
  );

  return (
    <View style={styles.blurView}>
      <View style={styles.popupView}>
        {renderDriveWayIcon()}
        {renderHeading()}
        <ScrollView bounces={false} persistentScrollbar={true}>
          {renderDescription()}
          {renderStoreDetails()}
          {renderInfo()}
        </ScrollView>
        {renderGotItButton()}
      </View>
    </View>
  );
};
