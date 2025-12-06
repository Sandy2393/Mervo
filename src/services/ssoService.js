// SSO service stubs. TODO: Wire real OAuth/SAML flows.
export function beginOAuthLogin(provider) {
    // TODO: Build authorization URL with state/nonce/PKCE
    return `https://auth.example.com/${provider}/authorize?TODO`;
}
export function handleOAuthCallback(params) {
    // TODO: Exchange code for tokens, validate, map to user
    return { master_account_id: "placeholder-master-account-id" };
}
export async function linkExternalAccount(provider, providerUserId) {
    // TODO: Persist to user_external_accounts table via API/SQL
    return true;
}
