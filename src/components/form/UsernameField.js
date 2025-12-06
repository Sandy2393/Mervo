import { jsx as _jsx } from "react/jsx-runtime";
import { Input } from '../ui/input';
import { ENV } from '../../config/env';
export function normalizeDisplayUsername(v) {
    if (!v)
        return v;
    const s = v.trim().toLowerCase();
    if (!s.includes('@'))
        return `${s}@${ENV.APP_TAG}`;
    return s;
}
export const UsernameField = ({ value, onChange, ...props }) => {
    const handleChange = (e) => {
        // keep lowercase as user types
        const v = e.target.value.toLowerCase();
        // allow typing without @, but show normalized on blur if needed
        onChange({ ...e, target: { ...e.target, value: v } });
    };
    return (_jsx(Input, { label: "Username", placeholder: `username (@${ENV.APP_TAG} will be appended)`, value: value, onChange: handleChange, ...props }));
};
export default UsernameField;
