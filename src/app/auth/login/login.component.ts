import { FirebaseService } from '../../services/firebase/firebase.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public fs:FirebaseService) { }

  ngOnInit(): void {
  }

  onFormReset(form: NgForm): void {
    form.reset();
  }
}
