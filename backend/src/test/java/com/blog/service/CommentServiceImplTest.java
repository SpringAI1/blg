package com.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.dto.CommentDTO;
import com.blog.entity.Comment;
import com.blog.entity.CommentLike;
import com.blog.entity.User;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CommentLikeRepository;
import com.blog.repository.CommentRepository;
import com.blog.repository.UserRepository;
import com.blog.service.impl.CommentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Comprehensive unit tests for {@link CommentServiceImpl}.
 *
 * Covers:
 * - getCommentsByArticle (flattened tree with children at depth 1)
 * - createComment (insert + atomic comment count increment)
 * - deleteComment (logical delete + recursive child deletion + atomic decrement)
 * - getAllComments (all comments as tree)
 * - getById (inherited from ServiceImpl)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CommentServiceImpl Unit Tests")
class CommentServiceImplTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private CommentLikeRepository commentLikeRepository;

    @InjectMocks
    private CommentServiceImpl commentService;

    @Captor
    private ArgumentCaptor<Comment> commentCaptor;

    private static final Long ARTICLE_ID = 100L;
    private static final Long USER_ID = 200L;
    private static final String USERNAME = "testUser";
    private static final String AVATAR = "https://example.com/avatar.png";

    @BeforeEach
    void setUp() {
        // Inject the mocked CommentRepository into the parent ServiceImpl's baseMapper field
        ReflectionTestUtils.setField(commentService, "baseMapper", commentRepository);
    }

    // -----------------------------------------------------------------------
    // Helper methods
    // -----------------------------------------------------------------------

    private Comment createCommentEntity(Long id, Long articleId, Long userId,
                                        Long parentId, String content, LocalDateTime createTime) {
        Comment comment = new Comment();
        comment.setId(id);
        comment.setArticleId(articleId);
        comment.setUserId(userId);
        comment.setParentId(parentId);
        comment.setContent(content);
        comment.setLikes(0);
        comment.setCreateTime(createTime);
        return comment;
    }

    private Comment createCommentEntity(Long id, Long articleId, Long userId,
                                        Long parentId, String content) {
        return createCommentEntity(id, articleId, userId, parentId, content, LocalDateTime.now());
    }

    private User createUser(Long id, String username, String avatar) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setAvatar(avatar);
        return user;
    }

    private User createUser() {
        return createUser(USER_ID, USERNAME, AVATAR);
    }

    // -----------------------------------------------------------------------
    // getCommentsByArticle tests
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getCommentsByArticle: should return empty list when article has no comments")
    void getCommentsByArticle_EmptyList() {
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.emptyList());

        List<CommentDTO> result = commentService.getCommentsByArticle(ARTICLE_ID, null);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(commentRepository).selectList(any(LambdaQueryWrapper.class));
        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("getCommentsByArticle: should return a single root comment with empty children")
    void getCommentsByArticle_SingleRoot() {
        LocalDateTime now = LocalDateTime.now();
        Comment root = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "Great article!", now);
        User user = createUser();

        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.singletonList(root));
        when(userRepository.selectById(USER_ID)).thenReturn(user);

        List<CommentDTO> result = commentService.getCommentsByArticle(ARTICLE_ID, null);

        assertEquals(1, result.size());
        CommentDTO dto = result.get(0);
        assertEquals(1L, dto.getId());
        assertEquals("Great article!", dto.getContent());
        assertEquals(ARTICLE_ID, dto.getArticleId());
        assertEquals(USER_ID, dto.getUserId());
        assertEquals(USERNAME, dto.getUsername());
        assertEquals(AVATAR, dto.getUserAvatar());
        assertNull(dto.getParentId());
        assertEquals(0, dto.getLikes());
        assertEquals(now, dto.getCreateTime());
        assertNotNull(dto.getChildren());
        assertTrue(dto.getChildren().isEmpty());

        verify(userRepository).selectById(USER_ID);
    }

    @Test
    @DisplayName("getCommentsByArticle: should return multiple root comments sorted by createTime")
    void getCommentsByArticle_MultipleRoots() {
        LocalDateTime earlier = LocalDateTime.of(2026, 1, 1, 10, 0);
        LocalDateTime later = LocalDateTime.of(2026, 1, 1, 12, 0);
        Comment root1 = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "First comment", earlier);
        Comment root2 = createCommentEntity(2L, ARTICLE_ID, USER_ID, null, "Second comment", later);

        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(root1, root2));
        when(userRepository.selectById(USER_ID)).thenReturn(createUser());

        List<CommentDTO> result = commentService.getCommentsByArticle(ARTICLE_ID, null);

        assertEquals(2, result.size());
        assertEquals("First comment", result.get(0).getContent());
        assertEquals("Second comment", result.get(1).getContent());
        // Both are root comments (no parent)
        assertNull(result.get(0).getParentId());
        assertNull(result.get(1).getParentId());
    }

    @Test
    @DisplayName("getCommentsByArticle: should build tree with root comments containing direct children at depth 1")
    void getCommentsByArticle_TreeStructure() {
        Comment root = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "Root comment");
        Comment child1 = createCommentEntity(2L, ARTICLE_ID, 201L, 1L, "Child one");
        Comment child2 = createCommentEntity(3L, ARTICLE_ID, 202L, 1L, "Child two");
        Comment anotherRoot = createCommentEntity(4L, ARTICLE_ID, USER_ID, null, "Another root");

        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(root, child1, child2, anotherRoot));
        User user1 = createUser(USER_ID, "user1", "avatar1");
        User user2 = createUser(201L, "user2", "avatar2");
        User user3 = createUser(202L, "user3", "avatar3");
        when(userRepository.selectById(USER_ID)).thenReturn(user1);
        when(userRepository.selectById(201L)).thenReturn(user2);
        when(userRepository.selectById(202L)).thenReturn(user3);

        List<CommentDTO> result = commentService.getCommentsByArticle(ARTICLE_ID, null);

        // Two root comments
        assertEquals(2, result.size());

        // First root
        CommentDTO rootDto = result.get(0);
        assertEquals(1L, rootDto.getId());
        assertEquals("Root comment", rootDto.getContent());
        assertEquals(2, rootDto.getChildren().size());

        // First child
        CommentDTO childDto1 = rootDto.getChildren().get(0);
        assertEquals(2L, childDto1.getId());
        assertEquals("Child one", childDto1.getContent());
        assertEquals(1L, childDto1.getParentId());
        assertEquals("user2", childDto1.getUsername());
        assertNotNull(childDto1.getChildren());
        assertTrue(childDto1.getChildren().isEmpty(), "Children of children should be empty (depth 1 only)");

        // Second child
        CommentDTO childDto2 = rootDto.getChildren().get(1);
        assertEquals(3L, childDto2.getId());
        assertEquals("Child two", childDto2.getContent());
        assertEquals(1L, childDto2.getParentId());
        assertEquals("user3", childDto2.getUsername());
        assertNotNull(childDto2.getChildren());
        assertTrue(childDto2.getChildren().isEmpty());

        // Second root has no children
        CommentDTO anotherRootDto = result.get(1);
        assertEquals(4L, anotherRootDto.getId());
        assertEquals("Another root", anotherRootDto.getContent());
        assertTrue(anotherRootDto.getChildren().isEmpty());
    }

    @Test
    @DisplayName("getCommentsByArticle: should not nest deeper than one level (TikTok-style flat display)")
    void getCommentsByArticle_MaxDepthOne() {
        // Root -> Child -> Grandchild relationship
        // Grandchild should NOT appear nested under Child; it should appear as a root
        // if parentId doesn't match any root. Actually, with buildTree logic,
        // grandchildren just get an empty children list at depth 1.
        Comment root = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "Root");
        Comment child = createCommentEntity(2L, ARTICLE_ID, 201L, 1L, "Child");
        Comment grandchild = createCommentEntity(3L, ARTICLE_ID, 202L, 2L, "Grandchild");

        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(root, child, grandchild));
        when(userRepository.selectById(anyLong())).thenReturn(createUser());

        List<CommentDTO> result = commentService.getCommentsByArticle(ARTICLE_ID, null);

        assertEquals(1, result.size()); // Only the root
        CommentDTO rootDto = result.get(0);
        assertEquals(1, rootDto.getChildren().size()); // One direct child

        CommentDTO childDto = rootDto.getChildren().get(0);
        assertEquals(2L, childDto.getId());
        // Child has grandchild's parentId, but getDirectChildren only looks one level down
        // The grandchild has parentId=2L, matching child, BUT getDirectChildren
        // explicitly sets children to empty ArrayList without recursion.
        // So grandchild is NOT in child's children.
        // The grandchild simply does NOT appear in the tree because its parentId (2L)
        // is not null, so it's filtered out of the root level.
        assertTrue(childDto.getChildren().isEmpty(),
                "Child comments should not have deeper nested children");
    }

    @Test
    @DisplayName("getCommentsByArticle: should handle orphaned user (userId not found) gracefully")
    void getCommentsByArticle_OrphanedUser() {
        Comment comment = createCommentEntity(1L, ARTICLE_ID, 999L, null, "Orphan comment");
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.singletonList(comment));
        when(userRepository.selectById(999L)).thenReturn(null);

        List<CommentDTO> result = commentService.getCommentsByArticle(ARTICLE_ID, null);

        assertEquals(1, result.size());
        CommentDTO dto = result.get(0);
        assertNull(dto.getUsername(), "Username should be null for orphaned user");
        assertNull(dto.getUserAvatar(), "Avatar should be null for orphaned user");
        assertEquals("Orphan comment", dto.getContent());
    }

    @Test
    @DisplayName("getCommentsByArticle: should only return comments for the specified article")
    void getCommentsByArticle_OnlySpecifiedArticle() {
        Comment comment = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "Target article comment");
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.singletonList(comment));
        when(userRepository.selectById(USER_ID)).thenReturn(createUser());

        List<CommentDTO> result = commentService.getCommentsByArticle(ARTICLE_ID, null);

        assertEquals(1, result.size());
        assertEquals(ARTICLE_ID, result.get(0).getArticleId());
    }

    // -----------------------------------------------------------------------
    // createComment tests
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("createComment: should create a root comment and increment article comment count")
    void createComment_RootComment() {
        String content = "New root comment";
        when(userRepository.selectById(USER_ID)).thenReturn(createUser());

        CommentDTO result = commentService.createComment(ARTICLE_ID, USER_ID, content, null);

        // Verify insert was called with correct fields
        verify(commentRepository).insert(commentCaptor.capture());
        Comment captured = commentCaptor.getValue();
        assertEquals(ARTICLE_ID, captured.getArticleId());
        assertEquals(USER_ID, captured.getUserId());
        assertEquals(content, captured.getContent());
        assertNull(captured.getParentId());

        // Verify article comment count was incremented
        verify(articleRepository).incrementCommentCount(ARTICLE_ID);

        // Verify returned DTO
        assertNotNull(result);
        assertEquals(content, result.getContent());
        assertEquals(ARTICLE_ID, result.getArticleId());
        assertEquals(USER_ID, result.getUserId());
        assertEquals(USERNAME, result.getUsername());
        assertEquals(AVATAR, result.getUserAvatar());
        assertNotNull(result.getChildren());
        assertTrue(result.getChildren().isEmpty());
    }

    @Test
    @DisplayName("createComment: should create a reply comment with parentId set")
    void createComment_ReplyComment() {
        Long parentId = 5L;
        String content = "This is a reply";
        when(userRepository.selectById(USER_ID)).thenReturn(createUser());

        CommentDTO result = commentService.createComment(ARTICLE_ID, USER_ID, content, parentId);

        verify(commentRepository).insert(commentCaptor.capture());
        Comment captured = commentCaptor.getValue();
        assertEquals(ARTICLE_ID, captured.getArticleId());
        assertEquals(USER_ID, captured.getUserId());
        assertEquals(content, captured.getContent());
        assertEquals(parentId, captured.getParentId());

        verify(articleRepository).incrementCommentCount(ARTICLE_ID);

        assertNotNull(result);
        assertEquals(parentId, result.getParentId());
        assertEquals(content, result.getContent());
    }

    @Test
    @DisplayName("createComment: should call insert before incrementing comment count")
    void createComment_InsertBeforeIncrement() {
        when(userRepository.selectById(USER_ID)).thenReturn(createUser());

        commentService.createComment(ARTICLE_ID, USER_ID, "Order test", null);

        InOrder inOrder = inOrder(commentRepository, articleRepository);
        inOrder.verify(commentRepository).insert(any(Comment.class));
        inOrder.verify(articleRepository).incrementCommentCount(ARTICLE_ID);
    }

    @Test
    @DisplayName("createComment: should set likes to default value")
    void createComment_DefaultLikes() {
        when(userRepository.selectById(USER_ID)).thenReturn(createUser());

        CommentDTO result = commentService.createComment(ARTICLE_ID, USER_ID, "Check likes", null);

        assertEquals(0, result.getLikes());
    }

    // -----------------------------------------------------------------------
    // deleteComment tests
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("deleteComment: should do nothing when comment does not exist")
    void deleteComment_NotFound() {
        when(commentRepository.selectById(99L)).thenReturn(null);

        commentService.deleteComment(99L);

        verify(commentRepository).selectById(99L);
        verify(commentRepository, never()).deleteById(anyLong());
        verify(articleRepository, never()).decrementCommentCount(anyLong(), anyInt());
    }

    @Test
    @DisplayName("deleteComment: should delete root comment with no children and decrement count by 1")
    void deleteComment_NoChildren() {
        Comment root = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "Lonely comment");
        when(commentRepository.selectById(1L)).thenReturn(root);
        // No children
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.emptyList());

        commentService.deleteComment(1L);

        verify(commentRepository).selectById(1L);
        verify(commentRepository).selectList(any(LambdaQueryWrapper.class));
        verify(commentRepository).deleteById(1L);
        verify(articleRepository).decrementCommentCount(ARTICLE_ID, 1);
    }

    @Test
    @DisplayName("deleteComment: should recursively delete children and decrement count appropriately")
    void deleteComment_WithChildren() {
        Comment root = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "Root");
        Comment child1 = createCommentEntity(2L, ARTICLE_ID, 201L, 1L, "Child 1");
        Comment child2 = createCommentEntity(3L, ARTICLE_ID, 202L, 1L, "Child 2");

        when(commentRepository.selectById(1L)).thenReturn(root);
        // First selectList: children of root (returns child1, child2)
        // Second selectList: children of child1 (returns empty)
        // Third selectList: children of child2 (returns empty)
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(child1, child2))
                .thenReturn(Collections.emptyList())
                .thenReturn(Collections.emptyList());

        commentService.deleteComment(1L);

        // Verify deletion order: children first (recursively), then root
        InOrder inOrder = inOrder(commentRepository);
        inOrder.verify(commentRepository).deleteById(2L); // child1
        inOrder.verify(commentRepository).deleteById(3L); // child2
        inOrder.verify(commentRepository).deleteById(1L); // root

        // Total: root(1) + child1(1) + child2(1) = 3
        verify(articleRepository).decrementCommentCount(ARTICLE_ID, 3);
    }

    @Test
    @DisplayName("deleteComment: should recursively delete deeply nested comments (grandchildren)")
    void deleteComment_DeeplyNested() {
        Comment root = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "Root");
        Comment child = createCommentEntity(2L, ARTICLE_ID, 201L, 1L, "Child");
        Comment grandchild = createCommentEntity(3L, ARTICLE_ID, 202L, 2L, "Grandchild");

        when(commentRepository.selectById(1L)).thenReturn(root);
        // Call order:
        // 1. deleteChildComments(1) -> selectList -> [child]
        // 2.   deleteChildComments(2) -> selectList -> [grandchild]
        // 3.     deleteChildComments(3) -> selectList -> []
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.singletonList(child))
                .thenReturn(Collections.singletonList(grandchild))
                .thenReturn(Collections.emptyList());

        commentService.deleteComment(1L);

        // Deletion order (bottom-up, recursively): grandchild -> child -> root
        InOrder inOrder = inOrder(commentRepository);
        inOrder.verify(commentRepository).deleteById(3L); // grandchild first
        inOrder.verify(commentRepository).deleteById(2L); // then child
        inOrder.verify(commentRepository).deleteById(1L); // finally root

        // Total: root + child + grandchild = 3
        verify(articleRepository).decrementCommentCount(ARTICLE_ID, 3);
    }

    @Test
    @DisplayName("deleteComment: should decrement correct article's comment count")
    void deleteComment_CorrectArticleCount() {
        Long otherArticleId = 200L;
        Comment comment = createCommentEntity(1L, otherArticleId, USER_ID, null, "On another article");
        when(commentRepository.selectById(1L)).thenReturn(comment);
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.emptyList());

        commentService.deleteComment(1L);

        verify(articleRepository).decrementCommentCount(otherArticleId, 1);
    }

    @Test
    @DisplayName("deleteComment: should handle comment with large number of children")
    void deleteComment_ManyChildren() {
        Comment root = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "Root");
        List<Comment> children = new ArrayList<>();
        for (long i = 2; i <= 11; i++) {
            children.add(createCommentEntity(i, ARTICLE_ID, 200L + i, 1L, "Child " + i));
        }

        when(commentRepository.selectById(1L)).thenReturn(root);
        // 第一次 selectList 返回所有子评论（10个），后续返回空
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(children, Collections.emptyList(), Collections.emptyList(), Collections.emptyList(),
                        Collections.emptyList(), Collections.emptyList(), Collections.emptyList(),
                        Collections.emptyList(), Collections.emptyList(), Collections.emptyList(),
                        Collections.emptyList());

        commentService.deleteComment(1L);

        verify(commentRepository, times(10 + 1)).deleteById(anyLong());
        verify(articleRepository).decrementCommentCount(ARTICLE_ID, 11); // 1 root + 10 children
    }

    // -----------------------------------------------------------------------
    // getAllComments tests
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getAllComments: should return empty list when there are no comments")
    void getAllComments_EmptyList() {
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.emptyList());

        List<CommentDTO> result = commentService.getAllComments();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("getAllComments: should return all comments as tree structure")
    void getAllComments_TreeStructure() {
        Comment root1 = createCommentEntity(1L, 10L, USER_ID, null, "Article 10 root");
        Comment root2 = createCommentEntity(2L, 20L, 201L, null, "Article 20 root");
        Comment child = createCommentEntity(3L, 10L, 202L, 1L, "Reply to root1");

        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(root1, root2, child));
        when(userRepository.selectById(anyLong())).thenReturn(createUser());

        List<CommentDTO> result = commentService.getAllComments();

        assertEquals(2, result.size());

        // root1 should have child
        CommentDTO root1Dto = result.stream()
                .filter(d -> d.getId().equals(1L))
                .findFirst().orElseThrow();
        assertEquals(1, root1Dto.getChildren().size());
        assertEquals(3L, root1Dto.getChildren().get(0).getId());

        // root2 should have no children
        CommentDTO root2Dto = result.stream()
                .filter(d -> d.getId().equals(2L))
                .findFirst().orElseThrow();
        assertTrue(root2Dto.getChildren().isEmpty());
    }

    @Test
    @DisplayName("getAllComments: should handle comments from multiple articles")
    void getAllComments_MultipleArticles() {
        Comment c1 = createCommentEntity(1L, 10L, USER_ID, null, "Article 10");
        Comment c2 = createCommentEntity(2L, 20L, USER_ID, null, "Article 20");
        Comment c3 = createCommentEntity(3L, 30L, USER_ID, null, "Article 30");

        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(c1, c2, c3));
        when(userRepository.selectById(anyLong())).thenReturn(createUser());

        List<CommentDTO> result = commentService.getAllComments();

        assertEquals(3, result.size());
        result.forEach(dto -> assertTrue(dto.getChildren().isEmpty()));
    }

    // -----------------------------------------------------------------------
    // getById tests (inherited from ServiceImpl)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getById: should return comment entity when found")
    void getById_Found() {
        Comment expected = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "Found comment");
        when(commentRepository.selectById(1L)).thenReturn(expected);

        Comment result = commentService.getById(1L);

        assertNotNull(result);
        assertEquals(expected.getId(), result.getId());
        assertEquals(expected.getContent(), result.getContent());
        assertEquals(expected.getArticleId(), result.getArticleId());
        assertEquals(expected.getUserId(), result.getUserId());
        assertEquals(expected.getParentId(), result.getParentId());
        verify(commentRepository).selectById(1L);
    }

    @Test
    @DisplayName("getById: should return null when comment not found")
    void getById_NotFound() {
        when(commentRepository.selectById(99L)).thenReturn(null);

        Comment result = commentService.getById(99L);

        assertNull(result);
        verify(commentRepository).selectById(99L);
    }

    // -----------------------------------------------------------------------
    // Edge case: mixed scenarios
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getCommentsByArticle: should handle article with only reply comments (no root)")
    void getCommentsByArticle_OnlyReplies() {
        // All comments have parentId set (replies) - but if parent is missing,
        // they get filtered out of root level
        Comment reply = createCommentEntity(1L, ARTICLE_ID, USER_ID, 99L, "Orphan reply");

        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.singletonList(reply));
        // User lookup still happens during DTO conversion even though it won't be in tree
        when(userRepository.selectById(USER_ID)).thenReturn(createUser());

        List<CommentDTO> result = commentService.getCommentsByArticle(ARTICLE_ID, null);

        // The reply has parentId=99L (non-null), so it doesn't appear as root.
        // Since no root comment with id=99L exists, this reply is effectively lost
        // (filtered out of the tree entirely).
        assertTrue(result.isEmpty(),
                "Replies whose parent is missing should not appear at root level");
    }

    @Test
    @DisplayName("createComment: multiple replies to the same parent should each increment count")
    void createComment_MultipleRepliesToSameParent() {
        Long parentId = 5L;
        when(userRepository.selectById(USER_ID)).thenReturn(createUser());

        commentService.createComment(ARTICLE_ID, USER_ID, "Reply 1", parentId);
        commentService.createComment(ARTICLE_ID, USER_ID, "Reply 2", parentId);

        verify(commentRepository, times(2)).insert(any(Comment.class));
        verify(articleRepository, times(2)).incrementCommentCount(ARTICLE_ID);
    }

    @Test
    @DisplayName("deleteComment: repeatedly deleting same comment should be idempotent from service perspective")
    void deleteComment_AlreadyDeleted() {
        // First call: comment exists
        Comment comment = createCommentEntity(1L, ARTICLE_ID, USER_ID, null, "To delete");
        when(commentRepository.selectById(1L)).thenReturn(comment);
        when(commentRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Collections.emptyList());

        commentService.deleteComment(1L);

        verify(commentRepository).deleteById(1L);
        verify(articleRepository).decrementCommentCount(ARTICLE_ID, 1);

        // Second call: comment no longer exists
        reset(commentRepository, articleRepository);
        when(commentRepository.selectById(1L)).thenReturn(null);

        commentService.deleteComment(1L);

        verify(commentRepository).selectById(1L);
        verify(commentRepository, never()).deleteById(anyLong());
        verify(articleRepository, never()).decrementCommentCount(anyLong(), anyInt());
    }
}
