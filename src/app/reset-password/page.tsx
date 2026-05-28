"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	View,
	Button,
	Flex,
	Link,
	useTheme,
	TextField,
	Alert,
	Text,
    Heading
} from "@aws-amplify/ui-react";
import { resetPassword } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";
import { formatAuthError } from "@/utils/auth-utils";

export default function ResetPassword() {
	const { tokens } = useTheme();
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);
		setLoading(true);

		try {
			if (!email.trim()) {
				setError("Please enter your email address.");
				setLoading(false);
				return;
			}

			await resetPassword({
				username: email,
			});

			setSuccess(true);

			router.push(`/confirm-reset-password?email=${encodeURIComponent(email)}`);
		} catch (err) {
			const errorMessage = formatAuthError(err);
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleBackToLogin = () => {
		router.push("/login");
	};

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
				<Flex direction="column" gap="16px" marginBottom="8px">
					<Heading level={3}>
						Reset Password
					</Heading>

					<Flex position="relative">
						<TextField
							placeholder="Enter your Email"
							name="email"
							label="Email"
							width="100%"
							isRequired
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
				    		/>
				    </Flex>

                    {error && (
				    	<Alert
				    		variation="error"
				    		isDismissible={true}
				    		hasIcon={true}
				    	>
				    		{error}
				    	</Alert>
				    )}

				    <Button
				    	width="100%"
				    	color="#fff"
				    	backgroundColor={loading ? "#ccc" : tokens.colors.font.orange}
				    	fontSize="16px"
				    	fontWeight="700"
				    	borderRadius="6px"
				    	height="41.33px"
				    	type="submit"
                        loadingText="Sending..."
				    	isLoading={loading}
				    	disabled={loading}
				    >
				    	Send Code
				    </Button>

				    <Flex justifyContent="center">
				    	<Button
				    		onClick={handleBackToLogin}
				    		variation="link"
                            size="small"
                            className="hover:border-inherit!"
				    	>
				    		Back to Sign In
				    	</Button>
				    </Flex>
				</Flex>
			</View>
		</Flex>
	);
}
