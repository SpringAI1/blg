package com.blog.controller;

import com.blog.common.Result;
import com.blog.entity.Meeting;
import com.blog.entity.MeetingParticipant;
import com.blog.service.MeetingService;
import com.blog.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @GetMapping
    public Result<List<Meeting>> getAllMeetings() {
        return Result.success(meetingService.getAllMeetings());
    }

    @GetMapping("/{id}")
    public Result<Meeting> getMeeting(@PathVariable Long id) {
        Meeting meeting = meetingService.getMeeting(id);
        if (meeting == null) {
            return Result.error(404, "会议不存在");
        }
        return Result.success(meeting);
    }

    @PostMapping
    public Result<Meeting> createMeeting(@RequestBody Meeting meeting) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        if (meeting.getTitle() == null || meeting.getTitle().trim().isEmpty()) {
            return Result.error(400, "会议标题不能为空");
        }
        if (meeting.getStartTime() == null) {
            return Result.error(400, "会议时间不能为空");
        }

        return Result.success(meetingService.createMeeting(meeting, userId));
    }

    @PostMapping("/{id}/join")
    public Result<Void> joinMeeting(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        try {
            String joinCode = body != null ? body.get("joinCode") : null;
            meetingService.joinMeeting(id, userId, joinCode);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @PostMapping("/{id}/leave")
    public Result<Void> leaveMeeting(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        try {
            meetingService.leaveMeeting(id, userId);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @GetMapping("/{id}/participants")
    public Result<List<MeetingParticipant>> getParticipants(@PathVariable Long id) {
        return Result.success(meetingService.getParticipants(id));
    }

    @GetMapping("/{id}/check-joined")
    public Result<Boolean> checkJoined(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.success(false);
        return Result.success(meetingService.isParticipant(id, userId));
    }

    @GetMapping("/my")
    public Result<List<Meeting>> getMyMeetings() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");
        return Result.success(meetingService.getMyMeetings(userId));
    }

    @GetMapping("/joined")
    public Result<List<Meeting>> getJoinedMeetings() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");
        return Result.success(meetingService.getJoinedMeetings(userId));
    }

    @PutMapping("/{id}")
    public Result<Meeting> updateMeeting(@PathVariable Long id, @RequestBody Meeting meeting) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        try {
            return Result.success(meetingService.updateMeeting(id, meeting, userId));
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteMeeting(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        try {
            meetingService.deleteMeeting(id, userId);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }
}
