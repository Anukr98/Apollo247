import _ from 'lodash';

export const invoiceEmail = _.template(`
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8"> 
    <meta name="viewport" content="width=device-width"> 
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
    <meta name="x-apple-disable-message-reformatting">  
    <title>Apollo</title> 
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>

      html,
      body {
          margin: 0 auto !important;
          padding: 0 !important;
          height: 100% !important;
          width: 100% !important;
          background: #e5e5e5;
          font-family: 'IBM Plex Sans', sans-serif;
          color: #02475b;
          font-size: 16px;
          font-weight: 400;
      }
      * {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
      }

      /* What it does: Centers email on Android 4.4 */
      div[style*="margin: 16px 0"] {
          margin: 0 !important;
      }

/* What it does: Stops Outlook from adding extra spacing to tables. */
table,
td {
    mso-table-lspace: 0pt !important;
    mso-table-rspace: 0pt !important;
}

/* What it does: Fixes webkit padding issue. */
table {
    border-spacing: 0 !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
    margin: 0 auto !important;
}

/* What it does: Uses a better rendering method when resizing images in IE. */
img {
    -ms-interpolation-mode:bicubic;
}

/* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
a {
    text-decoration: none;
}

/* What it does: A work-around for email clients meddling in triggered links. */
*[x-apple-data-detectors],  /* iOS */
.unstyle-auto-detected-links *,
.aBn {
    border-bottom: 0 !important;
    cursor: default !important;
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
}

/* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
.a6S {
    display: none !important;
    opacity: 0.01 !important;
}

/* What it does: Prevents Gmail from changing the text color in conversation threads. */
.im {
    color: inherit !important;
}

/* If the above doesn't work, add a .g-img class to any image in question. */
img.g-img + div {
    display: none !important;
}

/* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
@media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
    u ~ div .email-container {
        min-width: 320px !important;
    }
}
/* iPhone 6, 6S, 7, 8, and X */
@media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
    u ~ div .email-container {
        min-width: 375px !important;
    }
}
/* iPhone 6+, 7+, and 8+ */
@media only screen and (min-device-width: 414px) {
    u ~ div .email-container {
        min-width: 414px !important;
    }
}

</style>

    <!-- CSS Reset : END -->

    <!-- Progressive Enhancements : BEGIN -->
<style>

.primary{
	background: #f3a333;
}

.bg_white{
	background: #ffffff;
}
.bg_light{
	background: #f3f3ef;
}
.bg_black{
	background: #000000;
}
.bg_dark{
	background: rgba(0,0,0,.8);
}
.email-section{
	padding:2.5em;
}

/*BUTTON*/
.btn{
	padding: 10px 15px;
}
.btn.btn-primary{
	border-radius: 30px;
	background: #f3a333;
	color: #ffffff;
}
.bold {
  font-weight: bold;
}
.mainHeading {
  font-size: 35px;
  font-weight: bold;
  color: #02475b;
  line-height: 48px;
  margin: 0;
}
.salutation {
  font-weight: 500;
  font-size: 18px;
}
.iconSection {
  padding: 10px;
}
.left {
  width: 35%;
  display: inline-block;
  vertical-align: top;
  text-align: center;
}
.right {
  width: 53%;
  display: inline-block;
  vertical-align: top;
}
.rightContentHead {
  font-size: 18px;
  font-weight: 600;
  color: #02475b;
}
.rightContentText {
  font-size: 11px;
  font-weight: 400;
  margin: 0;
}
.paddingTop {
  padding-top: 40px;
}
.paddingBottom {
  padding-bottom: 30px;
}
.ourjourneyDiv {
    position: absolute;
    top: 2px;
    left: 60px;
    text-align: center;
    background-color: #f3f3ef;
    width: 210px;
    height: 30px;
}
.ourjourneyDiv td {
  color: #fcb716;
    font-size: 21px;
    font-weight: 600; 
    font-style: italic;
}
.discTxt {
  font-size: 12px;
    line-height: 16px;
    padding: 10px 20px !important;
    text-align: center !important;
    color: #0087ba;
    padding: 0 60px !important;
    line-height: 20px;
    padding-bottom: 20px !important;
    padding-bottom: 30px;
    opacity: 0.8;
}
hr {
    display: block;
    height: 1px;
    border: 0;
    margin: 0;
    background: orange;
    padding: 0;
    width: 40%;
    margin: 15px auto 10px auto;
}
@media screen and (max-width: 480px) {
  .left {
  width: 100%;
  display: inline-block;
  vertical-align: top;
  text-align: left;
}
.right {
  width: 100%;
  display: inline-block;
  vertical-align: top;
}
.rightContentHead {
  font-size: 16px;
}
.mainHeading {
  font-size: 28px;
}
.salutation {
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
}
 hr {
   margin: 15px 0 10px 10px;
  }
}
</style>
</head>

<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #222222;">
	<center style="width: 100%; background-color: #e5e5e5;">
    <div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
      &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>
    <div style="max-width: 600px; margin: 0 auto;" class="email-container">
    	<!-- BEGIN BODY -->
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
      	<tr>
          <td class="bg_light logo" style="padding: 1em 2.5em 0.2em 2.5em; text-align: right">
            <a href="#">
              <img src="https://assets.apollo247.com/images/ic_logo.png" width="84" alt="apollo247"/>
            </a>
           </h1>
          </td>
        </tr><!-- end tr -->
        <tr>
          <td class="bg_light" style="padding: 1em 2.5em; text-align: left">
            <p class="mainHeading">Namaste <%-name%>,</p>
            <p>Thank you for choosing Apollo 247</p>
            <p>Please find the attached invoice for your <span class="bold">Appointment ID: <%-displayId%></span> with us.</p>
            <p>we hope to serve you best!</p>
            <p class="salutation">
              Regards <br/>
              Team Apollo247
            </p>
          </td>
        </tr><!-- end tr -->
				<tr>
          <td class="bg_light" style="padding: 1em 2.5em; text-align: left; position: relative;" >
            <table class="ourjourneyDiv">
              <tr>
                <td >
                  Our journey so far!
                </td>
              </tr>
            </table>
		        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="border: 1px solid #02475b;">
              <tr>
                <td class="iconSection paddingTop">
                  <span class="left">
                    <img src="https://assets.apollo247.com/images/ic-doctor.png" height="41" alt="apollo247"/>
                  </span>
                  <span class="right">
                    <span class="rightContentHead">5000+</span>
                    <h6 class="rightContentText"> Doctors Onboarded </h6>
                  </span>
                  <hr />
                </td>
                <td class="iconSection paddingTop">
                  <span class="left">
                    <img src="https://assets.apollo247.com/images/ic_medicines.png" height="41" alt="apollo247"/>
                  </span>
                  <span class="right">
                    <span class="rightContentHead">2 lakh+</span>
                    <h6 class="rightContentText">Successful Pharmacy Orders Placed</h6>
                  </span>
                  <hr />
                </td>
                <td class="iconSection paddingTop">
                  <span class="left">
                    <img src="https://assets.apollo247.com/images/ic-tests.png" height="41" alt="apollo247"/>
                  </span>
                  <span class="right">
                    <span class="rightContentHead">2 lakh+</span>
                    <h6 class="rightContentText">Consultaions on plotform</h6>
                  </span>
                  <hr />
                </td>
              </tr>
              <tr>
                <td class="iconSection paddingBottom">
                  <span class="left">
                    <img src="https://assets.apollo247.com/images/records.png" height="41" alt="apollo247" />
                  </span>
                  <span class="right">
                    <span class="rightContentHead">65000+</span>
                    <h6 class="rightContentText"> Health Records Created</h6>
                  </span>
                  <hr />
                </td>
                <td class="iconSection paddingBottom">
                  <span class="left">
                    <img src="https://assets.apollo247.com/images/customersserved.png" height="41" alt="apollo247" />
                  </span>
                  <span class="right">
                    <span class="rightContentHead">2 lakh+</span>
                    <h6 class="rightContentText">Happy Customers</h6>
                  </span>
                  <hr />
                </td>
                <td class="iconSection paddingBottom">
                  <span class="left">
                    <img src="https://assets.apollo247.com/images/custsatisfaction.png" height="41" alt="apollo247" />
                  </span>
                  <span class="right">
                    <span class="rightContentHead">100%</span>
                    <h6 class="rightContentText">Customer Satisfaction</h6>
                  </span>
                  <hr />
                </td>
              </tr>  
            </table>
          </td>
          </tr>
          <tr>
            <tr>
              <td class="bg_light logo discTxt" style="padding: 1em 2.5em 0.2em 2.5em; text-align: left;">
                Apollo 247 employees or representatives will Never ask you for your personal information i.e. your bank account details, PIN, CVV etc. For your own safety, DO NOT share these details with anyone over phone, SMS, or E-mail.
              </td> 
              </tr>
          </tr> 
      </table>    
    </div>
  </center>
</body>
</html>
`);