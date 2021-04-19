import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {

  constructor(private router: Router, private localStorageS: LocalStorageService) { }

  ngOnInit(): void {
    if (this.localStorageS.retrieve("loggedInUserId") === undefined
      || this.localStorageS.retrieve("loggedInUserId") === null)
          this.router.navigate(["/login"]);
  }

}
