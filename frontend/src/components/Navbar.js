import { logout } from "../auth";

export default function Navbar() {
    return (
        <nav style={{ padding: "10px", backgroundColor: "#eee", display: "flex", justifyContent: "space-between" }}>
            <h2>CRM Dashboard</h2>
            <button onClick={logout}>Logout</button>
        </nav>
    );
}
