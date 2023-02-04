import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';
import { CalendarSettings } from './Settings';
import store from './store';


export function Calendar({ isSmall }) {
    // TODO get links from store
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

    async function handleSave() {
        await store.saveCalendarLinks(links);
    }

    // const calendarSrc = isSmall ? "https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff&ctz=Europe%2FLondon&showTitle=0&showNav=0&showDate=0&showPrint=0&showTabs=0&showCalendars=1&showTz=0&mode=AGENDA&title=What's%20Important&src=a3VuYWwudi5tYW5kYWxpYUBnbWFpbC5jb20&src=YWRkcmVzc2Jvb2sjY29udGFjdHNAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4udWsjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%237986CB&color=%2333B679&color=%230B8043"
        // : "https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff&ctz=Europe%2FLondon&showTitle=0&showNav=0&showDate=0&showPrint=0&showTabs=0&showCalendars=1&showTz=0&mode=WEEK&title=What's%20Important&src=a3VuYWwudi5tYW5kYWxpYUBnbWFpbC5jb20&src=YWRkcmVzc2Jvb2sjY29udGFjdHNAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4udWsjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%237986CB&color=%2333B679&color=%230B8043"

    const calendarSrc = isSmall ? links.mobile : links.desktop;

    if (loading) {
        return (
            <div className="Notes Responsive-item">
                <PulseLoader />
            </div>
        )
    }

    return (
        <div className="Responsive-item">
            {calendarSrc && (
                <iframe
                id="gcal"
                title="Google Calendar"
                src={calendarSrc}
                style={{ borderWidth: 0 }}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
            ></iframe>
            )}
            {!calendarSrc && (
                <div className="Calendar-Settings-Container">
                    <div>
                        <h2>Calendar</h2>
                        <CalendarSettings onEmitUpdate={loadLinks} />
                    </div>
                </div>
            )}
        </div>
    )
}
