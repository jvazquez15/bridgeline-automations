"use client";

import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { getAuthenticatedUser } from "@/utils/auth-utils";

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			const { authenticated } = await getAuthenticatedUser();

			if (authenticated) {
				router.push("/clients");
			} else {
				router.push("/login");
			}
		}

		checkAuth();
	}, [router]);

	return (
		<div>
			
		</div>
	)
}

