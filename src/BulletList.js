import { useEffect, useState } from 'react';
import store from './store';

function Bullet({ bullet }) {
    const [mediaSrc, setMediaSrc] = useState(null);

    useEffect(() => {
        var reader = new FileReader();
        reader.readAsDataURL(bullet.file);
        reader.onload = function (e) {
            setMediaSrc(e.target.result);
        }
    }, [bullet])

    return (
        <div className="Bullet">
            <img src={mediaSrc} className="Bullet-image"></img>
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
    }, [store])
    console.log(bullets)

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
