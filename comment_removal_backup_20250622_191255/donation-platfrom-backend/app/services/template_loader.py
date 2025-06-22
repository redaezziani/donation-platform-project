import os
from typing import Dict, Any, Optional
from pathlib import Path

class EmailTemplateLoader:
    """Utility class for loading email templates in multiple languages."""
    
    def __init__(self):
        # Get the absolute path to the templates directory
        current_dir = Path(__file__).parent.parent  # Go up to app directory
        self.templates_dir = current_dir / "templates" / "emails"
        self.supported_languages = ["en", "ar", "es", "fr", "ru"]
        self.default_language = "en"
    
    def get_template_path(self, language: str, template_name: str, format: str = "html") -> Path:
        """Get the path to a specific template file."""
        # Fallback to default language if requested language is not supported
        lang = language if language in self.supported_languages else self.default_language
        return self.templates_dir / lang / f"{template_name}.{format}"
    
    def load_template(self, language: str, template_name: str, format: str = "html") -> Optional[str]:
        """Load a template file and return its content."""
        template_path = self.get_template_path(language, template_name, format)
        
        try:
            with open(template_path, 'r', encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            # Try fallback to default language
            if language != self.default_language:
                fallback_path = self.get_template_path(self.default_language, template_name, format)
                try:
                    with open(fallback_path, 'r', encoding='utf-8') as file:
                        return file.read()
                except FileNotFoundError:
                    pass
            return None
    
    def render_template(self, template_content: str, context: Dict[str, Any]) -> str:
        """Render a template with the given context."""
        if not template_content:
            return ""
        
        # Simple template replacement using double braces
        rendered = template_content
        for key, value in context.items():
            placeholder = f"{{{{{key}}}}}"
            rendered = rendered.replace(placeholder, str(value))
        
        return rendered
    
    def get_localized_subject(self, language: str, template_type: str, campaign_title: str) -> str:
        """Get localized email subject based on language and template type."""
        subjects = {
            "new_campaign": {
                "en": f"🌟 New Campaign: {campaign_title}",
                "ar": f"🌟 حملة جديدة: {campaign_title}",
                "es": f"🌟 Nueva Campaña: {campaign_title}",
                "fr": f"🌟 Nouvelle Campagne: {campaign_title}",
                "ru": f"🌟 Новая Кампания: {campaign_title}"
            },
            "campaign_completed": {
                "en": f"🎉 Campaign Completed: {campaign_title}",
                "ar": f"🎉 تم إكمال الحملة: {campaign_title}",
                "es": f"🎉 Campaña Completada: {campaign_title}",
                "fr": f"🎉 Campagne Terminée: {campaign_title}",
                "ru": f"🎉 Кампания Завершена: {campaign_title}"
            }
        }
        
        # Fallback to default language if not found
        lang = language if language in self.supported_languages else self.default_language
        return subjects.get(template_type, {}).get(lang, f"Campaign Update: {campaign_title}")

# Create global template loader instance
template_loader = EmailTemplateLoader()
