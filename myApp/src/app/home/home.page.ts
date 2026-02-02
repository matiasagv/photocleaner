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
  albums: any[] = []; // Lista de álbumes del celular
  
  cargando = false;
  mostrarModalAlbums = false; // Controla si se ve la lista de álbumes
  albumActualNombre = 'Recientes'; // Para saber qué estamos viendo

  constructor(private platform: Platform) {}

  ngOnInit() {
    this.cargarFotosReales(); // Carga general al inicio
  }

  // --- LÓGICA DE ÁLBUMES ---

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
      // Pedimos los álbumes reales al celular
      const res = await Media.getAlbums();
      this.albums = res.albums;
      this.mostrarModalAlbums = true;
    } catch (error) {
      console.error('Error al traer álbumes', error);
    }
    this.cargando = false;
  }

  seleccionarAlbum(album: any) {
    console.log('Álbum seleccionado:', album.name);
    this.albumActualNombre = album.name;
    this.mostrarModalAlbums = false; // Cerramos el menú
    this.cargarFotosReales(album.identifier); // Cargamos fotos de ESE álbum
  }

  // --- CARGA DE FOTOS (Ahora acepta un ID de álbum opcional) ---

  async cargarFotosReales(albumId?: string) {
    this.cargando = true;
    this.fotos = []; // Limpiamos lo que había antes

    // 1. MODO WEB (PC)
    if (!this.platform.is('hybrid')) {
      // Simulamos carga
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

    // 2. MODO REAL (CELULAR)
    try {
      // Opciones de consulta
      const opciones: any = {
        quantity: 50,
        sort: 'creationDate'
      };

      // Si nos pasaron un álbum específico, lo agregamos al filtro
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

  // --- LÓGICA DE SWIPE (Igual que antes) ---

  handleChoice(decision: 'borrar' | 'guardar', foto: FotoReal) {
    if (decision === 'borrar') {
      this.borrarFoto(foto);
    }
    this.fotos = this.fotos.filter(f => f.id !== foto.id);

    if (this.fotos.length === 0) {
      this.lanzarConfetti();
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