import React from 'react';
import SEO from '../components/SEO';
import SectionHeading from '../components/SectionHeading';
import Breadcrumbs from '../components/Breadcrumbs';
import { COMPANY_NAME } from '../constants';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-24 pb-20 bg-white">
      <SEO title="Privacy Policy" description={`Privacy Policy for ${COMPANY_NAME}`} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Privacy Policy' }]} className="mb-8" />
        
        <SectionHeading title="Privacy Policy" subtitle="Last Updated: October 2024" />

        <div className="prose prose-slate max-w-none">
          <p>
            At {COMPANY_NAME}, accessible from our website, one of our main priorities is the privacy of our visitors. 
            This Privacy Policy document contains types of information that is collected and recorded by {COMPANY_NAME} 
            and how we use it.
          </p>

          <h3>1. Information We Collect</h3>
          <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
          <ul>
            <li><strong>Contact Information:</strong> Name, email address, phone number, and company name when you fill out forms.</li>
            <li><strong>Project Details:</strong> Information regarding your business needs, budget, and timeline.</li>
            <li><strong>Usage Data:</strong> We may collect information on how the Service is accessed and used (via Google Analytics).</li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <p>We use the information we collect in various ways, including to:</p>
          <ul>
            <li>Provide, operate, and maintain our website.</li>
            <li>Improve, personalize, and expand our website.</li>
            <li>Understand and analyze how you use our website.</li>
            <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
            <li>Send you emails (e.g., project proposals, newsletters).</li>
          </ul>

          <h3>3. Cookies and Web Beacons</h3>
          <p>
            Like any other website, {COMPANY_NAME} uses 'cookies'. These cookies are used to store information including 
            visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is 
            used to optimize the users' experience by customizing our web page content based on visitors' browser type 
            and/or other information.
          </p>

          <h3>4. Third Party Privacy Policies</h3>
          <p>
            {COMPANY_NAME}'s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you 
            to consult the respective Privacy Policies of these third-party ad servers for more detailed information. 
            It may include their practices and instructions about how to opt-out of certain options.
          </p>

          <h3>5. GDPR Data Protection Rights</h3>
          <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
          <ul>
            <li>The right to access – You have the right to request copies of your personal data.</li>
            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
          </ul>

          <h3>Contact Us</h3>
          <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;