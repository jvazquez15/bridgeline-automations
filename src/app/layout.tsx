import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Provider from "@/providers/Provider";
import Image from "next/image";
import { Amplify } from 'aws-amplify';
import outputs from '@/../amplify_outputs.json';
import "./globals.css";


const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Bridgeline Automations",
	description: "Automations Dashboard",
};

// Amplify.configure(outputs);

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col h-screen">
				<Provider>
					<header className="flex sticky top-0 items-center px-3.75 py-2.5 h-[57.67px] bg-[#ffffff] border-b border-zinc-200">
						<Image src="/hs-logo-black.png" alt="Hawksearch Logo" width={180} height={35} className="h-auto w-auto" loading="eager" />
					</header>
					{children}
				</Provider>
			</body>
		</html>
	);
}