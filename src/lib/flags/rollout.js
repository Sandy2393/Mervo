import crypto from "crypto";
export function hashToBucket(input) {
    const hash = crypto.createHash("sha1").update(input).digest("hex");
    const slice = hash.slice(0, 8); // 32-bit
    const int = parseInt(slice, 16);
    return int % 10000; // 0-9999
}
export function isInRollout(key, userId, percentage, salt = "") {
    if (!userId)
        return false;
    const bucket = hashToBucket(`${key}:${userId}:${salt}`);
    return bucket < percentage * 100; // percentage uses 0-100
}
export function chooseVariant(flagKey, userId, variants, salt = "") {
    const bucket = hashToBucket(`${flagKey}:${userId ?? "anon"}:${salt}`) % 10000;
    let cumulative = 0;
    for (const v of variants) {
        cumulative += Math.round(v.rolloutPercentage * 100);
        if (bucket < cumulative)
            return v.key;
    }
    return variants[0]?.key ?? "control";
}
