import { useState } from 'react';
import { Subscription, subscriptionService } from '../services/subscriptionService';
import { useWallet } from './useWallet';

export const useSubscriptionPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { wallet, isConnected } = useWallet();

  const processPayment = async (subscription: Subscription) => {
    if (!isConnected || !wallet?.publicKey) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    setIsProcessing(true);

    try {
      // Initialize subscription service with wallet
      const service = new subscriptionService.constructor(
        subscriptionService.connection,
        wallet
      );

      // Process payment through smart contract
      const result = await service.processSubscriptionPayment(
        subscription,
        wallet.publicKey
      );

      if (result.success) {
        // Store subscription locally for demo purposes
        const activatedSubscription = {
          id: `${subscription.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          name: subscription.name,
          price: subscription.price,
          solPrice: subscription.solPrice,
          period: subscription.period,
          category: subscription.category,
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + getPeriodInMs(subscription.period)),
          cashbackEarned: subscription.price * 0.1, // 10% cashback
          nftMint: result.signature, // Use transaction signature as NFT mint reference
        };

        // Store in local storage
        const existing = subscriptionService.getActivatedSubscriptions();
        existing.push(activatedSubscription);
        localStorage.setItem('activatedSubscriptions', JSON.stringify(existing));

        return {
          success: true,
          subscription: activatedSubscription,
          transactionHash: result.signature
        };
      } else {
        return {
          success: false,
          error: result.error || 'Payment failed'
        };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const getActivatedSubscriptions = () => {
    return subscriptionService.getActivatedSubscriptions();
  };

  const getSubscriptionStats = () => {
    return subscriptionService.getSubscriptionStats();
  };

  // Helper function to convert period to milliseconds
  const getPeriodInMs = (period: string): number => {
    switch (period.toLowerCase()) {
      case 'year':
        return 365 * 24 * 60 * 60 * 1000;
      case 'month':
        return 30 * 24 * 60 * 60 * 1000;
      case 'week':
        return 7 * 24 * 60 * 60 * 1000;
      case 'day':
        return 24 * 60 * 60 * 1000;
      default:
        return 365 * 24 * 60 * 60 * 1000; // Default to 1 year
    }
  };

  return {
    isProcessing,
    processPayment,
    getActivatedSubscriptions,
    getSubscriptionStats,
  };
}; 