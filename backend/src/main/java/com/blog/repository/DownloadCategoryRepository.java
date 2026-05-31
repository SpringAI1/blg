package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.DownloadCategory;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DownloadCategoryRepository extends BaseMapper<DownloadCategory> {
}
