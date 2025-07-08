
import { Metadata } from 'next';
import NewsPageClient from '../components/pages/NewsPageClient';

export const metadata: Metadata = {
  title: 'Anime News',
  description: 'Stay up-to-date with the latest news in the anime world. Get updates on new releases, popular series, and industry events.',
};

export default function NewsPage() {
  return <NewsPageClient />;
}
