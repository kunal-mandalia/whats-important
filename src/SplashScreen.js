import { useEffect } from "react"
import { useNavigate } from 'react-router-dom';

export function SplashScreen() {
    const navigate = useNavigate();
    useEffect(() => {
        setTimeout(() => {
            navigate('/');
        }, 1000 * 10);
    }, [navigate]);
    return (
        <div className="Splash">
            <h1>What's important</h1>
        </div>
    )
}
