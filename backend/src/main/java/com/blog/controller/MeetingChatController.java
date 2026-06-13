package com.blog.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class MeetingChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public MeetingChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 聊天消息 /app/meeting/{id} → /topic/meeting/{id}
     */
    @MessageMapping("/meeting/{id}")
    public void handleChatMessage(@DestinationVariable String id, @Payload Map<String, Object> message) {
        messagingTemplate.convertAndSend("/topic/meeting/" + id, message);
    }

    /**
     * WebRTC 信令 /app/meeting/{id}/signal → /topic/meeting/{id}/signal
     * 用于交换 offer/answer/ICE candidate
     */
    @MessageMapping("/meeting/{id}/signal")
    public void handleSignal(@DestinationVariable String id, @Payload Map<String, Object> signal) {
        messagingTemplate.convertAndSend("/topic/meeting/" + id + "/signal", signal);
    }

    /**
     * 文件共享通知 /app/meeting/{id}/file → /topic/meeting/{id}/file
     */
    @MessageMapping("/meeting/{id}/file")
    public void handleFileShared(@DestinationVariable String id, @Payload Map<String, Object> fileInfo) {
        messagingTemplate.convertAndSend("/topic/meeting/" + id + "/file", fileInfo);
    }
}
