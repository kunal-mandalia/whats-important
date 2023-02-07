import { useState, useEffect } from 'react';
import { PulseLoader } from 'react-spinners';
import { CalendarSettings } from './Settings';
import store from './store';


export function Calendar({ isSmall }) {
    const [loading, setLoading] = useState(true);
    const [links, setLinks] = useState({
        mobile: '',
        desktop: '',
    });

    function loadLinks() {
        store.getCalendarLinks()
            .then(l => {
                if (l.length > 0) {
                    setLinks(l[0]);
                }
            })
            .then(() => {
                setLoading(false);
            })
    }

    useEffect(() => {
        loadLinks();
    }, []);

    const calendarSrc = isSmall ? links.mobile : links.desktop;

    if (loading) {
        return (
            <div className="Media-Loading Responsive-item">
                <div className="Media-Container">
                    <PulseLoader />
                </div>
            </div>
        )
    }

    return (
        <div className="Responsive-item">
            
            {calendarSrc && (
                <div className="Calendar-Wrapper">
                    <iframe
                        id="gcal"
                        title="Google Calendar"
                        src={calendarSrc}
                        style={{ borderWidth: 0 }}
                        width="100%"
                        height="90%"
                        frameBorder="0"
                        scrolling="no"
                        className="Calendar-Iframe"
                    ></iframe>
            </div>
            )}
            {!calendarSrc && (
                <div className="Settings-Container Calendar-Add-Link">
                    <div>
                        <h1>Calendar</h1>
                        <CalendarSettings onEmitUpdate={loadLinks} />
                    </div>
                </div>
            )}
        </div>
    )
}
