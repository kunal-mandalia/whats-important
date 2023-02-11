import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { PulseLoader } from 'react-spinners';
import remarkGfm from 'remark-gfm'
import store from './store';

function syncStatus(local, server) {
    if (!local && !server) return 0;
    if (local && !server) return 1;
    if (!local && server) return 2;
    if (local && server) {
        if (local.note === server.note) return 1;
        
        const lt = new Date(local.last_modified).getTime();
        const st = new Date(server.last_modified).getTime();

        if (lt === st) return 1;
        if (lt < st) return 2;
        if (lt > st) return 3;
    }
    return 0;
}

export function Note() {
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [note, setNote] = useState('');

    async function syncData() {
        let local = null;
        let server = null;
        let note = '';

        local = await store.getNote();

        try {
            server = await store.readStoreOnline('note');
        } catch (e) {
            console.error(e);
        }

        const status = syncStatus(local, server);

        switch (status) {
            case 1:
                note = local.note;
                break;
            case 2:
                note = server.note;
                await store.saveObject('note', {
                    id: 'note',
                    note: server.note,
                    last_modified: server.last_modified,
                });
                break;
            case 3:
                note = local.note;
                await store.saveObjectOnline(note);
                break;
            default:
                break;
        }

        setNote(note);
        setLoading(false);
    }

    useEffect(() => {
        syncData();
    }, []);

    async function saveNote() {
        await store.saveObject('note', {
            id: 'note',
            note: note,
            last_modified: new Date().toISOString(),
        });
        try {
            // TODO: use same last_modified date
            await store.saveObjectOnline(note);
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) {
        return (
            <div className="Note Responsive-item">
                <PulseLoader />
            </div>
        )
    }

    if (editMode) {
        return (
            <div className="Note Responsive-item">
                <textarea className="Note-Editor" value={note} onChange={(e) => {
                    setNote(e.target.value);
                }} />
                <br />
                <br />
                
                <button className="Button" onClick={() => {
                    saveNote().then(() => {
                        setEditMode(false);
                    });
                }}>Done</button>
                <br />
            </div>
        )
    }

    if (!note) {
        return (
            <div className="Responsive-item">
                <div className="Settings-Container">
                    <h1>Note</h1>
                    <button className="Button" onClick={() => {
                        setEditMode(true);
                    }}>Add</button>
                    <br />
                </div>
            </div>
        )
    }

    return (
        <div className="Note Note-Reader Responsive-item">
            <Markdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
                {note}
            </Markdown>
            <br />
            <button className="Button" onClick={() => {
                setEditMode(true);
            }}>Edit</button>
        </div>
    )
}
