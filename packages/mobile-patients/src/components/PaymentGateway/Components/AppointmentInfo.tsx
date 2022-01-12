import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, TextInput } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import {
  Copy,
  Remove,
  PdfGray,
  EmailGray,
  Pdf,
  SearchSendIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';

export interface AppointmentInfoProps {
  paymentId: string;
  displayId: string;
  orderDetails: any;
  onPressCopy: () => void;
  onPressViewInvoice: () => void;
  onPressEmailInvoice: (email: any) => void;
  //   orderDateTime: any;
  //   paymentMode: string;
}

export const AppointmentInfo: React.FC<AppointmentInfoProps> = (props) => {
  const {
    paymentId,
    displayId,
    onPressCopy,
    orderDetails,
    onPressViewInvoice,
    onPressEmailInvoice,
  } = props;
  const { doctorName, appointmentType, appointmentDateTime } = orderDetails;
  const [showEmailInput, setshowEmailInput] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const [email, setEmail] = useState<string>(currentPatient?.emailAddress || '');
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const renderPaymentInfo = () => {
    return (
      <View style={{ paddingHorizontal: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.orderId}>Order ID:</Text>
          <Text style={styles.id}>{displayId}</Text>
        </View>
        <TouchableOpacity style={styles.paymentId} onPress={onPressCopy}>
          <Text style={styles.orderId}>Payment Ref. Number:</Text>
          <Text style={styles.id}>{paymentId}</Text>
          <Copy style={styles.iconStyle} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderViewInvoice = () => {
    return (
      <View style={styles.viewInvoice}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.viewInvoiceContainer} onPress={onPressViewInvoice}>
            <PdfGray style={styles.viewIcon} />
            <Text style={styles.invoice}>VIEW INVOICE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emailInvoiceView}
            onPress={() => setshowEmailInput(!showEmailInput)}
          >
            <EmailGray style={styles.emailIcon} />
            <Text style={styles.invoice}>EMAIL INVOICE</Text>
          </TouchableOpacity>
        </View>
        {renderEmailInputContainer()}
      </View>
    );
  };

  const renderEmailInputContainer = () => {
    return showEmailInput ? <View>{!emailSent ? renderInputEmail() : renderSentMsg()}</View> : null;
  };

  const renderInputEmail = () => {
    return (
      <View style={styles.inputContainer}>
        <View style={{ flex: 0.85 }}>
          <TextInput
            value={`${email}`}
            onChangeText={(email: any) => setEmail(email)}
            style={styles.inputStyle}
          />
        </View>
        <View style={styles.rightIcon}>{rightIconView()}</View>
      </View>
    );
  };

  const rightIconView = () => {
    return (
      <View style={{ paddingBottom: 0, opacity: isSatisfyingEmailRegex(email.trim()) ? 1 : 0.5 }}>
        <TouchableOpacity
          activeOpacity={1}
          disabled={!isSatisfyingEmailRegex(email.trim())}
          onPress={() => {
            onPressEmailInvoice(email);
            setEmailSent(true);
          }}
        >
          <SearchSendIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSentMsg = () => {
    const length = email?.length || 0;
    return (
      <View
        style={{ ...styles.inputContainer, justifyContent: length > 20 ? 'center' : undefined }}
      >
        <Text
          style={{
            lineHeight: length > 20 ? 18 : 30,
            textAlign: length > 20 ? 'center' : 'auto',
            ...styles.sentMsg,
          }}
        >
          {length < 21
            ? `Invoice has been sent to ${email}!`
            : `Invoice has been sent to ${'\n'} ${email}!`}
        </Text>
      </View>
    );
  };
  const renderAppointmentDetails = () => {
    return (
      <View style={styles.detailsCont}>
        <Text style={styles.details}>{string.consultPayment.appointmentDetails}</Text>
        <Text style={styles.consultTime}>
          {appointmentType.charAt(0).toUpperCase() +
            appointmentType.slice(1).toLowerCase() +
            ' Consultation, ' +
            getDate(appointmentDateTime)}
        </Text>
        <Text style={styles.docName}>{doctorName}</Text>
      </View>
    );
  };
  const renderAppointmentInfo = () => {
    return (
      <View>
        {renderPaymentInfo()}
        {renderViewInvoice()}
        {renderAppointmentDetails()}
      </View>
    );
  };
  return <View style={styles.container}>{renderAppointmentInfo()}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
  },

  orderId: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 13,
    color: '#68919D',
  },
  paymentId: {
    flexDirection: 'row',
    marginTop: 7,
    alignItems: 'center',
  },
  id: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 13,
    color: '#68919D',
    marginLeft: 5,
  },
  iconStyle: {
    width: 11,
    height: 12.5,
    marginLeft: 8,
  },
  viewInvoice: {
    marginTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D4',
  },
  viewIcon: {
    width: 16,
    height: 10,
    marginEnd: 4,
  },
  emailIcon: {
    width: 17,
    height: 13,
    marginEnd: 4,
  },
  viewInvoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInvoiceView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: 20,
  },
  invoice: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 13,
    color: '#FC9916',
    marginLeft: 3,
  },
  detailsCont: {
    paddingHorizontal: 12,
    paddingTop: 7,
  },
  details: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    color: '#02475B',
  },
  docName: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    color: '#1C4659',
  },
  consultTime: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    color: '#00B38E',
    marginTop: 7,
    marginBottom: 1,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.LIGHT_GRAY_2,
    marginTop: 10,
  },
  inputStyle: {
    lineHeight: 18,
    ...theme.fonts.IBMPlexSansMedium(11),
    color: '#6D7278',
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  rightIcon: {
    flex: 0.15,
    alignItems: 'flex-end',
  },
  sentMsg: {
    color: theme.colors.CONSULT_SUCCESS_TEXT,
    marginVertical: 4,
    ...theme.fonts.IBMPlexSansMedium(11),
  },
});
