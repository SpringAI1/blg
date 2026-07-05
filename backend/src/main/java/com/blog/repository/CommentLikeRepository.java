package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.CommentLike;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentLikeRepository extends BaseMapper<CommentLike> {
}
