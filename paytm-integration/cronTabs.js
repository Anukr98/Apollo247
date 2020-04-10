const axios = require('axios');
const Constants = require('./Constants');

exports.autoSubmitJDCasesheet = (req, res) => {
  const requestJSON = {
    query: Constants.AUTO_SUBMIT_JD_CASESHEET,
  };
  axios.defaults.headers.common['authorization'] = Constants.AUTH_TOKEN;
  axios
    .post(process.env.API_URL, requestJSON)
    .then((response) => {
      res.send({
        status: 'success',
        message: response.data,
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};
