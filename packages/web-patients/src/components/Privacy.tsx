import React from 'react';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { BottomLinks } from 'components/BottomLinks';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      fontSize: 18,
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
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
        padding: 40,
      },
    },
  };
});

export const Privacy: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <p>
            <strong>
              <u>Apollo247 Privacy Policy</u>
            </strong>
          </p>
          <p>
            This Privacy Policy governs how we, [insert name of NewCo] (collectively, &ldquo;
            <strong>[Initials of NewCo]</strong>&rdquo;, &ldquo;<strong>Apollo</strong>&rdquo;,
            &ldquo;<strong>Company</strong>&rdquo;, &ldquo;<strong>we</strong>,&rdquo; &ldquo;
            <strong>us</strong>,&rdquo; or &ldquo;<strong>our</strong>&rdquo;) collect, use, share
            and process your information, that you provide to us through your use of the app,
            Apollo247 and Website [insert website link] in the course of providing services (&ldquo;
            <strong>Services</strong>&rdquo;) as defined in the Terms and Conditions [insert link
            for terms and conditions] to you.
          </p>
          <p>
            [Initials of NewCo], owner of the Apollo247 website and app (&ldquo;
            <strong>Website</strong>&rdquo; / &ldquo;<strong>App</strong>&rdquo; respectively),
            respects your privacy, and seeks to comply with applicable legal requirements in respect
            of data collection, processing and transfer.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using this website / app, you
            agree to be bound by the terms described herein and all the terms incorporated by
            reference. If you do not agree to all of these terms, do not use this website / app.
          </p>
          <ol>
            <li>
              <strong>
                <em>What is Personal Information?</em>
              </strong>
            </li>
          </ol>
          <p>
            Personal information is that information which can be used to directly or indirectly
            identify you. It includes de-identified data that, when linked to other information
            available to us, would enable us to identify you. Personal data does not include data
            that has been irreversibly anonymized or aggregated so that we cannot identify you
            through it, even in conjugation conjunction with other information.
          </p>
          <p>
            &ldquo;Sensitive Personal Data or Information&rdquo; means Personal Information of any
            individual relating to password; financial information such as bank account or credit
            card or debit card or other payment instrument details; physical, physiological and
            mental health condition; sexual orientation; medical records and history; biometric
            information; any detail relating to the above as provided to or received by Apollo247
            for processing or storage. However, any data/ information relating to an individual that
            is freely available or accessible in public domain or furnished under the Right to
            Information Act, 2005 or any other law shall not qualify as Sensitive Personal Data or
            Information.
          </p>
          <p>
            By clicking "I accept" when downloading the App or proceeding to the Website, and/or
            using our services you represent that you voluntarily provide us with personal
            information including medical and financial information and consent to their collection,
            use and disclosure in accordance with this Privacy Policy. You also represent that you
            are duly authorised by any third party (including a child or an employer) whose
            information you share with us. We shall act as per your representation of authority and
            shall not make any independent enquiries to ascertain the veracity of your
            authorisation. In the event you do not have sufficient authorisation you shall be solely
            responsible for your acts and omissions including sharing of information with us by you
            and the consequential processing and actions taken by us in accordance with this Privacy
            Policy.
          </p>
          <ol start={2}>
            <li>
              <strong>
                <em>What types of data do we collect?</em>
              </strong>
            </li>
          </ol>
          <p>
            Apollo247, like many other websites uses &ldquo;Cookies&rdquo;. Cookies are small data
            files that a website stores on your web browser. These are used for the purpose of
            storing your preferences, previous activities browsing activities, profiling and
            tracking behaviour on this Website. By visiting Apollo247, you acknowledge, accept and
            expressly authorize the placement of cookies on your web browser. We recommend that you
            clear the cookies stored on your browser from time to time.
          </p>
          <p>
            When you sign up or register on the Apollo247 App or Website to use our Services, and
            during the course of actual usage of our Services, the types of information that will be
            collected by us include the following:
          </p>
          <ul>
            <li>Contact information: Name, Address, Contact details, Email ID, Phone Number;</li>
          </ul>
          <ol start={3}>
            <li>
              <strong>
                <em>Where do we collect your data from?</em>
              </strong>
            </li>
          </ol>
          <p>
            <strong>For end users: </strong>
          </p>
          <ul>
            <li>
              Any information that you voluntarily choose to provide to us through app, website,
              email, during interaction with us on call or chat and other modes of communication;
            </li>
            <li>
              Information that we collect from healthcare service provider (HSPs) such as doctors,
              hospitals, diagnostic centres, chemists etc. in the Apollo Group, to whom you have
              permitted the sharing of your personal information;
            </li>
            <li>
              Data you have provided to any group company of the Company, affiliates, associates,
              subsidiary, holding company of the Company, associates and subsidiaries of holding
              company of the Company, to whom you have given consent for sharing of such
              information.
            </li>
          </ul>
          <p>
            <strong>For doctors: </strong>
          </p>
          <ul>
            <li>
              Before onboarding you, we may request information regarding your qualifications,
              experience, public profile, and representations made by you to us;
            </li>
            <li>
              During your usage of the App / Website, we may collect information based on your use
              of the Services;
            </li>
            <li>
              We may collect other information that you voluntarily choose to provide to us through
              app, website, email, during interaction with us on call or chat and other modes of
              communication;
            </li>
            <li>
              We may collect information from any group company, affiliates, associates, subsidiary,
              holding company of the Company, associates and subsidiaries of holding company of the
              Company to whom you have given consent for sharing of information for availing value
              added service.
            </li>
          </ul>
          <ol start={4}>
            <li>
              <strong>
                <em>How do we use your data? </em>
              </strong>
            </li>
          </ol>
          <p>We use your Personal Information for purposes that include the following:</p>
          <p>
            <strong>General (end users and doctors):</strong>
          </p>
          <ul>
            <li>
              Your registration for the purpose of receiving our Services, identification,
              communication, notification and for fulfilment of the Terms and Conditions [Insert
              link of terms and conditions];
            </li>
            <li>
              Analysis, research, training and disclosure (where required) to its affiliates, agents
              and government authorities.
            </li>
            <li>
              Offering you personalized Services and targeted advertisements of various healthcare
              and wellness plans and offering you customised health insights;
            </li>
            <li>Improvement of our products and services;</li>
            <li>Research and analysis for the development of commercial solutions;</li>
            <li>
              Addressing your requests, queries and complaints, in any, pertaining to our Services;
              other customer care related activities;
            </li>
            <li>Investigating, enforcing, and resolving disputes;</li>
            <li>
              For the purpose of contacting you to provide you with information on new Services and
              offers, taking feedback, assisting you with completion of transactions or other issues
              relating to the use of Services;
            </li>
            <li>
              To send notices, communications, alerts, new offers relevant to use of the Services
              offered by Apollo247 on Website/app;
            </li>
            <li>
              Carrying out our obligations in relation to any agreement with our business partners
              or contractors;
            </li>
            <li>
              Technical administration and customization of Website, and other general
              administrative and business purposes;
            </li>
            <li>
              To send you information about special promotions or offers (either offered by
              Apollo247 or by its business partners), new features or products both of the Apollo as
              well as third-party offers or products with whom Apollo247 has a tie-up;
            </li>
          </ul>
          <p>
            <strong>For end users only: </strong>
          </p>
          <ul>
            <li>
              Creation and maintenance of health records in electronic form in the Personal Health
              Record (PHR) database;
            </li>
            <li>
              For sharing with your chosen HSP in the Apollo Group like doctors, hospitals,
              diagnostic centres, chemists who may provide you services under the Apollo247
              Platform.
            </li>
            <li>Processing any orders you may place using our Services;</li>
          </ul>
          <p>
            <strong>For doctors only: </strong>
          </p>
          <ul>
            <li>
              For verifying your professional credentials and any representations you have made to
              us;
            </li>
            <li>For processing any payments made to you;</li>
            <li>
              For providing recommendations to end users based on your expertise and
              specialisations;
            </li>
            <li>For providing any other service to you.</li>
          </ul>
          <ol start={5}>
            <li>
              <strong>
                <em>How long will we retain your data?</em>
              </strong>
            </li>
          </ol>
          <p>
            We store your personal information in accordance with applicable laws, which means we
            keep your data for as long as necessary to provide you with our Services or as may be
            required under any law. We shall store your personal information for lawful purposes
            only. We keep de-identified data for research and statistical purposes for a longer
            period.
          </p>
          <p>
            If you close your account, we have no obligation to retain your data, and we may delete
            any or all of your data without liability. However, we may retain data related to you if
            we believe it may be necessary to prevent fraud or future abuse, or if required by law,
            or for other legitimate purposes. We may continue to store your data in anonymised form
            for analytical and research purposes.
          </p>
          <ol start={6}>
            <li>
              <strong>
                <em>Disclosure and transfer of your data </em>
              </strong>
            </li>
          </ol>
          <p>
            We may disclose and in some cases transfer your personal information to such entities as
            required to provide services to you and to provide value added services or other third
            party products and services, to the extent permitted by applicable law. These entities
            may be located outside India, which you hereby consent to. We require such entities to
            protect your information through equivalent security measures as what we would adopt. An
            indicative list of entities we may disclose or transfer information to, are provided
            below:
          </p>
          <ol>
            <li>
              <strong>Service Providers</strong>: We share personal information with companies that
              provide Services on our behalf, such as website hosting, data storage, software
              services, email services, marketing, fulfilling customer orders, providing payment
              services, data analytics, data mining, providing customer services, and conducting
              surveys. These companies may be located within or outside India, but in any case are
              obligated to protect your data.
            </li>
          </ol>
          <p>
            We may also share information with employees, data processors, consultants, business
            partners and technology partners on a need to know basis. Such entities would be
            contractually obligated to maintain confidentiality in relation to your data.
          </p>
          <p>
            If you are an end user, your personal information will also be shared with your chosen
            HSPs.
          </p>
          <ol>
            <li>
              <strong>Business Affiliates</strong>: We may disclose or transfer some of your
              information to entities in the Apollo Group, affiliates, associates, subsidiary,
              holding company of the Company, associates and subsidiary of holding company of the
              Company including foreign entities, and in particular group companies and affiliates
              who are involved in the provision of products and services, to the extent permitted by
              applicable law.
            </li>
          </ol>
          <p>
            In the event of a merger, reorganization, acquisition, joint venture, assignment,
            spin-off, transfer, asset sale, or sale or disposition of all or any portion of our
            business, including in connection with any bankruptcy or similar proceedings, we may
            transfer any and all personal information to the relevant third party with the same
            rights of access and use.
          </p>
          <ol>
            <li>
              <strong>Law Enforcement Agencies</strong>: We may share information with law
              enforcement agencies pursuant to lawful requests for information, and otherwise as
              required under any law applicable at the given time, both in India and outside India.
            </li>
          </ol>
          <ol>
            <li>
              <strong>Other Third Parties</strong>:
            </li>
          </ol>
          <ul>
            <li>
              We may also disclose personal information if we determine in good faith that
              disclosure is reasonably necessary to protect our rights and pursue available
              remedies, enforce our terms and conditions, investigate fraud, or protect our
              operations or users.
            </li>
            <li>
              Anonymised, aggregated data that cannot re-identify you, may be shared with
              advertisers, research firms and other partners.
            </li>
          </ul>
          <ol start={7}>
            <li>
              <strong>
                <em>How do we protect your data?</em>
              </strong>
            </li>
          </ol>
          <p>
            We are committed towards maintaining the privacy of the information uploaded by you on
            the website and complies with the industry standard security safeguards for the purpose
            of securing the website and the information provided/uploaded by you.
          </p>
          <p>
            We use reasonable technical, administrative, and physical security measures for the
            purpose of safeguarding all data you share with us. We also have comprehensive internal
            policies in place to prevent unauthorized access to your data. We take adequate steps to
            ensure that third parties we share data with also adopt reasonable level of security
            practices and procedures to ensure the privacy and security of your information.
          </p>
          <p>
            However, we are not responsible for any loss, unauthorised access, safety issue or any
            harm caused to you by any misuse of your personal information, unless it is a direct and
            foreseeable consequence of negligence and non-compliance on our part only. You hereby
            acknowledge that we are not responsible, in particular, for any third party action or
            action on your part leading to loss, damage or harm to you or any other person.
          </p>
          <p>
            For any data loss or theft due to unauthorized access to your electronic devices through
            which you avail our Services, Company shall not be held liable for any loss whatsoever
            incurred by you. Further, you are liable to indemnify the Company as per the Terms of
            Use.
          </p>
          <ol start={8}>
            <li>
              <strong>
                <em>What are your rights?</em>
              </strong>
            </li>
          </ol>
          <p>
            We take reasonable steps to ensure that your personal information is accurate, complete,
            and up to date. However, you have the sole responsibility of ensuring that you review
            the accuracy of information provided by you and contact us in case of discrepancies, or
            in case you wish to discontinue the use of our services. You have the following rights
            with regard to your personal information:
          </p>
          <ul>
            <li>
              You have the right to access your personal information, and request correction and
              deletion. If your personal information changes, you may correct, delete inaccuracies,
              or amend information by making the change on our member information page or by
              contacting us through [Insert link of relevant email address for customer care]. We
              will make good faith efforts to make requested changes in our then active databases as
              soon as reasonably practicable. If you provide any information that is untrue,
              inaccurate, out of date or incomplete (or subsequently becomes untrue, inaccurate, out
              of date or incomplete), or we have reasonable grounds to suspect that the information
              provided by you is untrue, inaccurate, out of date or incomplete, we may, at our sole
              discretion, discontinue the provision of the Services to you. There may be
              circumstances where we will not correct, delete or update your Personal Information,
              including (a) where the Personal Information is opinion data that is kept solely for
              evaluative purpose; and (b) the Personal Information is in documents related to a
              prosecution if all proceedings relating to the prosecution have not been completed.
            </li>
            <li>
              You are free to not to share any medical or other information that you consider
              confidential and withdraw consent for us to use data that you have already provided.
              In the event that you refuse to share any information or withdraw consent to process
              information that you have previously given to us, we reserve the right to restrict or
              deny the provision of our services for which we consider such information to be
              necessary.
            </li>
            <li>
              You may contact [please insert details of Grievance Officer] for any questions or for
              exercise of these rights.
            </li>
          </ul>
          <p>Address:</p>
          <p>We will respond to your request within a reasonable time.</p>
          <ol start={9}>
            <li>
              <strong>
                <em>Third Party Websites and Services</em>
              </strong>
            </li>
          </ol>
          <p>
            Our Website and App may contain links to third party services, and give you the ability
            to access such third-party websites, products, and services. Please note that you may
            proceed to the use of such third party website or service at your own risk and the
            Company will not be held liable for any outcome or harm arising as a result of your use
            of such third party websites or services. Please read the privacy policies of any third
            party before proceeding to use their websites, products, or services.
          </p>
          <ol start={10}>
            <li>
              <strong>
                <em>Changes to this Privacy Policy</em>
              </strong>
            </li>
          </ol>
          <p>
            We may periodically revise or update this Privacy Policy. Your continued use of our
            products and services after the effective date of the Privacy Policy means that you
            accept the revised Privacy Policy. If you do not agree with any such revised terms,
            please refrain from using our Services and&nbsp;contact us to close any account you may
            have created.
          </p>
          <p>
            The Rubix Cube is is not the only twisty puzzle. Learn about Pyraminx, the 2x2 and 4x4
            cubes, the Megaminx on <a href="https://ruwix.com/">Ruwix.com</a>.
          </p>
        </div>
      </div>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};
