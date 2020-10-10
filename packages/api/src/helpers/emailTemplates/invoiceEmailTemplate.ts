import _ from 'lodash';

export const invoiceEmail = _.template(`
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width" />
    <title>Emailer</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-size: 12px;
        color: #000;
        font-family: Arial, san-serif;
      }
    </style>
  </head>
  <body>
    <table
      cellspacing="0"
      cellpadding="0"
      style="
        width: 600;
        margin: 0 auto;
        border: 1px solid #ccc;
        padding: 50px 20px;
      "
    >
      <tbody>
        <tr>
          <td style="font-size: 14px">
            Namaste <span style="font-weight: bold"><%- name %></span>,
          </td>
        </tr>

        <tr>
          <td style="padding: 30px 0">
            <p style="font-size: 14px">
              Thank you for choosing
              <span style="color: #fc9916; font-weight: bold">Apollo 247</span>.
            </p>
            <p style="padding: 10px 0; font-size: 14px">
              Please find the attached invoice for your Appointment <%- displayId %> with us.
            </p>
            <p style="font-size: 14px">We hope to serve you best!</p>
          </td>
        </tr>   
        <tr>
          <td style="font-size: 14px">Regards,</td>
        </tr>
        <tr>
          <td style="font-size: 14px; font-weight: bold">Team Apollo247</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td
            style="padding: 30px 0; font-size: 12px; color: rgb(48, 114, 236)"
          >
            Apollo 247 employees or representatives will NEVER ask you for your
            personal information i.e. your bank account details,, PIN, CVV etc.
            For your own safety, DO NOT share these details with anyone over
            phone, SMS, or E-mail.
          </td>
        </tr>
        <tr>
          <td>
            <table
              cellspacing="0"
              cellpadding="0"
              style="width: 60%; margin: 0 auto"
            >
              <tr>
                <td style="padding: 10px; text-align: center">
                  <a href="">
                    <img src="../../assets/app-store.png" alt="App store" width="150" />
                  </a>
                </td>
                <td style="padding: 10px; text-align: center">
                  <a href="">
                    <img src="../../assets/gplay-store.png" alt="App store" width="150" />
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td
            style="
              font-size: 10px;
              color: #888;
              text-align: center;
              padding: 30px 0 0;
            "
          >
            ©2020-Apollo 247, All rights reserved.
          </td>
        </tr>
      </tfoot>
    </table>
  </body>
</html>
`);