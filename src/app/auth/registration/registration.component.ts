import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  onRegister(form: NgForm): void {
    console.log("Успешно регистрован нови корисник" + form.value);
  }

  onFormReset(form: NgForm): void {
    form.reset();
  }

}
