import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Star, Zap, Shield, Crown, CheckCircle2,
  Brain, LineChart, BarChart3, Wallet, Bell, Users,
  ChevronDown, Sparkles, ArrowRight, Loader2
} from 'lucide-react';
import { paymentApi } from '../utils/api';
import { useAuthStore } from '../context/store';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    period: 'Forever free',
    description: 'Perfect for beginners exploring the stock market.',
    icon: <Zap size={24} />,
    color: 'from-slate-600 to-slate-700',
    borderColor: 'border-slate-600/30',
    buttonStyle: 'bg-slate-700 hover:bg-slate-600 text-white',
    popular: false,
    features: [
      { text: 'Virtual ₹0 starting balance', included: true },
      { text: 'Basic stock market data', included: true },
      { text: '5 trades per day', included: true },
      { text: 'Portfolio tracking', included: true },
      { text: 'AI trade suggestions', included: false },
      { text: 'Advanced charting tools', included: false },
      { text: 'Risk analysis dashboard', included: false },
      { text: 'Priority support', included: false },
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    period: '/month',
    description: 'For serious traders who want an edge in the market.',
    icon: <Crown size={24} />,
    color: 'from-primary-600 to-purple-600',
    borderColor: 'border-primary-500/40',
    buttonStyle: 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white shadow-lg shadow-primary-500/25',
    popular: true,
    features: [
      { text: 'Virtual ₹199 starting balance', included: true },
      { text: 'Real-time stock market data', included: true },
      { text: 'Unlimited trades', included: true },
      { text: 'Advanced portfolio analytics', included: true },
      { text: 'AI trade suggestions (50/day)', included: true },
      { text: 'TradingView advanced charts', included: true },
      { text: 'Risk analysis dashboard', included: true },
      { text: 'Priority support', included: false },
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    period: '/month',
    description: 'Full access for professional traders and institutions.',
    icon: <Shield size={24} />,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/30',
    buttonStyle: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold shadow-lg shadow-amber-500/20',
    popular: false,
    features: [
      { text: 'Virtual ₹999 starting balance', included: true },
      { text: 'Real-time data + Level II quotes', included: true },
      { text: 'Unlimited trades + options', included: true },
      { text: 'Full portfolio suite analytics', included: true },
      { text: 'Unlimited AI suggestions', included: true },
      { text: 'All charting tools + indicators', included: true },
      { text: 'Full risk analysis + backtesting', included: true },
      { text: 'Dedicated account manager', included: true },
    ]
  }
];

const comparisonFeatures = [
  { name: 'Starting Balance', basic: '₹0', pro: '₹199', enterprise: '₹999' },
  { name: 'Daily Trade Limit', basic: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Market Data', basic: 'Delayed 15min', pro: 'Real-time', enterprise: 'Real-time + L2' },
  { name: 'AI Suggestions', basic: '—', pro: '50/day', enterprise: 'Unlimited' },
  { name: 'Charting Tools', basic: 'Basic', pro: 'Advanced', enterprise: 'Full Suite' },
  { name: 'Risk Analysis', basic: '—', pro: '✓', enterprise: '✓ + Backtesting' },
  { name: 'Support', basic: 'Community', pro: 'Priority Email', enterprise: 'Dedicated Manager' },
];

const faqs = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. Downgrades take effect at the end of your billing cycle.'
  },
  {
    q: 'Is my virtual money real?',
    a: 'No. TradeSim is a simulation platform. All trades are executed with virtual currency. This is a risk-free environment to learn and practice trading strategies.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, contact our support team for a full refund.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, UPI, net banking, and wallets through Razorpay.'
  },
  {
    q: 'Can I use the AI suggestions for real trading?',
    a: 'Our AI provides insights based on historical data and patterns. While the analysis is sophisticated, it is designed for educational purposes within our simulation. Always consult a financial advisor for real investments.'
  }
];

