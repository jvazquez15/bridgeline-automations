"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import Image from "next/image";
import { getAuthenticatedUser } from "@/utils/auth-utils";

export default function AuthenticatedHeader() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

	useEffect(() => {
		const checkAuth = async () => {
			const { authenticated } = await getAuthenticatedUser();

			if (authenticated) {
				setIsLoggedIn(true);
			} else {
				setIsLoggedIn(false);
			}
		}

		checkAuth();
	}, []);

    if (isLoggedIn === null || !isLoggedIn) {
        return null;
    }

    return (
        <header className="flex sticky top-0 items-center z-1000 px-3.75 py-2.5 h-[57.67px] bg-[#ffffff] border-b border-zinc-200">
            <Image
                src="/hs-logo-black.png"
                alt="Hawksearch Logo"
                width={180}
                height={35}
                className="h-auto w-auto"
                loading="eager"
            />
        </header>
    );
}
