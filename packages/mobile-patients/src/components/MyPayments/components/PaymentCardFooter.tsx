/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */
import React, { FC, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '../../../theme/colors';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import CardFooterButton from './CardFooterButton';
import PaymentConstants from '../constants';

interface PaymentCardFooterProps {
  item: any;
  paymentFor: string;
  navigationProps: any;
}
const PaymentCardFooter: FC<PaymentCardFooterProps> = (props) => {
  const { SUCCESS, FAILED } = PaymentConstants;
  useEffect(() => {}, []);
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let leftHeaderText = '';
    let dateAndTime = '';
    let type = '';
    let status = '';
    let orderID = 0;
    let aptType = '';
    if (paymentFor === 'consult') {
      const { appointmentDateTime, appointmentPayments, doctor, appointmentType } = item;
      leftHeaderText = 'Dr. ' + doctor.name;
      type = appointmentType === 'ONLINE' ? 'Online' : 'Clinic Visit';
      aptType = appointmentType;
      if (!appointmentPayments || !appointmentPayments.length) {
        status = 'PENDING';
        return {
          leftHeaderText: leftHeaderText,
          dateAndTime: getDate(appointmentDateTime),
          type: type,
          status: status,
          aptType: aptType,
        };
      } else {
        status = appointmentPayments[0].paymentStatus;
        return {
          leftHeaderText: leftHeaderText,
          dateAndTime: getDate(appointmentDateTime),
          type: type,
          status: status,
          aptType: aptType,
        };
      }
    } else {
      const { medicineOrderPayments, orderAutoId, orderDateTime } = item;
      orderID = orderAutoId;
      dateAndTime = orderDateTime;
      if (!medicineOrderPayments || !medicineOrderPayments.length) {
        type = '';
        status = 'PENDING';
        return {
          leftHeaderText: 'Order No. - ' + orderAutoId,
          dateAndTime: dateAndTime,
          type: type,
          status: status,
          orderID: orderID,
          aptType: aptType,
        };
      } else {
        type = medicineOrderPayments[0].paymentType;

        status = medicineOrderPayments[0].paymentStatus;
        return {
          leftHeaderText: 'Order No. - ' + orderAutoId,
          dateAndTime: getDate(dateAndTime),
          type: type,
          status: status,
          orderID: orderID,
          aptType: aptType,
        };
      }
    }
  };
  const upperSection = () => {
    const { leftHeaderText, status } = statusItemValues();
    const showStatus = status === 'TXN_REFUND' ? 'Cancelled' : null;
    return (
      <View style={styles.contentViewStyles}>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 16, colors.CARD_HEADER, 1, 20, 0) }}>
            {leftHeaderText}
          </Text>
        </View>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 12, colors.FAILURE_TEXT, 1, 20, 0.04) }}>
            {showStatus}
          </Text>
        </View>
      </View>
    );
  };
  const lowerSection = () => {
    const { dateAndTime, type } = statusItemValues();
    return (
      <View style={styles.lowerView}>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 12, colors.CARD_HEADER, 0.6, 20, 0.04) }}>
            {dateAndTime}
          </Text>
        </View>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 12, colors.CARD_HEADER, 0.6, 20, 0.04) }}>
            {type}
          </Text>
        </View>
      </View>
    );
  };
  const getTitle = () => {
    const { paymentFor } = props;
    const { status, aptType } = statusItemValues();
    let buttonTitle = 'TRY AGAIN';
    if (paymentFor === 'consult') {
      if (status === SUCCESS) {
        buttonTitle = aptType === 'ONLINE' ? 'START CONSULTATION' : 'VIEW CONSULT DETAILS';
        return { buttonTitle: buttonTitle };
      }
      buttonTitle = 'TRY AGAIN';
      return { buttonTitle: buttonTitle };
    } else {
      if (status === SUCCESS) {
        buttonTitle = 'TRACK ORDER';
        return { buttonTitle: buttonTitle };
      }
      buttonTitle = 'TRY AGAIN';
      return { buttonTitle: buttonTitle };
    }
  };
  const navigateTo = () => {
    const { status, orderID } = statusItemValues();
    const { paymentFor } = props;
    if (paymentFor === 'consult') {
      if (status === FAILED) {
        props.navigationProps.navigate(AppRoutes.DoctorSearch, {});
      } else if (status === SUCCESS) {
        props.navigationProps.navigate(AppRoutes.Consult, {});
      } else {
        props.navigationProps.navigate(AppRoutes.ConsultRoom, {});
      }
    } else {
      if (status === FAILED) {
        props.navigationProps.navigate(AppRoutes.YourCart, {});
      } else if (status === SUCCESS) {
        props.navigationProps.navigate(AppRoutes.OrderDetailsScene, {
          goToHomeOnBack: true,
          orderAutoId: orderID,
        });
      } else {
        props.navigationProps.navigate(AppRoutes.ConsultRoom, {});
      }
    }
  };
  const renderButton = () => {
    const { status } = statusItemValues();
    const { buttonTitle } = getTitle();
    if (status === SUCCESS || status === FAILED) {
      return <CardFooterButton buttonTitle={buttonTitle} onPressAction={navigateTo} />;
    }
  };

  return (
    <View style={styles.mainContainer}>
      {upperSection()}
      {lowerSection()}
      {renderButton()}
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  contentViewStyles: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lowerView: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },
});

export default PaymentCardFooter;
