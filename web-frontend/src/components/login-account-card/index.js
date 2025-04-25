import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export function LoginAccountCard() {
    // ==== FIELDS ====
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // ==== END FIELDS ====
    const { authState, onLogin } = useAuth();
    const [errors, setErrors] = useState({});
    const resetValues = () => {
        setUsername("");
        setPassword("");
        setErrors({});
    };
    const navigate = useNavigate();
    const formValidation = () => {
        let errorHash = {};
        if (!username)
            errorHash.username = "Username required.";
        if (!password)
            errorHash.password = "Password required.";
        setErrors(errorHash);
        return Object.keys(errorHash).length === 0;
    };
    // Redirect to /new-page when this component is rendered
    const onClickLogin = async (event) => {
        event.preventDefault(); // Prevent page refresh        console.log("Submmit pressed ... ", username, password);
        if (formValidation()) {
            resetValues();
            const result = await onLogin(username, password);
            if (result && result.error) {
                navigate('/', { replace: true });
            }
            else if (authState?.authenticated) {
                navigate('/dashboard');
            }
        }
        else {
            console.log("Failed to validate!");
        }
    };
    useEffect(() => {
        setUsername("julia.martins");
        setPassword("financas#034?");
    }, []);
    return (_jsx("div", { children: _jsx("form", { children: _jsxs(Card, { className: "w-[400px]", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Login" }) }), _jsxs(CardContent, { className: "space-y-2", children: [_jsxs("div", { className: "space-y-1", style: { opacity: 1 }, children: [_jsx(Label, { htmlFor: "username", children: "Username" }), _jsx(Input, { id: "username", defaultValue: username, onChange: event => setUsername(event.target.value) })] }), errors.username ? _jsx("span", { style: styles.errorText, children: errors.username }) : null, _jsxs("div", { className: "space-y-1", style: { opacity: 1 }, children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", defaultValue: password, autoComplete: "shipping current-password webauthn", onChange: event => setPassword(event.target.value) })] }), errors.password ? _jsx("div", { style: styles.errorText, children: errors.password }) : null] }), _jsx(CardFooter, { className: "flex justify-center", children: _jsx(Button, { onClick: onClickLogin, style: { opacity: 1 }, children: _jsx("span", { className: "p-16", children: "Login" }) }) })] }) }) }));
}
const styles = {
    errorText: {
        color: 'red',
        marginBottom: 5,
    }
};
