import _ from 'lodash';

export const rescheduleAppointmentEmailTemplate = _.template(
  `<html>
  <body>
  <p> Appointment has been rescheduled on Apollo 247 app with the following details:</p>
  <ul>
  <li>Appointment No  : <%- rescheduledapptNo %></li>
  <li>Patient Name  : <%- PatientfirstName %></li>
  <li>Mobile Number   : <%- PatientMobileNumber %></li>
  <li>Doctor Name  : <%- docfirstName %></li>
  <li>Doctor Location (ATHS/Hyd Hosp/Chennai Hosp) : <%- hospitalCity %></li>
  <li>Appointment Date  : <%- apptDate %></li>
  <li>Appointment Slot  : <%- apptTime %></li>
  <li>Mode of Consult : <%-  rescheduledapptType %></li>
  </ul>
  </body> 
  </html>
  `
);
