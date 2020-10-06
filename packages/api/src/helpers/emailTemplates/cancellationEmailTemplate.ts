import _ from 'lodash';

export const cancellationEmailTemplate = _.template(`
<html>
<body>
<p><%- Title%></p>
<ul>
<li>Patient Name: <%- PatientName %> </li>
<li>Appointment Date Time: <%- AppointmentDateTime %> </li>
<li>Doctor Name: <%- DoctorName %> </li>
<li>Hospital Name: <%- HospitalName %> </li>
</ul>
</body>
</html>
`);