const PricingCard = ({ plan, index, onSelect, loading, loadingPlanId, currentPlan, isPremiumActive }) => {
  const isLoading = loading && loadingPlanId === plan.id;
  const isCurrentPlan = isPremiumActive
    ? currentPlan === plan.id
    : plan.id === 'basic';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`relative rounded-3xl p-[1px] ${plan.popular ? 'bg-gradient-to-b from-primary-500 to-purple-600' : 'bg-dark-border/60'}`}
    >
      {/* Popular Badge */}
      {plan.popular && !isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-primary-500/30">
            <Sparkles size={12} /> Most Popular
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 size={12} /> Current Plan
          </div>
        </div>
      )}

      <div className={`relative h-full bg-dark-card rounded-3xl p-6 md:p-8 flex flex-col overflow-hidden group`}>
        {/* Ambient Glow */}
        <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none bg-gradient-to-br ${plan.color} group-hover:opacity-20 transition-opacity duration-500`} />

        <div className="relative z-10 flex flex-col flex-1">
          {/* Icon & Name */}
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
            {plan.icon}
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
          <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

          {/* Price */}
          <div className="mb-8">
            <div className="flex items-end gap-1">
              <span className="text-4xl md:text-5xl font-black text-white">
                ₹{plan.price}
              </span>
              <span className="text-slate-400 text-sm font-medium mb-2">{plan.period}</span>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                {feature.included ? (
                  <Check size={18} className="text-profit shrink-0 mt-0.5" />
                ) : (
                  <X size={18} className="text-slate-600 shrink-0 mt-0.5" />
                )}
                <span className={feature.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <button
            onClick={() => onSelect(plan)}
            disabled={isLoading || isCurrentPlan}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isCurrentPlan ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed' : plan.buttonStyle} disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : isCurrentPlan ? (
              <>
                <CheckCircle2 size={16} />
                Active Plan
              </>
            ) : (
              <>
                {plan.price === 0 ? 'Get Started Free' : `Upgrade to ${plan.name}`}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card cursor-pointer"
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-light-text dark:text-white font-bold text-sm">{faq.q}</h4>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${openIndex === i ? 'rotate-180' : ''}`}
            />
          </div>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 pt-3 border-t border-light-border/50 dark:border-dark-border/50 leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

