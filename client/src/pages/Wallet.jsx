import React, { useState, useEffect } from 'react';
import BalanceCard from '../components/wallet/BalanceCard';
import WalletAnalytics from '../components/wallet/WalletAnalytics';
import TransactionHistory from '../components/wallet/TransactionHistory';
import FundModal from '../components/wallet/FundModal';
import { useWalletStore } from '../context/store';

const Wallet = () => {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'deposit' });
  const { fetchTransactions, fetchSummary } = useWalletStore();

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchSummary()]);
  }, []);

  const handleOpenModal = (type) => {
    setModalConfig({ isOpen: true, type });
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, type: 'deposit' });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Wallet Management</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Manage your virtual funds, view transaction history, and track cash flow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Balance & Analytics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <BalanceCard onOpenFundModal={handleOpenModal} />
          <WalletAnalytics />
        </div>

        {/* Right Column: Transaction History */}
        <div className="lg:col-span-1">
          <TransactionHistory />
        </div>
      </div>

      {/* Unified Fund Modal */}
      <FundModal 
        isOpen={modalConfig.isOpen} 
        onClose={handleCloseModal} 
        initialType={modalConfig.type} 
      />
    </div>
  );
};

export default Wallet;
