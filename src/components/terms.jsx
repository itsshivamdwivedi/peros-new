import React from "react";
import { ShieldCheck } from "lucide-react"; // Install lucide-react if not already

const TermsPage = () => {
  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto text-gray-800 sm:mt-[10vh]">
      <div className="flex items-center justify-center mb-8">
        <ShieldCheck className="w-8 h-8 text-green-600 mr-2" />
        <h1 className="text-4xl font-bold text-green-700 text-center">
          Terms and Conditions
        </h1>
      </div>

      <div className="space-y-6">
        <Section title="General Terms">
          <p>
            Welcome to Peros. By using this app, you agree to the following terms and conditions.
          </p>
        </Section>

        <Section title="Privacy Policy">
          <p className="mb-2">
            You may withdraw your consent by writing to the Grievance Officer. Mention <strong>“Withdrawal of consent for processing personal data”</strong> in the subject line.
          </p>
          <p className="mb-2">
            Your withdrawal will not be retrospective and must comply with our Terms, Privacy Policy, and applicable laws.
          </p>
          <p className="mb-2">
            We reserve the right to restrict services if necessary data is withdrawn.
          </p>
          <p>
            <strong>Changes to this Privacy Policy:</strong> Please review periodically. Updates may be provided as required under applicable laws.
          </p>
        </Section>

        <Section title="Privacy Policy">
  <p className="mb-2">
    At <strong>Peros</strong>, we value your privacy. Your personal data is stored securely and used only for providing and improving our services.
  </p>
  <p className="mb-2">
    You may withdraw your consent by writing to the Grievance Officer. Mention <strong>“Withdrawal of consent for processing personal data”</strong> in the subject line.
  </p>
  <p className="mb-2">
    Your withdrawal will not be retrospective and must comply with our Terms, Privacy Policy, and applicable laws.
  </p>
  <p className="mb-2">
    We reserve the right to restrict services if necessary data is withdrawn.
  </p>
  <p className="mb-4">
    <strong>Changes to this Privacy Policy:</strong> Please review periodically. Updates may be provided as required under applicable laws.
  </p>
  <div className="p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded">
    <strong>Your data is safe with us.</strong> Peros is fully committed to protecting your personal information and ensuring your privacy is never compromised.
  </div>
</Section>


        <Section title="Refund Policy">
          <p>We are not providing any kind of refund or return.</p>
        </Section>

        <Section title="Shipping Policy">
          <p>The product will be delivered within 7 days.</p>
        </Section>
      </div>

      <p className="text-sm text-gray-500 text-center mt-10">
        Last updated: <span className="font-medium">May 12, 2025</span>
        <p>&copy; 2025 Peros. All rights reserved.</p>
      </p>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="bg-gray-50 hover:bg-gray-100 transition-all duration-200 border border-gray-200 rounded-xl p-5 shadow-sm">
    <h2 className="text-xl font-semibold mb-2 text-green-600">{title}</h2>
    <div className="text-gray-700 leading-relaxed">{children}</div>
  </section>
);

export default TermsPage;
