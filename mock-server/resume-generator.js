const docx = require('docx');
const fs = require('fs');
const path = require('path');

const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType, BorderStyle, VerticalAlign, Header, Footer, PageNumber } = docx;

// 生成简历Word文档 - 标准企业简历模板格式（参考附件2-个人简历模版.docx）
async function generateResume(talent) {
  // 定义边框样式 - 细线边框
  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  };

  const noBorder = {
    top: { style: BorderStyle.NIL },
    bottom: { style: BorderStyle.NIL },
    left: { style: BorderStyle.NIL },
    right: { style: BorderStyle.NIL },
  };

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1134,    // 0.79英寸
            right: 1134,
            bottom: 1134,
            left: 1134,
          }
        }
      },
      children: [
        // ========== 标题 - 个人简历 ==========
        new Paragraph({
          children: [
            new TextRun({
              text: '个 人 简 历',
              bold: true,
              size: 36,  // 18pt
              font: '黑体',
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),

        // ========== 基本信息模块 ==========
        createSectionTitle('基本信息'),
        
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: thinBorder,
          rows: [
            createInfoRow('姓　　名', talent.name || '', '性　　别', talent.gender === 1 ? '男' : (talent.gender === 0 ? '女' : '')),
            createInfoRow('年　　龄', talent.age ? `${talent.age}岁` : '', '国　　籍', '中国'),
            createInfoRow('工作年限', talent.workYears ? `${talent.workYears}年` : '', '民　　族', '汉族'),
            createInfoRow('最高学历', talent.educationLevel || '', '所在地', talent.location || ''),
            createInfoRow('毕业院校', talent.schoolName || '', '专　　业', talent.major || ''),
            createInfoRow('电　　话', talent.phone || '', '邮　　箱', talent.email || ''),
          ]
        }),

        // ========== 个人评价模块 ==========
        createSectionTitle('个人评价'),
        
        new Paragraph({
          children: [
            new TextRun({
              text: '擅长领域：',
              bold: true,
              size: 21,
              font: '宋体',
            }),
            new TextRun({
              text: talent.skills ? talent.skills.slice(0, 3).join('、') : 'XXXXXXXX',
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 60 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: '专业技能：',
              bold: true,
              size: 21,
              font: '宋体',
            }),
            new TextRun({
              text: talent.skills ? talent.skills.join('、') : 'SQL、Java、Python',
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 60 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: '个人优势：',
              bold: true,
              size: 21,
              font: '宋体',
            }),
            new TextRun({
              text: `具有${talent.workYears || 3}年${talent.positionName || '相关'}工作经验，工作认真负责，具备良好的团队协作精神和沟通能力。`,
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 200 },
        }),

        // ========== 教育经历模块 ==========
        createSectionTitle('教育经历'),
        
        new Paragraph({
          children: [
            new TextRun({
              text: `2010/09-2014/06　　${talent.schoolName || '某某大学'}　　${talent.major || '计算机科学与技术'}　　${talent.educationLevel || '本科'}　　学士学位`,
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 200 },
        }),

        // ========== 工作经历模块 ==========
        createSectionTitle('工作经历'),
        
        new Paragraph({
          children: [
            new TextRun({
              text: `${talent.entryDate || '2021/09'}-至今　　${talent.deptName || '某某公司'}　　${talent.positionName || '软件开发工程师'}`,
              bold: true,
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 60 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: `公司规模：1000人以上　　城市：${talent.location || '西安市'}　　部门：${talent.deptName || '技术部'}`,
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 60 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: '工作职责：',
              bold: true,
              size: 21,
              font: '宋体',
            }),
            new TextRun({
              text: `负责${talent.positionName || '核心'}模块的设计与开发工作，参与系统架构设计，优化系统性能。`,
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 60 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: '工作业绩：',
              bold: true,
              size: 21,
              font: '宋体',
            }),
            new TextRun({
              text: '带领团队完成多个重点项目交付，获得客户好评。',
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 200 },
        }),

        // ========== 项目经历模块 ==========
        createSectionTitle('项目经历'),
        
        // 动态生成项目经历
        ...(talent.projects && talent.projects.length > 0
          ? talent.projects.map((project, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${project.period || '2022/04-至今'}　　${project.name || '项目名称'}　　角色：${project.role || '开发人员'}`,
                    bold: true,
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '项目描述：',
                    bold: true,
                    size: 21,
                    font: '宋体',
                  }),
                  new TextRun({
                    text: `${project.name || '项目'}的设计与开发，包括需求分析、架构设计、编码实现等工作。`,
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '工作内容/主要贡献：',
                    bold: true,
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 30 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '1、负责需求分析和系统设计工作；',
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 30 },
                indent: { left: 420 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '2、负责核心模块的开发和单元测试；',
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 30 },
                indent: { left: 420 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '3、协助处理日常运维及问题处理。',
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: index < talent.projects.length - 1 ? 150 : 200 },
                indent: { left: 420 },
              }),
            ]).flat()
          : [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '2022/04-至今　　企业级管理系统　　角色：技术负责人',
                    bold: true,
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '项目描述：企业核心业务系统的设计与开发，实现数据的高效管理和展现。',
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '工作内容/主要贡献：',
                    bold: true,
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 30 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '1、设计开发新需求对应的数据模型；',
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 30 },
                indent: { left: 420 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '2、负责系统的开发和日常运维；',
                    size: 21,
                    font: '宋体',
                  }),
                ],
                spacing: { after: 200 },
                indent: { left: 420 },
              }),
            ]
        ),

        // ========== 培训经历模块 ==========
        createSectionTitle('培训经历'),
        
        new Paragraph({
          children: [
            new TextRun({
              text: '2018/07/04-2019/04/16　　培训课程：专业技能培训　　培训机构：某某培训中心',
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 200 },
        }),

        // ========== 资质证书模块 ==========
        createSectionTitle('资质证书'),
        
        new Paragraph({
          children: [
            new TextRun({
              text: '信息系统项目管理师　　发证机构：人力资源和社会保障部　　认证等级：高级　　发证日期：2022/07/03',
              size: 21,
              font: '宋体',
            }),
          ],
          spacing: { after: 100 },
        }),
      ]
    }]
  });

  return doc;
}

// 创建模块标题
function createSectionTitle(title) {
  return new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24,  // 12pt
        font: '黑体',
      })
    ],
    spacing: { before: 300, after: 100 },
  });
}

// 创建信息表格行
function createInfoRow(label1, value1, label2, value2) {
  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  };

  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: label1, bold: true, size: 21, font: '宋体' })],
          alignment: AlignmentType.CENTER,
        })],
        width: { size: 12, type: WidthType.PERCENTAGE },
        borders: thinBorder,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: 'F5F5F5' },  // 浅灰色背景
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: value1, size: 21, font: '宋体' })],
        })],
        width: { size: 38, type: WidthType.PERCENTAGE },
        borders: thinBorder,
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: label2, bold: true, size: 21, font: '宋体' })],
          alignment: AlignmentType.CENTER,
        })],
        width: { size: 12, type: WidthType.PERCENTAGE },
        borders: thinBorder,
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: 'F5F5F5' },
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: value2, size: 21, font: '宋体' })],
        })],
        width: { size: 38, type: WidthType.PERCENTAGE },
        borders: thinBorder,
        verticalAlign: VerticalAlign.CENTER,
      }),
    ]
  });
}

// 导出函数
module.exports = { generateResume };
