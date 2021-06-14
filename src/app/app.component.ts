import { IndexedDatabaseService } from './services/indexed-database/indexed-database.service';
import { FirebaseService } from './services/firebase/firebase.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Item } from './model/item.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isDarkMode: boolean;
  numberOfProductsInShoppingCart: number;
  localStorageDb: string = "localStorageDb";
  
  constructor(private router: Router,  
    private activatedRoute: ActivatedRoute,  
    private titleService: Title,
    public fs:FirebaseService, private idb: IndexedDatabaseService) { }

  ngOnInit() {
    //Code from: https://www.c-sharpcorner.com/article/angular-dynamic-page-title-based-on-route/
    this.router.events.pipe(  
      filter(event => event instanceof NavigationEnd),  
    ).subscribe(() => {  
      const rt = this.getChild(this.activatedRoute);  
      rt.data.subscribe(data => { this.titleService.setTitle(data.title) });  
    });

    this.isDarkMode = true; /* Initially dark mode is on */
    
    this.idb.createNewDatabase(this.localStorageDb, 1, ["orderedProducts"],
          [{ keyPath: "id", autoIncrement: false }], null, null, null);

    setInterval(() => { /* Interval to update count of items in cart automaitcally */
      this.idb.getAllObjectStoreItems(this.idb.getIDB(this.localStorageDb), "orderedProducts").then(
        result => this.numberOfProductsInShoppingCart = (result as Array<Item>).filter(item => item.id.includes(this.fs.loggedInUserId + "_")).length
      );
    }, 2000);
  }  

  getChild(activatedRoute: ActivatedRoute) {  
    if (activatedRoute.firstChild) return this.getChild(activatedRoute.firstChild);  
    else return activatedRoute; 
  }
  
  onDarkModeChange(e) {
    this.isDarkMode = e.checked;
    document.querySelector("body").classList.remove(!e.checked ? "theme-dark" : "theme-light");
    document.querySelector("body").classList.add(e.checked ? "theme-dark" : "theme-light");
  }
}