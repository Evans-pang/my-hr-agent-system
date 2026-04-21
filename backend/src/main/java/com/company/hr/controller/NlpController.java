package com.company.hr.controller;

import com.company.hr.service.NlpService;
import com.company.hr.vo.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/nlp")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NlpController {

    private final NlpService nlpService;

    /**
     * 智能搜索 - 解析自然语言查询
     */
    @PostMapping("/parse-search")
    public Result<Map<String, Object>> parseSearchQuery(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.trim().isEmpty()) {
            return Result.error(400, "查询内容不能为空");
        }
        Map<String, Object> result = nlpService.parseSearchQuery(query);
        return Result.success(result);
    }

    /**
     * 简历解析
     */
    @PostMapping("/parse-resume")
    public Result<Map<String, Object>> parseResume(@RequestBody Map<String, String> request) {
        String resumeText = request.get("text");
        if (resumeText == null || resumeText.trim().isEmpty()) {
            return Result.error(400, "简历内容不能为空");
        }
        Map<String, Object> result = nlpService.parseResume(resumeText);
        return Result.success(result);
    }

    /**
     * 智能问答
     */
    @PostMapping("/chat")
    public Result<Map<String, String>> chat(@RequestBody Map<String, Object> request) {
        String question = (String) request.get("question");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.get("context");
        
        if (question == null || question.trim().isEmpty()) {
            return Result.error(400, "问题不能为空");
        }
        
        String answer = nlpService.chat(question, context);
        return Result.success(Map.of("answer", answer));
    }

    /**
     * 人才画像分析
     */
    @GetMapping("/talent-profile/{talentId}")
    public Result<Map<String, Object>> analyzeTalentProfile(@PathVariable Long talentId) {
        Map<String, Object> profile = nlpService.analyzeTalentProfile(talentId);
        return Result.success(profile);
    }

    /**
     * 人才匹配度计算
     */
    @PostMapping("/match-score")
    public Result<Map<String, Object>> calculateMatchScore(@RequestBody Map<String, Object> request) {
        Long talentId = Long.valueOf(request.get("talentId").toString());
        String positionRequirements = (String) request.get("positionRequirements");
        
        double score = nlpService.calculateMatchScore(talentId, positionRequirements);
        return Result.success(Map.of(
            "talentId", talentId,
            "matchScore", score,
            "level", score >= 90 ? "高度匹配" : score >= 70 ? "基本匹配" : "匹配度较低"
        ));
    }
}
