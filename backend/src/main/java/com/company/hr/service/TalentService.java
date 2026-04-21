package com.company.hr.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.company.hr.entity.Talent;

import java.util.List;
import java.util.Map;

public interface TalentService extends IService<Talent> {
    
    /**
     * 统计在职员工数量
     */
    Long countActiveTalents();
    
    /**
     * 统计关键人才数量
     */
    Long countKeyTalents();
    
    /**
     * 获取学历分布
     */
    List<Map<String, Object>> getEducationDistribution();
    
    /**
     * 获取部门分布
     */
    List<Map<String, Object>> getDeptDistribution();
    
    /**
     * 关键词搜索人才
     */
    List<Talent> searchByKeyword(String keyword);
}
