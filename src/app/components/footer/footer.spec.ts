import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the project name, the program and the author credits', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const texto = compiled.textContent ?? '';

    expect(texto).toContain('Sistema de Registro de Productos - Actividad 2');
    expect(texto).toContain('Tokyo-3');
    expect(texto).toContain('Jorge Alvarez');
  });

  it('should show the copyright with the current year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(`© ${new Date().getFullYear()}`);
  });
});
