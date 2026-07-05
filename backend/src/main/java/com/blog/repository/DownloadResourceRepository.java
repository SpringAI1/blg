package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.DownloadResource;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface DownloadResourceRepository extends BaseMapper<DownloadResource> {

    @Update("UPDATE download_resource SET views = COALESCE(views, 0) + 1 WHERE id = #{id}")
    int incrementViews(Long id);

    @Update("UPDATE download_resource SET download_count = COALESCE(download_count, 0) + 1 WHERE id = #{id}")
    int incrementDownloadCount(Long id);
}
