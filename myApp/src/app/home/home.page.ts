import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SwipeCardDirective } from '../directives/swipe-card';

interface Foto {
  id: number;
  src: string;
  name: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SwipeCardDirective],
})
export class HomePage {
  // Simulación de fotos locales. 
  // En producción usarías @capacitor-community/media para traer fotos reales.
  fotos: Foto[] = [
    { id: 1, src: 'https://picsum.photos/300/500?random=1', name: 'Vacaciones' },
    { id: 2, src: 'https://picsum.photos/300/500?random=2', name: 'Comida' },
    { id: 3, src: 'https://picsum.photos/300/500?random=3', name: 'Selfie' },
  ];

  constructor() {}

  handleChoice(decision: 'borrar' | 'guardar', foto: Foto) {
    if (decision === 'guardar') {
      console.log('Foto guardada (No hacer nada):', foto.name);
    } else {
      this.borrarFoto(foto);
    }

    // Remover la foto del array visualmente
    this.fotos = this.fotos.filter(f => f.id !== foto.id);
  }

  async borrarFoto(foto: Foto) {
    console.log('Moviendo a papelera:', foto.name);
    
    // AQUÍ VA LA LÓGICA DE CAPACITOR
    // Ejemplo conceptual con plugin Media:
    // await Media.deletePhotos({ identifiers: [foto.id] });
    
    // Nota: Android mostrará un popup nativo preguntando:
    // "¿Permitir a [TuApp] mover este elemento a la papelera?"
  }
}