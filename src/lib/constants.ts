
import type { PropertyType, EnergyRating, Tenure } from '@/types';
import { londonOutcodes } from '@/lib/data/london_outcodes_data';
import { TrendingUp, MapIcon, ListChecksIcon, Database, ShieldCheck, Sparkles, Users } from 'lucide-react';

// App Info
export const APP_NAME = "London Housing";
export const APP_TAGLINE = "AI-powered London house price prediction and property insights."; // Used for meta description primarily
export const APP_TITLE_TEMPLATE = (pageTitle?: string) => 
  pageTitle ? `${pageTitle} | ${APP_NAME}` : `${APP_NAME} - ${APP_TAGLINE}`;


// Navbar
export const NAV_ITEMS = [
  { href: '/', label: 'Introduction' },
  { href: '/prediction', label: 'Prediction' },
  { href: '/map', label: 'Map' },
  { href: '/recommendations', label: 'Recommendations' },
];

// Introduction Page
export const INTRO_HERO_TITLE = APP_NAME;
export const INTRO_HERO_DESCRIPTION = "Explore the future of London's property market with our intelligent house price prediction tool, utilizing advanced AI and detailed historical data.";
export const INTRO_HERO_CTA_TEXT = "Get Started with Prediction";
export const INTRO_HERO_CTA_LINK = "/prediction";

export const INTRO_FEATURES_SECTION_TITLE = "Application Features";
export const INTRO_FEATURE_CARDS = [
  { 
    title: "AI Price Prediction & Forecast", 
    description: "Input property details (address, type, size, rooms, etc.) to get an AI-driven price estimate for a specific sale month and a 12-month price trend forecast.", 
    IconComponent: TrendingUp 
  },
  { 
    title: "Interactive Map Exploration", 
    description: "Discover London regions with a map color-coded by average prices. Click areas for detailed local market insights powered by AI.", 
    IconComponent: MapIcon
  },
  { 
    title: "Property Recommendations", 
    description: "Find properties matching your criteria: price range, type, area, rooms, and more. Upload your own listings to share.", 
    IconComponent: ListChecksIcon
  },
];

export const INTRO_DATA_AI_SECTION_TITLE = "Data & AI Model";
export const INTRO_DATA_AI_CARD_DESCRIPTION = "The foundation of our analysis";
export const INTRO_DATA_AI_TEXT_P1 = "Our project utilizes comprehensive London housing data, including historical transactions from the <strong>UK Land Registry Price Paid Data</strong> (1991-2023), enriched with:";
export const INTRO_DATA_AI_CHARACTERISTICS_LIST = [
  "<strong>Location:</strong> Full Address, Geolocation (Latitude, Longitude), Outcode.",
  "<strong>Characteristics:</strong> Property Type (Flat, Detached, etc.), Tenure (Freehold, Leasehold).",
  "<strong>Size & Layout:</strong> Bedrooms, Bathrooms, Reception Rooms, Internal Area (sqm).",
  "<strong>Condition:</strong> Current Energy Efficiency Rating (A-G).",
  "<strong>Timing:</strong> Month of Sale for accurate predictions.",
];
export const INTRO_DATA_AI_MODELS_TEXT = "We employ machine learning models like <strong>Ridge Regression</strong>, <strong>XGBoost</strong>, <strong>LightGBM</strong>, and <strong>Ensemble Learning</strong>, trained on meticulously processed data to identify complex price-influencing factors.";
export const INTRO_DATA_AI_ICON = Database;

export const INTRO_ACCURACY_SECTION_TITLE = "Model Accuracy";
export const INTRO_ACCURACY_CARD_DESCRIPTION = "Evaluating our model's performance";
export const INTRO_ACCURACY_TEXT = "Model accuracy is paramount. We use metrics like MAE (Mean Absolute Error) and R² (R-squared) to continuously evaluate and refine our predictions, aiming for maximum reliability.";
export const INTRO_ACCURACY_CHART_TEXT = "Example chart showing model performance (e.g., MAE, R²).";
export const INTRO_ACCURACY_ICON = ShieldCheck;

