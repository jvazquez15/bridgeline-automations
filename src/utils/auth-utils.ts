import { getCurrentUser, signOut } from "aws-amplify/auth";

/**
 * Check if user is authenticated and get current session
 */
export async function getAuthenticatedUser(): Promise<{ authenticated: boolean; user: unknown | null; error?: unknown }> {
	try {
		const user = await getCurrentUser();
		return { authenticated: true, user };
	} catch (error) {
		return { authenticated: false, user: null, error };
	}
}

/**
 * Handle user logout
 */
export async function handleLogout() {
	try {
		await signOut();
		return { success: true };
	} catch (error) {
		console.error("Logout error:", error);
		return { success: false, error };
	}
}

/**
 * Format auth error messages for user display
 */
export function formatAuthError(error: unknown): string {
	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		
		if (message.includes("user does not exist")) {
			return "User account not found.";
		}
		if (message.includes("incorrect username or password")) {
			return "Incorrect username or password.";
		}
		if (message.includes("user is not confirmed")) {
			return "Please verify your email before signing in.";
		}
		if (message.includes("password attempt limit exceeded")) {
			return "Too many failed login attempts. Please try again later or reset your password.";
		}
		if (message.includes("invalid verification code")) {
			return "Invalid verification code provided, please try again.";
		}
		if (message.includes("password did not conform")) {
			return "Password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters.";
		}
		
		return error.message;
	}
	return "An unexpected error occurred. Please try again.";
}
