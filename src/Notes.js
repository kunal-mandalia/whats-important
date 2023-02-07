import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { PulseLoader } from 'react-spinners';
import remarkGfm from 'remark-gfm'
import store from './store';


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
            <div className="Responsive-item">
                <div className="Notes Notes-Writer">
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
                    <br />
                </div>
            </div>
        )
    }

    if (!notes) {
        return (
            <div className="Responsive-item">
                <div className="Notes Notes-Add">
                    <h1>Notes</h1>
                    <button className="Button" onClick={() => {
                        setEditMode(true);
                    }}>Add</button>
                    <br />
                </div>
            </div>
        )
    }

    return (
        <div className="Responsive-item">
            <div className="Notes Notes-Reader">
                <Markdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
                    {notes}
                </Markdown>
                <br />
                <button className="Button" onClick={() => {
                    setEditMode(true);
                }}>Edit</button>
            </div>
        </div>
    )
}
