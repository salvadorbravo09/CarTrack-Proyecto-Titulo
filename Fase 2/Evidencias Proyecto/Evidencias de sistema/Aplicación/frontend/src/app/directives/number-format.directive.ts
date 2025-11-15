import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumberFormat]',
  standalone: true
})
export class NumberFormatDirective {

  constructor(
    private el: ElementRef,
    private control: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    let value = this.el.nativeElement.value;
    
    // Remover todo excepto números
    const numericValue = value.replace(/\D/g, '');
    
    // Si no hay valor, limpiar
    if (!numericValue) {
      this.el.nativeElement.value = '';
      this.control.control?.setValue(null, { emitEvent: false });
      return;
    }

    // Formatear con puntos como separador de miles
    const formattedValue = this.formatNumber(numericValue);
    
    // Actualizar el valor visual
    this.el.nativeElement.value = formattedValue;
    
    // Guardar el valor numérico real en el formulario
    this.control.control?.setValue(parseInt(numericValue), { emitEvent: false });
  }

  @HostListener('blur')
  onBlur(): void {
    const value = this.el.nativeElement.value;
    if (value) {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue) {
        this.el.nativeElement.value = this.formatNumber(numericValue);
      }
    }
  }

  @HostListener('focus')
  onFocus(): void {
    // Opcional: mantener el formato al enfocar
  }

  private formatNumber(value: string): string {
    if (!value) return '';
    
    // Convertir a número y formatear con separador de miles
    const number = parseInt(value);
    return number.toLocaleString('es-CL');
  }
}
