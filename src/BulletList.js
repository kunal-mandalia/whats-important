import { useEffect, useState } from 'react';
import store from './store';

function Bullet({ bullet }) {
    const [mediaSrc, setMediaSrc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        var reader = new FileReader();
        reader.readAsDataURL(bullet.file);
        reader.onload = function (e) {
            setMediaSrc(e.target.result);
            setLoading(false);
        }
    }, [bullet, setLoading])

    if (loading) {
        return <div>Loading...</div>
    }
    return (
        <div className="Bullet">
            <img src={mediaSrc} className="Bullet-image" alt="bullet"></img>
            <h4>{bullet.description}</h4>
        </div>
    )
}

function BulletList() {
    const [bullets, setBullets] = useState([]);

    useEffect(() => {
        store
            .getBullets()
            .then(setBullets)
            .then(() => {
                store.subscribe(setBullets)
            })
    }, [])

    return (
        <div>
            {bullets.map(b => {
                return (
                    <Bullet key={b.id} bullet={b} />
                )
            })}
        </div>
    )
}

export default BulletList;
