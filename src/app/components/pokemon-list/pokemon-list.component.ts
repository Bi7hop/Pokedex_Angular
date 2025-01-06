import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { Pokemon } from '../../interfaces/pokemon.interface';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class PokemonListComponent implements OnInit, OnDestroy {
  allPokemons: Pokemon[] = [];         
  displayedPokemons: Pokemon[] = [];   
  filteredPokemons: Pokemon[] = [];    
  loading = false;
  initialLoading = true;              
  visiblePokemonCount = 20;           
  private destroy$ = new Subject<void>();

  constructor(
    private pokemonService: PokemonService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadAllPokemon();
    this.setupSearchSubscription();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription() {
    this.pokemonService.getFilteredPokemon()
      .pipe(takeUntil(this.destroy$))
      .subscribe(filteredPokemon => {
        this.filteredPokemons = filteredPokemon;
        this.displayedPokemons = this.filteredPokemons.slice(0, this.visiblePokemonCount);
      });
  }

  loadAllPokemon() {
    this.initialLoading = true;
    this.pokemonService.getPokemonBatch(1, 151).subscribe({
      next: (pokemon) => {
        this.allPokemons = pokemon;
        this.filteredPokemons = pokemon;
        this.displayedPokemons = pokemon.slice(0, this.visiblePokemonCount);
        this.initialLoading = false;
      },
      error: (error) => {
        console.error('Error loading Pokemon:', error);
        this.initialLoading = false;
      }
    });
  }

  loadMore() {
    if (this.loading) return;
    
    this.loading = true;
    const currentLength = this.displayedPokemons.length;
    const newPokemons = this.filteredPokemons.slice(
      currentLength, 
      currentLength + this.visiblePokemonCount
    );
    
    this.displayedPokemons = [...this.displayedPokemons, ...newPokemons];
    this.loading = false;
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

 
  hasMorePokemon(): boolean {
    return this.displayedPokemons.length < this.filteredPokemons.length;
  }
}