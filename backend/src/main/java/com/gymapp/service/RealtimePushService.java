package com.gymapp.service;

import com.gymapp.dto.attendance.AttendanceResponse;
import com.gymapp.dto.notification.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RealtimePushService {

    private final SimpMessagingTemplate messagingTemplate;

    public void pushAttendance(String gymId, AttendanceResponse attendance) {
        messagingTemplate.convertAndSend("/topic/gym/" + gymId + "/attendance", attendance);
    }

    public void pushNotification(String userId, NotificationResponse notification) {
        messagingTemplate.convertAndSend("/topic/user/" + userId + "/notifications", notification);
    }
}
