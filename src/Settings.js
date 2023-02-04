import { useState, useEffect } from 'react';
import { PulseLoader } from 'react-spinners';
import { Menu } from './Menu';
import store from './store';

export function CalendarSettings({ onEmitUpdate }) {
    const [links, setLinks] = useState({
        mobile: '',
        desktop: '',
    });


    useEffect(() => {
        store.getCalendarLinks().then(l => {
            if (l.length > 0) {
                setLinks(l[0]);
            }
        });
    }, []);

    async function handleSave() {
        await store.saveCalendarLinks(links);
        onEmitUpdate && onEmitUpdate(links);
    }

    return (
        <>
            <div className="Calendar-Settings">
                <label htmlFor="calendar-link-mobile">Desktop link</label>
                <br />
                <input type="text" id="calendar-link-desktop" value={links.desktop} onChange={(e) => {
                    setLinks((prev) => ({
                        ...prev,
                        desktop: e.target.value
                    }))
                }}></input>
                <br />
                <br />

                <label htmlFor="calendar-link-mobile">Mobile link</label>
                <br />
                <input type="text" id="calendar-link-mobile" value={links.mobile} onChange={(e) => {
                    setLinks((prev) => ({
                        ...prev,
                        mobile: e.target.value
                    }))
                }}></input>
                <br />
                <br />

                <button className="Button" onClick={handleSave}>Save</button>
            </div>
        </>
    )
}

function noop() {};

export function MediaSettings({ onEmitUpdate }) {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const emitUpdate = onEmitUpdate || noop;

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

    const handleSave = async () => {
        try {
            const input = document.querySelector('input[type=file]');
            const file = input.files[0];
            store
                .saveObject('media', {
                    file,
                })
                .then(() => {
                    getAllMedia();
                })
                .then(() => {
                    emitUpdate();
                })
        } catch (e) {
            console.error(e);
        }
    }

    const handleDelete = (id) => {
        store
            .deleteItem('media', id)
            .then(() => {
                getAllMedia();
            })
            .then(() => {
                emitUpdate();
            })
    }

    if (loading) {
        return (
            <div className="Media-Settings">
                <PulseLoader />
            </div>
        )
    }

    return (
        <div className="Media-Settings">
            <div className="Media-Items">
                {media.map(m => {
                    return (
                    <div key={`file_${m.id}`}>
                        <img alt="" className="Media-Image" src={m.url} />
                        <div className="Media-Item-Controls"><button className="Small-Button" onClick={() => {
                            handleDelete(m.id)
                        }}>x</button></div>
                    </div>
                    )
                })}
            </div>
            <div>
                <br />
                <br />
                <label htmlFor="Media-Image" className="Button">Add image</label>
                <input type="file" id="Media-Image" style={{ display: 'none' }} accept="image/png, image/jpeg" onChange={(e) => {
                    handleSave();
                }} />
            </div>
        </div>
    );
}


export function SettingsPage() {
    return (
        <div>
            <Menu />
            <div className="Settings">
                <div>
                    <h1>Settings</h1>
                    <hr />

                    <h2>Media</h2>
                    <MediaSettings />
                    <br />
                    <br />
                    <hr />

                    <h2>Calendar</h2>
                    <CalendarSettings />
                </div>
            </div>
        </div>
    )
}
