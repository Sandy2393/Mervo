export type SecretScope = {
  connectorId: string;
  companyId: string;
};

// TODO: replace with KMS/Secret Manager/Vault. Never store secrets client-side.
const mem: Record<string, string> = {};

export async function putSecret(scope: SecretScope, key: string, value: string) {
  mem[`${scope.companyId}:${scope.connectorId}:${key}`] = value;
}

export async function getSecret(scope: SecretScope, key: string) {
  return mem[`${scope.companyId}:${scope.connectorId}:${key}`];
}
