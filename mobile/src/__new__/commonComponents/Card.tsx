import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StyleProp,
  ImageStyle,
  TextStyle,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import { theme } from 'app/src/__new__/theme/theme';

const styles = StyleSheet.create({
  cardContainer: {
    margin: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    padding: 20,
    marginBottom: 0,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    // shadowRadius: 2,
    elevation: 2,
  },
  headingText: {
    paddingVertical: 10,
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  descriptionText: {
    color: theme.colors.CARD_DESCRIPTION,
    paddingBottom: 35,
    ...theme.fonts.IBMPlexSansMedium(17),
  },
  buttonStyle: {
    position: 'absolute',
    bottom: 15,
    right: -20,
    height: 64,
    width: 64,
  },
});

export interface cardProps {
  cardContainer: StyleProp<ViewStyle>;
  heading: StyleProp<ViewStyle>;
  descriptionTextStyle: StyleProp<ViewStyle>;
  description: String;
  disableButton: Number;
  buttonIcon: String;
  onClickButton: () => null;
}

export const Card: React.FC<cardProps> = (props) => {
  return (
    <View style={[styles.cardContainer, props.cardContainer]}>
      <Text style={styles.headingText}>{props.heading}</Text>
      <Text style={[styles.descriptionText, props.descriptionTextStyle]}>{props.description}</Text>
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={props.onClickButton}
        activeOpacity={props.disableButton ? 1 : 0.5}
      >
        <Image
          source={
            props.buttonIcon === 'arrow_yellow'
              ? require('app/src/__new__/images/Login/ic_arrow_yellow.png')
              : require('app/src/__new__/images/Login/ic_arrow_disabled.png')
          }
        />
      </TouchableOpacity>
      {props.children}
    </View>
  );
};
