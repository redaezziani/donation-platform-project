import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from sqlalchemy.orm import Session
from collections import defaultdict

from app.core.config import settings
from app.services.newsletter_service import get_active_subscribers
from app.services.template_loader import template_loader
from app.db.models.campaign import Campaign

class EmailService:
    def __init__(self):
        self.smtp_server = getattr(settings, 'SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_username = getattr(settings, 'SMTP_USERNAME', '')
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', '')
        self.from_email = getattr(settings, 'FROM_EMAIL', 'noreply@qalbwahed.org')
        
    def _create_smtp_connection(self):
        """Create SMTP connection with SSL."""
        context = ssl.create_default_context()
        server = smtplib.SMTP(self.smtp_server, self.smtp_port)
        server.starttls(context=context)
        if self.smtp_username and self.smtp_password:
            server.login(self.smtp_username, self.smtp_password)
        return server
    
    def send_email(self, to_emails: List[str], subject: str, html_content: str, text_content: Optional[str] = None):
        """Send email to multiple recipients."""
        if not self.smtp_username or not self.smtp_password:
            print("⚠️  SMTP credentials not configured. Email not sent.")
            print("   Please set SMTP_USERNAME and SMTP_PASSWORD environment variables.")
            print(f"   Would have sent email to {len(to_emails)} recipients with subject: '{subject}'")
            return False
            
        print(f"📧 Sending email to {len(to_emails)} recipients...")
        print(f"   Subject: {subject}")
        print(f"   SMTP Server: {self.smtp_server}:{self.smtp_port}")
        print(f"   From: {self.from_email}")
            
        try:
            server = self._create_smtp_connection()
            
            for to_email in to_emails:
                message = MIMEMultipart("alternative")
                message["Subject"] = subject
                message["From"] = self.from_email
                message["To"] = to_email
                
                # Add text and HTML parts
                if text_content:
                    text_part = MIMEText(text_content, "plain", "utf-8")
                    message.attach(text_part)
                
                html_part = MIMEText(html_content, "html", "utf-8")
                message.attach(html_part)
                
                server.sendmail(self.from_email, to_email, message.as_string())
                print(f"   ✅ Email sent to: {to_email}")
            
            server.quit()
            print(f"📧 Successfully sent emails to {len(to_emails)} recipients")
            return True
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return False
    
    def send_new_campaign_notification(self, db: Session, campaign: Campaign):
        """Send notification to newsletter subscribers about a new campaign."""
        subscribers = get_active_subscribers(db)
        print(f"📧 New campaign notification triggered for: {campaign.title}")
        print(f"   Found {len(subscribers)} active newsletter subscribers")
        
        if not subscribers:
            print("   No subscribers found, skipping email notification")
            return
        
        # Group subscribers by language for batch processing
        subscribers_by_language = defaultdict(list)
        for subscriber in subscribers:
            language = subscriber.language or "en"
            subscribers_by_language[language].append(subscriber)
        
        print(f"   Subscribers grouped by language: {dict((lang, len(subs)) for lang, subs in subscribers_by_language.items())}")
        
        # Send emails for each language group
        for language, lang_subscribers in subscribers_by_language.items():
            subscriber_emails = [sub.email for sub in lang_subscribers]
            print(f"   Processing {len(subscriber_emails)} subscribers for language: {language}")
            
            # Get localized subject
            subject = template_loader.get_localized_subject(language, "new_campaign", campaign.title)
            
            # Prepare template context
            context = {
                'campaign_title': campaign.title,
                'campaign_description': campaign.description,
                'target_amount': f"{campaign.target_amount:,.2f}",
                'current_amount': f"{campaign.current_amount:,.2f}",
                'end_date': campaign.end_date.strftime('%B %d, %Y') if campaign.end_date else 'No end date',
                'campaign_url': f"http://localhost:5173/campaigns/{campaign.id}",
                'website_url': "http://localhost:5173",
                'unsubscribe_url': "http://localhost:5173/unsubscribe?email={{email}}"
            }
            
            # Load and render templates
            html_template = template_loader.load_template(language, "new_campaign", "html")
            text_template = template_loader.load_template(language, "new_campaign", "txt")
            
            if html_template:
                html_content = template_loader.render_template(html_template, context)
                text_content = template_loader.render_template(text_template, context) if text_template else None
                
                # Send email in batches to avoid overwhelming the SMTP server
                batch_size = 50
                for i in range(0, len(subscriber_emails), batch_size):
                    batch = subscriber_emails[i:i + batch_size]
                    self.send_email(batch, subject, html_content, text_content)
            else:
                print(f"   ⚠️  Template not found for language: {language}")
    
    def send_campaign_completed_notification(self, db: Session, campaign: Campaign):
        """Send notification when a campaign is completed."""
        subscribers = get_active_subscribers(db)
        print(f"📧 Campaign completion notification triggered for: {campaign.title}")
        print(f"   Found {len(subscribers)} active newsletter subscribers")
        
        if not subscribers:
            print("   No subscribers found, skipping email notification")
            return
        
        # Group subscribers by language for batch processing
        subscribers_by_language = defaultdict(list)
        for subscriber in subscribers:
            language = subscriber.language or "en"
            subscribers_by_language[language].append(subscriber)
        
        print(f"   Subscribers grouped by language: {dict((lang, len(subs)) for lang, subs in subscribers_by_language.items())}")
        
        # Send emails for each language group
        for language, lang_subscribers in subscribers_by_language.items():
            subscriber_emails = [sub.email for sub in lang_subscribers]
            print(f"   Processing {len(subscriber_emails)} subscribers for language: {language}")
            
            # Get localized subject
            subject = template_loader.get_localized_subject(language, "campaign_completed", campaign.title)
            
            # Calculate success rate
            success_rate = ((campaign.current_amount / campaign.target_amount) * 100) if campaign.target_amount > 0 else 0
            
            # Prepare template context
            context = {
                'campaign_title': campaign.title,
                'target_amount': f"{campaign.target_amount:,.2f}",
                'current_amount': f"{campaign.current_amount:,.2f}",
                'success_rate': f"{success_rate:.1f}",
                'website_url': "http://localhost:5173",
                'unsubscribe_url': "http://localhost:5173/unsubscribe?email={{email}}"
            }
            
            # Load and render templates
            html_template = template_loader.load_template(language, "campaign_completed", "html")
            text_template = template_loader.load_template(language, "campaign_completed", "txt")
            
            if html_template:
                html_content = template_loader.render_template(html_template, context)
                text_content = template_loader.render_template(text_template, context) if text_template else None
                
                # Send email in batches
                batch_size = 50
                for i in range(0, len(subscriber_emails), batch_size):
                    batch = subscriber_emails[i:i + batch_size]
                    self.send_email(batch, subject, html_content, text_content)
            else:
                print(f"   ⚠️  Template not found for language: {language}")

# Create global email service instance
email_service = EmailService()
