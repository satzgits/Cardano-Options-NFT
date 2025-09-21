import { useEffect, useState } from "react";
import { useWallet } from '@meshsdk/react';
import { CardanoWallet } from '@meshsdk/react';

const WalletConnection = () => {
  const { connected, wallet, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && wallet) {
      const fetchWalletDetails = async () => {
        try {
          setLoading(true);
          const addr = await wallet.getChangeAddress();
          const balanceInfo = await wallet.getBalance();
          
          setAddress(addr);
          // Convert lovelace to ADA (1 ADA = 1,000,000 lovelace)
          const adaBalance = (parseInt(balanceInfo[0]?.quantity || '0') / 1000000).toFixed(2);
          setBalance(adaBalance);
        } catch (error) {
          console.error('Error fetching wallet details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchWalletDetails();
    } else {
      setAddress(null);
      setBalance(null);
    }
  }, [connected, wallet]);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 text-white">Wallet Connection</h3>
      
      {!connected ? (
        <div className="text-center">
          <p className="text-gray-300 mb-3">Connect your Cardano wallet to start trading options</p>
          <CardanoWallet />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-green-400 font-medium">✓ Wallet Connected</span>
            <button 
              onClick={disconnect}
              className="text-red-400 hover:text-red-300 text-sm underline"
            >
              Disconnect
            </button>
          </div>
          
          {loading ? (
            <div className="text-gray-300">Loading wallet details...</div>
          ) : (
            <div className="space-y-2">
              <div>
                <span className="text-gray-300 text-sm">Address:</span>
                <div className="text-white font-mono text-sm">
                  {address ? shortenAddress(address) : 'Loading...'}
                </div>
              </div>
              
              <div>
                <span className="text-gray-300 text-sm">Balance:</span>
                <div className="text-white font-semibold">
                  {balance ? `${balance} ADA` : 'Loading...'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnection;