import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor() { }

  paymentTypes = [ "MasterCard", "Visa", "American Express", "Bitcoin", "Ethereum", "Monero" ];

  ngOnInit(): void {
  }

  onRegister(form: NgForm): void {
    console.log(form.value);
  }

  onFormReset(form: NgForm): void {
    form.reset();
  }

}
