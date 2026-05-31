package com.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.entity.Category;
import java.util.List;

public interface CategoryService extends IService<Category> {
    List<Category> getAllCategories();
    Category createCategory(Category category);
    void updateCategory(Long id, Category category);
    void deleteCategory(Long id);
}
