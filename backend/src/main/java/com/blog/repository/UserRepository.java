package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface UserRepository extends BaseMapper<User> {

    @Update("UPDATE blog_user SET article_count = COALESCE(article_count, 0) + 1 WHERE id = #{id}")
    int incrementArticleCount(Long id);

    @Update("UPDATE blog_user SET article_count = GREATEST(0, COALESCE(article_count, 0) - 1) WHERE id = #{id}")
    int decrementArticleCount(Long id);

    @Update("UPDATE blog_user SET follower_count = COALESCE(follower_count, 0) + 1 WHERE id = #{id}")
    int incrementFollowerCount(Long id);

    @Update("UPDATE blog_user SET follower_count = GREATEST(0, COALESCE(follower_count, 0) - 1) WHERE id = #{id}")
    int decrementFollowerCount(Long id);

    @Update("UPDATE blog_user SET following_count = COALESCE(following_count, 0) + 1 WHERE id = #{id}")
    int incrementFollowingCount(Long id);

    @Update("UPDATE blog_user SET following_count = GREATEST(0, COALESCE(following_count, 0) - 1) WHERE id = #{id}")
    int decrementFollowingCount(Long id);

    @Update("UPDATE blog_user SET coins = COALESCE(coins, 0) + #{amount} WHERE id = #{id}")
    int addCoins(Long id, int amount);
}
