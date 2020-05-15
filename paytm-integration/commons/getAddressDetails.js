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
              }
          }
        }
      `,
      },
    })
      .then((response) => {
        console.log(
          response,
          response.data.data.getPatientAddressById.patientAddress.state,
          'address resp'
        );
        resolve(response.data.data.getPatientAddressById.patientAddress);
      })
      .catch((error) => {
        logger.error(`processOrders()-> ${error.stack}`);
        console.log(error, 'address error');
      });
  });
}

module.exports = { getAddressDetails };
