package com.linkedIn.features.networking.repository;

import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.networking.model.Connection;
import com.linkedIn.features.networking.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    boolean existsByAuthorAndRecipient(AuthenticationUser sender, AuthenticationUser recipient);

    List<Connection> findAllByAuthorOrRecipient(AuthenticationUser userOne, AuthenticationUser userTwo);

    @Query("SELECT c FROM connections c WHERE (c.author = :user OR c.recipient = :user) AND c.status = :status")
    List<Connection> findConnectionsByUserAndStatus(@Param("user") AuthenticationUser user, @Param("status") Status status);

    List<Connection> findByAuthorIdAndStatusOrRecipientIdAndStatus(Long authenticatedUserId, Status status, Long authenticatedUserId1, Status status1);
}
