import React from 'react';
import { RequireGuest } from '@/components/auth';
import { ClientOnly } from '@/components/ClientOnly';
import SignupWizard from '@/components/auth/SignupWizard';

const SignUpPage: React.FC = () => {
  return (
    <ClientOnly>
      <RequireGuest>
        <SignupWizard />
      </RequireGuest>
    </ClientOnly>
  );
};

export default SignUpPage;
