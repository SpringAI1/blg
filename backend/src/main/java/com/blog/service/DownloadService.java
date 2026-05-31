package com.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.dto.DownloadResourceDTO;
import com.blog.entity.DownloadCategory;
import java.util.List;

public interface DownloadService {
    Page<DownloadResourceDTO> getResources(int pageNum, int pageSize, Long categoryId, String keyword);
    DownloadResourceDTO getResource(Long id);
    List<DownloadCategory> getAllCategories();
    void increaseViews(Long id);
    void recordDownload(Long resourceId, Long userId);
}
