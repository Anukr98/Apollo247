
import { Doctor } from 'doctors-service/entities';
import { AZURE_SERVICE_BUS } from 'consults-service/database/connectAzureServiceBus';
import {
    APPOINTMENT_TYPE
} from 'consults-service/entities';
import { log } from 'customWinstonLogger';
import {
    format,
    subMinutes,
    addHours
} from 'date-fns';
import { exotelCalling } from 'consults-service/resolvers/exotelCalling';

type AppointmentBooking = {
    appointmentDateTime: Date;
    appointmentType: APPOINTMENT_TYPE;
};

export const sendMessageToASBQueue = async (
    doctorDetails: Doctor,
    appointmentDetails: Pick<AppointmentBooking, "appointmentDateTime" | "appointmentType">
) => {
    const sbService = AZURE_SERVICE_BUS.getInstance();
    const queueName = process.env.ASB_DOCTOR_APPOINTMENT_REMINDER_QUEUE || 'doctor-appointment-reminder-queue';
    sbService.createQueueIfNotExists(queueName, function (createQueueError) {
        if (createQueueError) {
            console.log('Failed to create queue: ', createQueueError);
            log(
                'consultsServiceLogger',
                'Failed to create message queue',
                `sendMessageToASBQueue()->${queueName}`,
                JSON.stringify(createQueueError),
                ''
            );
        } else {
            var message = {
                body: JSON.stringify({
                    From: parseInt(doctorDetails.mobileNumber, 10),
                    CustomField: format(appointmentDetails.appointmentDateTime, "yyyy-MM-dd'T'HH:mm:00.000X") + '_' + appointmentDetails.appointmentType
                }),
                brokerProperties: {
                    ScheduledEnqueueTimeUtc: appointmentDetails.appointmentType === APPOINTMENT_TYPE.ONLINE ?
                        format(subMinutes(appointmentDetails.appointmentDateTime, doctorDetails.ivrCallTimeOnline), "yyyy-MM-dd'T'HH:mm:00.000X") :
                        format(subMinutes(appointmentDetails.appointmentDateTime, doctorDetails.ivrCallTimePhysical), "yyyy-MM-dd'T'HH:mm:00.000X")
                }
            };
            sbService.sendQueueMessage(queueName, message, function (sendMsgError) {
                if (sendMsgError) {
                    console.error('Failed to send message to queue: ', sendMsgError);
                    log(
                        'consultsServiceLogger',
                        'Failed to send message to queue',
                        'sendMessageToASBQueue()',
                        JSON.stringify(sendMsgError),
                        ''
                    );
                }
                console.log("message sent to queue > ", JSON.stringify(message, null, 3));
            });
        }
    });
};


const receiveMessageFromASBQueue = (function () {
    const sbService = AZURE_SERVICE_BUS.getInstance();
    const queueName = process.env.ASB_DOCTOR_APPOINTMENT_REMINDER_QUEUE || 'doctor-appointment-reminder-queue';
    const IVR_url = `http://my.exotel.com/${process.env.EXOTEL_ACCOUNT_SID}/exoml/start_voice/${process.env.EXOTEL_APPOINTMENT_REMINDER_IVR_APP_ID || 311473 || 320240}`;

    setInterval(function () {
        sbService.createQueueIfNotExists(queueName, function (createQueueError) {
            if (createQueueError) {
                console.log('Failed to create queue: ', createQueueError);
                log(
                    'consultsServiceLogger',
                    'Failed to create message queue',
                    `receiveMessageToASBQueue()->${queueName}`,
                    JSON.stringify(createQueueError),
                    ''
                );
            } else {
                sbService.receiveQueueMessage(queueName, { isPeekLock: true }, async function (recieveError, lockedMessage) {
                    if (recieveError) {
                        log(
                            'consultsServiceLogger',
                            'Failed to recieve message from queue',
                            'receiveMessageToASBQueue()',
                            JSON.stringify(recieveError),
                            ''
                        );
                    }
                    if (lockedMessage) {
                        const message = JSON.parse(lockedMessage.body);
                        console.log("message received from queue > ", JSON.stringify(message, null, 3));
                        const exotelUrl: string | undefined = process.env.EXOTEL_API_URL;
                        const exotelRequest = {
                            From: message.From,
                            Url: IVR_url,
                            CallerId: process.env.EXOTEL_CALLER_ID,
                            CustomField: message.CustomField
                        };

                        await exotelCalling({ exotelUrl, exotelRequest });
                        sbService.deleteMessage(lockedMessage, function (errorInDelete) {
                            if (errorInDelete) {
                                console.error('Failed to delete message: ', errorInDelete);
                            }
                        });
                    }
                });
            }
        })
    }, 10000);
})();
