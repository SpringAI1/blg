package com.blog.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.entity.Category;
import com.blog.repository.CategoryRepository;
import com.blog.service.CategoryService;
import com.blog.service.CacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryRepository, Category> implements CategoryService {

    private final CacheService cacheService;

    private static final String CATEGORY_LIST_KEY = "category:list";
    private static final long CATEGORY_CACHE_MINUTES = 30;

    public CategoryServiceImpl(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    @Override
    public List<Category> getAllCategories() {
        List<Category> cached = cacheService.get(CATEGORY_LIST_KEY, List.class);
        if (cached != null) {
            return cached;
        }

        List<Category> categories = baseMapper.selectList(null);
        cacheService.set(CATEGORY_LIST_KEY, categories, CATEGORY_CACHE_MINUTES, TimeUnit.MINUTES);

        return categories;
    }

    @Override
    public Category createCategory(Category category) {
        Category result = baseMapper.insert(category) > 0 ? category : null;

        cacheService.delete(CATEGORY_LIST_KEY);

        return result;
    }

    @Override
    public void updateCategory(Long id, Category category) {
        Category existing = baseMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("Category not found");
        }
        existing.setName(category.getName());
        existing.setSlug(category.getSlug());
        existing.setDescription(category.getDescription());
        baseMapper.updateById(existing);

        cacheService.delete(CATEGORY_LIST_KEY);
    }

    @Override
    public void deleteCategory(Long id) {
        baseMapper.deleteById(id);

        cacheService.delete(CATEGORY_LIST_KEY);
    }
}
