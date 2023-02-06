class Store {
    constructor(props) {
        this.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
        this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
        this.dbVersion = props.dbVersion;
        this.storeName = `${props.storeNamePrefix}-v${this.dbVersion}`;
        this.subscribers = [];
        this.stores = [
            'note',
            'media',
            'calendar'
        ];
    }

    async getDBConnection() {
        return new Promise((resolve, reject) => {
            const request = this.indexedDB.open("whatsimportant", this.dbVersion);
            request.onsuccess = (event) => {
                const db = request.result;
                db.onerror = function (event) {
                    console.error("Error creating/accessing IndexedDB database");
                };
                return resolve(db);
            }
            request.onerror = (event) => {
                console.error(event);
                return reject(event);
            }
            request.onupgradeneeded = async (event) => {
                const db = event.target.result;
                const trx = event.target.transaction;
                console.log(`Upgrading to version ${db.version}`);
                await Promise.all(this.stores.map(s => db.createObjectStore(s, { keyPath: 'id', autoIncrement: true })));
                trx.oncomplete = () => {    
                    return resolve(db);
                }
                trx.onerror = (event) => {
                    console.error(event);
                    return reject(event);
                }
            };
        })
    }

    async saveBullet(bullet) {
        return new Promise(async (resolve, reject) => {
            const now = new Date().getTime();
            const db = await this.getDBConnection();
            const transaction = db.transaction([this.storeName], "readwrite");

            for (let i = 0; i < 365; i++) {
                const request = transaction.objectStore(this.storeName).put({
                    ...bullet,
                    date: new Date(now + (1000 * 60 * 60 * 24 * i))
                });

                request.onsuccess = async () => {
                    if (i  === 365 - 1) {
                        const bullets = await this.getBullets();
                        this.subscribers.forEach(f => f(bullets));
                        return resolve();
                    }
                }
                request.onerror = () => reject();
            }
        });
    }

    async saveItem(store, id, item) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.getDBConnection();
                const transaction = db.transaction([store], "readwrite");
                transaction.objectStore(store).put({ id, data: item });
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    async saveObject(store, object) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.getDBConnection();
                const transaction = db.transaction([store], "readwrite");
                transaction.objectStore(store).put(object);
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    async getItemById(store, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.getDBConnection();
                const transaction = db.transaction([store], "readonly");
                const request = transaction.objectStore(store).get(id);
                request.onsuccess = (event) => {
                    return resolve(event.target.result);
                }
                request.onerror = (reason) => {
                    return reject(reason)
                }
            } catch (e) {
                return reject(e);
            }
        })
    }

    async getAll(store) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.getDBConnection();
                const transaction = db.transaction([store], "readonly");
                const request = transaction.objectStore(store).getAll();
                request.onsuccess = (event) => {
                    return resolve(event.target.result);
                }
                request.onerror = (reason) => {
                    return reject(reason)
                }
            } catch (e) {
                return reject(e);
            }
        })
    }

    async saveNotes(notes) {
        return this.saveItem('note', 'note', notes);
    }

    async getNotes() {
        return this.getItemById('note', 'note');
    }

    async saveCalendarLinks(links) {
        return this.saveObject('calendar', 
        {
            ...links,
            id: 1,
        });
    }

    async getCalendarLinks() {
        return this.getAll('calendar');
    }

    async deleteItem(store, id) {
        return new Promise(async (resolve, reject) => {
            const db = await this.getDBConnection();
            const transaction = db.transaction([store], "readwrite");
            const request = transaction.objectStore(store).delete(id);
            request.onsuccess = async () => {
                return resolve();
            }
            request.onerror = () => reject();
        });
    }



    async deleteBullet(id) {
        return new Promise(async (resolve, reject) => {
            const db = await this.getDBConnection();
            const transaction = db.transaction([this.storeName], "readwrite");
            const request = transaction.objectStore(this.storeName).delete(id);
            request.onsuccess = async () => {
                const bullets = await this.getBullets();
                this.subscribers.forEach(f => f(bullets));
                return resolve();
            }
            request.onerror = () => reject();
        });
    }

    async getBullets() {
        return new Promise(async (resolve, reject) => {
            const db = await this.getDBConnection();
            const transaction = db.transaction([this.storeName], "readonly");
            const request = transaction.objectStore(this.storeName).getAll();
            request.onsuccess = (event) => {
                return resolve(event.target.result);
            }
            request.onerror = (reason) => {
                return reject(reason)
            }
        })
    }

    async _deleteStore(transaction, store) {
        return new Promise((resolve, reject) => {
            const request = transaction.objectStore([store]).clear();
            request.onsuccess = (event) => {
                return resolve(event.target.transaction);
            }
            request.onerror = (event) => {
                return reject();
            }
        });
    }
    async _putObject(transaction, store, object) {
        return new Promise((resolve, reject) => {
            const request = transaction.objectStore([store]).put(object);
            request.onsuccess = (event) => {
                return resolve(event.target.transaction);
            }
            request.onerror = (event) => {
                return reject();
            }
        });
    }

    async importData(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.getDBConnection();
                let trx = db.transaction(['calendar', 'note', 'media'], "readwrite");
                trx.addEventListener('complete', (event) => {
                    console.log('Transaction was completed');
                    return resolve();
                });

                trx = await this._deleteStore(trx, 'calendar');
                trx = await this._deleteStore(trx, 'note');
                trx = await this._deleteStore(trx, 'media');

                trx = await this._putObject(trx, 'calendar', data.calendar);
                trx = await this._putObject(trx, 'note', data.note);
                for (let i = 0; i < data.media.length; i++) {
                    trx = await this._putObject(trx, 'media', {
                        file: data.media[i].file,
                    })
                }
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        })
    }

    async factoryReset() {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.getDBConnection();
                let trx = db.transaction(['calendar', 'note', 'media'], "readwrite");
                trx.addEventListener('complete', (event) => {
                    console.log('Transaction was completed');
                    return resolve();
                });
                trx = await this._deleteStore(trx, 'calendar');
                trx = await this._deleteStore(trx, 'note');
                trx = await this._deleteStore(trx, 'media');
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        })
    }

    subscribe(f) {
        this.subscribers.push(f);
    }
}

const store = new Store({
    dbVersion: 4,
    storeNamePrefix: 'whatsimportant'
});

export default store;