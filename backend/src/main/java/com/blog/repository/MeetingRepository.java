package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.Meeting;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface MeetingRepository extends BaseMapper<Meeting> {

    @Select("SELECT * FROM meeting WHERE deleted = 0 ORDER BY start_time DESC")
    List<Meeting> findAllActive();

    @Select("SELECT * FROM meeting WHERE host_id = #{hostId} AND deleted = 0 ORDER BY start_time DESC")
    List<Meeting> findByHostId(Long hostId);

    @Select("SELECT m.* FROM meeting m INNER JOIN meeting_participant mp ON m.id = mp.meeting_id WHERE mp.user_id = #{userId} AND m.deleted = 0 AND mp.deleted = 0 ORDER BY m.start_time DESC")
    List<Meeting> findJoinedMeetings(Long userId);

    @Update("UPDATE meeting SET participant_count = COALESCE(participant_count, 0) + 1 WHERE id = #{id}")
    int incrementParticipantCount(Long id);

    @Update("UPDATE meeting SET participant_count = GREATEST(0, COALESCE(participant_count, 0) - 1) WHERE id = #{id}")
    int decrementParticipantCount(Long id);
}
