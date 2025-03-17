package com.linkedIn.features.feed.controller;

import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.feed.dto.CommentDto;
import com.linkedIn.features.feed.dto.PostDto;
import com.linkedIn.features.feed.model.Comment;
import com.linkedIn.features.feed.model.Post;
import com.linkedIn.features.feed.service.FeedService;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/feed")
public class FeedController {
    private final FeedService feedService;

    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping("/")
    public ResponseEntity<List<Post>> getFeedPosts(@RequestAttribute("authenticatedUser") AuthenticationUser user){
        List<Post> posts = feedService.getFeedPost(user.getId());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPost(){
        List<Post> posts = feedService.getAllPost();
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(@RequestBody PostDto postDto, @RequestAttribute("authenticatedUser") AuthenticationUser user) {
        Post post = feedService.createPost(postDto, user.getId());
        return ResponseEntity.ok(post);
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<Post> editPost(@PathVariable Long postId, @RequestBody PostDto postDto, @RequestAttribute("authenticatedUser") AuthenticationUser user){
        Post post = feedService.editPost(postId, user.getId(),postDto);
        return ResponseEntity.ok(post);
    }
    @GetMapping("/posts/{postId}")
    public ResponseEntity<Post> getPost(@PathVariable Long postId) {
        Post post = feedService.getPost(postId);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId, @RequestAttribute("authenticatedUser") AuthenticationUser user) {
        feedService.deletePost(postId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable Long userId) {
        List<Post> posts = feedService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/posts/{postId}/like")
    public ResponseEntity<Post> likePost(@PathVariable Long postId, @RequestAttribute("authenticatedUser") AuthenticationUser user) {
        Post post = feedService.likePost(postId, user.getId());
        return ResponseEntity.ok(post);
    }

    @GetMapping("/posts/{postId}/likes")
    public ResponseEntity<Set<AuthenticationUser>> getPostLikes(@PathVariable Long postId) {
        Set<AuthenticationUser> likes = feedService.getPostLikes(postId);
        return ResponseEntity.ok(likes);
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long postId, @RequestBody CommentDto commentDto, @RequestAttribute("authenticatedUser") AuthenticationUser user) {
        Comment comment = feedService.addComment(postId, user.getId(), commentDto.getContent());
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, @RequestAttribute("authenticatedUser") AuthenticationUser user) {
        feedService.deleteComment(commentId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> editComment(@PathVariable Long commentId, @RequestBody CommentDto commentDto, @RequestAttribute("authenticatedUser") AuthenticationUser user) {
        Comment comment = feedService.editComment(commentId, user.getId(), commentDto.getContent());
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long postId) {
        List<Comment> comments = feedService.getPostComments(postId);
        return ResponseEntity.ok(comments);
    }


}
