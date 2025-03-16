package com.linkedIn.features.feed.repository;

import com.linkedIn.features.feed.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByAuthorIdNotOrderByCreationDateDesc(Long authenticatedUserId);

    List<Post> findAllByOrderByCreationDateDesc();

    List<Post> findByAuthorId(Long authorId);
}
