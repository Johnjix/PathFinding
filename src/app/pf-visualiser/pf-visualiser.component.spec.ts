import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PfVisualiserComponent } from './pf-visualiser.component';

describe('PfVisualiserComponent', () => {
  let component: PfVisualiserComponent;
  let fixture: ComponentFixture<PfVisualiserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PfVisualiserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PfVisualiserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
