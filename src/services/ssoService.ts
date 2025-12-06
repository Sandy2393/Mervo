// SSO service stubs. TODO: Wire real OAuth/SAML flows.

export type SSOProvider = "google" | "microsoft" | "saml";

export function beginOAuthLogin(provider: SSOProvider): string {
  // TODO: Build authorization URL with state/nonce/PKCE
  return `https://auth.example.com/${provider}/authorize?TODO`;
}

export function handleOAuthCallback(params: URLSearchParams): { master_account_id: string } {
  // TODO: Exchange code for tokens, validate, map to user
  return { master_account_id: "placeholder-master-account-id" };
}

export async function linkExternalAccount(provider: SSOProvider, providerUserId: string): Promise<boolean> {
  // TODO: Persist to user_external_accounts table via API/SQL
  return true;
}
