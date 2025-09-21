import React, { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { ForgeScript, Mint, Transaction, resolveFingerprint } from '@meshsdk/core';
import { format, addDays, addHours } from 'date-fns';
import { DollarSign, Calendar, Target, Zap, AlertCircle } from 'lucide-react';

interface OptionMetadata {
  strikePrice: number;
  expiryDate: Date;
  underlyingAsset: string;
  optionType: 'call' | 'put';
  premium: number;
}

export default function OptionMinter() {
  const { wallet, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<OptionMetadata>({
    strikePrice: 0.40,
    expiryDate: addHours(new Date(), 24), // 24 hours from now
    underlyingAsset: 'ADA',
    optionType: 'call',
    premium: 0.1
  });

  const handleInputChange = (field: keyof OptionMetadata, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateNFTMetadata = (): any => {
    return {
      name: `${formData.optionType.toUpperCase()} Option - ${formData.underlyingAsset}`,
      description: `Option contract: ${formData.optionType} ${formData.underlyingAsset} at $${formData.strikePrice} strike, expires ${format(formData.expiryDate, 'PPP')}`,
      image: "ipfs://QmSampleImageHashForOptionNFT", // In real implementation, generate unique image
      attributes: [
        {
          trait_type: "Option Type",
          value: formData.optionType.toUpperCase()
        },
        {
          trait_type: "Strike Price (USD)",
          value: formData.strikePrice.toString()
        },
        {
          trait_type: "Underlying Asset",
          value: formData.underlyingAsset
        },
        {
          trait_type: "Expiry Date",
          value: format(formData.expiryDate, 'yyyy-MM-dd HH:mm')
        },
        {
          trait_type: "Premium (ADA)",
          value: formData.premium.toString()
        },
        {
          trait_type: "Status",
          value: "Active"
        }
      ],
      // Option contract data
      optionData: {
        strikePrice: formData.strikePrice,
        expiryTimestamp: formData.expiryDate.getTime(),
        underlyingAsset: formData.underlyingAsset,
        optionType: formData.optionType,
        premium: formData.premium,
        createdAt: new Date().getTime(),
        exercised: false
      }
    };
  };

  const mintOptionNFT = async () => {
    if (!connected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      // Generate unique asset name based on current timestamp
      const timestamp = Date.now().toString();
      const assetName = `CardanoOption${timestamp}`;
      
      // Create minting script (simple signature script for demo)
      const usedAddress = await wallet.getUsedAddresses();
      const address = usedAddress[0];
      
      const forgingScript = ForgeScript.withOneSignature(address);
      const assetId = forgingScript.hash + assetName;

      // Generate metadata for the option NFT
      const metadata = generateNFTMetadata();

      // Create the minting transaction
      const tx = new Transaction({ initiator: wallet });

      // Add minting action
      const asset: Mint = {
        assetName: assetName,
        assetQuantity: '1',
        metadata: metadata,
        label: '721', // NFT metadata label
        recipient: address
      };

      tx.mintAsset(forgingScript, asset);

      // Build and sign transaction
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      setTxHash(txHash);
      
      // Reset form
      setFormData({
        strikePrice: 0.40,
        expiryDate: addHours(new Date(), 24),
        underlyingAsset: 'ADA',
        optionType: 'call',
        premium: 0.1
      });

    } catch (err: any) {
      console.error('Minting error:', err);
      setError(err.message || 'Failed to mint option NFT');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-300">Create Option NFT</h2>
            <p className="text-gray-400">Mint your option contract as a tradeable NFT</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {txHash && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-300 font-medium mb-2">Option NFT Minted Successfully! 🎉</p>
            <p className="text-gray-400 text-sm break-all">
              Transaction Hash: {txHash}
            </p>
            <a 
              href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              View on CardanoScan
            </a>
          </div>
        )}

        <div className="space-y-6">
          {/* Option Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Option Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['call', 'put'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleInputChange('optionType', type)}
                  className={`p-4 rounded-xl border transition-all ${
                    formData.optionType === type
                      ? 'border-green-500 bg-green-500/20 text-green-300'
                      : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="text-lg font-bold">{type.toUpperCase()}</div>
                  <div className="text-xs">
                    {type === 'call' ? 'Right to buy' : 'Right to sell'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Strike Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Strike Price (USD)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.strikePrice}
              onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="0.40"
            />
          </div>

          {/* Underlying Asset */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Underlying Asset</label>
            <select
              value={formData.underlyingAsset}
              onChange={(e) => handleInputChange('underlyingAsset', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="ADA">ADA</option>
              <option value="BTC">BTC (Demo)</option>
              <option value="ETH">ETH (Demo)</option>
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Expiry Date & Time</span>
            </label>
            <input
              type="datetime-local"
              value={format(formData.expiryDate, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => handleInputChange('expiryDate', new Date(e.target.value))}
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Premium */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Premium (ADA)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.premium}
              onChange={(e) => handleInputChange('premium', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="0.1"
            />
          </div>

          {/* Summary */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <h3 className="text-lg font-bold text-purple-300 mb-3">Option Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white font-medium">{formData.optionType.toUpperCase()} Option</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Asset:</span>
                <span className="text-white font-medium">{formData.underlyingAsset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Strike:</span>
                <span className="text-white font-medium">${formData.strikePrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expires:</span>
                <span className="text-white font-medium">{format(formData.expiryDate, 'MMM dd, HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Premium:</span>
                <span className="text-white font-medium">{formData.premium} ADA</span>
              </div>
            </div>
          </div>

          {/* Mint Button */}
          <button
            onClick={mintOptionNFT}
            disabled={!connected || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-3"
          >
            <Zap className="w-5 h-5" />
            <span>
              {isLoading ? 'Minting...' : !connected ? 'Connect Wallet' : 'Mint Option NFT'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}