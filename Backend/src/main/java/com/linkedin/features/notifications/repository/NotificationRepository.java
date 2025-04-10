package com.linkedIn.features.notifications.repository;

import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.notifications.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreationDateDesc(AuthenticationUser user);
    List<Notification> findByRecipient(AuthenticationUser user);
}
