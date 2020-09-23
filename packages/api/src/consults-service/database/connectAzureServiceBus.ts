import azure from 'azure-sb';

export const AZURE_SERVICE_BUS = (function () {
    const connectionStringASB = process.env.ASB_DOCTOR_APPOINTMENT_REMINDER_CONNECTION;
    if (!connectionStringASB) throw new Error('Must provide connection string');
    let instance: azure.ServiceBusService;

    function createInstance() {
        const sbService = azure.createServiceBusService(connectionStringASB);
        return sbService;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();