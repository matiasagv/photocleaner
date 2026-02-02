import { Component, OnInit } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
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
  albums: any[] = []; 
  historial: FotoReal[] = [];
  
  cargando = false;
  mostrarModalAlbums = false;
  albumActualNombre = 'Recientes';

  // --- VARIABLES PARA EL ZOOM (NUEVO) ---
  verZoom = false;
  fotoZoom: FotoReal | null = null;

  constructor(private platform: Platform) {}

  ngOnInit() {
    this.cargarFotosReales();
  }

  // --- 0. FUNCIÓN PARA ABRIR ZOOM (NUEVO) ---
  abrirZoom(foto: FotoReal) {
    this.fotoZoom = foto;
    this.verZoom = true;
  }

  // --- 1. LÓGICA DE ÁLBUMES ---

  async abrirSelectorAlbums() {
    this.cargando = true;
    
    // Si es PC (Web), inventamos álbumes
    if (!this.platform.is('hybrid')) {
      this.albums = [
        { name: 'Cámara', identifier: '1', count: 120 },
        { name: 'WhatsApp', identifier: '2', count: 500 },
        { name: 'Instagram', identifier: '3', count: 45 },
        { name: 'Screenshots', identifier: '4', count: 12 }
      ];
      this.mostrarModalAlbums = true;
      this.cargando = false;
      return;
    }

    try {
      const res = await Media.getAlbums();
      this.albums = res.albums;
      this.mostrarModalAlbums = true;
    } catch (error) {
      console.error('Error al traer álbumes', error);
    }
    this.cargando = false;
  }

  seleccionarAlbum(album: any) {
    this.albumActualNombre = album.name;
    this.mostrarModalAlbums = false;
    this.cargarFotosReales(album.identifier);
  }

  // --- 2. CARGA DE FOTOS ---

  async cargarFotosReales(albumId?: string) {
    this.cargando = true;
    this.fotos = [];
    this.historial = []; // Limpiamos historial al cambiar de álbum

    // MODO WEB (PC)
    if (!this.platform.is('hybrid')) {
      setTimeout(() => {
        this.fotos = [
          { id: '1', src: 'https://picsum.photos/400/600?random=' + Math.random(), size: 2500000, sizeStr: '2.5 MB' },
          { id: '2', src: 'https://picsum.photos/400/600?random=' + Math.random(), size: 1200000, sizeStr: '1.2 MB' },
          { id: '3', src: 'https://picsum.photos/400/600?random=' + Math.random(), size: 5800000, sizeStr: '5.8 MB' },
        ];
        this.cargando = false;
      }, 500);
      return;
    }

    // MODO REAL (CELULAR)
    try {
      await (Media as any).requestPermissions();
      
      const opciones: any = {
        quantity: 50,
        sort: 'creationDate'
      };

      if (albumId) {
        opciones.albumIdentifier = albumId;
      }

      const respuesta = await Media.getMedias(opciones);

      this.fotos = respuesta.medias.map((media: any) => ({
        id: media.identifier,
        src: media.webPath,
        size: media.size,
        sizeStr: this.formatBytes(media.size)
      }));
      
    } catch (error) {
      console.error('Error cargando fotos:', error);
    }
    this.cargando = false;
  }

  // --- 3. SWIPE Y ACCIONES ---

  handleChoice(decision: 'borrar' | 'guardar', foto: FotoReal) {
    // 1. Guardamos en historial para poder deshacer
    this.historial.push(foto);

    if (decision === 'borrar') {
      this.borrarFoto(foto);
    }
    
    // Quitamos la foto de la vista
    this.fotos = this.fotos.filter(f => f.id !== foto.id);

    if (this.fotos.length === 0) {
      this.lanzarConfetti();
    }
  }

  // --- 4. FUNCIÓN DESHACER ---
  deshacer() {
    if (this.historial.length > 0) {
      const ultimaFoto = this.historial.pop(); // Sacamos la última del historial
      if (ultimaFoto) {
        this.fotos.push(ultimaFoto); // La devolvemos a la pila
      }
    }
  }

  async borrarFoto(foto: FotoReal) {
    if (!this.platform.is('hybrid')) return;
    try {
      await (Media as any).deleteMedias({ identifiers: [foto.id] });
    } catch (error) {
      console.error('Error al borrar');
    }
  }

  formatBytes(bytes: number, decimals = 1) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals ? decimals : 1)) + ' ' + sizes[i];
  }

  lanzarConfetti() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
}