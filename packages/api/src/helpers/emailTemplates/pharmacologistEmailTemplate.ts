import _ from 'lodash';

export const pharmacologistEmailTemplate = _.template(
  `<html>
  <body>  
  <p> Dear Dr. Sanjeev,</p>
  <p><%- patientName %> would like a detailed review of prescription attached here.</p>
  <p>The prescription has been attached in this email.</p>
  <p>Upload Time: <%- date %> </p>
  <p>Message from <%- patientName %> : <%- patientQueries %></p>
  <p>Best Regards,</p>
  <p>Apollo 247 Team</p>
  </body> 
  </html>
  `
);
