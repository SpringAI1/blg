package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.Favorite;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FavoriteRepository extends BaseMapper<Favorite> {
    /** 物理删除（绕过 MyBatis-Plus 逻辑删除），避免 UNIQUE 约束冲突 */
    @Delete("DELETE FROM favorite WHERE user_id = #{userId} AND article_id = #{articleId}")
    void deletePhysical(@Param("userId") Long userId, @Param("articleId") Long articleId);
}
