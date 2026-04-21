package com.company.hr.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.hr.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    @Select("SELECT * FROM sys_user WHERE username = #{username} AND status = 1")
    User findByUsername(@Param("username") String username);
}
