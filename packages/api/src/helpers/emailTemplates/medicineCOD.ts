import _ from 'lodash';

export const medicineCOD = _.template(
  `<html>
  <body>  
  <p> Kindly process the order for the following items:</p>
  <ul>
  <li>Medicine Details
    <ul>
    <% _.each(orderDetails.medicineOrderLineItems, function(item,index) { %>
        <li>SKUcode<%- index+1 %> : <%-item.medicineSKU%> , Quantity: <%- item.quantity %></li>
    <% }); %>
    </ul>
  </li>
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
        <li>City : <%- patientAddress.city %></li>
        <li>State : <%- patientAddress.state %></li>
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
