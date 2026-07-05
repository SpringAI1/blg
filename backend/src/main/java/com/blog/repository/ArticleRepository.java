package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ArticleRepository extends BaseMapper<Article> {

    @Select("SELECT COALESCE(SUM(views), 0) FROM article WHERE deleted = 0")
    Long sumViews();

    @Select("SELECT COALESCE(SUM(likes), 0) FROM article WHERE deleted = 0")
    Long sumLikes();

    @Select("SELECT COALESCE(SUM(favorite_count), 0) FROM article WHERE deleted = 0")
    Long sumFavorites();

    @Update("UPDATE article SET views = COALESCE(views, 0) + 1 WHERE id = #{id}")
    int incrementViews(Long id);

    @Update("UPDATE article SET likes = COALESCE(likes, 0) + 1 WHERE id = #{id}")
    int incrementLikes(Long id);

    @Update("UPDATE article SET likes = GREATEST(0, COALESCE(likes, 0) - 1) WHERE id = #{id}")
    int decrementLikes(Long id);

    @Update("UPDATE article SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = #{id}")
    int incrementCommentCount(Long id);

    @Update("UPDATE article SET comment_count = GREATEST(0, COALESCE(comment_count, 0) - #{count}) WHERE id = #{id}")
    int decrementCommentCount(Long id, int count);

    @Update("UPDATE article SET favorite_count = COALESCE(favorite_count, 0) + 1 WHERE id = #{id}")
    int incrementFavoriteCount(Long id);

    @Update("UPDATE article SET favorite_count = GREATEST(0, COALESCE(favorite_count, 0) - 1) WHERE id = #{id}")
    int decrementFavoriteCount(Long id);
}
