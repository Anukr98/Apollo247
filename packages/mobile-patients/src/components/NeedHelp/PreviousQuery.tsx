import { Query } from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { WhatsAppIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { ORDER_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Divider, ListItem, ListItemProps } from 'react-native-elements';

interface Props extends ListItemProps {
  query: Query;
}

export const PreviousQuery: React.FC<Props> = ({ query, ...listItemProps }) => {
  const order = query.orderType === ORDER_TYPE.CONSULT ? 'Appointment' : 'Order';

  const renderRightElement = () => {
    const onPress = async () => {
      try {
        const chatPreFilledMessage = `I want to know the status of my Help_Ticket regarding ${order} ID - ${query.orderId}`;
        const phoneNumber = query.orderType === ORDER_TYPE.CONSULT ? '8047104009' : '4041894343';
        const whatsAppScheme = `whatsapp://send?text=${chatPreFilledMessage}&phone=91${phoneNumber}`;
        const canOpenURL = await Linking.canOpenURL(whatsAppScheme);
        canOpenURL && Linking.openURL(whatsAppScheme);
      } catch (error) {}
    };

    return (
      <Button
        title={'CHAT WITH US'}
        icon={<WhatsAppIcon style={styles.icon} />}
        buttonStyle={styles.buttonStyle}
        titleStyle={styles.buttonTitleStyle}
        onPress={onPress}
      />
    );
  };

  const title = `To know the status of the Help Ticket for your ${order} #${query.orderId}`;

  return (
    <>
      <ListItem
        title={title}
        titleStyle={styles.titleStyle}
        rightElement={renderRightElement()}
        containerStyle={styles.containerStyle}
        Component={TouchableOpacity}
        {...listItemProps}
      />
      <Divider style={styles.divider} />
    </>
  );
};

const { text } = theme.viewStyles;
const { APP_YELLOW, LIGHT_BLUE, WHITE } = theme.colors;
const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: '#E8F5FF',
  },
  divider: {
    marginBottom: 10,
    marginTop: 13,
  },
  titleStyle: {
    ...text('M', 14, LIGHT_BLUE),
  },
  buttonStyle: {
    backgroundColor: WHITE,
    borderRadius: 10,
  },
  buttonTitleStyle: {
    ...text('SB', 15, APP_YELLOW),
    paddingHorizontal: 5,
  },
  icon: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
  },
});
