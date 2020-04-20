import _ from 'lodash';

export const medicineSendPrescription = _.template(
  `<html>
  <body>  
  <p> Kindly process the order for the customer basis the prescription uploaded:</p>
  <li>Patient Details
  <ul>
     <li>First Name : <%- orderDetails.patient.firstName %></li>
     <li>Last Name : <%- orderDetails.patient.lastName %></li> 
     <li>UHID : <%- orderDetails.patient.uhid %></li> 
     <li>Mobile Number : <%- orderDetails.patient.mobileNumber %></li>
     <% if(patientAddress) {  %>
     <li>Customer Delivery Address : 
      <ul>
        <li>AddressLine1 : <%- patientAddress.addressLine1 %></li>
        <li>AddressLine2 : <%- patientAddress.addressLine2 %> </li>
        <li>Landmark : <%- patientAddress.landmark %></li>
        <li>City : <%- patientAddress.city +', '+ patientAddress.state %></li>
        <li>State : <%- patientAddress.state %></li>
        <li>Zipcode : <%- patientAddress.zipcode %></li>
      </ul>
     </li>
     <% } %>
    </ul>
  </li>
  <li>Cash on Delivery. </li>

  </ul>
  </body> 
  </html>
  `
);
