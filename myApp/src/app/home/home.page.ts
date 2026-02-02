import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SwipeCardDirective } from '../directives/swipe-card';
import { Media } from '@capacitor-community/media';

interface FotoReal {
  id: string; // El ID real de la foto en Android
  src: string; // La ruta para mostrarla
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
      // Pedimos permiso si es la primera vez
      await Media.requestPermissions();
      
      // Traemos las últimas 50 fotos
      const respuesta = await Media.getMedias({
        quantity: 50,
        sort: 'creationDate'
      });

      // Transformamos los datos para que nuestra app los entienda
      // webPath es una URL especial para ver fotos locales en Ionic
      this.fotos = respuesta.medias.map(media => ({
        id: media.identifier,
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
    // Quitamos la foto de la pantalla
    this.fotos = this.fotos.filter(f => f.id !== foto.id);
  }

  async borrarFoto(foto: FotoReal) {
    try {
      console.log('Intentando borrar:', foto.id);
      
      // ESTO ES LO QUE BORRA REALMENTE
      // En Android 11+ saldrá un popup del sistema pidiendo confirmación
      await Media.deleteMedias({
        identifiers: [foto.id]
      });
      
    } catch (error) {
      console.error('No se pudo borrar:', error);
      // Opcional: Si falla (ej: usuario cancela), podrías volver a poner la foto en el array
    }
  }
}