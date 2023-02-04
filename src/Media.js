import { useEffect, useState } from 'react';
import { PulseLoader } from 'react-spinners';
import { MediaSettings } from './Settings';
import store from './store';

function nextImageIndex(currentIndex, numImages) {
    return (currentIndex + 1) % (numImages);
}

export function Media() {
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    function getAllMedia() {
        store
            .getAll('media')
            .then((m) => {
                if (m) {
                    const mItems = m.map(mi => {
                        return {
                            ...mi,
                            url: URL.createObjectURL(mi.file)
                        }
                    });
                    setMedia(mItems);
                }
            })
            .then(() => {
                setLoading(false);
            })
    }

    useEffect(() => {
        getAllMedia();
    }, []);

    useEffect(() => {
        if (!loading && media.length > 0) {
            const interval = setInterval(() => {
                setSelectedMediaIndex(nextImageIndex(selectedMediaIndex, media.length));
            }, 1000 * 10);

            return () => clearInterval(interval);
        }
        if (!loading && media.length === 0) {
            setEditMode(true);
        }
    }, [loading, selectedMediaIndex, media]);


    if (loading) {
        return (
            <div className="Media-Loading Responsive-item">
                <div className="Media-Container">
                    <PulseLoader />
                </div>
            </div>
        )
    }

    if (editMode) {
        return (
            <div className="Responsive-item">
                <div className="Settings-Container">
                    <h1>Media</h1>
                    <MediaSettings onEmitUpdate={getAllMedia} />
                    {media.length > 0 && (
                        <div>
                            <br />
                            <br />
                            <button className="Button" onClick={() => {
                                setEditMode(false);
                            }}>Done</button>
                        </div>
                    )}
                </div>
                
            </div>
        )
    }

    return <div className="Responsive-item">
        <div className="Media-Container">
            {media.length > 0 && <img alt="" className="Media-item Spot-light" key={selectedMediaIndex} src={media[selectedMediaIndex].url} />}
        </div>
    </div>
}
