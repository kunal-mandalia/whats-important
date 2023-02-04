import { Link } from "react-router-dom";

function SettingsLink() {
    return <Link className="Link-Emoji-Button" to="/settings">⚙️</Link>;
}

function HomeLink() {
    return <Link className="Link-Emoji-Button" to="/">🏠</Link>;
}

export function Menu() {
    const MenuLink = window.location.pathname.startsWith("/settings") ? HomeLink : SettingsLink;
    return (
        <div className="Menu">
            <div><strong>What's Important</strong> <small>v{process.env.REACT_APP_VERSION.substring(0, 7)}</small></div>
            <MenuLink />
        </div>
    )
}