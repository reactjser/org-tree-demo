export default {
  departmentId: "2019110801",
  department: "总经理",
  name: "张三",
  size: [80, 60],
  children: [
    {
      departmentId: "2019110802",
      department: "管理中心",
      name: "李四",
      size: [120, 60],
      children: [
        {
          departmentId: "2019110803",
          department: "财务部",
          name: null,
          size: [120, 30],
          children: []
        },
        {
          departmentId: "2019110804",
          department: "行政人事部",
          name: null,
          size: [120, 30],
          children: []
        },
        {
          departmentId: "2019110805",
          department: "采购部",
          name: null,
          size: [120, 30],
          children: []
        }
      ]
    },
    {
      departmentId: "2019110806",
      department: "营销中心",
      name: "王五",
      size: [120, 60],
      children: [
        {
          departmentId: "2019110807",
          department: "客服部",
          name: null,
          size: [120, 30],
          children: []
        },
        {
          departmentId: "2019110808",
          department: "渠道部",
          name: null,
          size: [120, 30],
          children: []
        },
        {
          departmentId: "2019110809",
          department: "租赁部",
          name: null,
          size: [120, 30],
          children: []
        },
        {
          departmentId: "2019110810",
          department: "直营部",
          name: null,
          size: [120, 30],
          children: []
        },
        {
          departmentId: "2019110811",
          department: "品牌部",
          name: null,
          size: [120, 30],
          children: []
        }
      ]
    },
    {
      // `isEmpty`为`true`则表示跨层数据
      // 宽度指定0，高度指定与同层同高即可
      // 此条数据表示该部门直接由第一层的大佬分管，但是处于架构图的第三层
      isEmpty: true,
      size: [120, 0],
      children: [
        {
          departmentId: "2019110812",
          department: "运营部",
          name: null,
          size: [120, 30],
          children: []
        }
      ]
    },
    {
      departmentId: "2019110813",
      department: "销售支持中心",
      name: "赵六",
      size: [120, 60],
      children: [
        {
          departmentId: "2019110814",
          department: "配件生产部",
          name: null,
          size: [120, 30],
          children: []
        },
        {
          departmentId: "2019110815",
          department: "技术部",
          name: null,
          size: [120, 30],
          children: []
        },
        {
          departmentId: "2019110816",
          department: "工程部",
          name: null,
          size: [120, 30],
          children: []
        },
        {
          departmentId: "2019110817",
          department: "组装测试部",
          name: null,
          size: [120, 30],
          children: []
        }
      ]
    }
  ]
};
