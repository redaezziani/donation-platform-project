import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslation } from 'react-i18next';
import { paymentAPI } from '../lib/api';
import stripePromise from '../lib/stripe';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { toast } from "sonner"
import { Alert, AlertDescription } from './ui/alert';
import { CreditCard } from 'lucide-react';

const DonationForm = ({ campaignId, onSuccess }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  // Form states
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Card element options
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const paymentIntent = await paymentAPI.createPaymentIntent({
        campaign_id: campaignId,
        amount: parseFloat(amount),
        currency: 'usd', // Keep USD for Stripe compatibility
        message: message || null,
        is_anonymous: isAnonymous,
        donor_name: isAnonymous ? null : (donorName || user?.full_name),
        donor_email: isAnonymous ? null : (donorEmail || user?.email),
      });

      // The paymentAPI.createPaymentIntent already returns response.data
      // So paymentIntent already contains { client_secret, payment_intent_id }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: isAnonymous ? 'Anonymous' : (donorName || user?.full_name),
              email: isAnonymous ? null : (donorEmail || user?.email),
            },
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message || t('donation.processing'));
      } else if (confirmedPayment.status === 'succeeded') {
        // Confirm with backend
        await paymentAPI.confirmPayment(confirmedPayment.id);
        
        // Show success toast with multi-language support
        toast.success(t('donation.successThankYou', { 
          amount: `${amount} ${t('common.sar')}` 
        }), {
          description: t('donation.successMessage'),
          duration: 5000,
          action: {
            label: t('donation.donateAgain'),
            onClick: () => {
              setAmount('');
              setMessage('');
              if (!isAuthenticated) {
                setDonorEmail('');
                setDonorName('');
              }
              elements.getElement(CardElement).clear();
            }
          }
        });
        
        onSuccess && onSuccess({
          amount: parseFloat(amount),
          paymentIntentId: confirmedPayment.id
        });
        
        // Reset form
        setAmount('');
        setMessage('');
        if (!isAuthenticated) {
          setDonorEmail('');
          setDonorName('');
        }
        elements.getElement(CardElement).clear();
      }
    } catch (error) {
      console.error('Donation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      setError(error.response?.data?.detail || error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t('campaign.donateToThis')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">{t('donation.donationAmount')} ({t('common.sar')})</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('donation.amount')}
              required
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[13, 27, 67, 133].map((quickAmount, index) => {
              const sarAmount = [50, 100, 250, 500][index];
              return (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="text-xs"
                >
                  ${quickAmount}
                  <br />
                  <span className="text-gray-500">({sarAmount} {t('common.sar')})</span>
                </Button>
              );
            })}
          </div>

          {/* Donor Information (if not authenticated) */}
          {!isAuthenticated && !isAnonymous && (
            <>
              <div>
                <Label htmlFor="donorName">{t('donation.donorName')}</Label>
                <Input
                  id="donorName"
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder={t('auth.fullName')}
                  required={!isAnonymous}
                />
              </div>
              <div>
                <Label htmlFor="donorEmail">{t('donation.donorEmail')}</Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder={t('auth.email')}
                  required={!isAnonymous}
                />
              </div>
            </>
          )}

          {/* Anonymous Donation Checkbox */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="text-sm">
              {t('donation.anonymousDescription')}
            </Label>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">{t('donation.messageOptional')}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('donation.messageOptional')}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Card Element */}
          <div>
            <Label>{t('donation.cardInfo')}</Label>
            <div className="mt-1 p-3 border border-gray-300 rounded-md">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full"
            size="lg"
          >
            {loading ? t('donation.processing') : `${t('donation.donate')} ${amount ? `${t('common.sar')} ${amount}` : ''}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Wrapper component that provides Stripe Elements
const DonationWrapper = ({ campaignId, onSuccess, onError, onClose }) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="relative">
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10"
            onClick={onClose}
          >
            ✕
          </Button>
        )}
        <DonationForm 
          campaignId={campaignId}
          onSuccess={onSuccess}
        />
      </div>
    </Elements>
  );
};

export default DonationWrapper;