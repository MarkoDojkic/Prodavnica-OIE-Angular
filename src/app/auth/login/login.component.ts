import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  onLogin(form: NgForm): void {
    console.log("Корисник са следећим параметрима покушава да се улогује:");
    console.log(form.value);
  }

  onFormReset(form: NgForm): void {
    form.reset();
  }

}
