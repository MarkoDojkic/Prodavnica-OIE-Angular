import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndexedDatabaseService {

  openedIDBDatabases: Array<IDBDatabase> = [];

  constructor() { }

  openIDB(databaseName: string, databaseVersion: number): void {
    const openIDB = window.indexedDB.open(databaseName, databaseVersion);
    openIDB.onsuccess = () => { this.openedIDBDatabases.push(openIDB.result); }
    openIDB.onerror = error => { console.error("Error while opening database: " /* + JSON.stringify(error) */)}
  }

  getIDB(dbName: string): IDBDatabase {
    return this.openedIDBDatabases.find(value => value.name === dbName);
  }

  createNewDatabase(name: string, version, objectStoreNames: Array<string>,
    objectStoreParametars: Array<IDBObjectStoreParameters>, indexNames: Array<Array<string>>,
    indexKeyPaths: Array<Array<string>>, indexParameters: Array<Array<IDBIndexParameters>>): void {   
    var createIDB = window.indexedDB.open(name, 1);
    createIDB.onupgradeneeded = event => {
      if (event.oldVersion < 1) {
        this.openedIDBDatabases.push(createIDB.result);        
        var i = 0, j = 0;
        if (objectStoreNames === undefined || objectStoreNames === null) return;
        objectStoreNames.forEach(objectStoreName => {
          const createOS = this.getIDB(name).createObjectStore(objectStoreName, objectStoreParametars[i]);
          indexNames[i].forEach(indexName => {
            createOS.createIndex(indexName, indexKeyPaths[i][j], indexParameters[i][j]);
            j++;
          });
          i++;
        });
      }
    }
    createIDB.onsuccess = () => this.openedIDBDatabases.push(createIDB.result);
    /* createIDB.onerror = error => console.error(error); */
  }

  getObjectStoreItem(database: IDBDatabase, objectStoreName: string, objectStoreKey: IDBValidKey | IDBKeyRange): Promise<any> {
    const transaction = database.transaction(objectStoreName, 'readonly').objectStore(objectStoreName).getAll(objectStoreKey);
    return new Promise<any>((resolve, reject) => {
      transaction.onsuccess = () => { resolve(transaction.result) };
      transaction.onerror = error => { reject(Error("Error while getting idb data: " + error)); };
    });
  }

  getAllObjectStoreItems(database: IDBDatabase, objectStoreName: string): Promise<any> {
    const transaction = database.transaction(objectStoreName, 'readonly').objectStore(objectStoreName).getAll(IDBKeyRange.lowerBound(0));
    return new Promise<any>((resolve, reject) => {
      transaction.onsuccess = () => { resolve(transaction.result) };
      transaction.onerror = error => { reject(Error("Error while getting idb data: " + error)); };
    });
  }

  putObjectStoreItem(database: IDBDatabase, objectStoreName: string, objectStoreItemValue: any, objectStoreItemKey?: IDBValidKey): void {
    database.transaction(objectStoreName, "readwrite").objectStore(objectStoreName).put(objectStoreItemValue, objectStoreItemKey);
  }

  removeObjectStoreItem(database: IDBDatabase, objectStoreName: string, objectStoreItemKey?: IDBValidKey): void {
    database.transaction(objectStoreName, "readwrite").objectStore(objectStoreName).delete(objectStoreItemKey);
  }

  clearObjectStoredatabase(database: IDBDatabase, objectStoreName: string): void {
    database.transaction(objectStoreName, "readwrite").objectStore(objectStoreName).clear();
  }
}
