import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { newsletterAPI } from '../lib/api';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus]= useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');

  const handleNewsletterSubscription = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscriptionStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    setSubscriptionStatus(null);
    setMessage('');

    try {
      await newsletterAPI.subscribe(email, 'footer', i18n.language);
      setSubscriptionStatus('success');
      setMessage('Successfully subscribed to our newsletter!');
      setEmail(''); // Clear the input
    } catch (error) {
      setSubscriptionStatus('error');
      if (error.response?.status === 400) {
        setMessage('Email is already subscribed to the newsletter');
      } else {
        setMessage('Failed to subscribe. Please try again later.');
      }
    } finally {
      setIsSubscribing(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setSubscriptionStatus(null);
        setMessage('');
      }, 5000);
    }
  };

  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-AlRaiMediaBold text-primary">{t('footer.brandName')}</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              {t('footer.newsletterDescription')}
            </p>
            <form onSubmit={handleNewsletterSubscription} className="max-w-sm">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background"
                  disabled={isSubscribing}
                  required
                />
                <button 
                  type="submit"
                  disabled={isSubscribing}
                  className="h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? '...' : t('footer.subscribe')}
                </button>
              </div>
              {message && (
                <p className={`text-xs mt-2 ${
                  subscriptionStatus === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {message}
                </p>
              )}
            </form>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link to="/campaigns" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.browseCampaigns')}
                </Link>
              </li>
              <li>
                <Link to="/create-campaign" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.createCampaign')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.aboutPlatform')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">{t('footer.contactUs')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@qalbwahed.org</span>
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+966 0123456789</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {t('footer.brandName')}. {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary mx-2">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary mx-2">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary mx-2">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.017 0C8.396 0 7.999.01 6.756.048 5.517.086 4.668.222 3.935.42a7.934 7.934 0 00-2.868 1.869A7.901 7.901 0 00.42 5.222C.222 5.955.086 6.804.048 8.042.01 9.285 0 9.682 0 13.304s.01 4.02.048 5.264c.038 1.238.174 2.087.372 2.82.196 1.076.512 1.986 1.199 2.711a7.784 7.784 0 002.868 1.869c.733.198 1.582.334 2.82.372C7.999 23.99 8.396 24 12.017 24s4.018-.01 5.264-.048c1.238-.038 2.087-.174 2.82-.372a7.898 7.898 0 002.869-1.869 7.784 7.784 0 001.198-2.711c.198-.733.335-1.582.372-2.82.039-1.244.048-1.641.048-5.264s-.01-4.02-.048-5.264c-.037-1.238-.174-2.087-.372-2.82a7.898 7.898 0 00-1.198-2.711A7.784 7.784 0 0020.131.42c-.733-.198-1.582-.334-2.82-.372C16.035.01 15.638 0 12.017 0zm0 5.838a7.466 7.466 0 110 14.932 7.466 7.466 0 010-14.932zM12.017 18.305a4.839 4.839 0 100-9.678 4.839 4.839 0 000 9.678zm9.495-12.852a1.745 1.745 0 11-3.49 0 1.745 1.745 0 013.49 0z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;