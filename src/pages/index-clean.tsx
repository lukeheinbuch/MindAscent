import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function IndexCleanRedirect() {
	const router = useRouter();
	useEffect(() => { router.replace('/'); }, [router]);
	return null;
}
