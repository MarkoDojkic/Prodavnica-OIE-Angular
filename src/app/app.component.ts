import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'prodavnica-oie-angular';
  selectedLanguage = "English";

  changeLanguage(lang: String) {
    console.log(lang);
    switch (lang) {
      case "eng": console.log("Choosed english"); break;
      case "srcyl": console.log("Choosed serbian cyrilic"); break;
      case "englat": console.log("Choosed serbian latin");
    }
  }
}
