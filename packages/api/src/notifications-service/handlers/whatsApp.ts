export const sendNotificationWhatsapp = async (
  mobileNumber: string,
  message: string,
  loginType: number
) => {
  /*const apiUrl =
      process.env.WHATSAPP_URL +
      '?method=OPT_IN&phone_number=' +
      mobileNumber +
      '&userid=' +
      process.env.WHATSAPP_USERNAME +
      '&password=' +
      process.env.WHATSAPP_PASSWORD +
      '&auth_scheme=plain&format=text&v=1.1&channel=WHATSAPP';
    const whatsAppResponse = await fetch(apiUrl)
      .then(async (res) => {
        if (loginType == 1) {
          const sendApiUrl = `${process.env.WHATSAPP_URL}?method=SendMessage&send_to=${mobileNumber}&userid=${process.env.WHATSAPP_USERNAME}&password=${process.env.WHATSAPP_PASSWORD}&auth_scheme=plain&msg_type=TEXT&format=text&v=1.1&msg=${message}`;
          fetch(sendApiUrl)
            .then((res) => res)
            .catch((error) => {
              console.log('whatsapp error', error);
              throw new AphError(AphErrorMessages.MESSAGE_SEND_WHATSAPP_ERROR);
            });
        }
      })
      .catch((error) => {
        throw new AphError(AphErrorMessages.GET_OTP_ERROR);
      });
    return whatsAppResponse;*/
  return true;
};

export const sendDoctorNotificationWhatsapp = async (
  templateName: string,
  phoneNumber: string,
  templateData: string[]
) => {
  const scenarioUrl = process.env.WHATSAPP_SCENARIO_URL ? process.env.WHATSAPP_SCENARIO_URL : '';
  const scenarioResponse = await fetch(scenarioUrl, {
    method: 'POST',
    body: JSON.stringify({
      name: 'New Scenario',
      flow: [
        {
          from: process.env.WHATSAPP_DOCTOR_NUMBER ? process.env.WHATSAPP_DOCTOR_NUMBER : '',
          channel: 'WHATSAPP',
        },
      ],
      default: true,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.WHATSAPP_AUTH_HEADER ? process.env.WHATSAPP_AUTH_HEADER : '',
    },
  });
  const textRes = await scenarioResponse.text();
  const keyResp = JSON.parse(textRes);
  console.log(keyResp.key, 'scenario key');
  const url = process.env.WHATSAPP_SEND_URL ? process.env.WHATSAPP_SEND_URL : '';
  if (keyResp) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        scenarioKey: keyResp.key,
        destinations: [{ to: { phoneNumber } }],
        whatsApp: {
          templateName,
          templateData,
          language: 'en',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.WHATSAPP_AUTH_HEADER ? process.env.WHATSAPP_AUTH_HEADER : '',
      },
    });
    console.log(response, 'response');
  }
};
