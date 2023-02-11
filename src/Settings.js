import { useState, useEffect } from 'react';
import { PulseLoader } from 'react-spinners';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Menu } from './Menu';
import store from './store';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';

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
                <br />
                <br />
            </div>
        </>
    )
}

function noop() { };

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
            const input = document.querySelector("#Media-Image");
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
                <br />
                <br />
            </div>
        </div>
    );
}

export function ImportExportDataSettings() {
    const [importData, setImportData] = useState(null);
    const navigate = useNavigate();
    async function handleExport() {
        /**
         * Strategy:
         * /
         *  /media
         *      /{fileId}.{type}
         *  calendar.json
         *  notes.json
         * 
         * TODO: store db version metadata
         */
        const zip = new JSZip();
        const dataFolder = zip.folder("data");
        const imageFolder = zip.folder("media");

        const calendar = await store.getItemById('calendar', 1);
        dataFolder.file("calendar.json", JSON.stringify(calendar));

        const note = await store.getItemById('note', 'note');
        dataFolder.file("note.json", JSON.stringify(note));

        const config = await store.getAll('config');
        dataFolder.file("config.json", JSON.stringify(config));

        const media = await store.getAll('media');

        media.forEach(m => {
            imageFolder.file(m.file.name, m.file);
        });

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "whatsimportant_mydata.zip");
    }

    async function handleImport() {
        // TODO: validate import
        try {
            const input = document.querySelector("#Import-File");
            const file = input.files[0];
            const zipFile = await JSZip.loadAsync(file);
            const media = await Promise.all(
                Object.keys(zipFile.files)
                    .filter((fileName) => fileName.startsWith('media/') && !zipFile.files[fileName].dir)
                    .map(async (fileName) => {
                        const blob = await zipFile.files[fileName].async("blob");
                        const url = URL.createObjectURL(blob);
                        return {
                            file: blob,
                            url,
                            name: fileName
                        }
                    })
            )
            const calendar = JSON.parse(await zipFile.files['data/calendar.json'].async("text"));
            const note = JSON.parse(await zipFile.files['data/note.json'].async("text"));
            const config = JSON.parse(await zipFile.files['data/config.json'].async("text"));
            setImportData({
                media,
                calendar,
                note,
                config
            })
        } catch (error) {
            console.error(error);
        }
    }

    async function saveImport() {
        store.importData(importData)
            .then(() => {
                if (window.confirm("Import successful. Reload site?")) {
                    navigate("/");
                }
            })
    }

    async function cancelImport() {
        setImportData(null);
    }

    return (
        <div>
            <div className="Import-Export-Controls">
                <button onClick={handleExport} type="button" className="Button">Export</button>{' '}
                {
                    !importData && <>
                        <label htmlFor="Import-File" className="Button">Import</label>
                        <input type="file" id="Import-File" style={{ display: 'none' }} accept=".zip" onChange={handleImport} />
                    </>
                }
            </div>
            <br />
            {importData && (
                <div className="Import-Preview">
                    <h2>Preview Import</h2>
                    <h3>Media</h3>
                    <div className="Import-Media-Container">
                        {(importData.media || []).map(m => {
                            return <img alt="" className="Media-Image" key={m.name} src={m.url} />
                        })}
                    </div>
                    <br />
                    <hr />

                    <h3>Calendar</h3>

                    <h4>Desktop</h4>
                    <small>{(importData.calendar?.desktop) && <a href={importData.calendar.desktop}>{importData.calendar.desktop}</a>}</small>

                    <br />
                    <h4>Mobile</h4>
                    <small>{(importData.calendar?.mobile) && <a href={importData.calendar.mobile}>{importData.calendar.mobile}</a>}</small>
                    <br />
                    <br />
                    <hr />

                    <h3>Note</h3>
                    <Markdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
                        {importData?.note?.data || ''}
                    </Markdown>
                    <br />
                    <br />
                    <button className="Button" onClick={saveImport}>Confirm Import</button>{' '}
                    <button className="Button" onClick={cancelImport}>Cancel</button>
                </div>
            )}
        </div>
    )
}

export function AirtableSettings() {
    const [values, setValues] = useState({});
    const keys = ['apiKey', 'base', 'table', 'recordId'];

    useEffect(() => {
        store
            .getAll('config')
            .then((c) => {
                return c.find(item => item.id === 'airtable')
            })
            .then((c) => {
                if (c) {
                    setValues(c);
                }
            })
    }, []);

    const handleSave = async () => {
        await store.saveObject('config', {
            id: 'airtable',
            apiKey: values["apiKey"],
            base: values["base"],
            table: values["table"],
            recordId: values["recordId"]
        });
    }

    const setKeyValue = (key, value) => {
        setValues((prev) => ({
            ...prev,
            [key]: value
        }));
    }

    return (
        <div>
            <small>Used to sync notes across devices. Do not store anything sensitive in notes</small>
            <br />
            <br />

            {keys.map((k => {
                return (
                    <div key={k}>
                        <label htmlFor={`airtable-${k}`}>{k}</label>
                        <br />
                        <input type="text" id={`airtable-${k}`} value={values[k] || ""} onChange={(e) => {
                            setKeyValue(k, e.target.value)
                        }}></input>
                        <br />
                        <br />
                    </div>
                )
            }))}

            <button className="Button" type="button" onClick={handleSave}>Save</button>
        </div>
    )
}


export function SettingsPage() {
    const navigate = useNavigate();
    return (
        <div>
            <Menu />
            <div className="Settings">
                <div>
                    <h1>Settings</h1>
                    <hr />

                    <h2>Export data</h2>
                    <ImportExportDataSettings />
                    <hr />

                    <h2>Media</h2>
                    <MediaSettings />
                    <hr />

                    <h2>Calendar</h2>
                    <CalendarSettings />
                    <hr />

                    <h2>Airtable integration</h2>
                    <AirtableSettings />
                    <hr />

                    <h2>Factory Reset</h2>
                    <button className="Button" type="button" onClick={() => {
                        if (window.confirm("Delete all data?")) {
                            store.factoryReset()
                                .then(() => {
                                    navigate("/");
                                });
                        }
                    }}>Clear all data</button>
                </div>
            </div>
        </div>
    )
}
