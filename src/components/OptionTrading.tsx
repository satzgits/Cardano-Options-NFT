import React, { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { format } from 'date-fns';
import { ShoppingCart, Tag, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface MarketOption {
  id: string;
  name: string;
  optionType: 'call' | 'put';
  strikePrice: number;
  expiryDate: Date;
  premium: number;
  seller: string;
  underlyingAsset: string;
  currentPrice: number;
}

export default function OptionTrading() {
  const { wallet, connected } = useWallet();
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [isLoading, setIsLoading] = useState(false);

  // Mock marketplace data
  const marketOptions: MarketOption[] = [
    {
      id: '1',
      name: 'CALL Option - ADA',
      optionType: 'call',
      strikePrice: 0.42,
      expiryDate: new Date(Date.now() + 86400000 * 2), // 2 days
      premium: 0.15,
      seller: 'addr1...abc123',
      underlyingAsset: 'ADA',
      currentPrice: 0.355
    },
    {
      id: '2',
      name: 'PUT Option - ADA',
      optionType: 'put',
      strikePrice: 0.33,
      expiryDate: new Date(Date.now() + 86400000 * 5), // 5 days
      premium: 0.08,
      seller: 'addr1...def456',
      underlyingAsset: 'ADA',
      currentPrice: 0.355
    },
    {
      id: '3',
      name: 'CALL Option - ADA',
      optionType: 'call',
      strikePrice: 0.38,
      expiryDate: new Date(Date.now() + 86400000 * 3), // 3 days
      premium: 0.12,
      seller: 'addr1...ghi789',
      underlyingAsset: 'ADA',
      currentPrice: 0.355
    }
  ];

  const buyOption = async (option: MarketOption) => {
    if (!connected) return;

    setIsLoading(true);
    try {
      // In real implementation, create transaction to buy option NFT
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      
      alert(`Successfully purchased ${option.name} for ${option.premium} ADA!\n\nThis would be a real transaction in the full implementation.`);
    } catch (error) {
      console.error('Error buying option:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const listOptionForSale = async () => {
    if (!connected) return;

    alert('List for sale functionality would allow you to:\n\n• Select an option NFT from your portfolio\n• Set a selling price\n• List it on the marketplace\n• Receive ADA when someone buys it');
  };

  const isInTheMoney = (option: MarketOption) => {
    if (option.optionType === 'call') {
      return option.currentPrice > option.strikePrice;
    } else {
      return option.currentPrice < option.strikePrice;
    }
  };

  const getTimeToExpiry = (expiryDate: Date) => {
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else {
      return `${hours}h`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-300">Option Marketplace</h2>
            <p className="text-gray-400">Buy and sell option NFTs with other traders</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-black/30 rounded-xl p-1 max-w-md">
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: 'buy', label: 'Buy Options', icon: ShoppingCart },
              { id: 'sell', label: 'Sell Options', icon: Tag }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id as 'buy' | 'sell')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-all ${
                  selectedTab === id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedTab === 'buy' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Available Options</h3>
            <div className="text-sm text-gray-400">
              {marketOptions.length} options available
            </div>
          </div>

          {marketOptions.map((option) => (
            <div key={option.id} className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-600 hover:border-blue-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    option.optionType === 'call' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {option.optionType === 'call' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{option.name}</h4>
                    <p className="text-sm text-gray-400">by {option.seller.slice(0, 12)}...</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isInTheMoney(option) ? 'text-green-400 bg-green-500/20 border border-green-500/30' : 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30'
                }`}>
                  {isInTheMoney(option) ? 'IN THE MONEY' : 'OUT OF MONEY'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-400">Strike Price</div>
                  <div className="font-bold text-white">${option.strikePrice}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="font-bold text-white">${option.currentPrice.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Premium</div>
                  <div className="font-bold text-white">{option.premium} ADA</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Time to Expiry</div>
                  <div className="font-bold text-white">{getTimeToExpiry(option.expiryDate)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Expires {format(option.expiryDate, 'MMM dd, HH:mm')}</span>
                </div>
                
                <button
                  onClick={() => buyOption(option)}
                  disabled={!connected || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{isLoading ? 'Buying...' : `Buy for ${option.premium} ADA`}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 text-center">
          <Tag className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-purple-300 mb-4">Sell Your Options</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            List your option NFTs for sale on the marketplace. Set your price and let other traders buy your positions.
          </p>
          
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6 max-w-md mx-auto">
            <h4 className="text-lg font-bold text-purple-300 mb-3">How it works:</h4>
            <ul className="text-sm text-gray-400 space-y-2 text-left">
              <li>• Select an option NFT from your portfolio</li>
              <li>• Set your desired selling price</li>
              <li>• List it on the marketplace</li>
              <li>• Receive ADA when someone buys it</li>
            </ul>
          </div>

          <button
            onClick={listOptionForSale}
            disabled={!connected}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            {connected ? 'List Option for Sale' : 'Connect Wallet to Sell'}
          </button>
        </div>
      )}

      {!connected && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
          <p className="text-yellow-300">
            Please connect your wallet to access the trading marketplace
          </p>
        </div>
      )}
    </div>
  );
}