import { Component, OnInit } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular'; // <--- OJO: Agregamos Platform
import { CommonModule } from '@angular/common';
import { SwipeCardDirective } from '../directives/swipe-card';
import { Media } from '@capacitor-community/media';
import confetti from 'canvas-confetti';

interface FotoReal {
  id: string;
  src: string;
  size: number;
  sizeStr: string;
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
  historial: FotoReal[] = [];
  cargando = true;

  // Inyectamos Platform para saber si estamos en PC o Celular
  constructor(private platform: Platform) {}

  ngOnInit() {
    this.cargarFotosReales();
  }

  async cargarFotosReales() {
    // 1. SI ESTAMOS EN LA WEB (PC), USAMOS DATOS FALSOS
    if (!this.platform.is('hybrid')) {
      console.log('Modo Web detectado: Cargando fotos falsas');
      this.fotos = [
        { id: '1', src: 'https://picsum.photos/400/600?random=1', size: 2500000, sizeStr: '2.5 MB' },
        { id: '2', src: 'https://picsum.photos/400/600?random=2', size: 1200000, sizeStr: '1.2 MB' },
        { id: '3', src: 'https://picsum.photos/400/600?random=3', size: 5800000, sizeStr: '5.8 MB' },
        { id: '4', src: 'https://picsum.photos/400/600?random=4', size: 3100000, sizeStr: '3.1 MB' },
      ];
      this.cargando = false;
      return;
    }

    // 2. SI ESTAMOS EN CELULAR, USAMOS LA GALERÍA REAL
    try {
      await (Media as any).requestPermissions();
      const respuesta = await Media.getMedias({ quantity: 50, sort: 'creationDate' });

      this.fotos = respuesta.medias.map((media: any) => ({
        id: media.identifier,
        src: media.webPath,
        size: media.size,
        sizeStr: this.formatBytes(media.size)
      }));
      
      this.cargando = false;
    } catch (error) {
      console.error('Error cargando fotos:', error);
      this.cargando = false;
    }
  }

  formatBytes(bytes: number, decimals = 1) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals ? decimals : 1)) + ' ' + sizes[i];
  }

  handleChoice(decision: 'borrar' | 'guardar', foto: FotoReal) {
    this.historial.push(foto);
    if (decision === 'borrar') {
      this.borrarFoto(foto);
    }
    this.fotos = this.fotos.filter(f => f.id !== foto.id);

    if (this.fotos.length === 0) {
      this.lanzarConfetti();
    }
  }

  deshacer() {
    if (this.historial.length > 0) {
      const ultimaFoto = this.historial.pop();
      if (ultimaFoto) this.fotos.push(ultimaFoto);
    }
  }

  async borrarFoto(foto: FotoReal) {
    // En web no hacemos nada real
    if (!this.platform.is('hybrid')) return;

    try {
      await (Media as any).deleteMedias({ identifiers: [foto.id] });
    } catch (error) {
      console.error('Error al borrar');
    }
  }

  lanzarConfetti() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
}