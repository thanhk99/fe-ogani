import { Component, OnInit } from '@angular/core';
import { LayoutService } from './_service/layout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ogani';
  showHeaderFooter = true;

  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.layoutService.getHeaderFooterVisibility().subscribe(visible => {
      this.showHeaderFooter = visible;
    });
  }
}
