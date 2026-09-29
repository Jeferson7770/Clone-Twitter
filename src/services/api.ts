import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@Twitter:token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/token/refresh/')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('@Twitter:refresh_token');

        if (refreshToken) {
          const response = await axios.post(
            'http://127.0.0.1:8000/api/token/refresh/',
            { refresh: refreshToken }
          );

          const newAccessToken = response.data.access;

          localStorage.setItem('@Twitter:token', newAccessToken);
          if (response.data.refresh) {
            localStorage.setItem(
              '@Twitter:refresh_token',
              response.data.refresh
            );
          }

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn('Sessão expirada. Redirecionando para o login...');
        localStorage.removeItem('@Twitter:token');
        localStorage.removeItem('@Twitter:refresh_token');
        localStorage.removeItem('@Twitter:user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
