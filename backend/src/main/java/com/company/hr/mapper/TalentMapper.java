package com.company.hr.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.hr.entity.Talent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface TalentMapper extends BaseMapper<Talent> {
    
    @Select("SELECT COUNT(*) FROM hr_talent WHERE status = 1")
    Long countActiveTalents();
    
    @Select("SELECT COUNT(*) FROM hr_talent WHERE status = 1 AND is_key_talent = 1")
    Long countKeyTalents();
    
    @Select("SELECT education_level as name, COUNT(*) as value FROM hr_talent WHERE status = 1 GROUP BY education_level")
    List<Map<String, Object>> getEducationDistribution();
    
    @Select("SELECT dept_id, COUNT(*) as count FROM hr_talent WHERE status = 1 GROUP BY dept_id")
    List<Map<String, Object>> getDeptDistribution();
    
    List<Talent> searchByKeyword(@Param("keyword") String keyword);
}
