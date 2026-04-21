package com.company.hr.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.company.hr.entity.Talent;
import com.company.hr.service.TalentService;
import com.company.hr.vo.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/talent")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TalentController {

    private final TalentService talentService;

    /**
     * 获取仪表盘统计数据
     */
    @GetMapping("/dashboard/stats")
    public Result<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", talentService.countActiveTalents());
        stats.put("keyTalentCount", talentService.countKeyTalents());
        stats.put("educationDistribution", talentService.getEducationDistribution());
        stats.put("deptDistribution", talentService.getDeptDistribution());
        return Result.success(stats);
    }

    /**
     * 获取人才列表
     */
    @GetMapping("/list")
    public Result<List<Talent>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Integer isKeyTalent) {
        
        QueryWrapper<Talent> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like("name", keyword)
                    .or()
                    .like("talent_id", keyword));
        }
        
        if (deptId != null) {
            wrapper.eq("dept_id", deptId);
        }
        
        if (isKeyTalent != null) {
            wrapper.eq("is_key_talent", isKeyTalent);
        }
        
        wrapper.orderByDesc("create_time");
        
        return Result.success(talentService.list(wrapper));
    }

    /**
     * 搜索人才
     */
    @GetMapping("/search")
    public Result<List<Talent>> search(@RequestParam String keyword) {
        List<Talent> list = talentService.searchByKeyword(keyword);
        return Result.success(list);
    }

    /**
     * 获取人才详情
     */
    @GetMapping("/{id}")
    public Result<Talent> getById(@PathVariable Long id) {
        Talent talent = talentService.getById(id);
        if (talent == null) {
            return Result.error("人才不存在");
        }
        return Result.success(talent);
    }

    /**
     * 新增人才
     */
    @PostMapping
    public Result<Boolean> save(@RequestBody Talent talent) {
        boolean success = talentService.save(talent);
        return success ? Result.success(true) : Result.error("保存失败");
    }

    /**
     * 更新人才
     */
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody Talent talent) {
        talent.setId(id);
        boolean success = talentService.updateById(talent);
        return success ? Result.success(true) : Result.error("更新失败");
    }

    /**
     * 删除人才
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean success = talentService.removeById(id);
        return success ? Result.success(true) : Result.error("删除失败");
    }
}
