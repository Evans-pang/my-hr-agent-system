package com.company.hr;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@MapperScan("com.company.hr.mapper")
@EnableCaching
public class HrAgentSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(HrAgentSystemApplication.class, args);
    }
}
