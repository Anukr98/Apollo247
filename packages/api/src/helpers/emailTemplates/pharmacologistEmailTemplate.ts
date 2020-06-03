import _ from 'lodash';

export const pharmacologistEmailTemplate = _.template(
  `<html>
  <body>  
  <p> Dear Dr. Sanjeev,</p>
  <ul>
    <li><%- patientName %> would like a detailed review of prescription attached here.</li>
    <li>The prescription has been attached in this email.</li>
    <li>Upload Time: <%- date %> <li>
    <li>Message from <%- patientName %> : <%- patientQueries %></li> 

    <li>Best Regards,</li>
    <li>Apollo 247 Team</li>
  </ul>
  </body> 
  </html>
  `
);
