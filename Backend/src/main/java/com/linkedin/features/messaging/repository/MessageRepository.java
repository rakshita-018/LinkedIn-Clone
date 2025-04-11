package com.linkedIn.features.messaging.repository;


import com.linkedIn.features.messaging.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MessageRepository extends JpaRepository<Message, Long> {
}