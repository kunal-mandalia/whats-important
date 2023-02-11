import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { PulseLoader } from 'react-spinners';
import remarkGfm from 'remark-gfm'
import store from './store';


export function Note() {
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [note, setNote] = useState('');

    useEffect(() => {
        async function init() {
            let local = null;
            let server = null;
            let note = '';
    
            local = await store.getNote();
    
            try {
                server = await store.readStoreOnline('note');
            } catch (e) {
                console.error(e);
            }
    
            if (!local && !server) {
                note = '';
            } else if (!local && server) {
                note = server.note;
            } else if (local && !server) {
                note = local.note;
            } else {
                // Both client and server have a note
                // Check if there's any conflict
                const lt = new Date(local.last_modified).getTime();
                const st = new Date(server.last_modified).getTime();
                debugger;
                if (lt === st) {
                    note = local.note;
                } else if (lt > st) {
                    if (window.confirm(`
Local note (${local.last_modified}) ahead of server (${server.last_modified}). Use local (OK) or Server (Cancel)?

Local note:
${local.note.substring(0, 20)}

Server note:
${server.note.substring(0, 20)}
`)) {
                        // Save note on server
                        note = local.note;
                        await store.saveObjectOnline(note);
                    } else {
                        note = server.note
                        await store.saveObject('note', {
                            id: 1,
                            note: server.note,
                            last_modified: server.last_modified,
                        });
                    }
                } else if (st > lt) {
                    note = server.note;
                    await store.saveObject('note', {
                        id: 'note',
                        note: note,
                        last_modified: server.last_modified,
                    });
                }
            }
    
            setNote(note);
            setLoading(false);
        }
        init();
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
