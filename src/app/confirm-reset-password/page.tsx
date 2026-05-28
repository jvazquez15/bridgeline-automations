"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	View,
	PasswordField,
	Button,
	Flex,
	useTheme,
	TextField,
	Alert,
	Text,
    Heading
} from "@aws-amplify/ui-react";
import { confirmResetPassword, resetPassword } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";
import { formatAuthError } from "@/utils/auth-utils";

export default function ConfirmResetPassword() {
	const { tokens } = useTheme();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [codeError, setCodeError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		const emailParam = searchParams.get("email");
		if (emailParam) {
			setEmail(decodeURIComponent(emailParam));
		}
	}, [searchParams]);

	const validatePassword = (password: string): string | null => {
		if (password.length < 8) {
			return "Password must have at least 8 characters";
		}

		return null;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);
		setLoading(true);

		const currentCodeError = !code.trim() ? "Reset code is required." : null;
		const currentPasswordError = validatePassword(newPassword);
		const currentConfirmPasswordError = newPassword !== confirmPassword ? "Passwords do not match." : null;

		setCodeError(currentCodeError);
		setPasswordError(currentPasswordError);
		setConfirmPasswordError(currentConfirmPasswordError);

		if (currentCodeError || currentPasswordError || currentConfirmPasswordError) {
			setLoading(false);
			return;
		}

		try {
			if (!email.trim()) {
				setError("Email is required.");
				setLoading(false);
				return;
			}

			await confirmResetPassword({
				username: email,
				confirmationCode: code,
				newPassword: newPassword,
			});

			setSuccess(true);

            setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (err) {
			const errorMessage = formatAuthError(err);
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleResetAgain = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (!email.trim()) {
                return;
            }

            await resetPassword({
                username: email,
            });

            router.push(`/confirm-reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            const errorMessage = formatAuthError(err);
            console.log(errorMessage);
        }
    };

	if (success) {
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
				>
					<Flex direction="column" gap="16px" alignItems="center">
						<Text fontSize="18px" fontWeight="700" color="#047D95">
							✓ Password Reset Successful
						</Text>
						<Text fontSize="14px" color="#666" textAlign="center">
							Your password has been successfully reset. Redirecting to login...
						</Text>
					</Flex>
				</View>
			</Flex>
		);
	}

	return (
		<Flex
			width="100%"
            height="100%"
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
					<Heading level={3}>
						Reset Password
					</Heading>

                    <Flex position="relative" direction="column" gap="6px">
				    	<TextField
				    		placeholder="Code"
				    		name="code"
				    		label="Code *"
				    		width="100%"
				    		isRequired
				    		value={code}
				    		onChange={(e) => {
				    		setCode(e.target.value);
				    		setCodeError(e.target.value.trim() ? null : "Reset code is required.");
				    	}}
				    		disabled={loading}
				    	/>
				    	{codeError && (
				    		<Text color="#d92d20" fontSize="12px" lineHeight="16px">
				    			{codeError}
				    		</Text>
				    	)}
				    </Flex>

				    <Flex position="relative" direction="column" gap="6px">
				    	<PasswordField
				    		width="100%"
				    		placeholder="New Password"
				    		name="newPassword"
				    		label="New Password"
				    		hideShowPassword={false}
				    		value={newPassword}
				    		onChange={(e) => {
				    	    	const nextPassword = e.target.value;
				    	    	setNewPassword(nextPassword);
				    	    	setPasswordError(validatePassword(nextPassword));
				    	    	if (confirmPassword) {
				    	    		setConfirmPasswordError(nextPassword === confirmPassword ? null : "Your passwords must match");
				    	    	}
				    	    }}
                            hasError={!!passwordError}
				    		disabled={loading}
				    	/>

				    	{passwordError && (
				    		<Text variation="error">
				    			{passwordError}
				    		</Text>
				    	)}
				    </Flex>

				    <Flex position="relative" direction="column" gap="6px">
				    	<PasswordField
				    		width="100%"
				    		placeholder="Confirm Password"
				    		name="confirmPassword"
				    		label="Confirm Password"
				    		hideShowPassword={false}
				    		value={confirmPassword}
				    		onChange={(e) => {
				    	    	const confirmValue = e.target.value;
				    	    	setConfirmPassword(confirmValue);
				    	    	setConfirmPasswordError(confirmValue === newPassword ? null : "Your passwords must match");
				    	    }}
                            hasError={!!confirmPasswordError}
				    		disabled={loading}
				    	/>
				    	{confirmPasswordError && (
				    		<Text variation="error">
				    			{confirmPasswordError}
				    		</Text>
				    	)}
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
                        loadingText="Submitting..."
				    	isLoading={loading}
				    	disabled={loading}
				    >
				    	Submit
				    </Button>

				    <Flex justifyContent="center">
				    	<Button
				    		onClick={handleResetAgain}
				    		className="hover:border-inherit!"
                            marginBottom="-16px"
                            variation="link"
                            size="small"
				    	>
				    		Resend Code
				    	</Button>
				    </Flex>
				</Flex>
			</View>
		</Flex>
	);
}
