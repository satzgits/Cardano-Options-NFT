import { useEffect, useState } from "react";
import axios from "axios";

interface PriceData {
  price: number;
  change24h: number;
  timestamp: number;
}

const useCardanoPrice = () => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    try {
      setError(null);
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd&include_24hr_change=true"
      );
      
      const data = response.data.cardano;
      setPriceData({
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        timestamp: Date.now()
      });
      setLoading(false);
    } catch (err) {
      console.error('Price fetch error:', err);
      
      // Fallback to mock data if API fails
      setPriceData({
        price: 0.45,
        change24h: 2.5,
        timestamp: Date.now()
      });
      setError("Using fallback price data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { priceData, loading, error, refetch: fetchPrice };
};

export default useCardanoPrice;