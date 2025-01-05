import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Pokemon, PokemonSpecies, EvolutionChain, FlavorTextEntry } from '../../interfaces/pokemon.interface';
import { animate, style, transition, trigger } from '@angular/animations';
import { PokemonService } from '../../services/pokemon.service';

interface EvolutionStage {
  name: string;
  sprite: string;
}

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.3)', opacity: 0 }),
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ transform: 'scale(0.3)', opacity: 0 }))
      ])
    ])
  ]
})
export class PokemonDetailComponent implements OnInit {
  selectedTab = 0;
  evolutionChain: EvolutionStage[] = [];
  pokemonDescription = '';

  constructor(
    private dialogRef: MatDialogRef<PokemonDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public pokemon: Pokemon,
    private pokemonService: PokemonService
  ) {}

  ngOnInit() {
    this.loadPokemonDetails();
  }

  async loadPokemonDetails() {
    try {
      const species = await this.pokemonService.getPokemonSpecies(this.pokemon.id);
      const evolutionData = await this.pokemonService.getEvolutionChain(this.pokemon.id);

      // Lade die Beschreibung
      const englishFlavors = (species as PokemonSpecies).flavor_text_entries
        .filter((entry: FlavorTextEntry) => entry.language.name === 'en');
      if (englishFlavors.length > 0) {
        this.pokemonDescription = englishFlavors[0].flavor_text
          .replace(/\f/g, ' ');
      }

      // Verarbeite die Evolutionskette
      await this.processEvolutionChain(evolutionData as EvolutionChain);
    } catch (error) {
      console.error('Error loading pokemon details:', error);
    }
  }

  async processEvolutionChain(evolutionData: EvolutionChain) {
    const chain: EvolutionStage[] = [];
    let currentStage = evolutionData.chain;

    while (currentStage) {
      try {
        const pokemonData = await this.pokemonService
          .getPokemonByName(currentStage.species.name)
          .toPromise();

        if (pokemonData && pokemonData.sprites?.other?.home?.front_default) {
          chain.push({
            name: currentStage.species.name,
            sprite: pokemonData.sprites.other.home.front_default
          });
        }
      } catch (error) {
        console.error(`Error loading evolution stage: ${currentStage.species.name}`, error);
      }

      currentStage = currentStage.evolves_to[0];
    }

    this.evolutionChain = chain;
  }

  getStatColor(value: number): string {
    if (value >= 100) return '#4CAF50';
    if (value >= 70) return '#8BC34A';
    if (value >= 50) return '#FFC107';
    return '#FF5722';
  }

  onTabChange(index: number) {
    this.selectedTab = index;
  }

  close() {
    this.dialogRef.close();
  }
}