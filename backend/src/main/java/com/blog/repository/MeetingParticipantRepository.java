package com.blog.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.entity.MeetingParticipant;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MeetingParticipantRepository extends BaseMapper<MeetingParticipant> {

    @Select("SELECT * FROM meeting_participant WHERE meeting_id = #{meetingId} AND deleted = 0")
    List<MeetingParticipant> findByMeetingId(Long meetingId);

    @Select("SELECT COUNT(*) FROM meeting_participant WHERE meeting_id = #{meetingId} AND deleted = 0")
    Long countByMeetingId(Long meetingId);

    @Select("SELECT * FROM meeting_participant WHERE meeting_id = #{meetingId} AND user_id = #{userId} AND deleted = 0")
    MeetingParticipant findByMeetingIdAndUserId(@Param("meetingId") Long meetingId, @Param("userId") Long userId);
}
