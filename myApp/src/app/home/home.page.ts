import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
// OJO: Asegúrate que el nombre del archivo coincida aquí abajo.
// Si tu archivo se llama swipe-card.ts, déjalo así. Si es .directive.ts, agrégalo.
import { SwipeCardDirective } from '../directives/swipe-card'; 
import { Media } from '@capacitor-community/media';

interface FotoReal {
  id: string;
  src: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SwipeCardDirective],
})
export class HomePage implements OnInit {
  fotos: FotoReal[] = [];
  cargando = true;

  constructor() {}

  ngOnInit() {
    this.cargarFotosReales();
  }

  async cargarFotosReales() {
    try {
      // TRUCO: Usamos (Media as any) para saltarnos el chequeo estricto
      // El plugin SI tiene esta función, pero TypeScript a veces no la ve.
      await (Media as any).requestPermissions();
      
      const respuesta = await Media.getMedias({
        quantity: 50,
        sort: 'creationDate'
      });

      this.fotos = respuesta.medias.map((media: any) => ({
        id: media.identifier,
        // TRUCO: Al poner 'media: any' arriba, ya no llora por el webPath
        src: media.webPath 
      }));
      
      this.cargando = false;
    } catch (error) {
      console.error('Error cargando fotos:', error);
      this.cargando = false;
    }
  }

  handleChoice(decision: 'borrar' | 'guardar', foto: FotoReal) {
    if (decision === 'guardar') {
      console.log('Conservada:', foto.id);
    } else {
      this.borrarFoto(foto);
    }
    this.fotos = this.fotos.filter(f => f.id !== foto.id);
  }

  async borrarFoto(foto: FotoReal) {
    try {
      console.log('Intentando borrar:', foto.id);
      
      // TRUCO: De nuevo usamos (Media as any) para forzar el borrado
      await (Media as any).deleteMedias({
        identifiers: [foto.id]
      });
      
    } catch (error) {
      console.error('No se pudo borrar:', error);
    }
  }
}