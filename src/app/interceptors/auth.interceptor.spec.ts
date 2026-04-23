import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptors,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('without stored credentials', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([authInterceptor])),
          provideHttpClientTesting(),
        ],
      });
      httpMock = TestBed.inject(HttpTestingController);
      http = TestBed.inject(HttpClient);
      sessionStorage.removeItem('tienda_creds');
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should pass the request through without Authorization header', () => {
      http.get('/api/test').subscribe();
      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });
  });

  describe('with stored credentials', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([authInterceptor])),
          provideHttpClientTesting(),
        ],
      });
      httpMock = TestBed.inject(HttpTestingController);
      http = TestBed.inject(HttpClient);
      sessionStorage.setItem('tienda_creds', btoa('user:password123'));
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should add Basic Authorization header', () => {
      http.get('/api/secure').subscribe();
      const req = httpMock.expectOne('/api/secure');
      expect(req.request.headers.get('Authorization')).toBe(`Basic ${btoa('user:password123')}`);
      req.flush({});
    });
  });
});
