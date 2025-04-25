package com.linkedIn.features.feed.service;

import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.authentication.repository.AuthenticationUserRepository;
import com.linkedIn.features.feed.dto.PostDto;
import com.linkedIn.features.feed.model.Comment;
import com.linkedIn.features.feed.model.Post;
import com.linkedIn.features.feed.repository.CommentRepository;
import com.linkedIn.features.feed.repository.PostRepository;
import com.linkedIn.features.networking.model.Connection;
import com.linkedIn.features.networking.model.Status;
import com.linkedIn.features.networking.repository.ConnectionRepository;
import com.linkedIn.features.notifications.service.NotificationService;
import com.linkedIn.features.storage.service.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FeedService {

    private final PostRepository postRepository;
    private final AuthenticationUserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final ConnectionRepository connectionRepository;
    private final StorageService storageService;

    public FeedService(PostRepository postRepository, AuthenticationUserRepository userRepository,
                       CommentRepository commentRepository, NotificationService notificationService, ConnectionRepository connectionRepository, StorageService storageService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.connectionRepository = connectionRepository;
        this.storageService = storageService;
    }

    public Post createPost(MultipartFile picture, String content, Long id) throws Exception {
        AuthenticationUser author = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        String pictureUrl = storageService.saveImage(picture);

        Post post = new Post(content, author);
        post.setPicture(pictureUrl);
        post.setLikes(new HashSet<>());

        notificationService.sendNewPostNotificationToFeed(post);

        return postRepository.save(post);
    }

    public Post editPost(Long postId, Long id, MultipartFile picture, String content) throws Exception {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        AuthenticationUser user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!post.getAuthor().equals(user)) {
            throw new IllegalArgumentException("User is not the author of the post");
        }

        String pictureUrl = storageService.saveImage(picture);

        post.setContent(content);
        post.setPicture(pictureUrl);

        notificationService.sendEditNotificationToPost(postId, post);

        return postRepository.save(post);
    }

//    public List<Post> getFeedPost(Long authenticatedUserId) {
//        return postRepository.findByAuthorIdNotOrderByCreationDateDesc(authenticatedUserId);
//    }

    public List<Post> getFeedPosts(Long authenticatedUserId) {
        List<Connection> connections = connectionRepository.findByAuthorIdAndStatusOrRecipientIdAndStatus(
                authenticatedUserId, Status.ACCEPTED, authenticatedUserId, Status.ACCEPTED);

        Set<Long> connectedUserIds = connections.stream()
                .map(connection -> connection.getAuthor().getId().equals(authenticatedUserId)
                        ? connection.getRecipient().getId()
                        : connection.getAuthor().getId())
                .collect(Collectors.toSet());

        return postRepository.findByAuthorIdInOrderByCreationDateDesc(connectedUserIds);
    }

    public List<Post> getAllPost() {
        return postRepository.findAllByOrderByCreationDateDesc();
    }

    public Post getPost(Long postId) {
        return postRepository.findById(postId).orElseThrow(() ->
                new IllegalArgumentException("Post not found"));
    }

    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        AuthenticationUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!post.getAuthor().equals(user)) {
            throw new IllegalArgumentException("User is not the author of the post");
        }
        notificationService.sendDeleteNotificationToPost(postId);
        postRepository.delete(post);
    }

    public List<Post> getPostsByUserId(Long userId) {
        return postRepository.findByAuthorId(userId);
    }

    public Post likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        AuthenticationUser user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (post.getLikes().contains(user)) {
            post.getLikes().remove(user);
        } else {
            post.getLikes().add(user);
            System.out.println("User liking the post: " + user.getId() + ", Post owner: " + post.getAuthor().getId());
            notificationService.sendLikeNotification(user, post.getAuthor(), post.getId());
        }
        Post savedPost = postRepository.save(post);
        notificationService.sendLikeToPost(postId, savedPost.getLikes());
        return savedPost;
    }

    public Set<AuthenticationUser> getPostLikes(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return post.getLikes();
    }

    public Comment addComment(Long postId, Long userId, String content) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        AuthenticationUser user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Comment comment = commentRepository.save(new Comment(post, user, content));
        notificationService.sendCommentNotification(user, post.getAuthor(), post.getId());
        notificationService.sendCommentToPost(postId, comment);
        return comment;
    }

    public Comment editComment(Long commentId, Long userId, String newContent) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        AuthenticationUser user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!comment.getAuthor().equals(user)) {
            throw new IllegalArgumentException("User is not the author of the comment");
        }
        comment.setContent(newContent);
        Comment savedComment = commentRepository.save(comment);
        notificationService.sendCommentToPost(savedComment.getPost().getId(), savedComment);
        return savedComment;
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        AuthenticationUser user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!comment.getAuthor().equals(user)) {
            throw new IllegalArgumentException("User is not the author of the comment");
        }
        commentRepository.delete(comment);
        notificationService.sendDeleteCommentToPost(comment.getPost().getId(), comment);
    }

    public List<Comment> getPostComments(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return post.getComments();
    }
}
