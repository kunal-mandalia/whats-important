class Store {
    constructor() {
        this.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
        this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
        this.dbVersion = 2;
        this.storeName = `whatsimportant-v${this.dbVersion}`;
        this.db = null;
    }

    initialise() {
        const request = this.indexedDB.open("whatsimportant", this.dbVersion);
        request.onsuccess = (event) => {
            console.log("Success creating/accessing IndexedDB database");
            this.db = request.result;

            this.db.onerror = function (event) {
                console.log("Error creating/accessing IndexedDB database");
            };

            // Interim solution for Google Chrome to create an objectStore. Will be deprecated
            if (this.db.setVersion) {
                if (this.db.version !== this.dbVersion) {
                    var setVersion = this.db.setVersion(this.dbVersion);
                    setVersion.onsuccess = function () {
                        this.db.createObjectStore(this.db);
                    };
                }
            }
        }

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log(`Upgrading to version ${db.version}`);
            db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
            this.db = db;
        };
    }

    saveBullet(bullet) {
        const transaction = this.db.transaction([this.storeName], "readwrite");
        transaction.objectStore(this.storeName).put(bullet);
    }

    async getBullets() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readonly");
            const request = transaction.objectStore(this.storeName).getAll();
            request.onsuccess = (event) => {
                return resolve(event.target.result);
            }
            request.onerror = (reason) => {
                return reject(reason)
            }
        })
    }
}

const store = new Store();

store.initialise();

export default store;