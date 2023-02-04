import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { PulseLoader } from 'react-spinners';
import remarkGfm from 'remark-gfm'
import store from './store';


// TODO: save to indexeddb
export function Notes() {
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        store.getNotes()
            .then(n => {
                setNotes(n?.data || '')
            })
            .then(() => {
                setLoading(false);
            });
    }, []);

    async function saveNotes() {
        store.saveNotes(notes)
    }

    if (loading) {
        return (
            <div className="Notes Responsive-item">
                <PulseLoader />
            </div>
        )
    }

    if (editMode) {
        return (
            <div className="Notes Responsive-item">
                <textarea className="Notes-Editor" value={notes} onChange={(e) => {
                    setNotes(e.target.value);
                }} />
                <br />
                <br />
                
                <button className="Button" onClick={() => {
                    saveNotes().then(() => {
                        setEditMode(false);
                    });
                }}>Done</button>
            </div>
        )
    }

    if (!notes) {
        return (
            <div className="Responsive-item">
                <div className="Settings-Container">
                    <h2>Notes</h2>
                    <button className="Button" onClick={() => {
                        setEditMode(true);
                    }}>Add</button>
                </div>
            </div>
        )
    }

    return (
        <div className="Notes Notes-Reader Responsive-item">
            <Markdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
                {notes}
            </Markdown>
            <button className="Button" onClick={() => {
                setEditMode(true);
            }}>Edit</button>
        </div>
    )
}
