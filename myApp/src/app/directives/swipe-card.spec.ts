import { Directive, ElementRef, EventEmitter, Input, Output, AfterViewInit, NgZone } from '@angular/core';
import { GestureController, GestureDetail } from '@ionic/angular';

@Directive({
  selector: '[appSwipeCard]',
  standalone: true
})
export class SwipeCardDirective implements AfterViewInit {
  @Output() choiceMade = new EventEmitter<'borrar' | 'guardar'>();
  
  // Ajusta este umbral para determinar cuánto hay que deslizar para que cuente
  private readonly windowWidth = window.innerWidth;

  constructor(
    private el: ElementRef,
    private gestureCtrl: GestureController,
    private zone: NgZone
  ) {}

  ngAfterViewInit() {
    const gesture = this.gestureCtrl.create({
      el: this.el.nativeElement,
      gestureName: 'swipe-card',
      onMove: (ev) => this.onMove(ev),
      onEnd: (ev) => this.onEnd(ev)
    });
    gesture.enable(true);
  }

  private onMove(ev: GestureDetail) {
    const rotate = ev.deltaX * 0.05; // Rotación suave al mover
    this.el.nativeElement.style.transform = `translateX(${ev.deltaX}px) rotate(${rotate}deg)`;
    
    // Opcional: Cambiar opacidad o color de fondo para indicar acción
    if (ev.deltaX > 0) {
      this.el.nativeElement.style.border = "2px solid green"; // Indicador visual derecha
    } else {
      this.el.nativeElement.style.border = "2px solid red"; // Indicador visual izquierda
    }
  }

  private onEnd(ev: GestureDetail) {
    this.el.nativeElement.style.transition = '0.3s ease-out';
    this.el.nativeElement.style.border = "none";

    // Si deslizó suficiente a la derecha (> 150px) -> GUARDAR
    if (ev.deltaX > 150) {
      this.el.nativeElement.style.transform = `translateX(${this.windowWidth * 1.5}px)`;
      this.emitChoice('guardar');
    } 
    // Si deslizó suficiente a la izquierda (< -150px) -> BORRAR (Papelera)
    else if (ev.deltaX < -150) {
      this.el.nativeElement.style.transform = `translateX(-${this.windowWidth * 1.5}px)`;
      this.emitChoice('borrar');
    } 
    // Si no, vuelve al centro
    else {
      this.el.nativeElement.style.transform = '';
    }
  }

  private emitChoice(decision: 'borrar' | 'guardar') {
    // Esperamos a que termine la animación antes de emitir
    setTimeout(() => {
      this.zone.run(() => this.choiceMade.emit(decision));
    }, 300);
  }
}