import AdminAffiliateDetailsClient from './components/AdminAffiliateDetailsClient';

interface PageProps {
  params: Promise<{ affiliateId: string }>;
}

export default async function AffiliateDetailsPage({ params }: PageProps) {
  const { affiliateId } = await params;
  return <AdminAffiliateDetailsClient affiliateId={affiliateId} />;
}




