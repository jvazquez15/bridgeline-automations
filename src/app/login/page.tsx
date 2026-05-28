"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	View,
	PasswordField,
	Button,
	Flex,
	useTheme,
	TextField,
	Alert,
} from "@aws-amplify/ui-react";
import { signIn, confirmSignIn } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";
import { formatAuthError, getAuthenticatedUser } from "@/utils/auth-utils";

export default function Login() {
	const { tokens } = useTheme();

	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	// Check if user is already authenticated on mount
	useEffect(() => {
		
		const checkAuth = async () => {
			const { authenticated } = await getAuthenticatedUser();

			if (authenticated) {
				router.push("/");
			} else {
				setIsCheckingAuth(false);
			}
		};

		checkAuth();
	}, [router]);

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const signed = await signIn({
				username: email,
				password: password,
			});

			if (!signed.isSignedIn) {
				if (signed.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
					const confirmResult = await confirmSignIn({
						challengeResponse: password,
					});
					console.log(confirmResult)
					if (!confirmResult.isSignedIn) {
						setError("Tried to sign in with new password. Failed.");
						return
					}
				} else {
					setError("Sign in failed. Please try again.");
					return;
				}
			}

			console.log("Login successful");
			router.push("/");
		} catch (err) {
			const errorMessage = formatAuthError(err);
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = () => {
		router.push("/reset-password");
	};

	if (isCheckingAuth) {
		return (
			<Flex
				width="100vw"
				position="absolute"
				justifyContent="center"
				alignItems="center"
				padding="15vh"
				backgroundColor="#f9fafb"
				flex={1}
			>
				<View padding="32px">
					Loading...
				</View>
			</Flex>
		);
	}

	return (
		<Flex
			width="100vw"
			position="absolute"
			justifyContent="center"
			alignItems="center"
			padding="15vh"
			backgroundColor="#f9fafb"
			flex={1}
		>
			<View
				fontFamily='InterVariable, "Inter var", Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Oxygen, Ubuntu, Cantarell, "Open Sans", sans-serif'
				width={{ base: "100%", small: "90%", medium: "478px" }}
				maxWidth="478px"
				padding="32px"
				backgroundColor="white"
				border="1px solid gray"
				boxShadow="0 4px 12px rgba(0,0,0,0.08)"
				as="form"
				onSubmit={handleSubmit}
			>
				<Flex direction="column" gap="16px" marginBottom="16px">
					<Flex position="relative">
						<TextField
							placeholder="Enter your Email"
							name="username"
							label="Email"
							width="100%"
							isRequired
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
						/>
					</Flex>

					<Flex position="relative">
						<PasswordField
							width="100%"
							placeholder="Enter your Password"
							name="password"
							label="Password"
							autoComplete="new-password"
							hideShowPassword={false}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
						/>
					</Flex>
				</Flex>

				{error && (
					<Alert
					  	variation="error"
					  	isDismissible={true}
					  	hasIcon={true}
						marginBottom="14px"
					>
					  	{error}
					</Alert>
				)}

				{/* Sign In Button */}
				<Button
					width="100%"
					color="#fff"
					backgroundColor={loading ? "#ccc" : tokens.colors.font.orange}
					fontSize="16px"
					fontWeight="700"
					borderRadius="6px"
					height="41.33px"
					marginBottom="16px"
					type="submit"
					isLoading={loading}
					loadingText="Signing in"
					disabled={loading}
				>
					Sign in
				</Button>

				{/* Forgot Password */}
				<Flex justifyContent="center">
					<Button
						onClick={handleForgotPassword}
						variation="link"
                        size="small"
						className="hover:border-inherit!"
					>
						Forgot your password?
					</Button>
				</Flex>
			</View>
		</Flex>
	);	
}	