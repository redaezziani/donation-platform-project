import React, { useState, useEffect } from 'react';
import { newsletterAPI } from '../../lib/api';
import { useLanguage } from '../../hooks/useLanguage';

const NewsletterStats = () => {
  const { t, formatDate } = useLanguage();
  const [stats, setStats] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewsletterData();
  }, []);

  const fetchNewsletterData = async () => {
    try {
      setLoading(true);
      const [statsData, subscribersData] = await Promise.all([
        newsletterAPI.getStats(),
        newsletterAPI.getSubscribers(1, 10) // Get first 10 subscribers
      ]);
      
      setStats(statsData);
      setSubscribers(subscribersData);
    } catch (error) {
      console.error('Error fetching newsletter data:', error);
      setError(t('newsletter.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      const response = await newsletterAPI.testEmail();
      alert(`${t('newsletter.testEmailSent')} ${response.message}`);
    } catch (error) {
      console.error('Error sending test email:', error);
      if (error.response?.status === 403) {
        alert(t('newsletter.accessDenied'));
      } else if (error.response?.status === 401) {
        alert(t('newsletter.authenticationFailed'));
      } else {
        alert(`${t('newsletter.failedToSendTestEmail')}: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleCreateTestCampaign = async () => {
    try {
      const response = await newsletterAPI.createTestCampaign();
      alert(`${t('newsletter.testCampaignCreated')} ${response.message}`);
      // Refresh the page to see the new campaign
      window.location.reload();
    } catch (error) {
      console.error('Error creating test campaign:', error);
      if (error.response?.status === 403) {
        alert(t('newsletter.accessDenied'));
      } else if (error.response?.status === 401) {
        alert(t('newsletter.authenticationFailed'));
      } else {
        alert(`${t('newsletter.failedToCreateTestCampaign')}: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('newsletter.statistics')}</h3>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('newsletter.statistics')}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleTestEmail}
            className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90"
          >
            {t('newsletter.testEmail')}
          </button>
          <button
            onClick={handleCreateTestCampaign}
            className="px-3 py-1 bg-primary/80 text-primary-foreground text-sm rounded hover:bg-primary/70"
          >
            {t('newsletter.createTestCampaign')}
          </button>
        </div>
      </div>
      
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.active_subscribers}</div>
            <div className="text-sm text-muted-foreground">{t('newsletter.activeSubscribers')}</div>
          </div>
          <div className="text-center p-4 bg-primary/20 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.recent_subscriptions}</div>
            <div className="text-sm text-muted-foreground">{t('newsletter.recentSubscriptions')}</div>
          </div>
          <div className="text-center p-4 bg-primary/15 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.total_subscribers}</div>
            <div className="text-sm text-muted-foreground">{t('newsletter.totalSubscribers')}</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.inactive_subscribers}</div>
            <div className="text-sm text-muted-foreground">{t('newsletter.unsubscribed')}</div>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-md font-semibold text-foreground mb-3">{t('newsletter.recentSubscribers')}</h4>
        {subscribers.length > 0 ? (
          <div className="space-y-2">
            {subscribers.slice(0, 5).map((subscriber) => (
              <div key={subscriber.id} className="flex justify-between items-center py-2 px-3 bg-primary/5 rounded">
                <span className="text-sm text-foreground">{subscriber.email}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(subscriber.subscribed_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t('newsletter.noSubscribersYet')}</p>
        )}
      </div>
    </div>
  );
};

export default NewsletterStats;
