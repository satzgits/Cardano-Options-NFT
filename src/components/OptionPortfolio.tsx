import React, { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { format, isAfter } from 'date-fns';
import { Wallet, TrendingUp, TrendingDown, Clock, Target, Zap, Eye, AlertTriangle } from 'lucide-react';

interface OptionNFT {
  assetId: string;
  assetName: string;
  quantity: string;
  metadata?: {
    name: string;
    description: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
    optionData?: {
      strikePrice: number;
      expiryTimestamp: number;
      underlyingAsset: string;
      optionType: 'call' | 'put';
      premium: number;
      createdAt: number;
      exercised: boolean;
    };
  };
}

export default function OptionPortfolio() {
  const { wallet, connected } = useWallet();
  const [optionNFTs, setOptionNFTs] = useState<OptionNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionNFT | null>(null);
  const [currentADAPrice, setCurrentADAPrice] = useState(0.355); // Mock price

  useEffect(() => {
    if (connected) {
      fetchOptionNFTs();
    }
  }, [connected]);

  const fetchOptionNFTs = async () => {
    if (!connected) return;

    setIsLoading(true);
    try {
      // Get all assets from wallet
      const assets = await wallet.getAssets();
      
      // Filter for option NFTs (in real implementation, filter by policy ID or metadata)
      const options: OptionNFT[] = assets
        .filter((asset: any) => 
          asset.assetName && 
          (asset.assetName.includes('CardanoOption') || asset.assetName.includes('Option'))
        )
        .map((asset: any) => ({
          assetId: asset.unit,
          assetName: asset.assetName,
          quantity: asset.quantity,
          // Mock metadata for demo - in real app, fetch from blockchain
          metadata: {
            name: `CALL Option - ADA`,
            description: `Option contract: CALL ADA at $0.40 strike`,
            attributes: [
              { trait_type: "Option Type", value: "CALL" },
              { trait_type: "Strike Price (USD)", value: "0.40" },
              { trait_type: "Underlying Asset", value: "ADA" },
              { trait_type: "Expiry Date", value: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd HH:mm') },
              { trait_type: "Premium (ADA)", value: "0.1" },
              { trait_type: "Status", value: "Active" }
            ],
            optionData: {
              strikePrice: 0.40,
              expiryTimestamp: Date.now() + 86400000, // 24 hours from now
              underlyingAsset: 'ADA',
              optionType: 'call' as const,
              premium: 0.1,
              createdAt: Date.now() - 3600000, // 1 hour ago
              exercised: false
            }
          }
        }));

      setOptionNFTs(options);
    } catch (error) {
      console.error('Error fetching option NFTs:', error);
      
      // Mock data for demo
      const mockOptions: OptionNFT[] = [
        {
          assetId: 'mock001',
          assetName: 'CardanoOption001',
          quantity: '1',
          metadata: {
            name: 'CALL Option - ADA',
            description: 'Option contract: CALL ADA at $0.40 strike, expires in 23h',
            attributes: [
              { trait_type: "Option Type", value: "CALL" },
              { trait_type: "Strike Price (USD)", value: "0.40" },
              { trait_type: "Underlying Asset", value: "ADA" },
              { trait_type: "Expiry Date", value: format(new Date(Date.now() + 82800000), 'yyyy-MM-dd HH:mm') },
              { trait_type: "Premium (ADA)", value: "0.1" },
              { trait_type: "Status", value: "Active" }
            ],
            optionData: {
              strikePrice: 0.40,
              expiryTimestamp: Date.now() + 82800000, // 23 hours
              underlyingAsset: 'ADA',
              optionType: 'call',
              premium: 0.1,
              createdAt: Date.now() - 3600000,
              exercised: false
            }
          }
        },
        {
          assetId: 'mock002',
          assetName: 'CardanoOption002',
          quantity: '1',
          metadata: {
            name: 'PUT Option - ADA',
            description: 'Option contract: PUT ADA at $0.35 strike, expires in 5h',
            attributes: [
              { trait_type: "Option Type", value: "PUT" },
              { trait_type: "Strike Price (USD)", value: "0.35" },
              { trait_type: "Underlying Asset", value: "ADA" },
              { trait_type: "Expiry Date", value: format(new Date(Date.now() + 18000000), 'yyyy-MM-dd HH:mm') },
              { trait_type: "Premium (ADA)", value: "0.05" },
              { trait_type: "Status", value: "Active" }
            ],
            optionData: {
              strikePrice: 0.35,
              expiryTimestamp: Date.now() + 18000000, // 5 hours
              underlyingAsset: 'ADA',
              optionType: 'put',
              premium: 0.05,
              createdAt: Date.now() - 7200000,
              exercised: false
            }
          }
        }
      ];
      setOptionNFTs(mockOptions);
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = (expiryTimestamp: number) => {
    return Date.now() > expiryTimestamp;
  };

  const isInTheMoney = (option: OptionNFT) => {
    if (!option.metadata?.optionData) return false;
    
    const { optionType, strikePrice } = option.metadata.optionData;
    
    if (optionType === 'call') {
      return currentADAPrice > strikePrice;
    } else {
      return currentADAPrice < strikePrice;
    }
  };

  const calculateProfitLoss = (option: OptionNFT) => {
    if (!option.metadata?.optionData) return 0;
    
    const { optionType, strikePrice, premium } = option.metadata.optionData;
    
    let intrinsicValue = 0;
    if (optionType === 'call' && currentADAPrice > strikePrice) {
      intrinsicValue = currentADAPrice - strikePrice;
    } else if (optionType === 'put' && currentADAPrice < strikePrice) {
      intrinsicValue = strikePrice - currentADAPrice;
    }
    
    return intrinsicValue - premium;
  };

  const getStatusColor = (option: OptionNFT) => {
    if (!option.metadata?.optionData) return 'text-gray-400';
    
    if (isExpired(option.metadata.optionData.expiryTimestamp)) {
      return 'text-red-400';
    }
    
    if (isInTheMoney(option)) {
      return 'text-green-400';
    }
    
    return 'text-yellow-400';
  };

  const getStatusText = (option: OptionNFT) => {
    if (!option.metadata?.optionData) return 'Unknown';
    
    if (isExpired(option.metadata.optionData.expiryTimestamp)) {
      return 'EXPIRED';
    }
    
    if (isInTheMoney(option)) {
      return 'IN THE MONEY';
    }
    
    return 'OUT OF MONEY';
  };

  const exerciseOption = async (option: OptionNFT) => {
    if (!option.metadata?.optionData || !connected) return;
    
    try {
      // In real implementation, create transaction to exercise option
      console.log('Exercising option:', option.assetId);
      alert(`Exercise functionality would be implemented here!\n\nOption: ${option.metadata.name}\nProfit: $${calculateProfitLoss(option).toFixed(4)}`);
    } catch (error) {
      console.error('Error exercising option:', error);
    }
  };

  if (!connected) {
    return (
      <div className="text-center py-16">
        <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-300 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">Please connect your wallet to view your option NFTs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-300">My Option Portfolio</h2>
              <p className="text-gray-400">Manage your option NFTs and track performance</p>
            </div>
          </div>
          <button
            onClick={fetchOptionNFTs}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Eye className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="text-blue-300 text-sm font-medium">Total Options</div>
            <div className="text-2xl font-bold text-white">{optionNFTs.length}</div>
          </div>
          <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="text-green-300 text-sm font-medium">In The Money</div>
            <div className="text-2xl font-bold text-white">
              {optionNFTs.filter(option => isInTheMoney(option)).length}
            </div>
          </div>
          <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
            <div className="text-red-300 text-sm font-medium">Expired</div>
            <div className="text-2xl font-bold text-white">
              {optionNFTs.filter(option => 
                option.metadata?.optionData && isExpired(option.metadata.optionData.expiryTimestamp)
              ).length}
            </div>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
            <div className="text-purple-300 text-sm font-medium">Total P&L</div>
            <div className="text-2xl font-bold text-white">
              ${optionNFTs.reduce((sum, option) => sum + calculateProfitLoss(option), 0).toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Options List */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your option NFTs...</p>
        </div>
      ) : optionNFTs.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">No Option NFTs Found</h3>
          <p className="text-gray-400">Create your first option NFT to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {optionNFTs.map((option) => {
            const optionData = option.metadata?.optionData;
            if (!optionData) return null;

            const profitLoss = calculateProfitLoss(option);
            const timeToExpiry = optionData.expiryTimestamp - Date.now();
            const hoursToExpiry = Math.max(0, Math.floor(timeToExpiry / (1000 * 60 * 60)));

            return (
              <div key={option.assetId} className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-600 hover:border-purple-500/50 transition-colors">
                {/* Option Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      optionData.optionType === 'call' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {optionData.optionType === 'call' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{option.metadata?.name}</h3>
                      <p className="text-sm text-gray-400">{option.assetName}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(option)} border ${
                    getStatusText(option) === 'EXPIRED' ? 'border-red-500/30 bg-red-500/20' :
                    getStatusText(option) === 'IN THE MONEY' ? 'border-green-500/30 bg-green-500/20' :
                    'border-yellow-500/30 bg-yellow-500/20'
                  }`}>
                    {getStatusText(option)}
                  </div>
                </div>

                {/* Option Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Strike Price</div>
                    <div className="font-bold text-white">${optionData.strikePrice}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Current Price</div>
                    <div className="font-bold text-white">${currentADAPrice.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Premium Paid</div>
                    <div className="font-bold text-white">{optionData.premium} ADA</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">P&L</div>
                    <div className={`font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${profitLoss.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Expiry Info */}
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {isExpired(optionData.expiryTimestamp) ? 
                      'Expired' : 
                      `Expires in ${hoursToExpiry}h`
                    }
                  </span>
                  <span className="text-xs text-gray-500">
                    ({format(new Date(optionData.expiryTimestamp), 'MMM dd, HH:mm')})
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => exerciseOption(option)}
                    disabled={isExpired(optionData.expiryTimestamp) || !isInTheMoney(option)}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Exercise</span>
                  </button>
                  <button
                    onClick={() => setSelectedOption(option)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </button>
                </div>

                {/* Warning for near expiry */}
                {!isExpired(optionData.expiryTimestamp) && hoursToExpiry < 6 && (
                  <div className="mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm">Option expires soon!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Option Details Modal */}
      {selectedOption && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Option Details</h3>
              <button
                onClick={() => setSelectedOption(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">Asset ID</div>
                <div className="text-white font-mono text-sm break-all">{selectedOption.assetId}</div>
              </div>
              
              {selectedOption.metadata?.attributes?.map((attr, index) => (
                <div key={index}>
                  <div className="text-sm text-gray-400">{attr.trait_type}</div>
                  <div className="text-white">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}