import { axiosInstance } from '@/utils/http';

export const fileApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    
    // axios 拦截器返回了 response.data（即 {code, message, data}）
    const result = response as any;
    if (result.code !== 200) {
      throw new Error(result.message || '上传失败');
    }
    
    return result.data as { url: string };
  }
};