const PaymentSuccessModal = ({ isOpen, onClose, plan }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-[90%] max-w-sm bg-dark-card border border-dark-border rounded-3xl shadow-2xl p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-profit/10 flex items-center justify-center text-profit mx-auto mb-5"
            >
              <CheckCircle2 size={44} />
            </motion.div>
            <h2 className="text-2xl font-black text-white mb-2">Welcome to {plan?.name}!</h2>
            <p className="text-slate-400 text-sm mb-6">
              Your plan has been activated. Enjoy all the premium features.
            </p>
            <div className="bg-dark-bg border border-dark-border rounded-xl p-4 mb-6">
              <p className="text-slate-500 text-xs mb-1">Your new plan</p>
              <p className="text-white font-bold text-lg">{plan?.name} — ₹{plan?.price}{plan?.period}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-colors"
            >
              Start Trading
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PaymentFailedModal = ({ isOpen, onClose, error }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-[90%] max-w-sm bg-dark-card border border-dark-border rounded-3xl shadow-2xl p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-loss/10 flex items-center justify-center text-loss mx-auto mb-5"
            >
              <X size={44} />
            </motion.div>
            <h2 className="text-2xl font-black text-white mb-2">Payment Failed</h2>
            <p className="text-slate-400 text-sm mb-6">
              {error || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Premium = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const { user: authUser } = useAuthStore(); // renamed to avoid shadowing

  // Compute active plan status
  const isPremiumActive =
    authUser?.isPremium &&
    authUser?.premiumExpiresAt &&
    new Date(authUser.premiumExpiresAt) > new Date();
  const currentPlan = isPremiumActive ? authUser?.subscriptionPlan : null;

  const handleSelectPlan = async (plan) => {
    if (plan.price === 0) {
      // Basic plan - just update (if needed)
      setSelectedPlan(plan);
      return;
    }

    // Prevent duplicate purchase on frontend
    if (isPremiumActive && currentPlan === plan.id) {
      setErrorMessage(`You already have an active ${plan.name} plan.`);
      setShowFailure(true);
      return;
    }

    setLoading(true);
    setLoadingPlanId(plan.id);
    setSelectedPlan(plan);

    try {
      // 1. Create order on backend
      const orderRes = await paymentApi.createOrder(plan.id);
      const { order } = orderRes.data;
      console.log('Order received from backend:', order);

      // 2. Get user details for Razorpay
      const userStr = localStorage.getItem('user');
      const localUser = userStr ? JSON.parse(userStr) : null;

      // 3. Initialize Razorpay checkout
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Trade Sim',
        description: `${plan.name} Plan Subscription`,
        image: '', // Disable custom logo to prevent localhost image errors
        order_id: order.id,
        prefill: {
          name: localUser?.name || 'Test User',
          email: localUser?.email || 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
          escape: true,
          backdropclose: false
        },
        retry: {
          enabled: true,
          max_count: 1
        },
        handler: async function (response) {
          try {
            // 4. Verify payment on backend
            const verifyRes = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id
            });

            // 5. Update user in localStorage and store
            if (verifyRes.data.success && verifyRes.data.user) {
              localStorage.setItem('user', JSON.stringify(verifyRes.data.user));
              useAuthStore.setState({ user: verifyRes.data.user });
            }

            setShowSuccess(true);
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setErrorMessage('Payment verification failed. Please contact support.');
            setShowFailure(true);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        console.error('Payment failed:', response);
        try {
          await paymentApi.handleFailure({
            razorpay_order_id: order.id,
            error: response.error
          });
        } catch (e) {
          console.error('Failed to record payment failure:', e);
        }
        setErrorMessage(response.error?.description || 'Payment failed. Please try again.');
        setShowFailure(true);
      });
      rzp.open();

    } catch (err) {
      console.error('=== Error Creating Order on Frontend ===');
      console.error(err);
      if (err.response) {
        console.error('Backend Response Status:', err.response.status);
        console.error('Backend Response Data:', err.response.data);
      }
      setErrorMessage(err.response?.data?.message || 'Failed to create payment order. Please try again.');
      setShowFailure(true);
    } finally {
      setLoading(false);
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-primary-500/20">
          <Star size={14} /> Premium Membership
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
          Choose Your Trading Plan
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Unlock powerful features, advanced AI analytics, and unlimited trading to supercharge your simulation experience.
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6 mb-16">
        {plans.map((plan, index) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            index={index}
            onSelect={handleSelectPlan}
            loading={loading}
            loadingPlanId={loadingPlanId}
            currentPlan={currentPlan}
            isPremiumActive={isPremiumActive}
          />
        ))}
      </div>

      {/* Feature Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-16"
      >
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-8">Feature Comparison</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="px-6 py-4 text-slate-400 text-sm font-medium">Feature</th>
                <th className="px-6 py-4 text-slate-400 text-sm font-medium text-center">Basic</th>
                <th className="px-6 py-4 text-sm font-medium text-center">
                  <span className="text-primary-400">Pro</span>
                </th>
                <th className="px-6 py-4 text-sm font-medium text-center">
                  <span className="text-amber-400">Enterprise</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, i) => (
                <tr
                  key={i}
                  className={`border-b border-light-border/50 dark:border-dark-border/50 transition-colors ${i % 2 === 0 ? 'bg-light-bg/50 dark:bg-dark-bg/30' : 'bg-transparent'
                    }`}
                >
                  <td className="py-4 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">{feature.name}</td>
                  <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 text-center">{feature.basic}</td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">{feature.pro}</td>
                  <td className="py-2 px-4 text-center">
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">{feature.enterprise}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-10"
      >
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto">
          <FAQ />
        </div>
      </motion.div>

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        plan={selectedPlan}
      />

      {/* Payment Failed Modal */}
      <PaymentFailedModal
        isOpen={showFailure}
        onClose={() => setShowFailure(false)}
        error={errorMessage}
      />
    </div>
  );
};

export default Premium;
