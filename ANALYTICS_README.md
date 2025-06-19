# Dashboard Analytics Components

This document describes the new dashboard analytics components created for the donation platform.

## Components Created

### 1. DashboardAnalytics.jsx
Main component that contains three analytics cards with different chart types.

**Location**: `/src/components/DashboardAnalytics.jsx`

**Features**:
- Loading states with skeleton UI
- Error handling with retry functionality
- Responsive grid layout (1 column on mobile, 3 columns on large screens)
- Multi-language support

### 2. DonationTrendsChart.jsx
Line chart component showing donation trends over time.

**Location**: `/src/components/charts/donation-trends-chart.jsx`

**Features**:
- Dual Y-axis (left: donation count, right: donation amount)
- 30-day trend data
- Interactive tooltips with formatted currency
- Responsive design

### 3. CampaignStatusChart.jsx
Bar chart component showing campaign status distribution.

**Location**: `/src/components/charts/campaign-status-chart.jsx`

**Features**:
- Shows Active, Pending, Completed, and Rejected campaigns
- Color-coded bars for different statuses
- Real-time data from backend API
- Fallback to mock data if API fails

### 4. CategoryDistributionChart.jsx
Pie chart component showing campaign distribution by category.

**Location**: `/src/components/charts/category-distribution-chart.jsx`

**Features**:
- Interactive pie chart with hover effects
- Custom tooltip showing count, amount, and percentage
- Legend with color indicators
- Supports multiple categories (Water Projects, Education, Medical Aid, etc.)

## Backend API Endpoints

### 1. Donation Trends Endpoint
**URL**: `GET /api/v1/analytics/donation-trends?days=30`

**Response**:
```json
[
  {
    "date": "2025-06-01",
    "donations": 25,
    "amount": 5000.0
  }
]
```

### 2. Category Distribution Endpoint
**URL**: `GET /api/v1/analytics/category-distribution`

**Response**:
```json
[
  {
    "name": "Water Projects",
    "value": 35,
    "amount": 125000.0,
    "color": "#3b82f6"
  }
]
```

## Language Support

The analytics components support all platform languages:
- English (en)
- Arabic (ar)
- Spanish (es)
- French (fr)
- Russian (ru)

## Usage

To use the analytics dashboard:

1. Import the component:
```jsx
import DashboardAnalytics from '../components/DashboardAnalytics';
```

2. Add to your admin dashboard:
```jsx
<DashboardAnalytics />
```

## Permissions

All analytics endpoints require admin authentication. Non-admin users will receive a 403 Forbidden error.

## Development Notes

- Mock data is used when backend APIs are not available
- Charts are built using Recharts library
- All components support RTL languages
- Error boundaries handle API failures gracefully
- Loading states provide good UX during data fetching
