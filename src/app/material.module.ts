import { NgModule } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@NgModule({
    imports: [
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatToolbarModule,
        MatMenuModule,
        MatRadioModule,
        MatCheckboxModule,
        MatSlideToggleModule,
    ],
    exports: [
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatToolbarModule,
        MatMenuModule,
        MatRadioModule,
        MatCheckboxModule,
        MatSlideToggleModule
    ]
})

export class MaterialModule { }