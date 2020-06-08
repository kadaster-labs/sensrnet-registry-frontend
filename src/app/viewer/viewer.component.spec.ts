import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ViewerComponent } from './viewer.component';

describe('ViewerComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [
        ViewerComponent,
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ViewerComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'viewer'`, () => {
    const fixture = TestBed.createComponent(ViewerComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('viewer');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(ViewerComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('viewer app is running!');
  });
});
