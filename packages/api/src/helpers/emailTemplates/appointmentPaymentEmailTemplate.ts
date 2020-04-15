import _ from 'lodash';

export const appointmentPaymentEmailTemplate = _.template(`
<html>
<body>  
<ol>
<p>New Appointment has been booked on Apollo 247 app with the following details </p>
<ul>
<li>Appointment No : <%- displayId %></li>
<li>Patient Name : <%- firstName %></li>
<li>Mobile Number : <%- mobileNumber %></li>
<li>UHID : <%- uhid %></li>
<li>Payment Received from Patient : <%- amountPaid %></li>
<li>Email ID : <%- emailId %></li>
<li>Doctor Name : <%- docfirstName +' '+ doclastName %></li>
<li>Doctor Location : <%- hospitalcity %></li>
<li>Appointment Date : <%- apptDate %></li>
<li>Appointment Slot : <%- apptTimeFormat %></li>
<li>Mode of Consult : <%- appointmentType %> </li>
</ul>
</ol>
</body>
</html>
`);
