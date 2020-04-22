import _ from 'lodash';

export const medicineSendPrescription = _.template(
  `<html>
  <body>  
  <p> Kindly process the order for the customer basis the prescription uploaded:</p>
  <li>Patient Details
  <ul>
     <li>First Name : <%- patientDetails.firstName %></li>
     <li>Last Name : <%- patientDetails.lastName %></li> 
     <li>UHID : <%- patientDetails.uhid %></li> 
     <li>Mobile Number : <%- patientDetails.mobileNumber %></li>
     <% if(patientAddressDetails) {  %>
     <li>Customer Delivery Address : 
      <ul>
        <li>AddressLine1 : <%-patientAddressDetails.addressLine1 %></li>
        <li>AddressLine2 : <%- patientAddressDetails.addressLine2 %> </li>
        <li>Landmark : <%- patientAddressDetails.Landmark %></li>
        <li>City : <%- patientAddressDetails.City +', '+ patientAddressDetails.State %></li>
        <li>State : <%- patientAddressDetails.State %></li>
        <li>Zipcode : <%- patientAddressDetails.Zipcode %></li>
      </ul>
     </li>
     <% } %>
    </ul>
  </li>
  <% _.each(prescriptionImages, function(order, index) { %>
    <li><a><%-order %></a></a></li>
  <% }); %>

  <li>Cash on Delivery. </li>

  </ul>
  </body> 
  </html>
  `
);
