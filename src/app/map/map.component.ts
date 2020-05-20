import { Component, OnInit } from '@angular/core';
import { SearchComponentEvent } from 'generieke-geo-componenten-search';
import { MapService } from 'generieke-geo-componenten-map';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {

  constructor(public mapService: MapService) {}

  ngOnInit(): void {
  }

  handleEvent(event: SearchComponentEvent) {
    this.mapService.zoomToPdokResultAndMark(event, 'een');
  }
};


