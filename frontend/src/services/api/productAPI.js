import apiClient from './baseAPI';

export const productAPI = {
  // Products
  getProducts: (params) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
  
  // Product Images
  uploadImage: (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/products/${productId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteImage: (productId, imageId) => apiClient.delete(`/products/${productId}/images/${imageId}`),
  getProductImages: (productId) => apiClient.get(`/products/${productId}/images`),
  
  // Product Categories
  getCategories: () => apiClient.get('/products/categories'),
  
  // Product Search
  searchProducts: (query) => apiClient.get('/products/search', { params: { q: query } }),
};

export default productAPI;

