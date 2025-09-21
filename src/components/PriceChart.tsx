import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, Activity } from 'lucide-react';
import axios from 'axios';
import useCardanoPrice from '../hooks/useCardanoPrice';

interface PriceData {
  timestamp: number;
  price: number;
  date: string;
}

interface SentimentData {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  signals: string[];
}

export default function PriceChart() {
  const { priceData: livePrice, loading: priceLoading, error } = useCardanoPrice();
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [sentiment, setSentiment] = useState<SentimentData>({
    sentiment: 'neutral',
    confidence: 0,
    signals: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock sentiment analysis function (in real app, use AI service)
  const generateSentiment = (priceChange: number, priceData: PriceData[]): SentimentData => {
    const signals: string[] = [];
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let confidence = 50;

    // Simple sentiment rules based on price movement
    if (priceChange > 5) {
      sentiment = 'bullish';
      confidence = Math.min(85, 60 + Math.abs(priceChange));
      signals.push('Strong 24h price increase');
    } else if (priceChange < -5) {
      sentiment = 'bearish';
      confidence = Math.min(85, 60 + Math.abs(priceChange));
      signals.push('Significant 24h price decline');
    }

    // Check recent trend
    if (priceData.length >= 7) {
      const recent = priceData.slice(-7);
      const trend = recent[recent.length - 1].price - recent[0].price;
      
      if (trend > 0) {
        signals.push('7-day upward trend');
        if (sentiment === 'neutral') sentiment = 'bullish';
      } else if (trend < 0) {
        signals.push('7-day downward trend');
        if (sentiment === 'neutral') sentiment = 'bearish';
      }
    }

    // Add volume-based signals (mocked)
    const volumeSignal = Math.random();
    if (volumeSignal > 0.7) {
      signals.push('High trading volume detected');
      confidence += 10;
    }

    // Add technical indicators (mocked)
    if (Math.random() > 0.6) {
      signals.push('RSI indicates oversold condition');
    }

    if (signals.length === 0) {
      signals.push('Market showing neutral signals');
    }

    return {
      sentiment,
      confidence: Math.max(30, Math.min(95, confidence)),
      signals
    };
  };

  const fetchPriceData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch current price and 24h change
      const currentResponse = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd&include_24hr_change=true'
      );
      
      const currentPrice = currentResponse.data.cardano.usd;
      const priceChange = currentResponse.data.cardano.usd_24h_change;
      
      setCurrentPrice(currentPrice);
      setPriceChange24h(priceChange);

      // Fetch 7 days of historical data
      const historicalResponse = await axios.get(
        'https://api.coingecko.com/api/v3/coins/cardano/market_chart?vs_currency=usd&days=7&interval=daily'
      );

      const prices = historicalResponse.data.prices;
      const formattedData: PriceData[] = prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        date: new Date(timestamp).toLocaleDateString()
      }));

      setPriceData(formattedData);
      
      // Generate AI sentiment
      const sentimentData = generateSentiment(priceChange, formattedData);
      setSentiment(sentimentData);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching price data:', error);
      
      // Fallback to mock data if API fails
      const mockData: PriceData[] = [];
      const basePrice = 0.35;
      const now = Date.now();
      
      for (let i = 6; i >= 0; i--) {
        const timestamp = now - (i * 24 * 60 * 60 * 1000);
        const randomChange = (Math.random() - 0.5) * 0.1;
        const price = basePrice + randomChange;
        
        mockData.push({
          timestamp,
          price,
          date: new Date(timestamp).toLocaleDateString()
        });
      }
      
      setPriceData(mockData);
      setCurrentPrice(0.355);
      setPriceChange24h(2.5);
      setSentiment({
        sentiment: 'bullish',
        confidence: 75,
        signals: ['Mock data: Positive momentum', 'Demo mode active']
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchPriceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Update current price and change from live data
  useEffect(() => {
    if (livePrice && !priceLoading) {
      setCurrentPrice(livePrice.price);
      setPriceChange24h(livePrice.change24h);
      setLastUpdate(new Date());
      
      // Update sentiment based on real price change
      const newSentiment = generateSentiment(livePrice.change24h, priceData);
      setSentiment(newSentiment);
    }
  }, [livePrice, priceLoading, priceData]);

  const formatPrice = (price: number) => {
    return price.toFixed(4);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-5 h-5" />;
      case 'bearish': return <TrendingDown className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-300">ADA Price</h3>
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            ${formatPrice(currentPrice)}
          </div>
          <div className={`flex items-center space-x-2 ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-medium">
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
            </span>
            <span className="text-gray-400 text-sm">24h</span>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-300">AI Sentiment</h3>
            <div className={getSentimentColor(sentiment.sentiment)}>
              {getSentimentIcon(sentiment.sentiment)}
            </div>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getSentimentColor(sentiment.sentiment)}`}>
            {sentiment.sentiment.toUpperCase()}
          </div>
          <div className="text-gray-400">
            {sentiment.confidence}% confidence
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-300">Last Update</h3>
            <button
              onClick={fetchPriceData}
              disabled={isLoading}
              className="text-green-400 hover:text-green-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="text-sm text-gray-400">
            {lastUpdate.toLocaleTimeString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Auto-refresh: 5min
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-blue-300 mb-6">ADA/USD Price Chart (7 Days)</h3>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-400">Loading chart data...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(3)}`}
              />
              <Tooltip
                labelStyle={{ color: '#1F2937' }}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-purple-300 mb-6">AI Market Sentiment Analysis</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${getSentimentColor(sentiment.sentiment)} bg-opacity-20`}>
              {getSentimentIcon(sentiment.sentiment)}
            </div>
            <div>
              <div className={`text-lg font-bold ${getSentimentColor(sentiment.sentiment)}`}>
                {sentiment.sentiment.toUpperCase()} SIGNAL
              </div>
              <div className="text-gray-400 text-sm">
                Confidence: {sentiment.confidence}%
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Key Signals:</h4>
            <ul className="space-y-2">
              {sentiment.signals.map((signal, index) => (
                <li key={index} className="text-sm text-gray-400 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}