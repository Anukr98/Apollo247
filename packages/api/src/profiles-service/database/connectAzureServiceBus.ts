import azure from 'azure-sb';

export const AZURE_SERVICE_BUS_HDFC = (function() {
  if (!process.env.HDFC_SERVICE_BUS) throw new Error('Must provide connection string');
  let instance: azure.ServiceBusService;

  function createInstance() {
    const sbService = azure.createServiceBusService(process.env.HDFC_SERVICE_BUS);
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
