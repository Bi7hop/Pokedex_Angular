import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { Pokemon } from '../../interfaces/pokemon.interface';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule,
    PokemonCardComponent,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss'
})
export class PokemonListComponent implements OnInit {
  pokemons: Pokemon[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 20;

  constructor(
    private pokemonService: PokemonService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadInitialPokemon();
  }

  loadInitialPokemon() {
    this.loading = true;
    this.pokemonService.getPokemonBatch(1, this.pageSize).subscribe({
      next: (pokemon) => {
        this.pokemons = pokemon;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Pokemon:', error);
        this.loading = false;
      }
    });
  }

  loadMore() {
    if (this.loading) return;
    
    this.loading = true;
    const nextPage = this.currentPage * this.pageSize + 1;
    
    this.pokemonService.getPokemonBatch(nextPage, this.pageSize).subscribe({
      next: (newPokemon) => {
        this.pokemons = [...this.pokemons, ...newPokemon];
        this.currentPage++;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading more Pokemon:', error);
        this.loading = false;
      }
    });
  }

  onPokemonClick(pokemon: Pokemon) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = pokemon;
    dialogConfig.panelClass = 'pokemon-detail-dialog';
    dialogConfig.backdropClass = 'dialog-backdrop';
    dialogConfig.position = { top: '50px' };
    dialogConfig.width = '400px';
    dialogConfig.maxWidth = '95vw';
    dialogConfig.enterAnimationDuration = '400ms';
    dialogConfig.exitAnimationDuration = '400ms';

    this.dialog.open(PokemonDetailComponent, dialogConfig);
  }
}