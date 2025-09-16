"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/app/components/ToasterProvider';

interface ReferralLinkCardProps {
  referralLink: string;
}

export default function ReferralLinkCard({ referralLink }: ReferralLinkCardProps) {
  async function handleCopy() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = referralLink;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showSuccess('Referral link copied');
    } catch {
      showError('Failed to copy link');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referral Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="rounded border bg-white p-3 text-sm text-gray-800 break-all font-mono">
          {referralLink}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="cursor-pointer" onClick={handleCopy}>Copy</Button>
        </div>
      </CardContent>
    </Card>
  );
}


