import { Component } from '@angular/core';
import { personalData } from 'src/utils/data/personal-data';


@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  personalData = personalData;

}
