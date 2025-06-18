import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { campaignsAPI, getImageUrl } from "../lib/api";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { CalendarIcon, Users, Target, List, ChevronRight } from "lucide-react";
import { Badge } from "../components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import DonationForm from "../components/DonationForm";

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const { t, formatCurrency, formatDate } = useLanguage();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [headings, setHeadings] = useState([]);
  const [activeHeading, setActiveHeading] = useState("");
  const [showDonationForm, setShowDonationForm] = useState(false);
  const contentRef = useRef(null);

  // Extract headings from markdown text
  const extractHeadings = (markdownText) => {
    if (!markdownText) return [];
    
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(markdownText)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase()
        .replace(/[^\u0600-\u06FF\w\s-]/g, '') // Keep Arabic characters, word characters, spaces, and hyphens
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      headings.push({
        level,
        text,
        id: `heading-${id}-${headings.length}` // Add index to ensure uniqueness
      });
    }
    
    return headings;
  };

  // Custom renderer for headings to add IDs
  const HeadingRenderer = ({ level, children, ...props }) => {
    const text = children[0];
    const id = `heading-${text.toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()}-${headings.findIndex(h => h.text === text)}`;
    
    const Tag = `h${level}`;
    return React.createElement(Tag, { id, ...props }, children);
  };

  // Scroll to heading
  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      const yOffset = -100; // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Track active heading on scroll
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.getBoundingClientRect().top <= 150) {
          setActiveHeading(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleDonationSuccess = (donationData) => {
    // Refresh campaign data to show updated amount
    fetchCampaign();
    setShowDonationForm(false);
    // Show success message or redirect
    alert(t('donation.successThankYou', { amount: formatCurrency(donationData.amount) }));
  };

  const handleDonationError = (error) => {
    console.error('Donation failed:', error);
    // Keep the donation form open so user can try again
  };

  const fetchCampaign = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await campaignsAPI.getCampaign(id);
      setCampaign(data);
      
      // Extract headings from markdown
      if (data.markdown_text) {
        const extractedHeadings = extractHeadings(data.markdown_text);
        setHeadings(extractedHeadings);
      }
    } catch (err) {
      setError(t('messages.errorLoadingCampaignDetails'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse text-center">
          <div className="text-xl font-semibold">{t('common.loading')}</div>
          <div className="mt-2 text-muted-foreground">
            {t('messages.pleaseWait')}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="text-xl font-semibold text-destructive">{error}</div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );

  if (!campaign)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="text-xl font-semibold">
            {t('messages.noCampaignData')}
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            {t('common.back')}
          </Button>
        </div>
      </div>
    );

  // Calculate donation progress percentage
  const progressPercentage = Math.min(
    Math.round((campaign.current_amount / campaign.target_amount) * 100),
    100
  );

  // Format date
  const formattedDate = formatDate(campaign.created_at);

  return (
    <div className="relative">
      <div className="w-full flex max-h-[80vh] overflow-hidden relative">
        <article className="z-[30] absolute inset-0 p-2 md:p-10 w-full h-full flex flex-col justify-end items-start">
          <h1 className=" text-lg md:text-6xl font-AlRaiMediaBold font-bold text-primary mb-4">
            {campaign.title}
          </h1>
          <p className=" text-sm md:text-lg text-white/80 max-w-[45rem] mb-4">
            {campaign.description || t('campaign.noDetailsAvailable')}
          </p>
          <div className="flex gap-2">
            <Link to="/about">
              <Button variant={"secondary"}>{t('home.learnMore')}</Button>
            </Link>
            <Button variant={"default"} onClick={() => setShowDonationForm(true)}>
              {t('donation.donateNow')}
            </Button>
          </div>
        </article>
        <img
          src={getImageUrl(campaign.image_path)}
          alt={campaign.title}
          className="w-full h-full saturate-0 object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://images.pexels.com/photos/5838484/pexels-photo-5838484.jpeg?_gl=1*7xo5ta*_ga*MjAzNjY3NjE3MC4xNzQ5ODQzNjA4*_ga_8JE65Q40S6*czE3NDk4NDg3NTMkbzIkZzEkdDE3NDk4NTA2ODQkajU5JGwwJGgw";
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Campaign Hero */}
        <div className="flex flex-col gap-2 justify-start items-start overflow-hidden">
          <div className="p-6">
            <div className="flex justify-start items-center gap-2 mb-4">
              <span className="size-2 animate-pulse rounded-full bg-primary"></span>
              {campaign.category || t('common.general')}
            </div>

            {/* Campaign Statistics */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm font-medium">{t('campaign.progress')}</span>
                <span className="text-sm font-bold">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />

              <div className="flex justify-between items-center mt-3">
                <div className="text-lg font-bold">
                  {formatCurrency(campaign.current_amount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('campaign.outOf')} {formatCurrency(campaign.target_amount)}
                </div>
              </div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    {t('campaign.startDate')}
                  </div>
                  <div className="text-sm font-medium">{formattedDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">{t('campaign.donors')}</div>
                  <div className="text-sm font-medium">
                    {campaign.donors_count || 0} {t('campaign.donorsCount')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">{t('campaign.target')}</div>
                  <div className="text-sm font-medium">
                    {formatCurrency(campaign.target_amount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Sticky TOC */}
        <div className="flex gap-8 px-6 pb-6">
          {/* Sticky Table of Contents */}
          {headings.length > 0 && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-20 bg-background ">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <List className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">{t('campaign.tableOfContents')}</h3>
                </div>
                <nav className="space-y-1">
                  {headings.map((heading, index) => (
                    <button
                      key={heading.id}
                      className={cn(
                        "w-full text-right flex items-start gap-3 p-2 rounded-md transition-all duration-200 hover:bg-muted/50",
                        heading.level === 1 && "font-semibold",
                        heading.level === 2 && "mr-2 font-medium",
                        heading.level === 3 && "mr-4 text-sm",
                        heading.level >= 4 && "mr-6 text-sm text-muted-foreground",
                        activeHeading === heading.id
                          ? "bg-primary/10 text-primary border-r-2 border-primary"
                          : "text-foreground hover:text-primary"
                      )}
                      onClick={() => scrollToHeading(heading.id)}
                    >
                      <span className="text-xs text-muted-foreground min-w-[1.5rem] text-center">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-right leading-tight">
                        {heading.text}
                      </span>
                      {activeHeading === heading.id && (
                        <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </nav>
                
                {/* Quick Stats in TOC */}
                <div className="mt-6 pt-4 border-t">
                  <div className="text-xs text-muted-foreground mb-2">{t('campaign.quickStats')}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('campaign.progress')}:</span>
                      <span className="font-medium text-primary">{progressPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('campaign.currentAmount')}:</span>
                      <span className="font-medium">{formatCurrency(campaign.current_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('campaign.donors')}:</span>
                      <span className="font-medium">{campaign.donors_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile TOC - Collapsible */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-6">
                <Card>
                  <CardContent className="p-4">
                    <details className="group">
                      <summary className="flex items-center gap-2 cursor-pointer list-none">
                        <List className="h-5 w-5 text-primary" />
                        <span className="text-lg font-bold text-primary">{t('campaign.tableOfContents')}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="mt-4 space-y-1">
                        {headings.map((heading, index) => (
                          <button
                            key={heading.id}
                            className={cn(
                              "w-full text-right flex items-start gap-3 p-2 rounded-md transition-all duration-200",
                              heading.level === 1 && "font-semibold",
                              heading.level === 2 && "mr-2 font-medium",
                              heading.level === 3 && "mr-4 text-sm",
                              heading.level >= 4 && "mr-6 text-sm text-muted-foreground",
                              activeHeading === heading.id
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:text-primary hover:bg-muted/50"
                            )}
                            onClick={() => scrollToHeading(heading.id)}
                          >
                            <span className="text-xs text-muted-foreground min-w-[1.5rem] text-center">
                              {index + 1}
                            </span>
                            <span className="flex-1 text-right leading-tight">
                              {heading.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </details>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Markdown Content */}
            {campaign.markdown_text && (
              <div className="mt-8">
                <div
                  ref={contentRef}
                  className="prose prose-sm prose-headings:text-primary prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-r-primary prose-blockquote:bg-primary/5 prose-blockquote:pr-4 max-w-none"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: (props) => <HeadingRenderer level={1} {...props} />,
                      h2: (props) => <HeadingRenderer level={2} {...props} />,
                      h3: (props) => <HeadingRenderer level={3} {...props} />,
                      h4: (props) => <HeadingRenderer level={4} {...props} />,
                      h5: (props) => <HeadingRenderer level={5} {...props} />,
                      h6: (props) => <HeadingRenderer level={6} {...props} />,
                    }}
                  >
                    {campaign.markdown_text}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <DonationForm
              campaignId={campaign.id}
              onSuccess={handleDonationSuccess}
              onError={handleDonationError}
              onClose={() => setShowDonationForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetailsPage;
