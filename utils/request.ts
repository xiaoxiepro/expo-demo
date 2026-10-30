
import axios from 'axios';
import type {
  AxiosResponse,
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

import * as SecureStore from 'expo-secure-store';

// 后端统一响应结构
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  result: T;
}

// 自定义请求配置
export interface CustomAxiosRequestConfig
  extends AxiosRequestConfig {
  skipErrorHandler?: boolean;
  showLoading?: boolean;
}

// Axios 内部请求配置
interface InternalCustomConfig
  extends InternalAxiosRequestConfig {
  skipErrorHandler?: boolean;
  showLoading?: boolean;
}

// 原生上传文件类型
export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

// Token 存储
const TOKEN_KEY = 'token';

export const setToken = (token: string) =>
  SecureStore.setItemAsync(TOKEN_KEY, token);

export const getToken = () =>
  SecureStore.getItemAsync(TOKEN_KEY);

export const removeToken = () =>
  SecureStore.deleteItemAsync(TOKEN_KEY);

// 全局 Loading 回调，可由页面或应用层设置
type LoadingHandler = (visible: boolean) => void;
let loadingHandler: LoadingHandler | undefined;

export function setRequestLoadingHandler(
  handler?: LoadingHandler,
) {
  loadingHandler = handler;
}

// 登录失效回调，避免在请求工具中直接使用路由 Hook
let unauthorizedHandler: (() => void) | undefined;

export function setUnauthorizedHandler(
  handler?: () => void,
) {
  unauthorizedHandler = handler;
}

// 统一处理登录失效
async function handleUnauthorized() {
  await removeToken();
  unauthorizedHandler?.();
}

// Axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  async (config: InternalCustomConfig) => {
    const token = await getToken();

    if (token) {
      config.headers.set('token', token);
    }

    if (config.showLoading) {
      loadingHandler?.(true);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 响应成功拦截器
instance.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    const config =
      response.config as InternalCustomConfig;

    if (config.showLoading) {
      loadingHandler?.(false);
    }

    const { code, result, message } = response.data ?? {};

    switch (code) {
      case 200:
      case 0:
        return Promise.resolve({
          ...response,
          data: result,
        });

      case 401:
        if (!config.skipErrorHandler) {
          await handleUnauthorized();
        }

        return Promise.reject(
          new Error(message || '未登录或登录已过期'),
        );

      default:
        if (!config.skipErrorHandler) {
          console.error(
            '业务请求失败:',
            message || '未知错误',
          );
        }

        return Promise.reject(
          new Error(message || '请求失败'),
        );
    }
  },
  async (error: AxiosError<ApiResponse>) => {
    const config =
      error.config as InternalCustomConfig | undefined;

    if (config?.showLoading) {
      loadingHandler?.(false);
    }

    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || '请求失败';

      if (status === 401) {
        if (!config?.skipErrorHandler) {
          await handleUnauthorized();
        }

        return Promise.reject(
          new Error(message || '登录已过期'),
        );
      }

      if (!config?.skipErrorHandler) {
        switch (status) {
          case 400:
            console.error('请求参数错误:', message);
            break;
          case 403:
            console.error('拒绝访问:', message);
            break;
          case 404:
            console.error('请求地址不存在:', message);
            break;
          case 500:
            console.error('服务器内部错误:', message);
            break;
          case 502:
            console.error('网关错误:', message);
            break;
          case 503:
            console.error('服务不可用:', message);
            break;
          case 504:
            console.error('网关超时:', message);
            break;
          default:
            console.error(
              `请求失败 (${status}):`,
              message,
            );
        }
      }

      return Promise.reject(new Error(message));
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'));
    }

    if (error.message === 'Network Error') {
      return Promise.reject(
        new Error('网络连接失败，请检查网络'),
      );
    }

    return Promise.reject(error);
  },
);

// 请求方法封装
class HttpClient {
  get<T = unknown>(
    url: string,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    return instance.get<T>(url, config).then((response) => response.data);
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    return instance.post<T>(url, data, config).then((response) => response.data);
  }

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    return instance.put<T>(url, data, config).then((response) => response.data);
  }

  delete<T = unknown>(
    url: string,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    return instance.delete<T>(url, config).then((response) => response.data);
  }

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    return instance.patch<T>(url, data, config).then((response) => response.data);
  }

  // 上传文件
  upload<T = unknown>(
    url: string,
    file: UploadFile | FormData,
    config?: CustomAxiosRequestConfig,
  ): Promise<T> {
    const formData = new FormData();

    if (file instanceof FormData) {
      file.forEach((value, key) => {
        formData.append(key, value);
      });
    } else {
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob);
    }

    return instance.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    }).then((response) => response.data);
  }

  
}

export const http = new HttpClient();

export default instance;
