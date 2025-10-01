import React from 'react';
import { RequireGuest } from '@/components/auth';
import { ClientOnly } from '@/components/ClientOnly';
import SignupWizard from '@/components/auth/SignupWizard';
import Layout from '@/components/Layout';

const SignUpPage: React.FC = () => {
  return (
    <ClientOnly>
      <Layout title="Create Account" fullScreen>
        <RequireGuest>
          <div className="max-w-2xl mx-auto py-10">
            <SignupWizard />
          </div>
        </RequireGuest>
      </Layout>
    </ClientOnly>
  );
};

export default SignUpPage;
