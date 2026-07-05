package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.ReadHistory;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ReadHistoryRepository extends BaseMapper<ReadHistory> {
}
