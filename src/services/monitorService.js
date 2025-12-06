export async function fetchMonitorStats() {
    // TODO: implement via events store; placeholder sample data
    return [
        {
            flagKey: "pricing_experiment",
            variants: [
                { key: "control", users: 120, conversions: 30 },
                { key: "variant_a", users: 110, conversions: 35 },
                { key: "variant_b", users: 105, conversions: 28 }
            ],
        },
    ];
}
