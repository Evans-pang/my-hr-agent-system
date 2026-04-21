package com.company.hr.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.company.hr.entity.Talent;
import com.company.hr.mapper.TalentMapper;
import com.company.hr.service.TalentService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TalentServiceImpl extends ServiceImpl<TalentMapper, Talent> implements TalentService {

    @Override
    public Long countActiveTalents() {
        return baseMapper.countActiveTalents();
    }

    @Override
    public Long countKeyTalents() {
        return baseMapper.countKeyTalents();
    }

    @Override
    public List<Map<String, Object>> getEducationDistribution() {
        return baseMapper.getEducationDistribution();
    }

    @Override
    public List<Map<String, Object>> getDeptDistribution() {
        return baseMapper.getDeptDistribution();
    }

    @Override
    public List<Talent> searchByKeyword(String keyword) {
        return baseMapper.searchByKeyword(keyword);
    }
}
