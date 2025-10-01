import React from 'react';
import Layout from '@/components/Layout';
import { RequireGuest } from '@/components/auth';
import SignupWizard from '@/components/auth/SignupWizard';

const SignupNewPage: React.FC = () => {
	return (
		<Layout title="Create Account" fullScreen>
			<RequireGuest>
				<div className="max-w-2xl mx-auto py-10">
					<SignupWizard />
				</div>
			</RequireGuest>
		</Layout>
	);
};

export default SignupNewPage;
