package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.Follow;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FollowRepository extends BaseMapper<Follow> {
}
