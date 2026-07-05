package com.blog.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.entity.Tag;
import com.blog.repository.TagRepository;
import com.blog.service.TagService;
import com.blog.service.CacheService;
import com.blog.dto.TagDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class TagServiceImpl extends ServiceImpl<TagRepository, Tag> implements TagService {

    private final CacheService cacheService;

    private static final String TAG_LIST_KEY = "tag:list";
    private static final long TAG_CACHE_MINUTES = 30;

    public TagServiceImpl(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    @Override
    public List<TagDTO> getAllTags() {
        List<TagDTO> cached = cacheService.get(TAG_LIST_KEY, List.class);
        if (cached != null) {
            return cached;
        }

        List<TagDTO> tags = baseMapper.selectList(null).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

        cacheService.set(TAG_LIST_KEY, tags, TAG_CACHE_MINUTES, TimeUnit.MINUTES);

        return tags;
    }

    @Override
    public TagDTO createTag(Tag tag) {
        TagDTO result = convertToDTO(baseMapper.insert(tag) > 0 ? tag : null);

        cacheService.delete(TAG_LIST_KEY);

        return result;
    }

    @Override
    public TagDTO updateTag(Long id, Tag tag) {
        Tag existing = baseMapper.selectById(id);
        if (existing == null) return null;

        if (tag.getName() != null) existing.setName(tag.getName());
        if (tag.getSlug() != null) existing.setSlug(tag.getSlug());
        if (tag.getColor() != null) existing.setColor(tag.getColor());
        baseMapper.updateById(existing);

        cacheService.delete(TAG_LIST_KEY);

        return convertToDTO(existing);
    }

    @Override
    public void deleteTag(Long id) {
        baseMapper.deleteById(id);

        cacheService.delete(TAG_LIST_KEY);
    }

    private TagDTO convertToDTO(Tag tag) {
        if (tag == null) {
            return null;
        }
        TagDTO dto = new TagDTO();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        dto.setCreateTime(tag.getCreateTime());
        return dto;
    }
}
