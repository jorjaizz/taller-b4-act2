import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a link for each registered route', () => {
    const enlaces = (fixture.nativeElement as HTMLElement).querySelectorAll('.enlace');
    expect(enlaces.length).toBe(2);
    expect(enlaces[0].getAttribute('href')).toBe('/registro');
    expect(enlaces[1].getAttribute('href')).toBe('/tienda');
  });

  it('should toggle the mobile menu', () => {
    expect(component.menuAbierto()).toBe(false);
    component.alternarMenu();
    expect(component.menuAbierto()).toBe(true);
    component.cerrarMenu();
    expect(component.menuAbierto()).toBe(false);
  });
});
