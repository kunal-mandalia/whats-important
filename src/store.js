class Store {
    constructor(props) {
        this.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
        this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
        this.dbVersion = props.dbVersion;
        this.storeName = `${props.storeNamePrefix}-v${this.dbVersion}`;
        this.subscribers = [];
    }

    async getDBConnection() {
        return new Promise((resolve, reject) => {
            const request = this.indexedDB.open("whatsimportant", this.dbVersion);
            request.onsuccess = (event) => {
                console.log("Success creating/accessing IndexedDB database");
                const db = request.result;

                db.onerror = function (event) {
                    console.log("Error creating/accessing IndexedDB database");
                };
                return resolve(db);
            }
            request.onerror = (event) => {
                console.error(event);
                return reject(event);
            }
            request.onupgradeneeded = async (event) => {
                const db = event.target.result;
                console.log(`Upgrading to version ${db.version}`);
                await db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                return resolve(db);
            };

        })
    }

    async saveBullet(bullet) {
        return new Promise(async (resolve, reject) => {
            const db = await this.getDBConnection();
            const transaction = db.transaction([this.storeName], "readwrite");
            const request = transaction.objectStore(this.storeName).put(bullet);
            request.onsuccess = async () => {
                const bullets = await this.getBullets();
                this.subscribers.forEach(f => f(bullets));
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

    subscribe(f) {
        this.subscribers.push(f);
    }
}

const store = new Store({
    dbVersion: 2,
    storeNamePrefix: 'whatsimportant'
});

export default store;