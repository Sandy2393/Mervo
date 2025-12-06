import { useState } from "react";
export function useGeofence(location, defaultRadius = 50) {
    const [insideGeofence, setInside] = useState(true);
    const requestOverride = async () => {
        // TODO: use real geolocation
        const geo = { lat: location?.lat || 0, lng: location?.lng || 0 };
        setInside(true);
        return geo;
    };
    return { insideGeofence, requestOverride };
}
