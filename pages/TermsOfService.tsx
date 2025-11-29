import React from 'react';
import SEO from '../components/SEO';
import SectionHeading from '../components/SectionHeading';
import Breadcrumbs from '../components/Breadcrumbs';
import { COMPANY_NAME } from '../constants';

const TermsOfService: React.FC = () => {
  return (
    <div className="pt-24 pb-20 bg-white">
      <SEO title="Terms of Service" description={`Terms and Conditions for ${COMPANY_NAME}`} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Terms of Service' }]} className="mb-8" />
        
        <SectionHeading title="Terms of Service" subtitle="Please read these terms carefully before using our services." />

        <div className="prose prose-slate max-w-none">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing and using the website of {COMPANY_NAME}, you accept and agree to be bound by the terms 
            and provision of this agreement. In addition, when using these particular services, you shall be 
            subject to any posted guidelines or rules applicable to such services.
          </p>

          <h3>2. Services</h3>
          <p>
            {COMPANY_NAME} provides web development, AI integration, and digital marketing services. Detailed descriptions 
            of these services can be found on our website. We reserve the right to modify, suspend, or discontinue 
            any service at any time without notice.
          </p>

          <h3>3. Intellectual Property</h3>
          <p>
            <strong>Agency Content:</strong> The content, organization, graphics, design, compilation, magnetic translation, 
            digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks 
            and other proprietary (including but not limited to intellectual property) rights.
          </p>
          <p>
            <strong>Client Work:</strong> Upon full payment, intellectual property rights for custom code and designs 
            created specifically for the Client shall be transferred to the Client, subject to the terms of the specific 
            Service Agreement signed.
          </p>

          <h3>4. Payment Terms</h3>
          <ul>
            <li>Quotes are valid for 30 days from issuance.</li>
            <li>A deposit (typically 50%) is required before work commences.</li>
            <li>Final payment is due upon project completion and before final deployment.</li>
            <li>We reserve the right to pause work if payments are not made on schedule.</li>
          </ul>

          <h3>5. Limitation of Liability</h3>
          <p>
            In no event shall {COMPANY_NAME}, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
            loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of 
            or inability to access or use the Service.
          </p>

          <h3>6. Governing Law</h3>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which 
            {COMPANY_NAME} is established, without regard to its conflict of law provisions.
          </p>

          <h3>7. Changes to Terms</h3>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes 
            a material change will be determined at our sole discretion.
          </p>

          <h3>Contact Us</h3>
          <p>If you have any questions about these Terms, please contact us.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;