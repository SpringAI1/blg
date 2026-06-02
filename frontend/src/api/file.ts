export const fileApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.message || '上传失败');
    }
    
    return data.data;
  }
};
