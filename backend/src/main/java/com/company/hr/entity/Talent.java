package com.company.hr.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("hr_talent")
public class Talent {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String talentId;
    private String eCode;
    private String employeeNo;
    private String name;
    private Integer gender;
    private LocalDate birthDate;
    private String phone;
    private String email;
    private String idCard;
    private Integer status;
    private Long deptId;
    private Long positionId;
    private LocalDate entryDate;
    private LocalDate leaveDate;
    private BigDecimal workYears;
    private String educationLevel;
    private String schoolName;
    private String major;
    private Integer is985211;
    private Integer isKeyTalent;
    private String talentType;
    private String resumeUrl;
    private String avatarUrl;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
