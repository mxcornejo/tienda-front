import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const creds = sessionStorage.getItem('tienda_creds');
  if (creds) {
    req = req.clone({ headers: req.headers.set('Authorization', `Basic ${creds}`) });
  }
  return next(req);
};
