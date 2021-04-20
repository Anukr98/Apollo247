/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import PaymentConstants from '../../constants';
import { textComponent } from './GenericText';
import { CONSULT_ORDER_INVOICE } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import InputEmail from './InputEmail';

interface ViewInvoiceProps {
  item: any;
  paymentFor: string;
  navigationProps?: any;
  patientId?: string;
  status?: string;
}
const ViewInvoice: FC<ViewInvoiceProps> = (props) => {
  const { SUCCESS, FAILED, REFUND } = PaymentConstants;
  const client = useApolloClient();
  const { showAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const [showEmailInput, setshowEmailInput] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(currentPatient?.emailAddress || '');
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let status = 'PENDING';
    if (paymentFor === 'consult') {
      const { appointmentPayments, PaymentOrders } = item;
      const paymentInfo = Object.keys(PaymentOrders).length
        ? PaymentOrders
        : appointmentPayments[0];
      if (!paymentInfo) {
        status = 'PENDING';
      } else {
        status = paymentInfo?.paymentStatus;
      }
      return {
        status: status,
      };
    } else {
      return { status: null };
    }
  };

  //TODO: refactor the downloadInvoice function and need to handle failure case
  const downloadInvoice = (emailInvoice?: boolean) => {
    const { item, patientId } = props;
    const inputVariables: any = {
      patientId: patientId,
      appointmentId: item.id,
    };
    if (emailInvoice) {
      inputVariables['emailId'] = emailInvoice ? email : '';
    }
    client
      .query({
        query: CONSULT_ORDER_INVOICE,
        variables: inputVariables,
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        if (!emailInvoice) {
          const { data } = res;
          const { getOrderInvoice } = data;
          let dirs = RNFetchBlob.fs.dirs;
          let fileName: string = 'Apollo_Consult_Invoice' + String(new Date()) + '.pdf';
          const downloadPath =
            Platform.OS === 'ios'
              ? (dirs.DocumentDir || dirs.MainBundleDir) +
                '/' +
                (fileName || 'Apollo_Consult_Invoice.pdf')
              : dirs.DownloadDir + '/' + (fileName || 'Apollo_Consult_Invoice.pdf');
          RNFetchBlob.config({
            fileCache: true,
            path: downloadPath,
            addAndroidDownloads: {
              title: fileName,
              useDownloadManager: true,
              notification: true,
              path: downloadPath,
              mime: mimeType(downloadPath),
              description: 'File downloaded by download manager.',
            },
          })
            .fetch('GET', String(getOrderInvoice), {
              //some headers ..
            })
            .then((res) => {
              console.log('invoiceURL-->', res);
              if (Platform.OS === 'android') {
                Alert.alert('Download Complete');
              }
              Platform.OS === 'ios'
                ? RNFetchBlob.ios.previewDocument(res.path())
                : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
            })
            .catch((err) => {
              CommonBugFender('ConsultView_downloadInvoice', err);
              console.log('error ', err);
            });
        }
      })
      .catch((error) => {
        // props.navigationProps.navigate(AppRoutes.MyAccount);
        renderErrorPopup(`Something went wrong, please try again after sometime`);
        CommonBugFender('fetchingConsultInvoice', error);
      });
  };

  const renderEmailInput = () => {
    return (
      <InputEmail
        showEmailInput={showEmailInput}
        email={email}
        setEmail={setEmail}
        emailSent={emailSent}
        onPressSend={() => {
          downloadInvoice(true);
          setEmailSent(true);
        }}
      />
    );
  };

  const { paymentFor, status } = props;
  return status === SUCCESS && paymentFor === 'consult' ? (
    <View>
      <View style={styles.viewInvoice}>
        <TouchableOpacity onPress={() => downloadInvoice()} style={styles.mainContainer}>
          {textComponent('VIEW INVOICE', undefined, theme.colors.APP_YELLOW, false)}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setshowEmailInput(!showEmailInput)}>
          {textComponent(
            'EMAIL INVOICE',
            undefined,
            !showEmailInput ? theme.colors.APP_YELLOW : 'rgba(252, 153, 22, 0.5)',
            false
          )}
        </TouchableOpacity>
      </View>
      {renderEmailInput()}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    paddingBottom: 15,
    justifyContent: 'flex-start',
  },
  viewInvoice: {
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ViewInvoice;
