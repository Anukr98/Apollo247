import _ from 'lodash';

export const helpEmailTemplate = _.template(
  `<html>
  <body>
  <p> #original_sender{<%- patientDetails.mobileNumber %>@apollo247.org} </p>
  <p> Patient Help Form</p>
  <ul>
  <li>Need help with  : <%- helpEmailInput.category %></li>
  <li>Reason  : <%- helpEmailInput.reason %></li>
  <li>Comments  : <%- helpEmailInput.comments %></li>
  <li>Patient Details
    <ul>
     <li>First Name : <%- patientDetails.firstName %></li>
     <li>Last Name : <%- patientDetails.lastName %></li>
     <li>Customer Id : <%- patientDetails.id %></li>
     <li>UHID : <%- patientDetails.uhid %></li>
     <li>Email : <%- patientDetails.emailAddress %></li>
     <li>Mobile Number : <%- patientDetails.mobileNumber %></li>
    </ul>
  </li>
  <% _.each(appointmentList, function(appointment,index) { %>
  <li> Appointment: <%- index+1 %>     
  <ul>
   <li>Doctor's Name : <%- appointment.doctorName %> </li>
   <li>Appointment DateTime : <%- format(appointment.appointmentDateTime, 'dd/MM/yyyy hh:mm aa') %> </li>
   <li>Appointment Mode : <%- appointment.appointmentMode %> </li>  
   <li>DoctorType : <%- appointment.doctorType %> </li>    
  </ul>    
  </li>
  <% }); %>
  <% _.each(medicineOrders, function(order, index) { %>
  <li> Medicine Order Details: <%- index+1 %> 
    <ul>      
        <li>Payment Details : <%- order.paymentMode %></li>
        <li>Item Details : 
            <ul>
              <% _.each(order.lineItems, function(item) { %>
                  <li>Name: <%- item.name %> , SKU: <%-item.sku%> , OrderId: <%- item.orderautoid %></li>
              <% }); %>
              </ul>
        </li>
        <li>Date and Time of Order : <%- order.orderDateTime %></li>
        <% if(order.prescriptionUrl != null) {  %>
          <li>Prescription : <%- order.prescriptionUrl %></li>
        <% } %> 
    </ul>
  </li>
  <% }); %>

  </ul>
  </body> 
  </html>
  `
);
