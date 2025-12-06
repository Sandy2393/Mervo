# Flag Definition Schema

Fields:
- `key`: unique identifier (string)
- `description`: optional
- `enabled`: boolean
- `type`: `boolean` | `multivariate`
- `killSwitch`: boolean (optional)
- `variants`: array of `{ key, rolloutPercentage, payload? }`
- `defaultVariant`: fallback variant key
- `targetingRules`: array of rules
  - `id`: string
  - `description`: optional
  - `condition`: condition tree
    - `op`: `eq` | `in` | `not` | `and` | `or`
    - `field`: context field (companyId, role, country, tags)
    - `value` / `values`: match values
- `force`: record userId -> variant key
- `salt`: optional hashing salt

Example:
```json
{
  "key": "pricing_experiment",
  "enabled": true,
  "type": "multivariate",
  "defaultVariant": "control",
  "variants": [
    {"key": "control", "rolloutPercentage": 34},
    {"key": "variant_a", "rolloutPercentage": 33, "payload": {"price": 19}},
    {"key": "variant_b", "rolloutPercentage": 33, "payload": {"price": 24}}
  ],
  "targetingRules": [
    {"id": "role-owner", "condition": {"op": "in", "field": "role", "values": ["owner"]}}
  ]
}
```
