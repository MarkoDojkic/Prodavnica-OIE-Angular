import { Component, HostBinding, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isDarkMode: Boolean;
  isLoggedIn: Boolean;
 
  constructor(private router: Router,  
    private activatedRoute: ActivatedRoute,  
    private titleService: Title,
    private localStorageS: LocalStorageService) { }

  ngOnInit() {
    this.isLoggedIn = (this.localStorageS.retrieve("loggedInUserId") === undefined
                          || this.localStorageS.retrieve("loggedInUserId") !== null)

    this.localStorageS.observe("loggedInUserId").subscribe((value) => {
      this.isLoggedIn = (value !== undefined || value !== null);
    });

    //Code from: https://www.c-sharpcorner.com/article/angular-dynamic-page-title-based-on-route/
    this.router.events.pipe(  
      filter(event => event instanceof NavigationEnd),  
    ).subscribe(() => {  
      const rt = this.getChild(this.activatedRoute);  
      rt.data.subscribe(data => { this.titleService.setTitle(data.title) });  
    });

    this.isDarkMode = true; /* Initially dark mode is on */
  }  

  getChild(activatedRoute: ActivatedRoute) {  
    if (activatedRoute.firstChild) return this.getChild(activatedRoute.firstChild);  
    else return activatedRoute; 
  }

  @HostBinding("class")
  get currentThemeMode() {
    return this.isDarkMode ? "theme-dark" : "theme-light";
  }
  
  onDarkModeChange(e) {
    this.isDarkMode = e.checked;
  }

  onLogout() {
    this.localStorageS.clear("loggedInUserId");
    this.router.navigate(["/login"]);
    this.isLoggedIn = false;
  }
}


