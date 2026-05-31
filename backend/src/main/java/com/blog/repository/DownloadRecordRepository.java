package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.DownloadRecord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DownloadRecordRepository extends BaseMapper<DownloadRecord> {
}
