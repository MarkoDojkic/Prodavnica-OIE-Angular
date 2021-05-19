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
    openIDB.onerror = error => { console.log("Error while opening database: " + JSON.stringify(error))}
  }

  getIDB(dbName: string): IDBDatabase {
    return this.openedIDBDatabases.find(value => value.name === dbName);
  }

  createNewDatabase(name: string, objectStoreNames: Array<string>,
    objectStoreParametars: Array<IDBObjectStoreParameters>, indexNames: Array<Array<string>>,
    indexKeyPaths: Array<Array<string>>, indexParameters: Array<Array<IDBIndexParameters>>): void {   
      const createIDB = window.indexedDB.open(name, 1);
      createIDB.onsuccess = () => {
        const openIDB = window.indexedDB.open(name, 2);
        
        openIDB.onupgradeneeded = () => {
          const index = this.openedIDBDatabases.push(openIDB.result);
          var i = 0, j = 0;

          objectStoreNames.forEach(objectStoreName => {
            const createOS = this.openedIDBDatabases[index].createObjectStore(objectStoreName, objectStoreParametars[i]);
            indexNames[i].forEach(indexName => {
              createOS.createIndex(indexName, indexKeyPaths[i][j], indexParameters[i][j]);
              j++;
            });
            i++;
          });
        };
      };
    
    createIDB.onerror = () => {
      const openIDB = window.indexedDB.open(name, 2);
      
      openIDB.onsuccess = () => { this.openedIDBDatabases.push(openIDB.result); }
      openIDB.onerror = () => { console.log("Error while attempting to create or open indexed database: " + JSON.stringify(createIDB.result)); }
    }
  }
  
  getObjectStoresItemCount(database: IDBDatabase, objectStoreNames: string[]): Observable<number[]> {
    const output: Observable<number[]> = new Observable((observer) => {
      objectStoreNames.forEach(objectStoreName => {
        const transaction = database.transaction(objectStoreName, "readonly").objectStore(objectStoreName).count();
        transaction.onsuccess = () => observer.next([transaction.result]);
        transaction.onerror = () => observer.next([-1]);
      });
      
      return {
        unsubscribe() {
          observer.remove(observer);
        }
      }
    });

    return output;
  }

  getObjectStoreItem(database: IDBDatabase, objectStoreName: string, objectStoreKey: IDBValidKey | IDBKeyRange): Promise<any> {
    const transaction = database.transaction(objectStoreName, 'readonly').objectStore(objectStoreName).getAll(objectStoreKey);
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