export const INTRO_GOAL_SECTION_TITLE = "Project Goal";
export const INTRO_GOAL_ICON = Sparkles;
export const INTRO_GOAL_TEXT = "London Housing aims to provide a transparent, user-friendly tool empowering users to make informed decisions in the property market by democratizing access to in-depth analysis.";

export const INTRO_TEAM_SECTION_TITLE = "Project Team";
export const INTRO_TEAM_ICON = Users;
export const INTRO_TEAM_MEMBERS = [
  { name: "An Nguyen", role: "Project Lead & AI Architect" },
  { name: "Binh Tran", role: "Data Specialist & Backend Developer" },
  { name: "Cuong Le", role: "Frontend Engineer & UI/UX Designer" },
  { name: "Dung Pham", role: "QA & Testing Lead" },
];


// Page Hero Texts (can be overridden by props in PageHero component)
export const PREDICTION_PAGE_HERO_TITLE = "Property Price Prediction";
export const PREDICTION_PAGE_HERO_DESCRIPTION = "Enter the property details below to receive an AI-powered price prediction and market insights. Note: Longitude and Latitude are optional; in a full app, they would be derived from the address.";

export const MAP_PAGE_HERO_TITLE = "Interactive London Map";
export const MAP_PAGE_HERO_DESCRIPTION = "Explore London's regions by average price, view details, and get AI-driven insights.";

export const RECOMMENDATIONS_PAGE_HERO_TITLE = "Suitable Property Recommendations";
export const RECOMMENDATIONS_PAGE_HERO_DESCRIPTION = "Find your ideal London property based on your budget and requirements. Explore our curated list or upload your own.";

export const CONTACT_PAGE_TITLE_TEMPLATE = (propertyName: string) => `Enquire About: ${propertyName}`;

// Form Select Options
export const PROPERTY_TYPE_OPTIONS: PropertyType[] = ['Flat', 'Detached', 'Terraced', 'Semi-detached', 'Bungalow', 'Maisonette'];
export const ENERGY_RATING_OPTIONS: EnergyRating[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
export const TENURE_OPTIONS: Tenure[] = ['Freehold', 'Leasehold'];
export const BEDROOM_OPTIONS: number[] = [0, 1, 2, 3, 4, 5, 6]; // 0 for studio
export const BATHROOM_OPTIONS: number[] = [0, 1, 2, 3, 4, 5];
export const RECEPTION_OPTIONS: number[] = [0, 1, 2, 3, 4];
export const REGION_OPTIONS: string[] = Array.from(new Set(londonOutcodes.map(o => o.id))).sort();

// Placeholder Image Hints
export const PLACEHOLDER_HINTS = {
  londonMap: "london boroughs map outline",
  accuracyChart: "graph accuracy",
  priceChart: "graph price trend",
  defaultHouse: "house exterior",
  salesmanPortrait: "professional portrait",
  uploadedProperty: "uploaded property",
  propertyGeneric: "property image"
};

// File Upload Constants (for Recommendations Page)
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ACCEPTED_IMAGE_TYPES_STRING = ".jpg, .jpeg, .png, .webp";

// Price Range constants for filters (Recommendations Page)
export const MIN_PRICE_FILTER_DEFAULT = 100000;
export const MAX_PRICE_FILTER_DEFAULT = 5000000;

// Prediction Form Constants
export const PREDICTION_FORM_DEFAULT_BEDROOMS = 1;
export const PREDICTION_FORM_DEFAULT_BATHROOMS = 1;
export const PREDICTION_FORM_DEFAULT_RECEPTIONS = 1;
export const PREDICTION_MONTH_OF_SALE_FORMAT_DESC = "Month of sale must be in YYYY-MM format (e.g., 2024-07).";

// Salesman default info (if API fails or for placeholders)
export const DEFAULT_SALESMAN_INFO = {
    name: "London Dwellings AI Team",
    email: "contact@londondwellings.ai",
    phone: "+44 123 456 7890",
    bio: "Our dedicated team is here to assist you with your property inquiries.",
    imageUrl: `https://placehold.co/150x150.png`,
    dataAiHint: "team avatar"
};
