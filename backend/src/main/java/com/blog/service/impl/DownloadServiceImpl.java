package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.dto.DownloadResourceDTO;
import com.blog.entity.DownloadCategory;
import com.blog.entity.DownloadRecord;
import com.blog.entity.DownloadResource;
import com.blog.entity.User;
import com.blog.repository.DownloadCategoryRepository;
import com.blog.repository.DownloadRecordRepository;
import com.blog.repository.DownloadResourceRepository;
import com.blog.repository.UserRepository;
import com.blog.service.CacheService;
import com.blog.service.DownloadService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class DownloadServiceImpl extends ServiceImpl<DownloadResourceRepository, DownloadResource> implements DownloadService {

    private final DownloadCategoryRepository categoryRepository;
    private final DownloadRecordRepository recordRepository;
    private final UserRepository userRepository;
    private final CacheService cacheService;

    private static final String RESOURCE_LIST_KEY = "download:list:";
    private static final String RESOURCE_KEY = "download:";
    private static final String CATEGORIES_KEY = "download:categories";
    private static final long CACHE_MINUTES = 5;

    public DownloadServiceImpl(DownloadCategoryRepository categoryRepository,
                             DownloadRecordRepository recordRepository,
                             UserRepository userRepository,
                             CacheService cacheService) {
        this.categoryRepository = categoryRepository;
        this.recordRepository = recordRepository;
        this.userRepository = userRepository;
        this.cacheService = cacheService;
    }

    @Override
    public Page<DownloadResourceDTO> getResources(int pageNum, int pageSize, Long categoryId, String keyword) {
        String cacheKey = RESOURCE_LIST_KEY + pageNum + ":" + pageSize + ":" +
                         (categoryId != null ? categoryId : "all") + ":" +
                         (keyword != null ? keyword : "none");

        Page<DownloadResourceDTO> cached = cacheService.get(cacheKey, Page.class);
        if (cached != null) {
            return cached;
        }

        Page<DownloadResource> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<DownloadResource> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DownloadResource::getStatus, "PUBLISHED");

        if (categoryId != null) {
            wrapper.eq(DownloadResource::getCategoryId, categoryId);
        }

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(DownloadResource::getTitle, keyword)
                .or()
                .like(DownloadResource::getDescription, keyword));
        }

        wrapper.orderByDesc(DownloadResource::getCreateTime);

        Page<DownloadResource> resourcePage = baseMapper.selectPage(page, wrapper);

        Page<DownloadResourceDTO> dtoPage = new Page<>(resourcePage.getCurrent(), resourcePage.getSize(), resourcePage.getTotal());
        dtoPage.setRecords(resourcePage.getRecords().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList()));

        cacheService.set(cacheKey, dtoPage, CACHE_MINUTES, TimeUnit.MINUTES);

        return dtoPage;
    }

    @Override
    public DownloadResourceDTO getResource(Long id) {
        String cacheKey = RESOURCE_KEY + id;

        DownloadResourceDTO cached = cacheService.get(cacheKey, DownloadResourceDTO.class);
        if (cached != null) {
            return cached;
        }

        DownloadResource resource = baseMapper.selectById(id);
        if (resource == null || !"PUBLISHED".equals(resource.getStatus())) {
            return null;
        }

        DownloadResourceDTO dto = convertToDTO(resource);
        cacheService.set(cacheKey, dto, CACHE_MINUTES, TimeUnit.MINUTES);

        return dto;
    }

    @Override
    public List<DownloadCategory> getAllCategories() {
        List<DownloadCategory> cached = cacheService.get(CATEGORIES_KEY, List.class);
        if (cached != null) {
            return cached;
        }

        LambdaQueryWrapper<DownloadCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(DownloadCategory::getSortOrder);
        List<DownloadCategory> categories = categoryRepository.selectList(wrapper);

        cacheService.set(CATEGORIES_KEY, categories, 30, TimeUnit.MINUTES);

        return categories;
    }

    @Override
    public void increaseViews(Long id) {
        DownloadResource resource = baseMapper.selectById(id);
        if (resource != null) {
            resource.setViews(resource.getViews() + 1);
            baseMapper.updateById(resource);

            cacheService.delete(RESOURCE_KEY + id);
            cacheService.deleteByPattern(RESOURCE_LIST_KEY + "*");
        }
    }

    @Override
    @Transactional
    public void recordDownload(Long resourceId, Long userId) {
        DownloadResource resource = baseMapper.selectById(resourceId);
        if (resource != null) {
            resource.setDownloadCount(resource.getDownloadCount() + 1);
            baseMapper.updateById(resource);

            DownloadRecord record = new DownloadRecord();
            record.setResourceId(resourceId);
            record.setUserId(userId);
            recordRepository.insert(record);

            cacheService.delete(RESOURCE_KEY + resourceId);
            cacheService.deleteByPattern(RESOURCE_LIST_KEY + "*");
        }
    }

    private DownloadResourceDTO convertToDTO(DownloadResource resource) {
        DownloadResourceDTO dto = new DownloadResourceDTO();
        BeanUtils.copyProperties(resource, dto);

        if (resource.getCategoryId() != null) {
            DownloadCategory category = categoryRepository.selectById(resource.getCategoryId());
            if (category != null) {
                dto.setCategoryName(category.getName());
                dto.setCategoryIcon(category.getIcon());
            }
        }

        if (resource.getUserId() != null) {
            User user = userRepository.selectById(resource.getUserId());
            if (user != null) {
                dto.setUsername(user.getUsername());
            }
        }

        if (resource.getTags() != null && !resource.getTags().isEmpty()) {
            dto.setTagList(Arrays.asList(resource.getTags().split(",")));
        }

        return dto;
    }
}
