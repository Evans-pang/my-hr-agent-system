package com.company.hr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class NlpService {

    @Value("${nlp.api.url:}")
    private String nlpApiUrl;

    @Value("${nlp.api.key:}")
    private String nlpApiKey;

    @Value("${nlp.enabled:false}")
    private boolean nlpEnabled;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 智能搜索 - 解析自然语言查询
     */
    public Map<String, Object> parseSearchQuery(String query) {
        if (!nlpEnabled || nlpApiUrl.isEmpty()) {
            // 模拟NLP解析结果
            return mockParseSearchQuery(query);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!nlpApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + nlpApiKey);
            }

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("query", query);
            requestBody.put("type", "hr_search");

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(nlpApiUrl, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return parseNlpResponse(root);
        } catch (Exception e) {
            log.error("NLP解析失败", e);
            return mockParseSearchQuery(query);
        }
    }

    /**
     * 简历解析 - 从简历文本中提取结构化信息
     */
    public Map<String, Object> parseResume(String resumeText) {
        if (!nlpEnabled || nlpApiUrl.isEmpty()) {
            return mockParseResume(resumeText);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!nlpApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + nlpApiKey);
            }

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", resumeText);
            requestBody.put("type", "resume_parse");

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(nlpApiUrl, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return parseResumeResponse(root);
        } catch (Exception e) {
            log.error("简历解析失败", e);
            return mockParseResume(resumeText);
        }
    }

    /**
     * 智能问答
     */
    public String chat(String question, Map<String, Object> context) {
        if (!nlpEnabled || nlpApiUrl.isEmpty()) {
            return mockChat(question, context);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!nlpApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + nlpApiKey);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("question", question);
            requestBody.put("context", context);
            requestBody.put("type", "hr_chat");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(nlpApiUrl, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("answer").asText("抱歉，我无法理解您的问题");
        } catch (Exception e) {
            log.error("智能问答失败", e);
            return mockChat(question, context);
        }
    }

    /**
     * 人才画像分析
     */
    public Map<String, Object> analyzeTalentProfile(Long talentId) {
        // 这里应该查询人才数据并进行分析
        Map<String, Object> profile = new HashMap<>();
        profile.put("talentId", talentId);
        profile.put("overallScore", 88);
        profile.put("strengths", Arrays.asList("技术能力强", "学习能力强", "团队协作好"));
        profile.put("weaknesses", Arrays.asList("管理经验不足"));
        profile.put("developmentSuggestions", Arrays.asList("加强项目管理培训", "提升沟通表达能力"));
        profile.put("matchPositions", Arrays.asList("技术负责人", "架构师"));
        return profile;
    }

    /**
     * 人才匹配度计算
     */
    public double calculateMatchScore(Long talentId, String positionRequirements) {
        // 模拟匹配度计算
        return 85.5;
    }

    // 模拟方法
    private Map<String, Object> mockParseSearchQuery(String query) {
        Map<String, Object> result = new HashMap<>();
        result.put("originalQuery", query);
        result.put("intention", "search_talent");
        
        Map<String, Object> filters = new HashMap<>();
        
        // 简单的关键词提取
        if (query.contains("Java") || query.contains("java")) {
            filters.put("skills", Arrays.asList("Java"));
        }
        if (query.contains("5年") || query.contains("五年")) {
            filters.put("minExperience", 5);
        }
        if (query.contains("高级") || query.contains("资深")) {
            filters.put("level", "senior");
        }
        if (query.contains("硕士")) {
            filters.put("education", "master");
        }
        
        result.put("filters", filters);
        result.put("confidence", 0.85);
        return result;
    }

    private Map<String, Object> mockParseResume(String resumeText) {
        Map<String, Object> result = new HashMap<>();
        result.put("name", "张三");
        result.put("phone", "138****8888");
        result.put("email", "zhangsan@email.com");
        result.put("education", "硕士");
        result.put("school", "某某大学");
        result.put("major", "计算机科学");
        result.put("workYears", 8);
        result.put("skills", Arrays.asList("Java", "Spring Boot", "MySQL", "Redis"));
        result.put("confidence", 0.92);
        return result;
    }

    private String mockChat(String question, Map<String, Object> context) {
        String lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.contains("多少人") || lowerQuestion.contains("人数")) {
            return "目前系统中有 1,234 名员工，其中研发人员 567 人，占比 46%。";
        }
        if (lowerQuestion.contains("离职") || lowerQuestion.contains("流失")) {
            return "本月离职率为 2.3%，低于行业平均水平。主要离职原因是职业发展。";
        }
        if (lowerQuestion.contains("招聘") || lowerQuestion.contains("hc")) {
            return "目前还有 15 个HC待招聘，主要集中在研发和产品部门。";
        }
        if (lowerQuestion.contains("绩效") || lowerQuestion.contains("考核")) {
            return "2024年Q1绩效考核已完成，A级员工占比 15%，B+级占比 35%。";
        }
        
        return "抱歉，我暂时无法回答这个问题。您可以尝试询问关于人员统计、离职率、招聘进度或绩效考核的问题。";
    }

    private Map<String, Object> parseNlpResponse(JsonNode root) {
        Map<String, Object> result = new HashMap<>();
        result.put("intention", root.path("intention").asText());
        result.put("confidence", root.path("confidence").asDouble());
        
        JsonNode filtersNode = root.path("filters");
        if (filtersNode.isObject()) {
            Map<String, Object> filters = new HashMap<>();
            filtersNode.fields().forEachRemaining(entry -> {
                filters.put(entry.getKey(), entry.getValue());
            });
            result.put("filters", filters);
        }
        
        return result;
    }

    private Map<String, Object> parseResumeResponse(JsonNode root) {
        Map<String, Object> result = new HashMap<>();
        result.put("name", root.path("name").asText());
        result.put("phone", root.path("phone").asText());
        result.put("email", root.path("email").asText());
        result.put("education", root.path("education").asText());
        result.put("confidence", root.path("confidence").asDouble());
        
        List<String> skills = new ArrayList<>();
        root.path("skills").forEach(node -> skills.add(node.asText()));
        result.put("skills", skills);
        
        return result;
    }
}
