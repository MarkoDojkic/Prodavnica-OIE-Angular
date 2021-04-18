import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {

  sessionId: String;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.sessionId = sessionStorage.getItem("loggedInUserId");
    if (this.sessionId === null || this.sessionId === undefined) this.router.navigate(["/login"]);
  }

}
