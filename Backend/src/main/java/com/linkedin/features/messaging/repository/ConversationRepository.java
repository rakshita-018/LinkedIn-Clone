package com.linkedIn.features.messaging.repository;


import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.messaging.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByAuthorAndRecipient(AuthenticationUser author, AuthenticationUser recipient);

    List<Conversation> findByAuthorOrRecipient(AuthenticationUser userOne, AuthenticationUser userTwo);
}
