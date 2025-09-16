"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginAffiliate } from '@/app/server/auth';
import { showError, showSuccess } from '@/app/components/ToasterProvider';
import { useRouter } from 'next/navigation';

export default function AffiliateLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Affiliate Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <Button
            className="w-full"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const res = await loginAffiliate(email, password);
                if (res.success) {
                  showSuccess('Logged in');
                  router.push('/affiliate');
                  router.refresh();
                } else {
                  showError(res.error || 'Invalid credentials');
                }
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}




