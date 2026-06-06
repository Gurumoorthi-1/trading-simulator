import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Footer from '../components/landing/Footer';

// ─── Shared Layout ──────────────────────────────────────────────────────────

const LegalPage = ({ title, lastUpdated, children }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <div className="bg-dark-bg min-h-screen text-slate-300">
            <LandingNavbar />

            <div className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
                        <p className="text-slate-500">Last Updated: {lastUpdated}</p>
                    </div>

                    <div className="space-y-10 bg-dark-card p-8 md:p-12 rounded-3xl border border-dark-border shadow-2xl">
                        {children}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

// ─── Reusable Section Components ────────────────────────────────────────────

const Section = ({ number, title, children }) => (
    <section>
        <h2 className="text-xl font-bold text-white mb-3 flex items-start gap-2">
            <span className="text-primary-400">{number}.</span> {title}
        </h2>
        <div className="text-slate-400 leading-relaxed space-y-3 pl-6">{children}</div>
    </section>
);

const BulletList = ({ items }) => (
    <ul className="list-disc pl-5 space-y-1.5">
        {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
);

const InfoBox = ({ children }) => (
    <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 text-primary-300 text-sm leading-relaxed">
        {children}
    </div>
);

const ContactBox = () => (
    <div className="bg-dark-bg border border-dark-border rounded-xl p-6 mt-4">
        <p className="text-white font-semibold mb-2">Contact Us</p>
        <p>Email: <a href="mailto:support@tradesim.in" className="text-primary-400 hover:underline">support@tradesim.in</a></p>
        <p className="text-slate-500 text-sm mt-2">We aim to respond to all queries within 2–3 business days.</p>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// 1. PRIVACY POLICY
// ═══════════════════════════════════════════════════════════════════════════

export const PrivacyPolicy = () => (
    <LegalPage title="Privacy Policy" lastUpdated="June 06, 2026">

        <InfoBox>
            TradeSim ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our educational stock market simulation platform at tradesim.in ("Platform"). By accessing or using TradeSim, you consent to the practices described in this policy.
        </InfoBox>

        <Section number="1" title="About TradeSim">
            <p>TradeSim is a <strong className="text-slate-300">purely educational, simulation-based platform</strong>. We do not facilitate real-money trading, investment advisory services, brokerage services, financial securities transactions, or any form of gambling or betting. All virtual balances, simulated trades, and portfolio data exist solely for learning and educational purposes and have no real-world monetary value.</p>
        </Section>

        <Section number="2" title="Information We Collect">
            <p>We collect the following categories of personal information:</p>
            <BulletList items={[
                "Identity Data: Full name, username or display name.",
                "Contact Data: Email address used for account registration.",
                "Account Data: Subscription plan, subscription status, subscription expiry dates, and virtual balance (for simulation only).",
                "Technical Data: IP address, browser type and version, operating system, time zone, device identifiers, and access logs.",
                "Usage Data: Pages visited, features used, simulation trades placed, AI assistant interactions, and session duration.",
                "Payment Data: When you purchase a subscription, payment is processed by Razorpay (a PCI-DSS compliant third-party payment gateway). TradeSim does not store your card details, bank account information, or UPI credentials. We only retain a payment confirmation reference, transaction ID, and the subscription plan activated.",
            ]} />
        </Section>

        <Section number="3" title="How We Use Your Information">
            <p>We use your personal data for the following purposes:</p>
            <BulletList items={[
                "To create and manage your TradeSim account.",
                "To provide access to simulation tools and features based on your subscription plan.",
                "To process subscription payments securely via Razorpay.",
                "To send transactional communications (e.g., payment confirmations, subscription renewal notices).",
                "To deliver AI-powered portfolio insights and trade suggestions within the platform.",
                "To detect, prevent, and address technical issues or fraudulent activity.",
                "To analyse aggregate usage patterns to improve platform features.",
                "To respond to your support queries.",
            ]} />
        </Section>

        <Section number="4" title="Legal Basis for Processing">
            <p>We process your personal data under the following legal bases:</p>
            <BulletList items={[
                "Contractual Necessity: To fulfil our obligations under the subscription agreement.",
                "Legitimate Interests: To operate, maintain, and improve our platform.",
                "Legal Compliance: To comply with applicable Indian laws and regulations.",
                "Consent: Where explicitly obtained (e.g., marketing communications).",
            ]} />
        </Section>

        <Section number="5" title="Data Sharing and Third Parties">
            <p>We do not sell, trade, or rent your personal information. We may share data with:</p>
            <BulletList items={[
                "Razorpay Software Pvt. Ltd. – for payment processing. Subject to Razorpay's Privacy Policy.",
                "MongoDB Atlas – for secure, encrypted cloud database storage.",
                "Groq / Google Gemini – for AI-powered analysis (only anonymised portfolio data is sent; no PII is transmitted).",
                "Legal authorities – where required by applicable law, court order, or government regulation.",
            ]} />
        </Section>

        <Section number="6" title="Data Retention">
            <p>We retain your personal data for as long as your account is active or as required to provide our services. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., payment records required for GST compliance).</p>
        </Section>

        <Section number="7" title="Cookies and Tracking">
            <p>TradeSim uses session cookies and authentication tokens to keep you logged in and to secure your session. We do not use advertising or tracking cookies. You may configure your browser to refuse cookies; however, this may affect platform functionality.</p>
        </Section>

        <Section number="8" title="Data Security">
            <p>We implement industry-standard security measures to safeguard your data:</p>
            <BulletList items={[
                "HTTPS / TLS encryption for all data in transit.",
                "Bcrypt password hashing – passwords are never stored in plain text.",
                "JWT (JSON Web Token) based authentication with expiry controls.",
                "Rate limiting and CSRF protection on all API endpoints.",
                "MongoDB Atlas security with IP whitelisting and encrypted storage.",
            ]} />
        </Section>

        <Section number="9" title="Your Rights">
            <p>You have the following rights over your personal data:</p>
            <BulletList items={[
                "Right to Access: Request a copy of personal data we hold about you.",
                "Right to Rectification: Request correction of inaccurate data.",
                "Right to Erasure: Request deletion of your account and associated data.",
                "Right to Object: Object to processing based on legitimate interests.",
                "Right to Data Portability: Request your data in a machine-readable format.",
            ]} />
            <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:support@tradesim.in" className="text-primary-400 hover:underline">support@tradesim.in</a>.</p>
        </Section>

        <Section number="10" title="Children's Privacy">
            <p>TradeSim is not intended for persons under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has registered without parental consent, please contact us immediately.</p>
        </Section>

        <Section number="11" title="Changes to This Policy">
            <p>We may update this Privacy Policy periodically. Material changes will be communicated via email or a prominent notice on the Platform. Continued use of TradeSim after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section number="12" title="Contact Information">
            <p>For privacy-related queries, requests, or complaints:</p>
            <ContactBox />
        </Section>
    </LegalPage>
);

// ═══════════════════════════════════════════════════════════════════════════
// 2. TERMS & CONDITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const TermsConditions = () => (
    <LegalPage title="Terms & Conditions" lastUpdated="June 06, 2026">

        <InfoBox>
            Please read these Terms and Conditions ("Terms") carefully before using the TradeSim platform. By accessing or using TradeSim, you agree to be legally bound by these Terms. If you do not agree to any part of these Terms, you must discontinue use of the Platform immediately.
        </InfoBox>

        <Section number="1" title="Definitions">
            <BulletList items={[
                '"Platform" refers to TradeSim, accessible at tradesim.in and its associated mobile-responsive web application.',
                '"User", "You", or "Your" refers to any individual who registers for and/or uses the Platform.',
                '"We", "Us", or "Our" refers to TradeSim and its operators.',
                '"Subscription" refers to the paid access tiers (Basic, Pro, Enterprise) offered on the Platform.',
                '"Virtual Funds" refers to simulated balances used solely for educational purposes within the Platform.',
            ]} />
        </Section>

        <Section number="2" title="Nature of the Platform – Educational Simulation Only">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 text-sm space-y-2">
                <p className="font-bold text-amber-200">⚠️ IMPORTANT DISCLAIMER</p>
                <p>TradeSim is exclusively an <strong>educational stock market simulation platform</strong>. The following are explicitly NOT provided:</p>
                <BulletList items={[
                    "Real-money trading or investment services.",
                    "Brokerage services or securities transactions.",
                    "Investment advisory or portfolio management advice.",
                    "Any form of gambling, betting, or wagering.",
                    "Financial instruments, derivatives, commodities, or forex trading.",
                ]} />
                <p>All market data, prices, virtual balances, and simulated trades on the Platform are for educational and demonstration purposes only. They do not reflect actual market conditions and have no real-world financial value.</p>
            </div>
        </Section>

        <Section number="3" title="Eligibility and Account Registration">
            <BulletList items={[
                "You must be at least 18 years of age to create an account on TradeSim.",
                "You must provide accurate, current, and complete information during registration.",
                "You are responsible for maintaining the confidentiality of your account credentials.",
                "You must notify us immediately of any unauthorised use of your account.",
                "One person may maintain only one account. Duplicate accounts may be terminated.",
                "TradeSim reserves the right to refuse or terminate accounts at its sole discretion.",
            ]} />
        </Section>

        <Section number="4" title="Subscription Plans and Payments">
            <p>TradeSim offers the following subscription tiers:</p>
            <BulletList items={[
                "Basic Plan – Free of charge. Access to core simulation features.",
                "Pro Plan – ₹199/month. Includes real-time data, unlimited trades, AI suggestions (50/day), and advanced analytics.",
                "Enterprise Plan – ₹999/month. Full access to all features including unlimited AI, advanced risk tools, and dedicated support.",
            ]} />
            <p className="mt-2">All subscription payments are processed through <strong className="text-slate-300">Razorpay</strong>, a PCI-DSS compliant payment gateway. By initiating a payment, you agree to Razorpay's Terms of Service and Privacy Policy.</p>
            <BulletList items={[
                "Subscriptions are billed on a monthly cycle from the date of activation.",
                "Prices displayed are inclusive of applicable taxes (GST where applicable).",
                "Subscription access is granted immediately upon successful payment confirmation.",
                "TradeSim does not store credit card, debit card, UPI, or banking credentials.",
            ]} />
        </Section>

        <Section number="5" title="User Responsibilities and Acceptable Use">
            <p>You agree to:</p>
            <BulletList items={[
                "Use the Platform solely for lawful, educational purposes.",
                "Not attempt to manipulate, reverse-engineer, or exploit the simulation engine or any Platform feature.",
                "Not upload or transmit malicious code, spam, or harmful content.",
                "Not impersonate any other user, entity, or TradeSim personnel.",
                "Not attempt to gain unauthorised access to any part of the Platform or its infrastructure.",
                "Comply with all applicable laws and regulations of the Republic of India.",
            ]} />
        </Section>

        <Section number="6" title="Intellectual Property">
            <p>All content, features, source code, trade names, logos, design elements, and AI-generated insights on TradeSim are the exclusive intellectual property of TradeSim or its licensors. You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform for personal educational purposes only.</p>
            <p>You may not reproduce, distribute, modify, create derivative works of, or commercially exploit any part of the Platform without prior written consent.</p>
        </Section>

        <Section number="7" title="Disclaimer of Investment Advice">
            <p>Nothing on TradeSim constitutes financial, investment, tax, legal, or trading advice. The AI-powered insights, trade suggestions, risk analysis scores, and portfolio analytics provided are for educational simulation purposes only. TradeSim does not hold any licence from SEBI (Securities and Exchange Board of India) as a registered investment advisor or broker.</p>
            <p className="mt-2"><strong className="text-slate-200">We strongly advise you not to make real-world financial decisions based on the Platform's content.</strong></p>
        </Section>

        <Section number="8" title="Limitation of Liability">
            <p>To the maximum extent permitted by applicable law:</p>
            <BulletList items={[
                "TradeSim shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.",
                "We are not responsible for any financial loss, data loss, or reputational harm resulting from reliance on Platform content.",
                "Our total aggregate liability for any claim arising under these Terms shall not exceed the amount paid by you for your current monthly subscription.",
                "TradeSim is not liable for service interruptions, data inaccuracies, or delays in third-party payment processing.",
            ]} />
        </Section>

        <Section number="9" title="Termination">
            <p>TradeSim reserves the right to suspend or terminate your account at any time for:</p>
            <BulletList items={[
                "Violation of these Terms or our Acceptable Use Policy.",
                "Non-payment or failed payment for a subscription.",
                "Fraudulent, abusive, or illegal activity on the Platform.",
                "Any conduct that TradeSim, in its sole discretion, deems harmful to the Platform or other users.",
            ]} />
            <p className="mt-2">Upon termination, your right to access the Platform ceases immediately. Subscription fees paid are subject to our Refund & Cancellation Policy.</p>
        </Section>

        <Section number="10" title="Governing Law and Dispute Resolution">
            <p>These Terms shall be governed by and construed in accordance with the <strong className="text-slate-300">laws of the Republic of India</strong>. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in <strong className="text-slate-300">Chennai, Tamil Nadu, India</strong>.</p>
        </Section>

        <Section number="11" title="Modifications to Terms">
            <p>We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised "Last Updated" date. Continued use of the Platform after such modifications constitutes your acceptance of the new Terms.</p>
        </Section>

        <Section number="12" title="Contact">
            <p>For any questions regarding these Terms, please contact us:</p>
            <ContactBox />
        </Section>
    </LegalPage>
);

// ═══════════════════════════════════════════════════════════════════════════
// 3. REFUND & CANCELLATION POLICY
// ═══════════════════════════════════════════════════════════════════════════

export const RefundPolicy = () => (
    <LegalPage title="Refund & Cancellation Policy" lastUpdated="June 06, 2026">

        <InfoBox>
            This Refund & Cancellation Policy governs all subscription purchases made on the TradeSim platform (tradesim.in). By purchasing a subscription, you acknowledge that you have read, understood, and agreed to this policy. All payments are processed by Razorpay, our authorised payment gateway partner.
        </InfoBox>

        <Section number="1" title="Subscription Plans">
            <p>TradeSim offers monthly subscription plans as follows:</p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm mt-3 rounded-xl overflow-hidden border border-dark-border">
                    <thead className="bg-dark-bg text-slate-300">
                        <tr>
                            <th className="text-left px-4 py-3">Plan</th>
                            <th className="text-left px-4 py-3">Price</th>
                            <th className="text-left px-4 py-3">Billing Cycle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                        <tr className="bg-dark-card/50">
                            <td className="px-4 py-3 text-white font-medium">Basic</td>
                            <td className="px-4 py-3">Free</td>
                            <td className="px-4 py-3">Permanent</td>
                        </tr>
                        <tr className="bg-dark-card/50">
                            <td className="px-4 py-3 text-white font-medium">Pro</td>
                            <td className="px-4 py-3">₹199 / month</td>
                            <td className="px-4 py-3">Monthly</td>
                        </tr>
                        <tr className="bg-dark-card/50">
                            <td className="px-4 py-3 text-white font-medium">Enterprise</td>
                            <td className="px-4 py-3">₹999 / month</td>
                            <td className="px-4 py-3">Monthly</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">All prices are in Indian Rupees (INR) and inclusive of applicable GST.</p>
        </Section>

        <Section number="2" title="Payment Processing">
            <BulletList items={[
                "All subscription payments are securely processed by Razorpay Software Pvt. Ltd.",
                "Payments can be made via Credit Card, Debit Card, UPI, Net Banking, or Wallets supported by Razorpay.",
                "Upon successful payment, you will receive a payment confirmation and your subscription will be activated immediately.",
                "TradeSim does not store any sensitive payment credentials (card numbers, UPI IDs, bank account details).",
                "A payment receipt will be sent to your registered email address.",
            ]} />
        </Section>

        <Section number="3" title="Refund Policy">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 text-sm mb-4">
                <p className="font-bold text-amber-200 mb-1">General Policy</p>
                <p>All sales are final. As TradeSim is a digital subscription service with <strong>immediate access granted upon payment</strong>, we do not offer refunds once a subscription has been activated and platform access has been granted.</p>
            </div>
            <p>This policy is consistent with the nature of SaaS (Software-as-a-Service) digital products where the service is delivered electronically and access to premium features is granted instantaneously.</p>
        </Section>

        <Section number="4" title="Exceptions – When Refunds May Be Considered">
            <p>TradeSim may, at its sole discretion, consider refund requests in the following exceptional circumstances:</p>
            <BulletList items={[
                "Technical Failure: If you were charged but did not receive platform access due to a verifiable technical error on our part.",
                "Duplicate Payment: If you were charged more than once for the same subscription period due to a payment gateway error.",
                "Subscription Not Activated: If your payment was successfully deducted but your subscription plan was not activated within 24 hours.",
                "Service Unavailability: If the Platform was completely inaccessible for more than 72 consecutive hours during your paid subscription period.",
            ]} />
            <p className="mt-2">Refund requests under exceptional circumstances must be submitted within <strong className="text-slate-300">7 days</strong> of the payment date, with supporting evidence (screenshots, transaction IDs). Approved refunds will be processed within <strong className="text-slate-300">7–10 business days</strong> to the original payment source, subject to Razorpay's processing timelines.</p>
        </Section>

        <Section number="5" title="Cancellation Policy">
            <BulletList items={[
                "You may cancel your subscription at any time from your account Settings page.",
                "Upon cancellation, your premium subscription access will remain active until the end of your current billing period.",
                "No partial refunds will be issued for unused days within an active billing period.",
                "After the billing period ends, your account will automatically revert to the free Basic plan.",
                "Cancellation does not delete your account or stored simulation data.",
                "To re-activate a premium plan, you may subscribe again at any time.",
            ]} />
        </Section>

        <Section number="6" title="Non-Refundable Scenarios">
            <p>Refunds will <strong className="text-slate-300">not</strong> be provided in the following cases:</p>
            <BulletList items={[
                "You changed your mind after the subscription was activated.",
                "You did not use the premium features during your subscription period.",
                "Your account was suspended or terminated due to a violation of our Terms & Conditions.",
                "You purchased a plan by mistake (downgrade or plan changes are not grounds for refund).",
                "Dissatisfaction with AI-generated suggestions or simulated data, as these are educational tools and not financial advisories.",
            ]} />
        </Section>

        <Section number="7" title="How to Request a Refund">
            <p>If you believe you qualify for a refund under the exceptional circumstances listed in Section 4, please follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
                <li>Email us at <a href="mailto:support@tradesim.in" className="text-primary-400 hover:underline">support@tradesim.in</a> with the subject line: <strong className="text-slate-300">"Refund Request – [Your Registered Email]"</strong>.</li>
                <li>Include your registered email address, Razorpay transaction ID, date of payment, and a detailed description of the issue.</li>
                <li>Attach supporting evidence (screenshots, payment confirmation emails).</li>
                <li>Our support team will review your request within 3–5 business days and communicate the decision via email.</li>
            </ol>
        </Section>

        <Section number="8" title="Chargebacks">
            <p>Initiating a chargeback or payment dispute with your bank or card issuer without first contacting TradeSim support may result in immediate suspension of your account. We encourage you to resolve any billing concerns directly with us before escalating to your payment provider.</p>
        </Section>

        <Section number="9" title="Subscription Renewal">
            <p>TradeSim subscriptions are <strong className="text-slate-300">not auto-renewed</strong>. Each subscription is a one-time monthly purchase. To continue premium access beyond the current billing period, you must manually renew your subscription through the Platform's Pricing page.</p>
        </Section>

        <Section number="10" title="Contact for Refund and Billing Queries">
            <p>For any refund, billing, or cancellation related queries, please reach out to our support team:</p>
            <ContactBox />
            <p className="text-slate-500 text-sm mt-3">This policy was last reviewed and updated on June 06, 2026 in compliance with applicable Indian consumer protection and digital commerce regulations.</p>
        </Section>
    </LegalPage>
);
