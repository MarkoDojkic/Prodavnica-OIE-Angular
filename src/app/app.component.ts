import { Component, HostBinding, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  //Code from: https://www.c-sharpcorner.com/article/angular-dynamic-page-title-based-on-route/

  isDarkMode: Boolean;
  isLoggedIn: Boolean;

  constructor(private router: Router,  
    private activatedRoute: ActivatedRoute,  
    private titleService: Title) { }

  ngOnInit() {
    this.isLoggedIn = sessionStorage.getItem('loggedInUserId') !== undefined;
    console.log(this.isLoggedIn);
    this.router.events.pipe(  
      filter(event => event instanceof NavigationEnd),  
    ).subscribe(() => {  
      const rt = this.getChild(this.activatedRoute);  
      rt.data.subscribe(data => { this.titleService.setTitle(data.title) });  
    });
    this.isDarkMode = true; /* Initially dark mode is on */
    if (this.router.url === "/") this.router.navigate(["/profilePage"]);
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
    this.isLoggedIn = false;
    sessionStorage.clear();
    this.router.navigate(["/login"]);
  }
}


