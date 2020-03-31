import React from 'react';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      marginTop: -88,
      fontSize: 18,
      [theme.breakpoints.down(900)]: {
        marginBottom: -80,
      },
      '& section': {
        paddingTop: 100,
        paddingBottom: 100,
        [theme.breakpoints.down(900)]: {
          paddingTop: 50,
          paddingBottom: 50,
        },
      },
      '& p': {
        marginBottom: 20,
        lineHeight: 1.5,
      },
      '& footer': {
        padding: '25px 0',
        textAlign: 'center',
        color: 'rgba(255,255,255,.3)',
        backgroundColor: '#222',
        fontSize: 12,
        '& p': {
          marginBottom: 10,
        },
        '& ul': {
          padding: 0,
          margin: 0,
          '& li': {
            listStyleType: 'none',
            display: 'inline-block',
            margin: '0 5px',
            '& a': {
              fontSize: 12,
              color: 'rgba(255,255,255,.3)',
            },
          },
        },
      },
    },
    container: {
      maxWidth: 1140,
      paddingLeft: 15,
      paddingRight: 15,
      margin: 'auto',
    },
  };
});

export const TermsAndConditions: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <section>
        <div className={classes.container}>
          <p>
            <strong>
              <u>Terms and Conditions</u>
            </strong>
          </p>
          <ol>
            <li>
              <strong>General </strong>
            </li>
          </ol>
          <p>
            We, at <em>Apollo247</em> (&ldquo;
            <strong>
              <em>Apollo247</em>
            </strong>
            &rdquo;, &ldquo;<strong>We</strong>,&rdquo; &ldquo;<strong>Us</strong>&rdquo;) provide
            services to all individuals accessing or using our app Apollo247 (&ldquo;
            <strong>App</strong>&rdquo;) for any reason (&ldquo;<strong>You</strong>&rdquo;, &ldquo;
            <strong>Yours</strong>&rdquo;, &ldquo;<strong>User</strong>&rdquo;) subject to the
            notices, terms, and conditions set forth in these terms and conditions (&ldquo;
            <strong>Terms and Conditions</strong>&rdquo;, &ldquo;<strong>Agreement</strong>&rdquo;,
            &ldquo;<strong>T&amp;C</strong>&rdquo;), read the Privacy Policy.
          </p>
          <p>
            The App is owned and operated by <em>AHEL</em>, a company duly incorporated under the
            provisions of the Companies Act, 2013<em>.</em>
          </p>
          <p>
            Any accessing or browsing of the and using the Services indicates your agreement to all
            the terms and conditions in this Agreement. If you disagree with any part of the Terms
            and Conditions, then you may discontinue access or use of the .
          </p>
          <ol start={2}>
            <li>
              <strong>Eligibility </strong>
            </li>
          </ol>
          <p>
            When you use the App, you represent that you meet the following primary eligibility
            criteria:
          </p>
          <ol>
            <li>
              You are at least 18 years old or visiting under the supervision of a parent or
              guardian, who in such a case will be deemed as the recipient / end-user of the
              Services for the purpose of these Terms and Conditions.
            </li>
            <li>
              You are legally competent to contract, and otherwise competent to receive the
              Services.
            </li>
            <li>
              You have not been previously suspended or removed by <em>Apollo247</em>, or
              disqualified for any other reason, from availing the Services.
            </li>
          </ol>
          <ol start={3}>
            <li>
              <strong>Our Services</strong>
            </li>
          </ol>
          <p>
            Through , we provide you with the following services (&ldquo;<strong>Services</strong>
            &rdquo;):
          </p>
          <ol>
            <li>
              <strong>Creating and maintaining user accounts:</strong>
            </li>
          </ol>
          <p>
            To use avail our Services, Users need to register on the App in order to use the
            functions, service or platform of the App. In order to register, you must provide
            certain personal details including your name, email address, birth date, gender, etc.
          </p>
          <ol>
            <li>
              <strong>Scheduling an appointment:</strong>
              <ul>
                <li>
                  You can book an appointment for a virtual consultation with a healthcare service
                  provider (&ldquo;<strong>HSP</strong>&rdquo;) listed on . Virtual consultations on
                  the App shall be available for family physician &amp; multi specialties.
                </li>
                <li>
                  You will receive a confirmation of appointment for a virtual consultation with an
                  HSP of your choice, on Apollo247 application and/or via SMS, email. reserves the
                  right to reschedule or cancel an appointment without any prior notice. The time
                  provided for consultation to you is indicative and actual consultation time may
                  change depending on the consulting HSP&rsquo;s discretion. Consultations can be
                  booked, rescheduled or cancelled free of cost in minimum fifteen minutes left from
                  consult slot start time for virtual consult and minimum thirty minutes left from
                  consult slot start time for physical consult for free. Maximum 3 free reschedules
                  are allowed for virtual consult and 1 free reschedule for physical consult.
                </li>
              </ul>
            </li>
          </ol>
          <ul>
            <li>
              Your consulting HSP reserves the right to provide post consultation free review.
            </li>
          </ul>
          <ol>
            <li>
              <strong>Holding virtual consultations: </strong>
            </li>
          </ol>
          <p>
            You can have a virtual consultation via video call or chat on the App with the HSP
            selected by you:
          </p>
          <ul>
            <li>
              Please ensure that you are equipped with proper video conference equipment and
              internet connectivity as required for the service you want to avail. In case of
              inadequate video conference equipment, technical error or defective internet
              connectivity, reserves the right to reschedule or cancel your appointment without any
              notice.
            </li>
            <li>
              You understand and acknowledge that there will not be any physical examination
              involved and the consultation services shall be provided remotely. The opinion
              delivered by the HSP shall solely be based on the verbal communication between the
              concerned HSP and the patient, and any test reports and other information
              provided/uploaded by you on the app.
            </li>
            <li>
              {' '}
              Services are not meant in any way for emergency and life-threatening conditions. It is
              advised to take the patient to the nearest hospital in such cases.
            </li>
          </ul>
          <ol>
            <li>
              <strong>Booking diagnostic lab tests</strong>
            </li>
          </ol>
          <p>
            To the extent any diagnostic test is prescribed by the consulting HSP, you may book an
            appointment for seeking only the lab, including but not limited to, blood diagnostic
            tests as available on . In addition, once the results of tests conducted are available,
            they may be accessed on the App as well.
          </p>
          <ol>
            <li>
              <strong>
                Receiving e-prescription from the HSP based on the virtual consultation.
              </strong>
            </li>
          </ol>
          <ol start={9}>
            <li>
              <strong>
                Ordering the delivery of medicines prescribed in the e-prescription upon payment for
                the same. Conditions in relation to payment are discussed below in Section 9.
              </strong>
            </li>
          </ol>
          <ol start={7}>
            <li>
              <strong>Accessing your medical records on .</strong>
            </li>
          </ol>
          <ol start={4}>
            <li>
              <strong>Your use of </strong>
            </li>
          </ol>
          <p>
            As an end-user and recipient of Services, when you use the , you agree to the following
            conditions of use:
          </p>
          <p>
            <strong>
              <em>Due diligence conditions:</em>
            </strong>
          </p>
          <ol>
            <li>
              You are solely responsible for the medical, health and personal information you
              provide on , and you are requested to use your discretion in providing such
              information.
            </li>
            <li>
              The advice of the doctor will depend upon the information you provide in . You will
              provide accurate and complete information everywhere on , based on which you will
              receive the Services.
            </li>
            <li>
              You will be solely responsible for all access to and use of this site by anyone using
              the password and identification originally assigned to you whether or not such access
              to and use of this site is actually authorized by you, including without limitation,
              all communications and transmissions and all obligations (including, without
              limitation, financial obligations) incurred through such access or use. You are solely
              responsible for protecting the security and confidentiality of the password and
              identification assigned to you.
            </li>
            <li>
              The information provided by you may be used by for the purpose of services including
              analysis, research, training and disclosure (where required) to its affiliates, agents
              and government authorities.
            </li>
            <li>
              The information provided by you can be kept with indefinitely and can be used without
              revealing your identity.
            </li>
            <li>
              We reserve the right to refuse service or terminate accounts at our discretion, if we
              believe that you have violated or are likely to violate applicable law or these Terms
              and Conditions.
            </li>
          </ol>
          <p>
            <strong>
              <em>Scope of Services:</em>
            </strong>
          </p>
          <ol>
            <li>
              The Services availed by you from a HSP via are an arrangement between you and the HSP
              you select. only facilitates connections between you and the HSP and bears no
              responsibility for the outcome of any such consultation obtained by you.
            </li>
            <li>
              <em>Apollo247</em> shall not be liable for misdiagnosis / faulty judgment /
              interpretation error / perception error/Adverse events/ inefficacy of prescribed
              treatment or advice/validity of the advice or prescription provided by the HSP /
              unavailability of the recommended or prescribed treatment or medication under any
              condition or circumstances. Users are advised to use their discretion for following
              the advice obtained post consultation from .
            </li>
            <li>
              You may view and access the content available on solely for the purposes of availing
              the Services, and only as per these Terms and Conditions. You shall not modify any
              content on or reproduce, display, publicly perform, distribute, or otherwise use such
              content in any way for any public or commercial purpose or for personal gain.
            </li>
          </ol>
          <p>
            <strong>
              <em>Prohibitions: </em>
            </strong>
          </p>
          <ol>
            <li>
              You may not reproduce, distribute, display, sell, lease, transmit, create derivative
              works from, translate, modify, reverse-engineer, disassemble, decompile or otherwise
              exploit the or any portion of it unless expressly permitted by <em>Apollo247</em> in
              writing.
            </li>
            <li>You may not make any commercial use of any of the information provided on .</li>
            <li>
              You may not impersonate any person or entity, or falsely state or otherwise
              misrepresent your identity, age or affiliation with any person or entity.
            </li>
            <li>
              You may not upload any content prohibited under applicable law, and / or designated as
              &ldquo;Prohibited Content&rdquo; under Section 5.
            </li>
          </ol>
          <ol start={5}>
            <li>
              <strong>Prohibited Content </strong>
            </li>
          </ol>
          <p>
            You shall not upload to, distribute, or otherwise publish through , the following
            Prohibited Content, which includes any content, information, or other material that:
          </p>
          <ol>
            <li>belongs to another person and which you do not own the rights to;</li>
            <li>
              is harmful, harassing, blasphemous defamatory, obscene, pornographic, pedophilic,
              invasive of another's privacy;
            </li>
            <li>is hateful, racially or ethnically objectionable, disparaging of any person;</li>
            <li>relates to or seems to encourage money laundering or gambling,</li>
            <li>harm minors in any way;</li>
            <li>infringes any patent, trademark, copyright or other proprietary rights;</li>
            <li>violates any law in India for the time being in force;</li>
            <li>deceives or misleads the addressee about the origin of your message;</li>
            <li>communicates any information which is grossly offensive or menacing in nature;</li>
            <li>impersonates another person;</li>
            <li>contains software viruses and malicious programs;</li>
            <li>
              threatens the unity, integrity, defence, security or sovereignty of India, friendly
              relations with foreign states, or public order; and
            </li>
            <li>
              incites any offence or prevents investigation of any offence or insults any other
              nation.
            </li>
          </ol>
          <p>
            You also understand and acknowledge that if you fail to adhere to the above, we have the
            right to remove such information and / or immediately terminate your access to the
            Services and / or to the .
          </p>
          <ol start={6}>
            <li>
              <strong>Indemnity</strong>
            </li>
          </ol>
          <p>
            You agree and undertake to indemnify and keep indemnified <em>Apollo247</em>, the
            concerned doctor/physician and for any losses, costs, charges and expenses including
            reasonable attorney fees that the concerned doctor/physician and may suffer on account
            of
          </p>
          <ol>
            <li>
              misdiagnosis / faulty judgment /interpretation errors / perception error arising from
            </li>
          </ol>
          <ul>
            <li>
              your failure to provide correct and / or complete clinical information / history about
              the patient in timely and clinically appropriate manner; or
            </li>
            <li>
              suppression of material facts; or your failure to provide relevant clinical
              information about the patient; or
            </li>
            <li>misinterpretation of the advice / prescription / diagnosis by you; or</li>
            <li>
              failure to follow doctor&rsquo;s advice / prescription by you; or
              <ol>
                <li>incorrect or inaccurate credit / debit card details provided by you; or</li>
                <li>using a credit / debit card which is not lawfully owned by you; or</li>
                <li>
                  if you permit a third party to use your password or other means to access your
                  account.
                </li>
              </ol>
            </li>
          </ul>
          <ol start={7}>
            <li>
              <strong>Limitation of Liability</strong>
            </li>
          </ol>
          <p>By using our Services, you confirm that you understand and agree to the following:</p>
          <ol start={7}>
            <li>
              The Services availed by you from a HSP via are provided to you by the HSP you select,
              and not by .
            </li>
            <li>
              only facilitates communications between you and the HSP and bears no responsibility
              for the quality and outcome of any such services obtained by you from the respective
              HSP.
            </li>
            <li>
              does not provide any medical or diagnostic services. If you receive any medical advice
              from a HSP you have contacted through , you are responsible for assessing such advice,
              the consequences of acting on such advice, and all post-consultation follow-up action,
              including following the HSP&rsquo;s instructions.
            </li>
            <li>
              In the event that markets or promotes any Services to you, please note that such
              Services will be provided by the relevant HSP, and you are responsible for undertaking
              an assessment regarding the suitability of such Services and such HSPs for your
              purposes. Marketing or promotion of Services should be considered as being for
              informational purposes only and does not constitute expert advice on the suitability
              of such services for your specific healthcare needs.
            </li>
            <li>
              The services provided through is not intended in any way to be a substitute for face
              to face consultation with a doctor. advices the users to make independent assessment
              in respect of its accuracy or usefulness and suitability prior to making any decision
              in reliance hereof.
            </li>
            <li>
              In no event will or its affiliates be liable to you for any special, indirect,
              incidental, consequential, punitive, reliance, or exemplary damages arising out of or
              relating to: (i) these Terms and Conditions and Privacy Policy; (ii) your use or
              inability to use the ; (iii) your use of any third party services including services
              provided by any HSP you contacted through .
            </li>
          </ol>
          <p>
            This section shall survive the termination of this agreement and the termination of your
            use of our Services.
          </p>
          <ol start={8}>
            <li>
              <strong>data &amp; information policy </strong>
            </li>
          </ol>
          <p>
            We respect your right to privacy in respect of any personal information provided to us
            for the purposes of availing our Services. To see how we collect and use your personal
            information, please see our Privacy Policy [<em>insert link</em>].
          </p>
          <p>
            By registering on the App, you consent to the sharing of any personal data of yours
            already held by PRISM with , in accordance with mutually accepted terms and conditions
            for the sharing of user data between PRISM and us.
          </p>
          <ol start={9}>
            <li>
              <strong>Intellectual property and ownership </strong>
            </li>
          </ol>
          <p>
            You recognize and agree that all copyright, registered trademarks and other intellectual
            property rights on all materials or contents provided as part of belong to us at all
            times or to those who grant us the license for their use.
          </p>
          <p>
            No use of these may be made without the prior written authorization of{' '}
            <em>Apollo247</em>.
          </p>
          <ol start={10}>
            <li>
              <strong>Other conditions</strong>
            </li>
            <li>
              <strong>Pricing and Payment </strong>
              <ul>
                <li>
                  You may use internet banking/debit/credit card/UPI/Wallet for making payment for
                  consultation charges. You shall be directed to our trusted payment gateway
                  partners once you proceed to make payment of Service fees.
                </li>
                <li>
                  shall not be liable in any manner whatsoever, if incorrect or inaccurate credit /
                  debit card details are provided by you for making the payment of consultation fees
                  or you use a credit/ debit card which is not lawfully owned by you or if you
                  permit a third party to use your password or other means to access your account.
                </li>
                <li>
                  shall keep the aforesaid information confidential at all times and shall not
                  utilize and share the same with any of the third parties unless it is an
                  authorized third-party website and / or required by law regulation or court order.
                </li>
              </ul>
            </li>
          </ol>
          <ol>
            <li>
              <strong>Delivery</strong>
              <ul>
                <li>
                  provides delivery of medicines/products ordered on the App. We provide free
                  delivery for orders over Rs.199. Our delivery charges are as follows: Rs.25.
                </li>
                <li>
                  In addition to payments by way of internet banking or debit/credit card as
                  described above, you may pay for medicines/products ordered on the App through
                  cash on delivery (&ldquo;<strong>COD</strong>&rdquo;)
                </li>
              </ul>
            </li>
          </ol>
          <ol>
            <li>
              <strong>Cancellation and refunds</strong>
            </li>
          </ol>
          <ul>
            <li>
              Refunds may be made in case a request is raised by the user by clicking the cancel
              button in the user dashboard in app within the stipulated deadline mentioned in the
              refund &amp; cancellation table above.
            </li>
            <li>
              Refunds will only be made against genuine and trackable cancellation requests
              generated by you by clicking on the cancellation button provided in the user dashboard
              in your account. Refund request against delays, nature of advice obtained, efficacy of
              treatment, health outcomes of consultation will not be entertained.
            </li>
            <li>
              Refunds may be processed within 15 working days from the receipt of a request from
              you. All communications with regards to refund should be sent to
              helpdesk@apollo247.com
            </li>
            <li>
              If the cancellation request is received prior to the order being shipped for delivery,
              a complete refund will be made. Once the order is shipped, cancellations are treated
              as returns and the process outlined in the returns section will be applicable.
            </li>
            <li>
              reserves the right to modify / implement a new pricing structure at any time prior to
              billing you for your initial payment or for future payments.
            </li>
          </ul>
          <ol>
            <li>
              <strong>Returns </strong>
            </li>
          </ol>
          <ul>
            <li>
              You may request a return of medicines/products delivered to you if you receive an
              incomplete order/ prescription, damaged or incorrect products or medicines. In any of
              these cases, a request for return has to be raised by clicking the option for return
              in the user dashboard of the App, within 7 days of receiving the incorrect or damaged
              products/damages.
            </li>
            <li>
              In addition to the above, if there is an error in filling the prescription by Us,
              please write to us on{' '}
              <a href="mailto:helpdesk@apollo247.com">helpdesk@apollo247.com</a> (24X7 customer
              support) with details of the error. We will request special authorization for a return
              of the prescription.
            </li>
            <li>
              Due to reasons of health, safety and fair use, the certain products such as personal
              hygiene and beauty products cannot be returned once purchased.
            </li>
            <li> reserves the right to refuse returns for certain products/medicines.</li>
          </ul>
          <ol>
            <li>
              <strong>AI Assistant</strong>
            </li>
          </ol>
          <p>
            uses an AI assistant to guide patients seeking medical help or treatment from the
            platform. This AI assistant&rsquo;s primary purposes are:
          </p>
          <ul>
            <li>
              to allow users to book or manage their appointments by letting them enter their
              symptoms, medical conditions or treatment that they are seeking to consult with a HSP;
            </li>
            <li>to guide the users with enquiries relating to appointments, timings;</li>
          </ul>
          <p>You understand that:</p>
          <ul>
            <li>You should never use the AI assistant in a medical or psychiatric emergency.</li>
            <li>
              You understand that in an emergency, you should dial 112 or visit the emergency
              department at Apollo Hospitals.
            </li>
            <li>
              You must be at least 18 years or older in order to use this platform and make
              transactions, including booking appointments.
            </li>
            <li>
              You can use this platform on behalf of other users (third parties) only if you are a
              legal guardian of such persons, meaning that you have the legal authority to care for
              the personal and property interests of such person.
            </li>
            <li>
              No content on the platform, is or should be considered, or used as a substitute for,
              medical advice, care, diagnosis or treatment.
            </li>
          </ul>
          <ol>
            <li>
              <strong>Accuracy of Information Displayed </strong>
            </li>
          </ol>
          <p>
            We have made every effort to display, as accurately as possible, the information
            provided by the relevant third parties including HSPs. However, we do not undertake any
            liability in respect of such information and or with respect to any other information in
            regard to which you are capable of conducting your own due diligence to ascertain
            accuracy.
          </p>
          <ol>
            <li>
              <strong>Packaging </strong>
            </li>
          </ol>
          <p>
            We comply with all packaging laws and regulations, <em>inter alia, </em>the Drugs and
            Cosmetics Rules, 1940 and rules thereunder, and the Legal Metrology Act, 2009, and the
            rules thereunder, to the extent the same may be applicable to the app.
          </p>
          <ol start={11}>
            <li>
              <strong>Third party links and resources </strong>
            </li>
          </ol>
          <p>
            Where any of the contain links to other sites and resources provided by third parties
            (including where our social media sharing plug-ins include links to third party sites),
            these links are provided for your information only. We have no control over the contents
            of those websites or resources and accept no responsibility for them or for any loss or
            damage that may arise from your use of them.
          </p>
          <ol start={12}>
            <li>
              <strong>Amendments</strong>
            </li>
          </ol>
          <p>
            We may from time to time update or revise these Terms and Conditions. Every time you
            wish to use the , please check the relevant Terms and Conditions to ensure you
            understand the terms that apply at that time.
          </p>
          <ol start={13}>
            <li>
              <strong>Events Beyond Our Control </strong>
            </li>
          </ol>
          <p>
            We will not be liable for any non-compliance or delay in compliance with any of the
            obligations we assume under any contract when caused by events that are beyond our
            reasonable control (&ldquo;<strong>Force Majeure</strong>&rdquo;). Force Majeure shall
            include any act, event, failure to exercise, omission or accident that is beyond our
            reasonable control, including, among others, the following:
          </p>
          <ol>
            <li>Strike, lockout or other forms of protest</li>
            <li>
              Civil unrest, revolt, invasion, terrorist attack or terrorist threat, war (declared or
              not) or threat or preparation for war.
            </li>
            <li>
              Fire, explosion, storm, flood, earthquake, collapse, epidemic or any other natural
              disaster.
            </li>
            <li>
              Inability to use public or private transportation and telecommunication systems.
            </li>
            <li>
              Acts, decrees, legislation, regulations or restrictions of any government or public
              authority including any judicial determination.
            </li>
          </ol>
          <p>
            Our obligations deriving from any contracts should be considered suspended during the
            period in which Force Majeure remains in effect and we will be given an extension of the
            period in which to fulfil these obligations by an amount of time we shall communicate to
            you, not being less than the time that the situation of Force Majeure lasted.&nbsp;
          </p>
          <ol start={14}>
            <li>
              <strong>Termination: </strong>
            </li>
          </ol>
          <ol>
            <li>
              This arrangement may be terminated by either party at any time, with or without cause.
            </li>
            <li>
              reserves the right to refuse the use of services immediately in case your conduct is
              deemed by to be in contravention of applicable acts, laws, rules and regulations or
              considered to be unethical / immoral.
            </li>
            <li>
              For change in law specifically, we reserve our rights to suspend our obligations under
              any contract indefinitely, and / or provide Services under revised Terms and
              Conditions.
            </li>
          </ol>
          <ol start={15}>
            <li>
              <strong>Applicable legislation and jurisdiction </strong>
            </li>
          </ol>
          <p>
            The use of our website and the product purchase contracts through said website shall be
            governed by the laws applicable in India. Any dispute relating to the use of our
            Services shall be subject to the non-exclusive jurisdiction of the Indian Courts.
          </p>
          <ol start={16}>
            <li>
              <strong>Contact Us</strong>
            </li>
          </ol>
          <p>
            If you have any query or grievances regarding the Services, Terms and Conditions and
            Privacy Policy, you may contact us at helpdesk@apollo247.com
          </p>
        </div>
      </section>
      <footer>
        <div className={classes.container}>
          <p>&copy; Apollo247 2020. All Rights Reserved.</p>
          <ul>
            <li>
              <Link to={clientRoutes.welcome()}>Home</Link>
            </li>
            <li>
              <Link to={clientRoutes.privacy()}>Privacy</Link>
            </li>
            <li>
              <Link to={clientRoutes.termsConditions()}>Terms</Link>
            </li>
            <li>
              <Link to={clientRoutes.FAQ()}>FAQ</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};
