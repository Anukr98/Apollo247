const axios = require('axios');
const logger = require('./../winston-logger')('Universal-Error-Logs');

function getAddressDetails(addressId) {
  return new Promise(async (resolve, reject) => {
    axios({
      url: process.env.API_URL,
      method: 'post',
      data: {
        query: `
        query {
          getPatientAddressById(id:"${addressId}") {
            patientAddress{
                id
                city
                state
                zipcode
                addressLine1
                addressLine2
                landmark
                latitude
                longitude
                stateCode
              }
          }
        }
      `,
      },
    })
      .then((response) => {
        console.log(response.data.data.getPatientAddressById.patientAddress, 'address resp');
        resolve(response.data.data.getPatientAddressById.patientAddress);
      })
      .catch((error) => {
        logger.error(
          `error while fethcing address details processOrders() ${addressId}-> ${error.stack}`
        );
        console.log(error, 'address error');
      });
  });
}

module.exports = { getAddressDetails };
