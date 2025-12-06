import { jsx as _jsx } from "react/jsx-runtime";
import { Input } from '../ui/Input';
export const PasswordField = ({ value, onChange, ...props }) => {
    return (_jsx(Input, { label: "Password", type: "password", value: value, onChange: onChange, ...props }));
};
export default PasswordField;
