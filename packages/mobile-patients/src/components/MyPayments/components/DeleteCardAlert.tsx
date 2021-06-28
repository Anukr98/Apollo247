import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { SavedCard } from '@aph/mobile-patients/src/components/MyPayments/components/SavedCard';

interface DeleteCardAlertProps {
  visible: boolean;
  onDismiss: () => void;
  cardInfo: any;
  cardTypes: any;
  onConfirmDelete: () => void;
}

export const DeleteCardAlert: React.FC<DeleteCardAlertProps> = (props) => {
  const { cardInfo, cardTypes, onConfirmDelete } = props;
  const renderCloseIcon = () => {
    return (
      <View style={styles.closeIcon}>
        <TouchableOpacity onPress={() => props.onDismiss()}>
          <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerCont}>
        <Text style={styles.headerText}>Confirm Card Deletion</Text>
      </View>
    );
  };

  const renderCardInfo = () => {
    return <SavedCard cardTypes={cardTypes} cardInfo={cardInfo} onAlert={true} isLastCard={true} />;
  };

  const renderBody = () => {
    return (
      <View style={{ paddingVertical: 19, paddingHorizontal: 15 }}>
        <Text style={styles.deleteMsg}>Are you sure, you want to delete the card below :</Text>
        {renderCardInfo()}
        {renderButtons()}
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View style={styles.row}>
        <TouchableOpacity onPress={() => props.onDismiss()}>
          <Text style={styles.back}> GO BACK</Text>
        </TouchableOpacity>
        <Button
          title={'DELETE NOW'}
          titleTextStyle={styles.btnTxt}
          style={styles.deleteBtn}
          onPress={onConfirmDelete}
        />
      </View>
    );
  };

  return (
    <Overlay
      onRequestClose={() => props.onDismiss()}
      isVisible={props.visible}
      windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
      containerStyle={{
        marginBottom: 20,
      }}
      fullScreen
      transparent
      overlayStyle={styles.overlayStyle}
    >
      <View>
        {renderCloseIcon()}
        <View style={styles.mainView}>
          {renderHeader()}
          {renderBody()}
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    borderRadius: 10,
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
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  deleteBtn: {
    width: 168,
  },
  btnTxt: {
    ...theme.fonts.IBMPlexSansBold(13),
  },
  closeIcon: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
    position: 'absolute',
    top: -45,
  },
  headerCont: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
  headerText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475B',
    lineHeight: 21,
    marginVertical: 18,
    textAlign: 'center',
  },
  deleteMsg: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    letterSpacing: 1,
    color: '#01475B',
  },
  back: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 24,
    color: '#FC9916',
  },
});
