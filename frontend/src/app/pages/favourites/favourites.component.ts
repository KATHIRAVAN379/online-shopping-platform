import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Product } from '../../core/models/product';
import { FavouriteService } from '../../core/services/favourite.service';

@Component({
  selector: 'app-favourites',
  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink
  ],

  templateUrl: './favourites.component.html',
  styleUrl: './favourites.component.css'
})
export class FavouritesComponent implements OnInit {

  favourites: Product[] = [];


  constructor(
    private favouriteService: FavouriteService
  ) {}


  ngOnInit(): void {

    this.favouriteService.favourites$
      .subscribe(products => {

        this.favourites = products;

      });

  }


  removeFavourite(productId: number): void {

    this.favouriteService.removeFavourite(
      productId
    );

  }


  clearAll(): void {

    this.favouriteService.clearFavourites();

  }

}