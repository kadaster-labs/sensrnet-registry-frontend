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

  xit('should create the app', () => {
    const fixture = TestBed.createComponent(ViewerComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  xit('should have as title viewer', () => {
    const fixture = TestBed.createComponent(ViewerComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('viewer');
  });

  xit('should render title', () => {
    const fixture = TestBed.createComponent(ViewerComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('viewer app is running!');
  });
});
