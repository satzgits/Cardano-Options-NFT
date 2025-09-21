import Head from "next/head";
import { CardanoWallet } from "@meshsdk/react";
import { useState } from "react";
import { TrendingUp, DollarSign, Timer, Trophy } from "lucide-react";
import OptionMinter from "../components/OptionMinter";
import OptionTrading from "../components/OptionTrading";
import PriceChart from "../components/PriceChart";
import OptionPortfolio from "../components/OptionPortfolio";
import WalletConnection from "../components/WalletConnection";

export default function Home() {
  const [activeTab, setActiveTab] = useState('mint');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mint':
        return <OptionMinter />;
      case 'trade':
        return <OptionTrading />;
      case 'chart':
        return <PriceChart />;
      case 'portfolio':
        return <OptionPortfolio />;
      default:
        return <OptionMinter />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white">
      <Head>
        <title>CardanoOptions - NFT Options Trading on Cardano</title>
        <meta name="description" content="Trade options as NFTs on Cardano blockchain. Transparent, decentralized options trading with AI sentiment analysis." />
      </Head>

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CardanoOptions
            </h1>
          </div>
          <CardanoWallet />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Options as NFTs
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Revolutionary options trading on Cardano. Mint option contracts as NFTs, 
            trade them on any marketplace, and exercise with transparent price oracles.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full border border-green-500/30">
              ✅ Testnet Ready
            </span>
            <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full border border-blue-500/30">
              🔗 Cardano Blockchain
            </span>
            <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full border border-purple-500/30">
              🤖 AI Sentiment
            </span>
          </div>
        </div>

        {/* Wallet Connection */}
        <WalletConnection />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 hover:border-purple-500/50 transition-all hover:scale-105">
            <DollarSign className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-purple-300">Mint Options</h3>
            <p className="text-gray-400 leading-relaxed">
              Create option contracts as tradeable NFTs. Set strike price, expiry, and underlying asset. 
              Each option is a unique NFT with metadata proving your rights.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 hover:border-blue-500/50 transition-all hover:scale-105">
            <Timer className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-blue-300">Price Oracles</h3>
            <p className="text-gray-400 leading-relaxed">
              Real-time ADA price feeds with transparent settlement. At expiry, smart contracts 
              automatically check conditions and execute payouts.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/30 hover:border-pink-500/50 transition-all hover:scale-105">
            <Trophy className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-pink-300">Trade & Exercise</h3>
            <p className="text-gray-400 leading-relaxed">
              Resell your option NFTs on any marketplace. Exercise profitable options 
              for instant settlement. Full transparency on Cardano testnet.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-purple-500/30 max-w-2xl mx-auto">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'mint', label: 'Mint Options', icon: DollarSign },
              { id: 'trade', label: 'Trade', icon: TrendingUp },
              { id: 'chart', label: 'Price Chart', icon: Timer },
              { id: 'portfolio', label: 'Portfolio', icon: Trophy }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  activeTab === id 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="mb-16">
          {renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-purple-500/30 py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            Built on Cardano Testnet • Powered by{" "}
            <a href="https://meshjs.dev" className="text-purple-400 hover:text-purple-300 transition-colors">
              MeshJS
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
