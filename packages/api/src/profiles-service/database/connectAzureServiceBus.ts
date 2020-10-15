import azure from 'azure-sb';

export const AZURE_SERVICE_BUS_GENERAL = (function() {
  if (!process.env.HDFC_SERVICE_BUS) throw new Error('Must provide connection string');
  let instance: azure.ServiceBusService;

  function createInstance() {
    const sbService = azure.createServiceBusService(process.env.GENERAL_SERVICE_BUS);
    return sbService;
  }

  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();
