import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
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
  store: Store;
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
        'Drive into the store and our staff will deliver your medicines to you outside. We will ensure you don’t have to wait & will get your medicines instantaneously!'
      }
    </Text>
  );

  const renderStoreDetails = () => (
    <View>
      <Spearator style={{ marginTop: 10 }} />
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
      <Spearator style={{ marginTop: 10 }} />
    </View>
  );

  const renderInfo = () => (
    <Text style={styles.infoText}>
      {
        'Once you place your order, you will get an SMS with the number of store executives. Kindly contact him 15 minutes before you arrive & he would be waiting outside with your products. Kindly use a prepaid method of payment to ensure stocks are blocked & smooth process.'
      }
    </Text>
  );

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
        {renderDescription()}
        {renderStoreDetails()}
        {renderInfo()}
        {renderGotItButton()}
      </View>
    </View>
  );
};
