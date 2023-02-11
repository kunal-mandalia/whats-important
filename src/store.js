import Airtable from 'airtable';

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
            'calendar',
            'config',
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

                const newStoreOps = this.stores
                    .filter(s => !db.objectStoreNames.contains(s))
                    .map(s => db.createObjectStore(s, { keyPath: 'id', autoIncrement: true }));

                await Promise.all(newStoreOps);
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

    async getConfigById(id) {
        const config = await this.getAll('config');
        return config.find(c => c.id === id);
    }

    async readStoreOnline() {
        return new Promise(async (resolve, reject) => {
            try {
                const airtableConfig = await this.getConfigById('airtable');
                const { apiKey, base, table } = airtableConfig;
                const airtable = new Airtable({
                    apiKey: apiKey,
                })
                airtable
                    .base(base)(table)
                    .select({
                        sort: [{ field: 'Note', direction: 'asc' }]
                    }).eachPage(function page(records) {
                        records.forEach(function (record) {
                            const note = record.get('Note');
                            const last_modified = record.get('Last Modified');
                            return resolve({ note, last_modified });
                        });
                    }, function done(error) {
                        if (error) return reject(error);
                        resolve();
                    });

            } catch (error) {
                console.error(error);
                return reject(error);
            }
        })
    }

    async saveObjectOnline(note) {
        return new Promise(async (resolve, reject) => {
            try {
                const airtableConfig = await this.getConfigById('airtable');
                const { apiKey, base, table, recordId } = airtableConfig;
                const airtable = new Airtable({
                    apiKey: apiKey
                })
                airtable
                    .base(base)(table)
                    .update(recordId, { Note: note }, (data) => {
                        return resolve(data);
                    });
            } catch (error) {
                return reject(error);
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

    async getNote() {
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
            console.log({ data })
            try {
                const db = await this.getDBConnection();
                let trx = db.transaction(this.stores, "readwrite");
                trx.addEventListener('complete', (event) => {
                    console.log('Transaction was completed');
                    return resolve();
                });

                trx = await this._deleteStore(trx, 'calendar');
                trx = await this._deleteStore(trx, 'note');
                trx = await this._deleteStore(trx, 'media');
                trx = await this._deleteStore(trx, 'config');

                trx = await this._putObject(trx, 'calendar', data.calendar);
                trx = await this._putObject(trx, 'note', data.note);
                if (data.config) {
                    for (let i = 0; i < data.config.length; i++) {
                        trx = await this._putObject(trx, 'config', data.config[i]);
                    }
                }
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
                let trx = db.transaction(this.stores, "readwrite");
                trx.addEventListener('complete', (event) => {
                    console.log('Transaction was completed');
                    return resolve();
                });
                trx = await this._deleteStore(trx, 'calendar');
                trx = await this._deleteStore(trx, 'note');
                trx = await this._deleteStore(trx, 'media');
                trx = await this._deleteStore(trx, 'config');
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
    dbVersion: 8,
    storeNamePrefix: 'whatsimportant'
});

export default store;