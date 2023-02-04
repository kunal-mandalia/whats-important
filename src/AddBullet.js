import { useState } from 'react';
import { BULLET_STATUS, BULLET_TYPES } from './constants';
import store from './store';


function AddBullet() {
    const [showNewBullet, setShowNewBullet] = useState(false);
    const [description, setDescription] = useState('');
    const [bulletType, setBulletType] = useState(BULLET_TYPES[0]);

    const handleSave = async () => {
        try {
            const input = document.querySelector('input[type=file]');
            const file = input.files[0];
            await store.saveBullet({
                file,
                description,
                type: bulletType,
                status: BULLET_STATUS[0]
            });
            setShowNewBullet(false);
        } catch (e) {
            console.error(e);
        }
    }

    if (showNewBullet) {
        return (
            <div>
                <div>
                    <label htmlFor="bullet-image">Image: </label>
                    <input type="file" id="bullet-image" accept="image/png, image/jpeg" />
                </div>

                <div>
                    <label htmlFor="bullet-description">Description: </label>
                    <input type="text" id="bullet-description" onChange={(e) => { setDescription(e.target.value) }} />
                </div>

                <div>
                    <button className="Button" onClick={handleSave}>Save</button>
                    {' '}
                    <button onClick={() => {
                        setShowNewBullet(false)
                    }}>Cancel</button>
                </div>
            </div>
        )
    }

    return (
        <button onClick={() => {
            setShowNewBullet(true)
        }}>Add bullet</button>
    )
}

export default AddBullet;