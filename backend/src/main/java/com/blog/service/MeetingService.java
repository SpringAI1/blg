package com.blog.service;

import com.blog.entity.Meeting;
import com.blog.entity.MeetingParticipant;
import com.blog.repository.MeetingParticipantRepository;
import com.blog.repository.MeetingRepository;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private MeetingParticipantRepository participantRepository;

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAllActive();
    }

    public Meeting getMeeting(Long id) {
        Meeting meeting = meetingRepository.selectById(id);
        // MyBatis-Plus 逻辑删除后，selectById 会自动过滤 deleted=1 的记录
        return meeting;
    }

    @Transactional(rollbackFor = Exception.class)
    public Meeting createMeeting(Meeting meeting, Long hostId) {
        meeting.setHostId(hostId);
        meeting.setStatus("UPCOMING");
        meeting.setParticipantCount(1);
        // 生成6位随机加入码
        meeting.setJoinCode(String.format("%06d", (int)(Math.random() * 1000000)));
        meeting.setCreateTime(LocalDateTime.now());
        meeting.setUpdateTime(LocalDateTime.now());
        meetingRepository.insert(meeting);

        // 主持人自动成为第一个参与者
        MeetingParticipant host = new MeetingParticipant();
        host.setMeetingId(meeting.getId());
        host.setUserId(hostId);
        host.setRole("HOST");
        host.setJoinedAt(LocalDateTime.now());
        participantRepository.insert(host);

        return meeting;
    }

    @Transactional(rollbackFor = Exception.class)
    public void joinMeeting(Long meetingId, Long userId, String joinCode) {
        Meeting meeting = meetingRepository.selectById(meetingId);
        if (meeting == null) throw new RuntimeException("会议不存在");
        if (meeting.getMaxParticipants() != null && meeting.getParticipantCount() >= meeting.getMaxParticipants()) {
            throw new RuntimeException("会议人数已满");
        }
        // 验证加入码（主持人免验证）
        if (meeting.getJoinCode() != null && !meeting.getJoinCode().isEmpty()
            && !meeting.getHostId().equals(userId)) {
            if (joinCode == null || !joinCode.equals(meeting.getJoinCode())) {
                throw new RuntimeException("加入码错误");
            }
        }

        MeetingParticipant existing = participantRepository.findByMeetingIdAndUserId(meetingId, userId);
        if (existing != null) {
            if (existing.getDeleted() == 1) {
                existing.setDeleted(0);
                existing.setJoinedAt(LocalDateTime.now());
                participantRepository.updateById(existing);
            } else {
                throw new RuntimeException("已经加入了该会议");
            }
        } else {
            MeetingParticipant mp = new MeetingParticipant();
            mp.setMeetingId(meetingId);
            mp.setUserId(userId);
            mp.setRole("PARTICIPANT");
            mp.setJoinedAt(LocalDateTime.now());
            participantRepository.insert(mp);
        }

        meeting.setParticipantCount(meeting.getParticipantCount() == null ? 1 : meeting.getParticipantCount() + 1);
        meeting.setUpdateTime(LocalDateTime.now());
        meetingRepository.updateById(meeting);
    }

    @Transactional(rollbackFor = Exception.class)
    public void leaveMeeting(Long meetingId, Long userId) {
        MeetingParticipant mp = participantRepository.findByMeetingIdAndUserId(meetingId, userId);
        if (mp == null) throw new RuntimeException("未加入该会议");

        mp.setDeleted(1);
        participantRepository.updateById(mp);

        Meeting meeting = meetingRepository.selectById(meetingId);
        if (meeting != null && meeting.getParticipantCount() != null && meeting.getParticipantCount() > 0) {
            meeting.setParticipantCount(meeting.getParticipantCount() - 1);
            meeting.setUpdateTime(LocalDateTime.now());
            meetingRepository.updateById(meeting);
        }
    }

    public List<MeetingParticipant> getParticipants(Long meetingId) {
        return participantRepository.findByMeetingId(meetingId);
    }

    public boolean isParticipant(Long meetingId, Long userId) {
        return participantRepository.findByMeetingIdAndUserId(meetingId, userId) != null;
    }

    public List<Meeting> getMyMeetings(Long userId) {
        return meetingRepository.findByHostId(userId);
    }

    public List<Meeting> getJoinedMeetings(Long userId) {
        return meetingRepository.findJoinedMeetings(userId);
    }

    @Transactional(rollbackFor = Exception.class)
    public Meeting updateMeeting(Long id, Meeting updated, Long userId) {
        Meeting meeting = meetingRepository.selectById(id);
        if (meeting == null || meeting.getDeleted() == 1) throw new RuntimeException("会议不存在");
        if (!meeting.getHostId().equals(userId)) throw new RuntimeException("只能编辑自己创建的会议");

        if (updated.getTitle() != null) meeting.setTitle(updated.getTitle());
        if (updated.getDescription() != null) meeting.setDescription(updated.getDescription());
        if (updated.getStartTime() != null) meeting.setStartTime(updated.getStartTime());
        if (updated.getEndTime() != null) meeting.setEndTime(updated.getEndTime());
        if (updated.getLocation() != null) meeting.setLocation(updated.getLocation());
        if (updated.getMaxParticipants() != null) meeting.setMaxParticipants(updated.getMaxParticipants());
        if (updated.getTags() != null) meeting.setTags(updated.getTags());
        if (updated.getStatus() != null) meeting.setStatus(updated.getStatus());

        meeting.setUpdateTime(LocalDateTime.now());
        meetingRepository.updateById(meeting);
        // 重新查询以获取最新数据
        return meetingRepository.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteMeeting(Long id, Long userId) {
        Meeting meeting = meetingRepository.selectById(id);
        if (meeting == null) throw new RuntimeException("会议不存在");
        if (!meeting.getHostId().equals(userId)) throw new RuntimeException("只能删除自己创建的会议");

        // MyBatis-Plus 逻辑删除：自动设置 deleted=1
        meetingRepository.deleteById(id);

        // 将所有参与者记录也逻辑删除
        List<MeetingParticipant> participants = participantRepository.findByMeetingId(id);
        for (MeetingParticipant mp : participants) {
            participantRepository.deleteById(mp.getId());
        }
    }
}
