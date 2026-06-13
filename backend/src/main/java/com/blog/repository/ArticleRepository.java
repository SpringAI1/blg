package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ArticleRepository extends BaseMapper<Article> {

    @Select("SELECT COALESCE(SUM(views), 0) FROM article WHERE deleted = 0")
    Long sumViews();

    @Select("SELECT COALESCE(SUM(likes), 0) FROM article WHERE deleted = 0")
    Long sumLikes();

    @Select("SELECT COALESCE(SUM(favorite_count), 0) FROM article WHERE deleted = 0")
    Long sumFavorites();
}
