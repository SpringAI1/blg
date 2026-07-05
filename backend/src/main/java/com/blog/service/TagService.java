package com.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.entity.Tag;
import com.blog.dto.TagDTO;
import java.util.List;

public interface TagService extends IService<Tag> {
    List<TagDTO> getAllTags();
    TagDTO createTag(Tag tag);
    TagDTO updateTag(Long id, Tag tag);
    void deleteTag(Long id);
}
