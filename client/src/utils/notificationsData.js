// Dummy notifications data for the Notifications Center

export const dummyNotifications = [
  {
    id: 'n1',
    category: 'alert',
    title: 'NVDA Price Alert',
    message: 'NVIDIA crossed your target price of $500. Currently trading at $505.22.',
    time: '2 min ago',
    read: false,
    icon: 'alert'
  },
  {
    id: 'n2',
    category: 'trade',
    title: 'Buy Order Filled',
    message: 'Successfully bought 10 shares of AAPL at $178.72.',
    time: '15 min ago',
    read: false,
    icon: 'trade_buy'
  },
  {
    id: 'n3',
    category: 'ai',
    title: 'TradeBot Insight',
    message: 'New BUY signal detected for MSFT with 91% confidence. Check AI Suggestions.',
    time: '32 min ago',
    read: false,
    icon: 'ai'
  },
  {
    id: 'n4',
    category: 'wallet',
    title: 'Deposit Confirmed',
    message: '$5,000 has been successfully added to your wallet from Chase •••• 4589.',
    time: '1 hr ago',
    read: true,
    icon: 'wallet'
  },
  {
    id: 'n5',
    category: 'trade',
    title: 'Sell Order Filled',
    message: 'Successfully sold 25 shares of XOM at $104.50. Profit: +$475.00.',
    time: '2 hrs ago',
    read: true,
    icon: 'trade_sell'
  },
  {
    id: 'n6',
    category: 'alert',
    title: 'Volatility Spike',
    message: 'TSLA volatility index spiked by 15%. Consider reviewing your positions.',
    time: '3 hrs ago',
    read: true,
    icon: 'alert'
  },
  {
    id: 'n7',
    category: 'ai',
    title: 'Portfolio Risk Alert',
    message: 'Your portfolio tech sector allocation exceeds 60%. Consider diversifying.',
    time: '5 hrs ago',
    read: true,
    icon: 'ai'
  },
  {
    id: 'n8',
    category: 'wallet',
    title: 'Withdrawal Processed',
    message: '$2,000 withdrawal to your linked bank account has been processed.',
    time: '1 day ago',
    read: true,
    icon: 'wallet'
  }
];
