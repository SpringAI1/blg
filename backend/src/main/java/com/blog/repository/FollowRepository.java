package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.Follow;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FollowRepository extends BaseMapper<Follow> {
    /** 物理删除（绕过 MyBatis-Plus 逻辑删除），避免 UNIQUE 约束冲突 */
    @Delete("DELETE FROM follow WHERE follower_id = #{followerId} AND following_id = #{followingId}")
    void deletePhysical(@Param("followerId") Long followerId, @Param("followingId") Long followingId);
}
