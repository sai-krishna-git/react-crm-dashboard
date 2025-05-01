import { useState } from "react";
import API from "../api";
import { setToken } from "../auth";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await API.post("/auth/admin/login", { email, password });
            setToken(res.data.token);
            window.location.href = "/dashboard";
        } catch {
            alert("Invalid Admin Credentials");
        }
    };

    return (
        <div>
            <h3>Admin Login</h3>
            <input type="email" placeholder="Admin Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
