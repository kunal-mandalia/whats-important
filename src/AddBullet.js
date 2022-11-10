import { useState } from 'react';
import store from './store';

function AddBullet() {
    const [showNewBullet, setShowNewBullet] = useState(false);
    const [description, setDescription] = useState('');

    const handleSave = async () => {
        try {
            const input = document.querySelector('input[type=file]');
            const file = input.files[0];
            await store.saveBullet({ file, description });
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
                    <button onClick={handleSave}>Save</button>
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