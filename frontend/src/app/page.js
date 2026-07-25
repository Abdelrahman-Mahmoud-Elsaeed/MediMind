import LandingPage from './(public)/LandingPage';

export const metadata = {
  title: 'MediMind | Medication Management & Caregiver Support',
  description: 'MediMind is a warm, calming companion for your health journey. Never miss a dose, connect with trusted caregivers, and watch yourself grow with our joyful digital plant experience.',
  keywords: ['medication management', 'pill reminder', 'caregiver support', 'health tracking', 'medication adherence', 'elder care', 'family health'],
  openGraph: {
    title: 'MediMind | Medication Management',
    description: 'Transform your daily health routine into a rewarding ritual. Never miss a dose and connect with trusted caregivers.',
    type: 'website',
    siteName: 'MediMind',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediMind | Medication Management',
    description: 'Transform your daily health routine into a rewarding ritual.',
  },
};

export default function HomePage() {
  return <LandingPage />;
}