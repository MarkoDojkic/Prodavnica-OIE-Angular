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
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTreeModule } from "@angular/material/tree";


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
        MatDialogModule,
        MatBadgeModule,
        MatSidenavModule,
        MatGridListModule,
        MatTreeModule
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
        MatSlideToggleModule,
        MatDialogModule,
        MatBadgeModule,
        MatSidenavModule,
        MatGridListModule,
        MatTreeModule
    ]
})

export class MaterialModule { }